/**
 * picker.destroy should remove auto-generated item IDs (picker-opt-*)
 * and role="option" / aria-selected. Without this the DOM leaks
 * stale IDs after re-init, and a fresh init could land on a
 * duplicate.
 */
import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test("picker destroy removes auto-generated IDs + role + aria-selected", async ({
  page,
}) => {
  await goto(page, "picker");
  await page.waitForFunction(
    () => document.querySelector("[data-picker]")?._pickerInit,
  );

  const after = await page.evaluate(() => {
    const picker = document.querySelector(
      ".snippet-preview > .cider [data-picker]",
    );
    // Ensure there's at least one selected item so an id gets set
    const col = picker.querySelector(".picker-column");
    col.focus();

    window.CiderUI.picker.destroy(picker);

    const items = picker.querySelectorAll(".picker-column > div");
    return {
      anyAutoId: [...items].some((i) => i.id && i.id.startsWith("picker-opt-")),
      anyAriaSelected: [...items].some((i) => i.hasAttribute("aria-selected")),
      anyRole: [...items].some((i) => i.hasAttribute("role")),
    };
  });

  expect(after.anyAutoId).toBe(false);
  expect(after.anyAriaSelected).toBe(false);
  expect(after.anyRole).toBe(false);
});
