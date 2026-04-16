/**
 * Contract test: loading the full cider.js bundle must only attach a
 * known, documented set of properties to window. Regressions here
 * (say a helper accidentally leaking out of its IIFE) pollute consumer
 * apps and can collide with globals they use.
 *
 * The allowed surface is what ciderui.d.ts declares plus the usual
 * noise a browser adds on its own. Anything new appearing here needs
 * a conscious decision — either document it in cider.d.ts or fix the
 * leak.
 */
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

const ALLOWED_GLOBALS = new Set([
  // Documented in js/cider.d.ts
  "CiderUI",
  "openDialog",
  "closeDialog",
  "openActionSheet",
  "closeActionSheet",
  "showHUD",
]);

test("full bundle attaches only documented globals", async ({ page }) => {
  await page.goto("about:blank");

  const before = await page.evaluate(() => Object.getOwnPropertyNames(window));

  const bundle = await readFile(resolve(here, "../js/cider.js"), "utf8");
  await page.addScriptTag({ content: bundle });

  const after = await page.evaluate(() => Object.getOwnPropertyNames(window));
  const added = after.filter((k) => !before.includes(k));
  const leaked = added.filter((k) => !ALLOWED_GLOBALS.has(k));

  expect(
    leaked,
    "new window.* properties not in the documented surface — either add to cider.d.ts or fix the leak",
  ).toEqual([]);
});
