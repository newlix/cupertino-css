import { test, expect } from "@playwright/test";
import { goto, preview, css, contrastBetween } from "./helpers.js";

test.describe("Badge", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "badge");
  });

  test("badge text meets WCAG AA contrast against background", async ({
    page,
  }) => {
    const badge = preview(page).locator(".badge").first();
    const ratio = await contrastBetween(
      badge,
      "color",
      badge,
      "backgroundColor",
    );
    expect(ratio, "badge text contrast ≥ 3:1").toBeGreaterThan(3);
  });

  test("badge-dot is exactly 12px circle", async ({ page }) => {
    const dot = preview(page, 2).locator(".badge-dot").first();
    await expect(dot).toBeVisible();
    expect(parseFloat(await css(dot, "width"))).toBe(12);
    expect(parseFloat(await css(dot, "height"))).toBe(12);
  });

  test("badge ring uses --badge-ring custom property", async ({ page }) => {
    const badge = preview(page, 1).locator(".badge").first();
    const shadow = await css(badge, "boxShadow");
    expect(shadow).not.toBe("none");
  });
});
