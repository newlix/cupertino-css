/**
 * HTML requires IDs to be unique per document. Duplicate IDs break
 * label→input association, aria-controls / aria-labelledby wiring,
 * and JavaScript querySelector correctness. Easy to introduce by
 * copy-pasting an example with id=foo into two snippets on the same
 * page.
 */
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const nav = JSON.parse(
  await readFile(resolve(here, "../docs/_data/nav.json"), "utf8"),
);
const links = nav
  .flatMap((s) => s.items)
  .filter((i) => i.href.endsWith(".html"));

for (const { label, href } of links) {
  test(`${label} — no duplicate element IDs`, async ({ page }) => {
    await page.goto(`/${href}`);
    await page.waitForLoadState("load");

    const dupes = await page.evaluate(() => {
      const ids = new Map();
      for (const el of document.querySelectorAll("[id]")) {
        ids.set(el.id, (ids.get(el.id) || 0) + 1);
      }
      return [...ids.entries()].filter(([, n]) => n > 1);
    });

    expect(dupes, `duplicate ids on ${href}`).toEqual([]);
  });
}
