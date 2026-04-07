import { test, expect } from "@playwright/test";
import { goto, preview, css, setDark, setLight } from "./helpers.js";

test.describe("Activity Indicator", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "activity-indicator");
  });

  test("uses currentColor so it adapts to parent text color", async ({
    page,
  }) => {
    const indicator = preview(page).locator(".activity-indicator").first();
    const bg = await css(indicator, "backgroundColor");

    // Apply a text color utility — background SHOULD change (currentColor inherits)
    await indicator.evaluate((el) => (el.style.color = "rgb(239, 68, 68)"));

    await expect(async () => {
      const bgAfter = await css(indicator, "backgroundColor");
      expect(bgAfter).not.toBe(bg);
    }).toPass({ timeout: 1000 });
  });

  test("color swaps in dark mode via inherited currentColor", async ({
    page,
  }) => {
    const indicator = preview(page).locator(".activity-indicator").first();

    await setLight(page);
    const lightBg = await css(indicator, "backgroundColor");

    await setDark(page);
    const darkBg = await css(indicator, "backgroundColor");

    // Light and dark should have different background colors
    expect(darkBg).not.toBe(lightBg);
  });

  test("spinner animates with stepped keyframes", async ({ page }) => {
    const indicator = preview(page).locator(".activity-indicator").first();
    const name = await css(indicator, "animationName");
    expect(name).not.toBe("none");
    const timing = await css(indicator, "animationTimingFunction");
    expect(timing).toContain("steps");
  });

  test("size variants render at expected dimensions", async ({ page }) => {
    const sizes = [
      { cls: ".activity-indicator-sm", px: 16 },
      { cls: ".activity-indicator-lg", px: 100 },
    ];
    for (const { cls, px } of sizes) {
      const el = page.locator(`.snippet-preview > .cider ${cls}`).first();
      if ((await el.count()) > 0) {
        expect(parseFloat(await css(el, "width")), cls).toBe(px);
      }
    }
  });
});
