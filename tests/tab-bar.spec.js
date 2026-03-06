import { test, expect } from "@playwright/test";
import { goto, preview, css, setDark } from "./helpers.js";

test.describe("Tab Bar", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "tab-bar");
  });

  test("tab bar renders with correct min-height", async ({ page }) => {
    const tabBar = preview(page).locator(".tab-bar");
    await expect(tabBar).toBeVisible();
    const h = parseFloat(await css(tabBar, "minHeight"));
    expect(h).toBe(49);
  });

  test("renders 4 tab items", async ({ page }) => {
    const items = preview(page).locator(".tab-bar > a");
    const count = await items.count();
    expect(count).toBe(4);
  });

  test("active item has primary color", async ({ page }) => {
    const active = preview(page).locator(".tab-bar > a[data-active]");
    await expect(active).toBeVisible();
    const color = await css(active, "color");
    // Inactive items should have different color
    const inactive = preview(page)
      .locator(".tab-bar > a:not([data-active])")
      .first();
    const inactiveColor = await css(inactive, "color");
    expect(color).not.toBe(inactiveColor);
  });

  test("tab items have column layout with icon and label", async ({ page }) => {
    const item = preview(page).locator(".tab-bar > a").first();
    const direction = await css(item, "flexDirection");
    expect(direction).toBe("column");
    // Has an SVG icon
    const svg = item.locator("svg");
    await expect(svg).toBeVisible();
  });

  test("tab items have 10px font size for labels", async ({ page }) => {
    const item = preview(page).locator(".tab-bar > a").first();
    const fontSize = parseFloat(await css(item, "fontSize"));
    expect(fontSize).toBe(10);
  });

  test("badge example shows badge on tab item", async ({ page }) => {
    const badge = preview(page, 1).locator(".badge");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("3");
  });

  test("dark mode changes tab bar background", async ({ page }) => {
    const tabBar = preview(page).locator(".tab-bar");
    const lightBg = await css(tabBar, "backgroundColor");
    await setDark(page);
    const darkBg = await css(tabBar, "backgroundColor");
    expect(darkBg).not.toBe(lightBg);
  });
});
