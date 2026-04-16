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

  test("callout background is the secondary surface; no accent-stripe left border", async ({
    page,
  }) => {
    // Deliberate design choice (see callout.css): no border-left accent, no
    // per-variant tint. Background = --color-secondary. A regression
    // reintroducing a thick left stripe would look like GitHub/MDN docs,
    // not Apple Settings.
    const callout = preview(page).locator(".callout").first();
    const leftW = parseFloat(await css(callout, "borderLeftWidth"));
    const rightW = parseFloat(await css(callout, "borderRightWidth"));
    // Either no border at all, or all sides equal — never a left-side stripe.
    expect(leftW).toBeLessThanOrEqual(rightW + 0.5);
    expect(await css(callout, "backgroundColor")).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("heading uses semibold weight, not larger size", async ({ page }) => {
    // Hierarchy comes from weight alone — heading and body share the same
    // text size (15px per callout.css comment). Regression would break the
    // quiet density.
    const heading = preview(page).locator(".callout h5").first();
    const body = preview(page).locator(".callout > p").first();
    const hSize = parseFloat(await css(heading, "fontSize"));
    const bSize = parseFloat(await css(body, "fontSize"));
    expect(hSize).toBe(bSize);
    const weight = Number(await css(heading, "fontWeight"));
    expect(weight).toBeGreaterThanOrEqual(600);
  });
});
