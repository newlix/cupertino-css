import { test, expect } from "@playwright/test";
import {
  goto,
  preview,
  css,
  focusViaKeyboard,
  skipWebkitScope,
} from "./helpers.js";

test.describe("Slider", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "slider");
  });

  test("slider has initial value", async ({ page }) => {
    const slider = preview(page).locator(".slider").first();
    await expect(slider).toBeVisible();

    const value = await slider.inputValue();
    expect(Number(value)).toBe(33);
  });

  test("slider value can be changed", async ({ page }) => {
    const slider = preview(page).locator(".slider").first();
    const before = Number(await slider.inputValue());

    const target = before === 75 ? 25 : 75;
    await slider.fill(String(target));
    const after = Number(await slider.inputValue());

    expect(after).toBe(target);
    expect(after).not.toBe(before);
  });

  test("slider updates --slider-value CSS variable on change", async ({
    page,
  }) => {
    const slider = preview(page).locator(".slider").first();
    await page.waitForFunction(
      () => document.querySelector(".slider")?._sliderInit,
    );
    await slider.fill("50");
    const pct = await slider.evaluate((el) =>
      el.style.getPropertyValue("--slider-value"),
    );
    expect(pct).toBe("50%");
  });

  test("disabled slider is not interactive", async ({ page }) => {
    const slider = page
      .locator(".snippet-preview > .cider .slider[disabled]")
      .first();
    await expect(slider).toBeDisabled();
  });

  test("focus-visible removes default outline", async ({
    page,
    browserName,
  }) => {
    skipWebkitScope(browserName);
    const slider = preview(page).locator(".slider").first();
    await focusViaKeyboard(page, slider);
    await expect(async () => {
      expect(await css(slider, "outlineStyle")).toBe("none");
    }).toPass({ timeout: 3000 });
  });

  test("ArrowRight increments and updates fill", async ({ page }) => {
    const slider = preview(page).locator(".slider").first();
    await page.waitForFunction(
      () => document.querySelector(".slider")?._sliderInit,
    );
    await slider.focus();
    const before = Number(await slider.inputValue());

    await page.keyboard.press("ArrowRight");
    await expect
      .poll(async () => Number(await slider.inputValue()))
      .toBe(before + 1);
    const pct = await slider.evaluate((el) =>
      el.style.getPropertyValue("--slider-value"),
    );
    // value=34, max=100, min=0 → 34%
    expect(pct).toBe("34%");
  });

  test("ArrowLeft decrements and updates fill", async ({ page }) => {
    const slider = preview(page).locator(".slider").first();
    await page.waitForFunction(
      () => document.querySelector(".slider")?._sliderInit,
    );
    await slider.focus();
    const before = Number(await slider.inputValue());

    await page.keyboard.press("ArrowLeft");
    await expect
      .poll(async () => Number(await slider.inputValue()))
      .toBe(before - 1);
  });

  test("Home jumps to min, End jumps to max", async ({ page }) => {
    const slider = preview(page).locator(".slider").first();
    await page.waitForFunction(
      () => document.querySelector(".slider")?._sliderInit,
    );
    await slider.focus();

    await page.keyboard.press("End");
    await expect.poll(async () => Number(await slider.inputValue())).toBe(100);

    await page.keyboard.press("Home");
    await expect.poll(async () => Number(await slider.inputValue())).toBe(0);
  });

  test("programmatic value assignment updates the CSS fill", async ({
    page,
  }) => {
    // Ciderui-specific: the slider intercepts HTMLInputElement.prototype.value
    // setter so JS code doing `slider.value = 75` also updates --slider-value.
    // Native <input> doesn't fire 'input' on programmatic assignment.
    const slider = preview(page).locator(".slider").first();
    await page.waitForFunction(
      () => document.querySelector(".slider")?._sliderInit,
    );

    await slider.evaluate((el) => {
      el.value = "75";
    });
    const pct = await slider.evaluate((el) =>
      el.style.getPropertyValue("--slider-value"),
    );
    expect(pct).toBe("75%");
  });
});
