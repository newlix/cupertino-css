import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('Drawer', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'drawer');
  });

  test('open bottom drawer and close via close button', async ({ page }) => {
    const drawer = page.locator('#demo-drawer-bottom');
    await expect(drawer).not.toBeVisible();

    await preview(page).locator('button:has-text("Open Drawer")').click();
    await expect(drawer).toBeVisible();
    await expect(drawer.locator('h2')).toBeVisible();

    await drawer.locator('.sheet-close').click();
    await expect(drawer).not.toBeVisible();
  });

  test('close drawer via backdrop click', async ({ page }) => {
    const drawer = page.locator('#demo-drawer-bottom');

    await preview(page).locator('button:has-text("Open Drawer")').click();
    await expect(drawer).toBeVisible();

    await drawer.evaluate(d => d.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await expect(drawer).not.toBeVisible();
  });

  test('top drawer opens from top', async ({ page }) => {
    const drawer = page.locator('#demo-drawer-top');

    await preview(page, 1).locator('button:has-text("Open Top Drawer")').click();
    await expect(drawer).toBeVisible();

    await drawer.locator('.sheet-close').click();
    await expect(drawer).not.toBeVisible();
  });
});
