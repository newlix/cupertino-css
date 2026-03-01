import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'dialog');
  });

  test('open alert and close via cancel', async ({ page }) => {
    const dialog = preview(page).locator('dialog');
    await expect(dialog).not.toBeVisible();

    await preview(page).locator('button:has-text("Close Document")').click();
    await expect(dialog).toBeVisible();

    await dialog.locator('button:has-text("Cancel")').click();
    await expect(dialog).not.toBeVisible();
  });

  test('destructive alert opens and closes', async ({ page }) => {
    const dialog = preview(page, 1).locator('dialog');
    await expect(dialog).not.toBeVisible();

    await preview(page, 1).locator('button:has-text("Delete Project")').first().click();
    await expect(dialog).toBeVisible();

    await dialog.locator('button:has-text("Cancel")').click();
    await expect(dialog).not.toBeVisible();
  });

  test('open form dialog via button and close via cancel', async ({ page }) => {
    const dialog = preview(page, 3).locator('dialog');

    await expect(dialog).not.toBeVisible();

    await preview(page, 3).locator('button:has-text("Edit Profile")').click();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('h2')).toHaveText('Edit Profile');

    await dialog.locator('button:has-text("Cancel")').click();
    await expect(dialog).not.toBeVisible();
  });

  test('close dialog via backdrop click', async ({ page }) => {
    const dialog = preview(page).locator('dialog');

    await preview(page).locator('button:has-text("Close Document")').click();
    await expect(dialog).toBeVisible();

    await dialog.evaluate(d => d.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await expect(dialog).not.toBeVisible();
  });
});
