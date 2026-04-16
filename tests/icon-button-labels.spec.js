/**
 * Icon-only buttons in the docs examples must carry an aria-label —
 * otherwise screen-reader users hear "button" with no context. This
 * doubles as a canary for people copy-pasting from our demos.
 *
 * An icon-only button is one whose DOM text content is empty or
 * only whitespace after stripping SVG/img descendants.
 */
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

test("every icon-only button in docs has aria-label", async ({ page }) => {
  const nav = JSON.parse(
    await readFile(resolve(here, "../docs/_data/nav.json"), "utf8"),
  );
  const links = nav
    .flatMap((s) => s.items)
    .filter((i) => i.href.startsWith("components/"));

  const offenders = [];

  for (const { href } of links) {
    await page.goto(`/${href}`);
    await page.waitForLoadState("load");

    const found = await page.evaluate(() => {
      const bad = [];
      for (const btn of document.querySelectorAll(
        ".snippet-preview > .cider button",
      )) {
        // Strip out decorative children (svg, img) — what text is left?
        const clone = btn.cloneNode(true);
        clone
          .querySelectorAll("svg, img, [aria-hidden='true']")
          .forEach((n) => n.remove());
        const text = clone.textContent.trim();
        if (text) continue; // has visible text label

        const aria =
          btn.getAttribute("aria-label") ||
          btn.getAttribute("aria-labelledby") ||
          btn.getAttribute("title");
        if (!aria) {
          bad.push(btn.outerHTML.slice(0, 120));
        }
      }
      return bad;
    });

    if (found.length)
      offenders.push({ page: href, examples: found.slice(0, 3) });
  }

  expect(
    offenders,
    "icon-only buttons without aria-label / aria-labelledby / title",
  ).toEqual([]);
});
