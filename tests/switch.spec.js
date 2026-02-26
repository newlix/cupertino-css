import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('Switch', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'switch');
  });

  test('clicking switch toggles on and off', async ({ page }) => {
    const sw = preview(page).locator('.switch');
    const wasChecked = await sw.isChecked();

    await sw.click();
    expect(await sw.isChecked()).toBe(!wasChecked);

    await sw.click();
    expect(await sw.isChecked()).toBe(wasChecked);
  });

  test('checked switch is pre-toggled', async ({ page }) => {
    // Second example should have a pre-checked switch
    const sw = preview(page, 1).locator('.switch');
    await expect(sw).toBeChecked();
  });

  test('disabled switch cannot be toggled', async ({ page }) => {
    const sw = page.locator('.docs-example-preview .switch[disabled]').first();
    await expect(sw).toBeDisabled();
  });
});
