/**
 * Component pages should render with zero console warnings, not just
 * zero errors. Warnings often flag deprecated API usage, bad ARIA,
 * slow CSS selectors, or strict-mode issues — all of which users
 * land on, copy-paste, and spread.
 */
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const nav = JSON.parse(
  await readFile(resolve(here, "../docs/_data/nav.json"), "utf8"),
);
const componentLinks = nav
  .flatMap((s) => s.items)
  .filter(
    (i) =>
      i.href.startsWith("components/") &&
      !i.href.includes("kitchen-sink") &&
      !i.href.includes("essentials"),
  );

for (const { label, href } of componentLinks) {
  test(`${label} — no console warnings`, async ({ page }) => {
    const warnings = [];
    page.on("console", (msg) => {
      if (msg.type() === "warning") warnings.push(msg.text());
    });
    await page.goto(`/${href}`);
    await page.waitForLoadState("load");

    // Filter out warnings emitted by the docs chrome, not the component
    // (e.g. third-party script loaders). Keeping the noisy-but-harmless
    // set explicit so new component warnings don't hide.
    const IGNORE = [/favicon/i, /manifest/i, /OffscreenCanvas/i];
    const real = warnings.filter((w) => !IGNORE.some((r) => r.test(w)));

    expect(real, `console warnings on ${href}`).toEqual([]);
  });
}
