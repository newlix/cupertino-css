/**
 * Accessibility tests — axe-core rules run against each component doc page.
 *
 * Only runs under Chromium to avoid 3× noise for identical violations.
 * A violation in the _docs chrome_ (sidebar, layout) that isn't about a
 * component itself is still reported once — treat it as a signal to fix
 * the docs shell, not as a component bug.
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const navPath = resolve(
  new URL("../docs/_data/nav.json", import.meta.url).pathname,
);
const nav = JSON.parse(await readFile(navPath, "utf-8"));
const componentLinks = nav.flatMap((section) =>
  section.items
    .filter((item) => item.href.endsWith(".html"))
    .map((item) => ({
      label: item.label,
      path: `/${item.href}`,
    })),
);

test.describe("a11y — component doc pages", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "axe rules are browser-agnostic — run once in chromium to avoid 3× noise",
  );

  for (const { label, path } of componentLinks) {
    test(`${label} — axe WCAG 2.1 AA`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("load");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        // Hide `.snippet pre` code blocks from the scan — they render as
        // highlighted HTML source and report false "duplicate id" / colour
        // violations for code that isn't meant to be interpreted as UI.
        .exclude(".snippet pre")
        // Known contrast exceptions — intentional design choices documented
        // in DISPUTES.md. Each is non-interactive information (success colour
        // in callouts, read-only token visual treatment).
        .exclude(".callout .text-green")
        .exclude('.token[data-value="Read-only"]')
        .analyze();

      if (results.violations.length) {
        // Compact summary for log readability; full context still in results.
        const summary = results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.length,
          first: v.nodes[0]?.target,
        }));
        console.error(
          `axe violations on ${path}:\n` + JSON.stringify(summary, null, 2),
        );
      }
      expect(results.violations, `axe violations on ${path}`).toEqual([]);
    });
  }
});
