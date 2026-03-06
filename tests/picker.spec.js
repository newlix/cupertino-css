import { test, expect } from "@playwright/test";
import { goto, preview, css, setDark } from "./helpers.js";

test.describe("Picker", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "picker");
    await page.waitForFunction(
      () => document.querySelector("[data-picker]")?._pickerInit,
    );
  });

  test("picker renders with correct height", async ({ page }) => {
    const picker = preview(page).locator(".picker");
    await expect(picker).toBeVisible();
    // Default: 5 items * 40px = 200px
    const h = parseFloat(await css(picker, "height"));
    expect(h).toBe(200);
  });

  test("picker has border-radius and shadow", async ({ page }) => {
    const picker = preview(page).locator(".picker");
    const radius = parseFloat(await css(picker, "borderRadius"));
    expect(radius).toBeGreaterThan(0);
    const shadow = await css(picker, "boxShadow");
    expect(shadow).not.toBe("none");
  });

  test("picker column contains items", async ({ page }) => {
    const items = preview(page).locator(".picker-column > div");
    const count = await items.count();
    expect(count).toBe(12); // 12 months
  });

  test("selection indicator is visible", async ({ page }) => {
    const picker = preview(page).locator(".picker");
    // ::after pseudo-element creates the selection band
    const hasIndicator = await picker.evaluate((el) => {
      const after = getComputedStyle(el, "::after");
      return after.content !== "none" && after.position === "absolute";
    });
    expect(hasIndicator).toBe(true);
  });

  test("multi-column picker has two columns", async ({ page }) => {
    const columns = preview(page, 1).locator(".picker-column");
    const count = await columns.count();
    expect(count).toBe(2);
  });

  test("picker items have correct height", async ({ page }) => {
    const item = preview(page).locator(".picker-column > div").first();
    const h = parseFloat(await css(item, "height"));
    expect(h).toBe(40);
  });

  test("picker column hides scrollbar", async ({ page }) => {
    const column = preview(page).locator(".picker-column");
    const scrollbarWidth = await column.evaluate(
      (el) => el.offsetWidth - el.clientWidth,
    );
    expect(scrollbarWidth).toBe(0);
  });

  test("dark mode changes picker background", async ({ page }) => {
    const picker = preview(page).locator(".picker");
    const lightBg = await css(picker, "backgroundColor");
    await setDark(page);
    const darkBg = await css(picker, "backgroundColor");
    expect(darkBg).not.toBe(lightBg);
  });
});
