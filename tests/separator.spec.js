import { test, expect } from "@playwright/test";
import { goto, preview, css, skipWebkitScope } from "./helpers.js";

test.describe("Separator", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "separator");
  });

  /* <hr> is a bare element selector inside @scope — skip WebKit */
  test("classless hr renders as thin colored line", async ({
    page,
    browserName,
  }) => {
    skipWebkitScope(browserName);
    const hr = preview(page).locator("hr").first();
    await expect(hr).toBeVisible();
    const height = parseFloat(await css(hr, "height"));
    expect(height).toBeLessThanOrEqual(1);
    expect(await css(hr, "backgroundColor")).not.toBe("rgba(0, 0, 0, 0)");
  });

  /* .separator-vertical is a class selector — works in WebKit */
  test("vertical separator stretches to parent height", async ({ page }) => {
    const sep = preview(page, 2).locator(".separator-vertical").first();
    await expect(sep).toBeVisible();
    const height = parseFloat(await css(sep, "height"));
    expect(height).toBeGreaterThanOrEqual(16);
  });

  /* .separator-label is a class selector — works in WebKit */
  test("separator-label uses flex with pseudo-element lines", async ({
    page,
  }) => {
    const label = preview(page, 3).locator(".separator-label").first();
    await expect(label).toBeVisible();
    expect(await css(label, "display")).toBe("flex");
    const text = await label.textContent();
    expect(text.trim().length).toBeGreaterThan(0);
  });
});
