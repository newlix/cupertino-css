#!/usr/bin/env node
// Same as axe-audit.js but toggles .dark on the root element before scanning.

import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const navPath = resolve(here, "../docs/_data/nav.json");
const nav = JSON.parse(await readFile(navPath, "utf8"));
const links = nav.flatMap((s) =>
  s.items
    .filter((i) => i.href.endsWith(".html"))
    .map((i) => ({ label: i.label, path: `/${i.href}` })),
);

const browser = await chromium.launch();
// Emulate prefers-color-scheme: dark so the docs layout's head script
// sets `.dark` on html BEFORE first paint. Toggling the class after
// paint hits a Chromium caching quirk where var() resolution inside
// @scope doesn't re-evaluate on ancestor class change.
const context = await browser.newContext({
  baseURL: "http://localhost:3000",
  colorScheme: "dark",
});
const page = await context.newPage();
const rollup = new Map();

for (const { path } of links) {
  try {
    await page.goto(path, { timeout: 10000 });
    await page.waitForLoadState("load");
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .exclude(".snippet pre")
      .exclude(".callout .text-green")
      .exclude('.token[data-value="Read-only"]')
      .analyze();
    for (const v of results.violations) {
      if (!rollup.has(v.id)) {
        rollup.set(v.id, { impact: v.impact, nodes: [] });
      }
      for (const n of v.nodes) {
        rollup
          .get(v.id)
          .nodes.push({ page: path, target: n.target.join(" "), any: n.any });
      }
    }
  } catch {
    /* skip */
  }
}

await browser.close();
console.log(`dark-mode axe: ${rollup.size} unique rules`);
for (const [id, { impact, nodes }] of rollup) {
  console.log(`[${impact}] ${id} (${nodes.length} nodes)`);
  for (const n of nodes.slice(0, 3)) {
    console.log(`  ${n.page}  ${n.target}`);
    if (n.any?.[0]?.message)
      console.log(`    ${n.any[0].message.slice(0, 200)}`);
  }
}
