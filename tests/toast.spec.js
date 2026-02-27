import { test, expect } from '@playwright/test';

test.describe('Toast', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/site/components/toast.html');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('static toast is visible and close button removes it', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const toast = preview.locator('.toast');

    await expect(toast).toBeVisible();
    await expect(toast.locator('.toast-title')).toHaveText('Saved successfully');

    await toast.locator('.toast-close').click();
    await expect(toast).toHaveCount(0);
  });

  test('programmatic showToast creates toast', async ({ page }) => {
    const programmaticPreview = page.locator('.snippet > figure').last();
    await programmaticPreview.locator('button:has-text("Show Toast")').click();

    const toast = page.locator('#toast-container .toast');
    await expect(toast.first()).toBeVisible();
    await expect(toast.first().locator('.toast-title')).toHaveText('Hello!');
  });
});
