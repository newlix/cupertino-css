import { test, expect } from '@playwright/test';

test.describe('Sheet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/site/components/sheet.html');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('open sheet via button, close via close button', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const sheet = page.locator('#demo-sheet-right');

    await expect(sheet).not.toBeVisible();

    await preview.locator('button:has-text("Open Sheet")').click();
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('h2')).toHaveText('Edit Profile');

    await sheet.locator('.sheet-close').click();
    await expect(sheet).not.toBeVisible();
  });

  test('close sheet via backdrop click', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const sheet = page.locator('#demo-sheet-right');

    await preview.locator('button:has-text("Open Sheet")').click();
    await expect(sheet).toBeVisible();

    // Dispatch click directly on sheet element (e.target === sheet triggers close)
    await sheet.evaluate(s => {
      s.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await expect(sheet).not.toBeVisible();
  });
});
