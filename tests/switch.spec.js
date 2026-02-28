import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('Switch', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'switch');
  });

  test('clicking switch toggles on and off', async ({ page }) => {
    const sw = preview(page).locator('input[role="switch"]').first();
    const wasChecked = await sw.isChecked();

    await sw.click();
    expect(await sw.isChecked()).toBe(!wasChecked);

    await sw.click();
    expect(await sw.isChecked()).toBe(wasChecked);
  });

  test('checked switch is pre-toggled', async ({ page }) => {
    // First example has an unchecked and a checked switch — target the checked one
    const sw = preview(page).locator('input[role="switch"]:checked');
    await expect(sw).toBeChecked();
  });

  test('disabled switch cannot be toggled', async ({ page }) => {
    const sw = page.locator('.snippet-preview > figure input[role="switch"][disabled]').first();
    await expect(sw).toBeDisabled();
  });
});
