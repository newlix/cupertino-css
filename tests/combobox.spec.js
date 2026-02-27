import { test, expect } from '@playwright/test';

test.describe('Combobox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/components/combobox.html');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('click trigger opens dropdown', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const combobox = preview.locator('.combobox').first();
    const trigger = combobox.locator('button');

    await expect(combobox).not.toHaveAttribute('data-open', '');

    await trigger.click();
    await expect(combobox).toHaveAttribute('data-open', '');
  });

  test('select option updates display and closes', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const combobox = preview.locator('.combobox').first();
    const trigger = combobox.locator('button');

    await trigger.click();
    await expect(combobox).toHaveAttribute('data-open', '');

    await combobox.locator('[role="option"]:has-text("Remix")').click();

    await expect(combobox).not.toHaveAttribute('data-open', '');
    await expect(trigger.locator('span')).toHaveText('Remix');
    await expect(combobox.locator('input[type="hidden"]')).toHaveValue('Remix');
  });

  test('type to filter options', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const combobox = preview.locator('.combobox').first();
    const trigger = combobox.locator('button');

    await trigger.click();

    const searchInput = combobox.locator('header input');
    await searchInput.fill('next');

    const visibleOptions = combobox.locator('[role="option"]:not([hidden])');
    await expect(visibleOptions).toHaveCount(1);
    await expect(visibleOptions.first()).toHaveText('Next.js');
  });

  test('Escape closes combobox', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const combobox = preview.locator('.combobox').first();
    const trigger = combobox.locator('button');

    await trigger.click();
    await expect(combobox).toHaveAttribute('data-open', '');

    await page.keyboard.press('Escape');
    await expect(combobox).not.toHaveAttribute('data-open', '');
  });
});
