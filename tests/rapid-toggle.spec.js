/**
 * Stress tests for rapid open/close cycles on modal components.
 * Users double-click, assistive tech triggers events faster than
 * animations finish, and dev tools can re-play click queues. Any
 * state that leaks between animation frames (data-closing, scroll
 * lock, focus restoration target) can corrupt under rapid toggle.
 */
import { test, expect } from "@playwright/test";
import { goto, preview } from "./helpers.js";

test.describe("Rapid toggle", () => {
  test("dialog open/close × 5 leaves body scrollable afterward", async ({
    page,
  }) => {
    await goto(page, "dialog");

    // Open + close five times. The scroll-lock ref counter must balance
    // back to zero; if any cycle leaks a +1, body stays locked.
    for (let i = 0; i < 5; i++) {
      await preview(page, 0)
        .locator('button:has-text("Close Document")')
        .click();
      const dialog = preview(page, 0).locator("dialog");
      await expect(dialog).toBeVisible();
      await dialog.locator('button:has-text("Cancel")').click();
      await expect(dialog).not.toBeVisible();
    }

    const finalOverflow = await page.evaluate(
      () => document.body.style.overflow,
    );
    // Scroll lock stores the original value and restores on unlock;
    // we expect either empty string or the original (usually "auto"/"")
    expect(finalOverflow).not.toBe("hidden");
  });

  test("action sheet open/close × 5 leaves body scrollable", async ({
    page,
  }) => {
    await goto(page, "action-sheet");

    for (let i = 0; i < 5; i++) {
      await preview(page, 0).locator('button:has-text("Share Photo")').click();
      const sheet = page.locator("#sheet1");
      await expect(sheet).toBeVisible();
      await sheet.locator('button:has-text("Cancel")').click();
      await expect(sheet).not.toBeVisible();
    }

    const finalOverflow = await page.evaluate(
      () => document.body.style.overflow,
    );
    expect(finalOverflow).not.toBe("hidden");
  });
});
