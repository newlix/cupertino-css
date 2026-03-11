import { test, expect } from "@playwright/test";
import { goto, preview, css, setDark, focusViaKeyboard } from "./helpers.js";

test.describe("Search Field", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "search-field");
  });

  test("search input renders with rounded border-radius", async ({ page }) => {
    const input = preview(page).locator(".search-field input").first();
    await expect(input).toBeVisible();
    const radius = parseFloat(await css(input, "borderRadius"));
    expect(radius).toBeGreaterThanOrEqual(8);
  });

  test("search input has left padding for icon", async ({ page }) => {
    const input = preview(page).locator(".search-field input").first();
    const paddingLeft = parseFloat(await css(input, "paddingLeft"));
    expect(paddingLeft).toBeGreaterThanOrEqual(28);
  });

  test("clear button is visible when present", async ({ page }) => {
    const clearBtn = preview(page, 1).locator(".search-clear").first();
    await expect(clearBtn).toBeVisible();
  });

  test("disabled search input has reduced opacity", async ({ page }) => {
    const input = preview(page, 2).locator(".search-field input").first();
    const opacity = parseFloat(await css(input, "opacity"));
    expect(opacity).toBeLessThan(1);
  });

  test("focus-visible shows focus ring on input", async ({ page }) => {
    const input = preview(page).locator(".search-field input").first();
    await focusViaKeyboard(page, input);
    const shadow = await css(input, "boxShadow");
    expect(shadow).not.toBe("none");
  });

  test("dark mode changes input background", async ({ page }) => {
    const input = preview(page).locator(".search-field input").first();
    const lightBg = await css(input, "backgroundColor");
    await setDark(page);
    const darkBg = await css(input, "backgroundColor");
    expect(darkBg).not.toBe(lightBg);
  });
});
