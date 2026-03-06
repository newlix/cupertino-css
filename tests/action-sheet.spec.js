import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('Action Sheet', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'action-sheet');
  });

  test('open action sheet and close via cancel', async ({ page }) => {
    const dialog = page.locator('#sheet1');
    await expect(dialog).not.toBeVisible();

    await preview(page).locator('button:has-text("Share Photo")').click();
    await expect(dialog).toBeVisible();

    await dialog.locator('button:has-text("Cancel")').click();
    await expect(dialog).not.toBeVisible();
  });

  test('action sheet has multiple groups', async ({ page }) => {
    await preview(page).locator('button:has-text("Share Photo")').click();
    const dialog = page.locator('#sheet1');
    await expect(dialog).toBeVisible();

    const groups = dialog.locator('.action-sheet-group');
    const count = await groups.count();
    expect(count).toBe(2);

    await dialog.locator('button:has-text("Cancel")').click();
  });

  test('clicking action button closes sheet', async ({ page }) => {
    const dialog = page.locator('#sheet1');
    await preview(page).locator('button:has-text("Share Photo")').click();
    await expect(dialog).toBeVisible();

    await dialog.locator('button:has-text("Copy Link")').click();
    await expect(dialog).not.toBeVisible();
  });

  test('close via Escape key', async ({ page }) => {
    const dialog = page.locator('#sheet1');
    await preview(page).locator('button:has-text("Share Photo")').click();
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('close via backdrop click', async ({ page }) => {
    const dialog = page.locator('#sheet1');
    await preview(page).locator('button:has-text("Share Photo")').click();
    await expect(dialog).toBeVisible();

    await dialog.evaluate(d => {
      d.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      d.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await expect(dialog).not.toBeVisible();
  });

  test('scroll lock is set when action sheet is open', async ({ page }) => {
    const dialog = page.locator('#sheet1');
    await preview(page).locator('button:has-text("Share Photo")').click();
    await expect(dialog).toBeVisible();

    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe('hidden');

    await dialog.locator('button:has-text("Cancel")').click();
    await expect(dialog).not.toBeVisible();

    await expect(async () => {
      const overflowAfter = await page.evaluate(() => document.body.style.overflow);
      expect(overflowAfter).toBe('');
    }).toPass({ timeout: 2000 });
  });

  test('focus is restored to trigger after close', async ({ page }) => {
    const trigger = preview(page).locator('button:has-text("Share Photo")');
    await trigger.click();
    const dialog = page.locator('#sheet1');
    await expect(dialog).toBeVisible();

    await dialog.locator('button:has-text("Cancel")').click();
    await expect(dialog).not.toBeVisible();

    await expect(trigger).toBeFocused();
  });

  test('with-header example shows title and message', async ({ page }) => {
    await preview(page, 1).locator('button:has-text("Delete Item")').click();
    const dialog = page.locator('#sheet2');
    await expect(dialog).toBeVisible();

    await expect(dialog.locator('.action-sheet-title')).toHaveText('Remove this item?');
    await expect(dialog.locator('.action-sheet-message')).toHaveText('This action cannot be undone.');

    await dialog.locator('button:has-text("Cancel")').click();
  });
});
