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

  test('close dialog via Escape key', async ({ page }) => {
    const dialog = preview(page).locator('dialog');

    await preview(page).locator('button:has-text("Close Document")').click();
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('scroll lock is set when dialog is open', async ({ page }) => {
    const dialog = preview(page).locator('dialog');

    await preview(page).locator('button:has-text("Close Document")').click();
    await expect(dialog).toBeVisible();

    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe('hidden');

    await dialog.locator('button:has-text("Cancel")').click();
    await expect(dialog).not.toBeVisible();

    const overflowAfter = await page.evaluate(() => document.body.style.overflow);
    expect(overflowAfter).toBe('');
  });

  test('focus is restored to trigger after dialog closes', async ({ page }) => {
    const trigger = preview(page).locator('button:has-text("Close Document")');

    await trigger.click();
    const dialog = preview(page).locator('dialog');
    await expect(dialog).toBeVisible();

    await dialog.locator('button:has-text("Cancel")').click();
    await expect(dialog).not.toBeVisible();

    await expect(trigger).toBeFocused();
  });

  test('focus trap wraps within dialog', async ({ page }) => {
    const dialog = preview(page, 3).locator('dialog');

    await preview(page, 3).locator('button:has-text("Edit Profile")').click();
    await expect(dialog).toBeVisible();

    // Tab through all focusable elements to reach the last one
    const focusable = await dialog.evaluate(d => {
      const sel = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return d.querySelectorAll(sel).length;
    });
    expect(focusable).toBeGreaterThan(1);

    // Focus the last focusable element, then Tab should wrap to first
    await dialog.evaluate(d => {
      const sel = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const els = d.querySelectorAll(sel);
      els[els.length - 1].focus();
    });
    await page.keyboard.press('Tab');

    // Focus should have wrapped to the first focusable element
    const wrappedToFirst = await dialog.evaluate(d => {
      const sel = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return document.activeElement === d.querySelectorAll(sel)[0];
    });
    expect(wrappedToFirst).toBe(true);

    await dialog.locator('button:has-text("Cancel")').click();
  });
});
