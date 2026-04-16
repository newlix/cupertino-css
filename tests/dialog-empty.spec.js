/**
 * Edge case: a dialog containing no focusable elements. Common pattern
 * for pure-information modals ("Saved ✓" with no buttons). Focus
 * handling must still behave sanely — no crash, no focus stuck on
 * background.
 */
import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test("dialog with no focusable content opens + Escape closes without error", async ({
  page,
}) => {
  await goto(page, "dialog");

  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));

  const result = await page.evaluate(() => {
    const d = document.createElement("dialog");
    d.className = "dialog alert";
    d.innerHTML = "<p>Saved ✓</p>";
    document.querySelector(".cider")?.appendChild(d);
    window.CiderUI.dialog.init();
    window.openDialog(d);
    return { opened: d.hasAttribute("open"), id: d.id || "tmp" };
  });

  expect(result.opened).toBe(true);
  expect(errors).toEqual([]);

  // Escape should still close
  await page.keyboard.press("Escape");

  const stillOpen = await page.evaluate(
    () =>
      !!document.querySelector(
        ".cider dialog.dialog[open]:not([data-closing])",
      ),
  );
  expect(stillOpen).toBe(false);
  expect(errors).toEqual([]);
});
