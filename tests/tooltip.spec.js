import { test, expect } from "@playwright/test";
import { goto, preview, focusViaKeyboard } from "./helpers.js";

test.describe("Tooltip", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "tooltip");
  });

  test("tooltip hidden by default, appears on hover after 0.6s delay", async ({
    page,
  }) => {
    const btn = preview(page).locator("[data-tooltip]").first();
    // Hidden before hover
    const before = await btn.evaluate(
      (el) => getComputedStyle(el, "::after").opacity,
    );
    expect(parseFloat(before)).toBe(0);

    await btn.hover();
    // Wait for 0.6s macOS-style delay + transition
    await page.waitForTimeout(800);
    const after = await btn.evaluate(
      (el) => getComputedStyle(el, "::after").opacity,
    );
    expect(parseFloat(after)).toBe(1);
  });

  test("tooltip appears on focus-visible without delay", async ({
    page,
    browserName,
  }) => {
    /* WebKit sometimes doesn't trigger :focus-visible on buttons the same way */
    test.fixme(
      browserName === "webkit",
      "WebKit: :focus-visible pseudo-element opacity inconsistent",
    );
    const btn = preview(page).locator("[data-tooltip]").first();
    await focusViaKeyboard(page, btn);
    await page.waitForTimeout(300);
    const opacity = await btn.evaluate(
      (el) => getComputedStyle(el, "::after").opacity,
    );
    expect(parseFloat(opacity)).toBe(1);
  });

  test("tooltip text is set via data attribute", async ({ page }) => {
    const btn = preview(page).locator("[data-tooltip]").first();
    const text = await btn.getAttribute("data-tooltip");
    expect(text).toBeTruthy();
    expect(text.length).toBeGreaterThan(0);
  });
});
