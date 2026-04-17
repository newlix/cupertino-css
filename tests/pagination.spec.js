import { test, expect } from "@playwright/test";
import { goto, preview, css, setDark, focusViaKeyboard } from "./helpers.js";

test.describe("Pagination", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "pagination");
  });

  test("active button has distinct styling", async ({ page }) => {
    const active = preview(page).locator(
      '.pagination button[aria-current="page"]',
    );
    await expect(active).toBeVisible();

    const fw = await css(active, "fontWeight");
    expect(Number(fw)).toBeGreaterThanOrEqual(500);
    const pe = await css(active, "pointerEvents");
    expect(pe).toBe("none");
  });

  test("disabled button has reduced opacity and pointer-events none", async ({
    page,
  }) => {
    const disabled = preview(page).locator(".pagination button[disabled]");
    await expect(disabled).toBeVisible();

    const opacity = await css(disabled, "opacity");
    expect(Number(opacity)).toBeLessThan(1);

    const pe = await css(disabled, "pointerEvents");
    expect(pe).toBe("none");
  });

  test("non-active button has focus-visible outline", async ({ page }) => {
    const btn = preview(page)
      .locator('.pagination button:not([aria-current="page"]):not([disabled])')
      .first();
    await focusViaKeyboard(page, btn);

    await expect(async () => {
      const outline = await css(btn, "outlineStyle");
      expect(outline).toBe("solid");
    }).toPass({ timeout: 3000 });
  });

  test("ellipsis span is present", async ({ page }) => {
    const ellipsis = preview(page).locator(".pagination > span");
    await expect(ellipsis).toBeVisible();
    await expect(ellipsis).toHaveText("...");
  });

  test("simple pagination has no disabled buttons", async ({ page }) => {
    const disabled = preview(page, 1).locator(".pagination button[disabled]");
    await expect(disabled).toHaveCount(0);

    const buttons = preview(page, 1).locator(".pagination button");
    await expect(buttons).toHaveCount(5);
  });

  test("dark mode: active button has distinct styling", async ({ page }) => {
    const active = preview(page).locator(
      '.pagination button[aria-current="page"]',
    );

    await setDark(page);
    const fw = await css(active, "fontWeight");
    expect(Number(fw)).toBeGreaterThanOrEqual(500);
    const bg = await css(active, "backgroundColor");
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("active button background uses primary color tint (not transparent)", async ({
    page,
  }) => {
    // Regression: oklch(from var(...)) broke Safari < 18; replaced with color-mix.
    // Verify the active button gets a visible tinted background in both modes.
    const active = preview(page).locator(
      '.pagination button[aria-current="page"]',
    );
    const lightBg = await css(active, "backgroundColor");
    expect(lightBg).not.toBe("rgba(0, 0, 0, 0)");

    await setDark(page);
    const darkBg = await css(active, "backgroundColor");
    expect(darkBg).not.toBe("rgba(0, 0, 0, 0)");
    // Dark mode uses higher alpha (20% vs 12%) so background should differ
    expect(darkBg).not.toBe(lightBg);
  });
});
