import { test, expect } from "@playwright/test";
import { goto, css, focusViaKeyboard } from "./helpers.js";

test.describe("CSS State Specificity", () => {
  test("radio: hover on checked shows hover feedback", async ({ page }) => {
    await goto(page, "radio-group");

    // First radio in the Default example is pre-checked
    const radio = page
      .locator('.snippet-preview > figure input[type="radio"]:checked')
      .first();
    const before = await css(radio, "borderColor");

    await radio.hover();
    await expect(async () => {
      expect(await css(radio, "borderColor")).not.toBe(before);
    }).toPass({ timeout: 1000 });
  });

  test("radio: hover changes unchecked border-color", async ({ page }) => {
    await goto(page, "radio-group");

    const radio = page
      .locator(
        '.snippet-preview > figure input[type="radio"]:not(:checked):not(:disabled)',
      )
      .first();
    const before = await css(radio, "borderColor");

    await radio.hover();
    await expect(async () => {
      expect(await css(radio, "borderColor")).not.toBe(before);
    }).toPass({ timeout: 1000 });
  });

  test("checkbox: hover on checked shows hover feedback", async ({ page }) => {
    await goto(page, "checkbox");

    // First example has an unchecked and a checked checkbox — target the checked one
    const cb = page
      .locator('.snippet-preview > figure input[type="checkbox"]:checked')
      .first();
    const bgBefore = await css(cb, "backgroundColor");

    await cb.hover();
    await expect(async () => {
      expect(await css(cb, "backgroundColor")).not.toBe(bgBefore);
    }).toPass({ timeout: 1000 });
  });

  test("switch: checked and unchecked have distinct backgrounds", async ({
    page,
  }) => {
    await goto(page, "switch");

    const checked = page
      .locator('.snippet-preview > figure input[role="switch"]:checked')
      .first();
    const unchecked = page
      .locator(
        '.snippet-preview > figure input[role="switch"]:not(:checked):not(:disabled)',
      )
      .first();

    const bgOn = await css(checked, "backgroundColor");
    const bgOff = await css(unchecked, "backgroundColor");

    expect(bgOn).not.toBe(bgOff);
  });

  test("disabled radio has opacity <= 0.5", async ({ page }) => {
    await goto(page, "radio-group");

    const disabled = page
      .locator('.snippet-preview > figure input[type="radio"][disabled]')
      .first();
    expect(parseFloat(await css(disabled, "opacity"))).toBeLessThanOrEqual(0.5);
  });

  test("disabled checkbox has cursor not-allowed", async ({ page }) => {
    await goto(page, "checkbox");

    const disabled = page
      .locator('.snippet-preview > figure input[type="checkbox"][disabled]')
      .first();
    expect(await css(disabled, "cursor")).toBe("not-allowed");
  });

  test("disabled button has reduced opacity and no pointer-events", async ({
    page,
  }) => {
    await goto(page, "button");

    const disabled = page
      .locator(".snippet-preview > figure button[disabled]")
      .first();
    expect(parseFloat(await css(disabled, "opacity"))).toBeLessThan(1);
    expect(await css(disabled, "pointerEvents")).toBe("none");
  });

  test("input focus changes border-color to primary", async ({ page }) => {
    await goto(page, "text-field");

    const input = page
      .locator('.snippet-preview > figure input[type="text"]')
      .first();
    const beforeColor = await css(input, "borderColor");

    await focusViaKeyboard(page, input);
    await expect(async () => {
      expect(await css(input, "borderColor")).not.toBe(beforeColor);
    }).toPass({ timeout: 1000 });
  });
});
