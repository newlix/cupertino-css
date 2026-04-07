import { test, expect } from "@playwright/test";
import { goto, preview, css, setDark, focusViaKeyboard } from "./helpers.js";

test.describe("Radio Group", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "radio-group");
  });

  test("clicking radio selects it", async ({ page }) => {
    const radios = preview(page).locator('input[type="radio"]');
    const second = radios.nth(1);
    await expect(second).not.toBeChecked();

    await second.click();
    await expect(second).toBeChecked();
  });

  test("selecting one deselects others in same group", async ({ page }) => {
    const radios = preview(page).locator('input[type="radio"]');
    const first = radios.first();
    const second = radios.nth(1);

    await expect(first).toBeChecked();
    await second.click();

    await expect(second).toBeChecked();
    await expect(first).not.toBeChecked();
  });

  test("disabled radio cannot be selected", async ({ page }) => {
    const disabled = page
      .locator('.snippet-preview > .cider input[type="radio"][disabled]')
      .first();
    await expect(disabled).toBeDisabled();
  });

  test("hover on checked radio changes border", async ({ page }) => {
    const radio = page
      .locator('.snippet-preview > .cider input[type="radio"]:checked')
      .first();
    const before = await css(radio, "borderColor");
    await radio.hover();
    await expect(async () => {
      expect(await css(radio, "borderColor")).not.toBe(before);
    }).toPass({ timeout: 1000 });
  });

  test("hover on unchecked radio changes border", async ({ page }) => {
    const radio = page
      .locator(
        '.snippet-preview > .cider input[type="radio"]:not(:checked):not(:disabled)',
      )
      .first();
    const before = await css(radio, "borderColor");
    await radio.hover();
    await expect(async () => {
      expect(await css(radio, "borderColor")).not.toBe(before);
    }).toPass({ timeout: 1000 });
  });

  test("focus-visible shows ring", async ({ page }) => {
    const radio = page
      .locator('.snippet-preview > .cider input[type="radio"]')
      .first();
    const before = await css(radio, "boxShadow");
    await focusViaKeyboard(page, radio);
    await expect(async () => {
      const after = await css(radio, "boxShadow");
      expect(after).not.toBe("none");
      expect(after).not.toBe(before);
    }).toPass({ timeout: 1000 });
  });

  test("dark mode: checked vs unchecked are distinguishable", async ({
    page,
  }) => {
    await setDark(page);
    const checked = page
      .locator('.snippet-preview > .cider input[type="radio"]:checked')
      .first();
    const unchecked = page
      .locator(
        '.snippet-preview > .cider input[type="radio"]:not(:checked):not(:disabled)',
      )
      .first();
    expect(await css(checked, "borderColor")).not.toBe(
      await css(unchecked, "borderColor"),
    );
  });
});
