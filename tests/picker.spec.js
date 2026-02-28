import { test, expect } from '@playwright/test';

test.describe('Picker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/site/components/picker.html');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('click trigger opens dropdown', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();
    const picker = preview.locator('.picker').first();
    const trigger = picker.locator('button');

    await expect(picker).not.toHaveAttribute('data-open', '');

    await trigger.click();
    await expect(picker).toHaveAttribute('data-open', '');
  });

  test('select option updates display and closes', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();
    const picker = preview.locator('.picker').first();
    const trigger = picker.locator('button');

    await trigger.click();
    await expect(picker).toHaveAttribute('data-open', '');

    await picker.locator('[role="option"]:has-text("Remix")').click();

    await expect(picker).not.toHaveAttribute('data-open', '');
    await expect(trigger.locator('span')).toHaveText('Remix');
    await expect(picker.locator('input[type="hidden"]')).toHaveValue('Remix');
  });

  test('type to filter options', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();
    const picker = preview.locator('.picker').first();
    const trigger = picker.locator('button');

    await trigger.click();

    const searchInput = picker.locator('header input');
    await searchInput.fill('next');

    const visibleOptions = picker.locator('[role="option"]:not([hidden])');
    await expect(visibleOptions).toHaveCount(1);
    await expect(visibleOptions.first()).toHaveText('Next.js');
  });

  test('Escape closes picker', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();
    const picker = preview.locator('.picker').first();
    const trigger = picker.locator('button');

    await trigger.click();
    await expect(picker).toHaveAttribute('data-open', '');

    await page.keyboard.press('Escape');
    await expect(picker).not.toHaveAttribute('data-open', '');
  });
});
