import { test, expect } from "@playwright/test";
import { goto, preview, css, setDark } from "./helpers.js";

test.describe("Segmented Control", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "segmented-control");
    await page.waitForFunction(() => {
      const tab = document.querySelector("[data-tab]");
      return tab && tab.getAttribute("role") === "tab";
    });
  });

  test("clicking segment switches active panel", async ({ page }) => {
    const seg1 = preview(page).locator('[data-tab="seg-1"]');
    const seg2 = preview(page).locator('[data-tab="seg-2"]');
    const panel1 = preview(page).locator('[data-tab-panel="seg-1"]');
    const panel2 = preview(page).locator('[data-tab-panel="seg-2"]');

    await expect(seg1).toHaveAttribute("data-active", "");
    await expect(panel1).toHaveAttribute("data-active", "");
    await expect(panel2).not.toHaveAttribute("data-active", "");

    await seg2.click();

    await expect(seg2).toHaveAttribute("data-active", "");
    await expect(seg1).not.toHaveAttribute("data-active", "");
    await expect(panel2).toHaveAttribute("data-active", "");
    await expect(panel1).not.toHaveAttribute("data-active", "");
  });

  test("active segment has indicator with background and box-shadow", async ({
    page,
  }) => {
    const indicator = preview(page).locator("[data-tab-indicator]");
    const bg = await css(indicator, "backgroundColor");
    const shadow = await css(indicator, "boxShadow");

    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
    expect(shadow).not.toBe("none");
  });

  test("inactive segment has no box-shadow", async ({ page }) => {
    const inactive = preview(page).locator('[data-tab="seg-2"]');
    const shadow = await css(inactive, "boxShadow");
    expect(shadow).toBe("none");
  });

  test("keyboard arrow navigation switches segments", async ({ page }) => {
    const seg1 = preview(page).locator('[data-tab="seg-1"]');
    const seg2 = preview(page).locator('[data-tab="seg-2"]');

    await seg1.focus();
    await page.keyboard.press("ArrowRight");

    await expect(seg2).toHaveAttribute("data-active", "");
    await expect(seg2).toBeFocused();
  });

  test("ARIA attributes are set correctly", async ({ page }) => {
    const seg1 = preview(page).locator('[data-tab="seg-1"]');
    await expect(seg1).toHaveAttribute("role", "tab");
    await expect(seg1).toHaveAttribute("aria-selected", "true");

    const seg2 = preview(page).locator('[data-tab="seg-2"]');
    await expect(seg2).toHaveAttribute("role", "tab");
    await expect(seg2).toHaveAttribute("aria-selected", "false");

    const panel1 = preview(page).locator('[data-tab-panel="seg-1"]');
    await expect(panel1).toHaveAttribute("role", "tabpanel");
  });

  test("Home key moves focus to first tab", async ({ page }) => {
    const seg1 = preview(page).locator('[data-tab="seg-1"]');
    const seg3 = preview(page).locator('[data-tab="seg-3"]');

    await seg3.click();
    await expect(seg3).toBeFocused();

    await page.keyboard.press("Home");
    await expect(seg1).toHaveAttribute("data-active", "");
    await expect(seg1).toBeFocused();
  });

  test("End key moves focus to last tab", async ({ page }) => {
    const seg1 = preview(page).locator('[data-tab="seg-1"]');
    const seg3 = preview(page).locator('[data-tab="seg-3"]');

    await seg1.focus();
    await page.keyboard.press("End");
    await expect(seg3).toHaveAttribute("data-active", "");
    await expect(seg3).toBeFocused();
  });

  test("dark mode: indicator still has background", async ({ page }) => {
    await setDark(page);
    const indicator = preview(page).locator("[data-tab-indicator]");
    const bg = await css(indicator, "backgroundColor");
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });
});
