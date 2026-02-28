import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('Slider', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'slider');
  });

  test('slider has initial value', async ({ page }) => {
    const slider = preview(page).locator('.slider').first();
    await expect(slider).toBeVisible();

    const value = await slider.inputValue();
    expect(Number(value)).toBeGreaterThanOrEqual(0);
  });

  test('slider value can be changed', async ({ page }) => {
    const slider = preview(page).locator('.slider').first();
    const before = Number(await slider.inputValue());

    await slider.fill('75');
    const after = Number(await slider.inputValue());

    expect(after).toBe(75);
    expect(after).not.toBe(before);
  });

  test('disabled slider is not interactive', async ({ page }) => {
    const slider = page.locator('.snippet-preview > figure .slider[disabled]').first();
    await expect(slider).toBeDisabled();
  });
});
