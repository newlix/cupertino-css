#!/usr/bin/env node
// One-shot a11y audit — runs axe against every docs page and prints a
// cross-page rollup of violation types, counts, and representative
// selectors. Standalone utility; not wired into CI (which uses the
// per-page assertion gate in tests/a11y.spec.js).

import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const navPath = resolve(
  new URL("../docs/_data/nav.json", import.meta.url).pathname,
);
const nav = JSON.parse(await readFile(navPath, "utf-8"));
const links = nav.flatMap((section) =>
  section.items
    .filter((item) => item.href.endsWith(".html"))
    .map((item) => ({
      label: item.label,
      path: `/${item.href}`,
    })),
);

const browser = await chromium.launch();
const context = await browser.newContext({ baseURL: "http://localhost:3000" });
const page = await context.newPage();

const rollup = new Map();

for (const { label, path } of links) {
  try {
    await page.goto(path, { timeout: 10000 });
    await page.waitForLoadState("load");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude(".snippet pre")
      .analyze();

    for (const v of results.violations) {
      if (!rollup.has(v.id)) {
        rollup.set(v.id, { impact: v.impact, help: v.help, nodes: [] });
      }
      const entry = rollup.get(v.id);
      for (const n of v.nodes) {
        const failureSummary = (n.any || [])
          .concat(n.all || [], n.none || [])
          .map((r) => r.message)
          .join(" | ");
        entry.nodes.push({
          page: path,
          label,
          target: n.target.join(" "),
          html: n.html.slice(0, 160),
          why: failureSummary,
        });
      }
    }
  } catch (err) {
    console.error(`skip ${path}: ${err.message}`);
  }
}

await browser.close();

const impactRank = { critical: 0, serious: 1, moderate: 2, minor: 3 };
const sorted = [...rollup.entries()].sort((a, b) => {
  const ra = impactRank[a[1].impact] ?? 9;
  const rb = impactRank[b[1].impact] ?? 9;
  if (ra !== rb) return ra - rb;
  return b[1].nodes.length - a[1].nodes.length;
});

console.log(`\n=== axe rollup (${rollup.size} unique rules) ===\n`);
for (const [id, { impact, help, nodes }] of sorted) {
  console.log(`[${impact}] ${id} — ${help} (${nodes.length} nodes)`);
  const byPage = new Map();
  for (const n of nodes) {
    if (!byPage.has(n.page)) byPage.set(n.page, []);
    byPage.get(n.page).push(n);
  }
  for (const [p, ns] of byPage) {
    console.log(`    ${p}  (${ns.length})`);
    console.log(`        e.g. ${ns[0].target}`);
    if (ns[0].why) console.log(`             ${ns[0].why.slice(0, 200)}`);
  }
}
console.log("");
