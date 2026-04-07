import { test, expect } from "@playwright/test";
import {
  goto,
  preview,
  css,
  focusViaKeyboard,
  skipWebkitScope,
} from "./helpers.js";

test.describe("Switch", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "switch");
  });

  test("clicking switch toggles on and off", async ({ page }) => {
    const sw = preview(page).locator('input[role="switch"]').first();
    await expect(sw).not.toBeChecked();

    await sw.click();
    await expect(sw).toBeChecked();

    await sw.click();
    await expect(sw).not.toBeChecked();
  });

  test("checked switch is pre-toggled", async ({ page }) => {
    // First example has an unchecked and a checked switch — target the checked one
    const sw = preview(page).locator('input[role="switch"]:checked');
    await expect(sw).toBeChecked();
  });

  test("disabled switch cannot be toggled", async ({ page }) => {
    const sw = page
      .locator('.snippet-preview > .cider input[role="switch"][disabled]')
      .first();
    await expect(sw).toBeDisabled();
  });

  test("checked vs unchecked have different background color", async ({
    page,
    browserName,
  }) => {
    skipWebkitScope(browserName);
    const unchecked = preview(page).locator('input[role="switch"]').first();
    const checked = preview(page)
      .locator('input[role="switch"]:checked')
      .first();
    const uncheckedBg = await css(unchecked, "backgroundColor");
    const checkedBg = await css(checked, "backgroundColor");
    expect(checkedBg).not.toBe(uncheckedBg);
  });

  test("focus-visible shows ring", async ({ page, browserName }) => {
    skipWebkitScope(browserName);
    const sw = preview(page).locator('input[role="switch"]').first();
    await focusViaKeyboard(page, sw);
    const shadow = await css(sw, "boxShadow");
    expect(shadow).not.toBe("none");
  });
});
