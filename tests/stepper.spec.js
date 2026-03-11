import { test, expect } from "@playwright/test";
import { goto, preview, css, focusViaKeyboard } from "./helpers.js";

test.describe("Stepper", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "stepper");
    await page.waitForFunction(
      () => document.querySelector("[data-stepper]")?._stepperInit,
    );
  });

  test("stepper renders with two buttons", async ({ page }) => {
    const stepper = preview(page).locator(".stepper");
    await expect(stepper).toBeVisible();
    const dec = stepper.locator("[data-stepper-decrement]");
    const inc = stepper.locator("[data-stepper-increment]");
    await expect(dec).toBeVisible();
    await expect(inc).toBeVisible();
  });

  test("stepper has correct border-radius", async ({ page }) => {
    const stepper = preview(page).locator(".stepper");
    const radius = parseFloat(await css(stepper, "borderRadius"));
    expect(radius).toBeGreaterThan(0);
  });

  test("increment button increases value", async ({ page }) => {
    const stepper = preview(page, 1).locator(".stepper");
    const output = stepper.locator("output");
    const before = await output.textContent();

    await stepper.locator("[data-stepper-increment]").click();
    const after = await output.textContent();
    expect(Number(after)).toBe(Number(before) + 1);
  });

  test("decrement button decreases value", async ({ page }) => {
    const stepper = preview(page, 1).locator(".stepper");
    const output = stepper.locator("output");
    const before = await output.textContent();

    await stepper.locator("[data-stepper-decrement]").click();
    const after = await output.textContent();
    expect(Number(after)).toBe(Number(before) - 1);
  });

  test("decrement disabled at min boundary", async ({ page }) => {
    const stepper = preview(page).locator(".stepper");
    // data-value="3" data-min="0": click decrement 3 times to reach min
    const dec = stepper.locator("[data-stepper-decrement]");
    await dec.click();
    await dec.click();
    await dec.click();
    await expect(dec).toBeDisabled();
  });

  test("increment disabled at max boundary", async ({ page }) => {
    const stepper = preview(page).locator(".stepper");
    // data-value="3" data-max="10": click increment 7 times to reach max
    const inc = stepper.locator("[data-stepper-increment]");
    for (let i = 0; i < 7; i++) await inc.click();
    await expect(inc).toBeDisabled();
  });

  test("linked input syncs with stepper", async ({ page }) => {
    const stepper = preview(page, 2).locator(".stepper");
    const input = preview(page, 2).locator("#qty");
    const before = await input.inputValue();

    await stepper.locator("[data-stepper-increment]").click();
    const after = await input.inputValue();
    expect(Number(after)).toBe(Number(before) + 1);
  });

  test("focus-visible shows ring on stepper button", async ({ page }) => {
    const btn = preview(page).locator("[data-stepper-increment]");
    await focusViaKeyboard(page, btn);
    await expect(async () => {
      const style = await css(btn, "outlineStyle");
      expect(style).toBe("solid");
    }).toPass({ timeout: 1000 });
  });
});
