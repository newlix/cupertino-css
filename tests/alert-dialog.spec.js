import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('Alert Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'alert-dialog');
  });

  test('open alert dialog and close via cancel', async ({ page }) => {
    const dialog = page.locator('#demo-alert-dialog');
    await expect(dialog).not.toBeVisible();

    await preview(page).locator('button:has-text("Delete Account")').click();
    await expect(dialog).toBeVisible();

    await dialog.locator('button:has-text("Cancel")').click();
    await expect(dialog).not.toBeVisible();
  });

  test('destructive alert dialog opens and closes', async ({ page }) => {
    const dialog = page.locator('#demo-alert-destructive');
    await expect(dialog).not.toBeVisible();

    await preview(page, 1).locator('button:has-text("Delete Project")').first().click();
    await expect(dialog).toBeVisible();

    await dialog.locator('button:has-text("Cancel")').click();
    await expect(dialog).not.toBeVisible();
  });

  test('close alert dialog via backdrop click', async ({ page }) => {
    const dialog = page.locator('#demo-alert-dialog');

    await preview(page).locator('button:has-text("Delete Account")').click();
    await expect(dialog).toBeVisible();

    await dialog.evaluate(d => d.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await expect(dialog).not.toBeVisible();
  });
});
