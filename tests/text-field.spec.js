import { test, expect } from "@playwright/test";
import {
  goto,
  preview,
  css,
  setDark,
  focusViaKeyboard,
  contrastBetween,
  skipWebkitScope,
} from "./helpers.js";

/* input is a bare element selector inside @scope — skip WebKit */
test.describe("Text Field", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "text-field");
  });

  test("focus changes border color to primary", async ({
    page,
    browserName,
  }) => {
    skipWebkitScope(browserName);
    const input = preview(page).locator("input").first();
    const before = await css(input, "borderColor");
    await focusViaKeyboard(page, input);
    const after = await css(input, "borderColor");
    expect(after).not.toBe(before);
  });

  test("aria-invalid input has different border color than normal", async ({
    page,
    browserName,
  }) => {
    skipWebkitScope(browserName);
    const normal = preview(page).locator("input").first();
    const invalid = preview(page, 4).locator('[aria-invalid="true"]').first();
    const normalBorder = await css(normal, "borderColor");
    const invalidBorder = await css(invalid, "borderColor");
    expect(invalidBorder).not.toBe(normalBorder);
  });

  test("required input label shows asterisk via ::after", async ({
    page,
    browserName,
  }) => {
    skipWebkitScope(browserName);
    const label = preview(page, 2).locator("label").first();
    const content = await label.evaluate(
      (el) => getComputedStyle(el, "::after").content,
    );
    expect(content).toContain("*");
  });

  test("dark mode: border visible against background", async ({
    page,
    browserName,
  }) => {
    skipWebkitScope(browserName);
    await setDark(page);
    const input = preview(page).locator('input[type="text"]').first();
    const ratio = await contrastBetween(
      input,
      "borderColor",
      input,
      "backgroundColor",
    );
    expect(ratio).toBeGreaterThan(1.05);
  });
});
