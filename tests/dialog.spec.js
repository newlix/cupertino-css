import { test, expect } from '@playwright/test';

test.describe('Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/site/components/dialog.html');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('open dialog via button and close via cancel', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const dialog = page.locator('#demo-dialog-1');

    await expect(dialog).not.toBeVisible();

    await preview.locator('button:has-text("Open Dialog")').click();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('h2')).toHaveText('Are you sure?');

    await dialog.locator('button:has-text("Cancel")').click();
    await expect(dialog).not.toBeVisible();
  });

  test('close dialog via backdrop click', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const dialog = page.locator('#demo-dialog-1');

    await preview.locator('button:has-text("Open Dialog")').click();
    await expect(dialog).toBeVisible();

    // Dispatch click directly on dialog element (e.target === dialog triggers close)
    await dialog.evaluate(d => {
      d.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await expect(dialog).not.toBeVisible();
  });
});
