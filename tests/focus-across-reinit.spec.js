/**
 * When htmx:afterSettle fires and init() re-scans the DOM, elements
 * that were focused before the event must stay focused. A regression
 * that blurs or resets focus would disorient keyboard users during
 * SPA-style interactions.
 */
import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test("focus survives htmx:afterSettle re-init", async ({ page }) => {
  await goto(page, "button");

  // Focus a button, dispatch afterSettle, verify focus still there.
  const sameFocus = await page.evaluate(() => {
    const btn = document.querySelector(".snippet-preview > .cider button");
    btn.focus();
    const before = document.activeElement === btn;

    document.dispatchEvent(new CustomEvent("htmx:afterSettle"));

    const after = document.activeElement === btn;
    return { before, after };
  });

  expect(sameFocus.before).toBe(true);
  expect(sameFocus.after).toBe(true);
});
