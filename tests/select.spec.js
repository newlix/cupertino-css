import { test, expect } from '@playwright/test';

test.describe('Select', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/site/components/select.html');
    await page.waitForLoadState('networkidle');
  });

  test('native select allows choosing an option', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const select = preview.locator('select');

    await expect(select).toHaveValue('');

    await select.selectOption('1');
    await expect(select).toHaveValue('1');
  });

  test('grouped select works', async ({ page }) => {
    const preview = page.locator('.snippet > figure').nth(1);
    const select = preview.locator('select');

    await select.selectOption('strawberry');
    await expect(select).toHaveValue('strawberry');
  });

  test('disabled select cannot be changed', async ({ page }) => {
    const preview = page.locator('.snippet > figure').nth(2);
    const select = preview.locator('select');

    await expect(select).toBeDisabled();
  });
});
