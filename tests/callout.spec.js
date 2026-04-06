import { test, expect } from "@playwright/test";
import { goto, preview, css, contrastBetween } from "./helpers.js";

test.describe("Callout", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "callout");
  });

  test("body text is visually lighter than heading (82% opacity mix)", async ({
    page,
  }) => {
    const heading = preview(page).locator(".callout > h5").first();
    const body = preview(page).locator(".callout > p").first();
    const headingColor = await css(heading, "color");
    const bodyColor = await css(body, "color");
    expect(bodyColor).not.toBe(headingColor);
  });

  test("body text meets WCAG AA contrast against callout background", async ({
    page,
  }) => {
    const body = preview(page).locator(".callout > p").first();
    const callout = preview(page).locator(".callout").first();
    const ratio = await contrastBetween(
      body,
      "color",
      callout,
      "backgroundColor",
    );
    expect(ratio, "callout body ≥ 4.5:1").toBeGreaterThanOrEqual(4.5);
  });
});
