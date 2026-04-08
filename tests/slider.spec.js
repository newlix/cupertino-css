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
    }).toPass({ timeout: 1000 });
  });
});
