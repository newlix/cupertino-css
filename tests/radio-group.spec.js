import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('Radio Group', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'radio-group');
  });

  test('clicking radio selects it', async ({ page }) => {
    const radios = preview(page).locator('.radio');
    const second = radios.nth(1);
    await expect(second).not.toBeChecked();

    await second.click();
    await expect(second).toBeChecked();
  });

  test('selecting one deselects others in same group', async ({ page }) => {
    const radios = preview(page).locator('.radio');
    const first = radios.first();
    const second = radios.nth(1);

    await expect(first).toBeChecked();
    await second.click();

    await expect(second).toBeChecked();
    await expect(first).not.toBeChecked();
  });

  test('disabled radio cannot be selected', async ({ page }) => {
    const disabled = page.locator('.docs-example-preview .radio[disabled]').first();
    await expect(disabled).toBeDisabled();
  });
});
