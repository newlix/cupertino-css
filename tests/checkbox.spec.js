import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('Checkbox', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'checkbox');
  });

  test('clicking checkbox toggles checked state', async ({ page }) => {
    const cb = preview(page).locator('input[type="checkbox"]').first();
    await expect(cb).not.toBeChecked();

    await cb.check();
    await expect(cb).toBeChecked();

    await cb.uncheck();
    await expect(cb).not.toBeChecked();
  });

  test('clicking label toggles checkbox', async ({ page }) => {
    const label = preview(page, 2).locator('label').first();
    const cb = label.locator('input[type="checkbox"]');
    await expect(cb).not.toBeChecked();

    await label.locator('span').click();
    await expect(cb).toBeChecked();
  });

  test('disabled checkbox cannot be toggled', async ({ page }) => {
    const cb = page.locator('.snippet-preview > figure input[type="checkbox"][disabled]').first();
    await expect(cb).toBeDisabled();
  });
});
