import { test, expect } from '@playwright/test';
import { goto, preview, css } from './helpers.js';

test.describe('Breadcrumb', () => {
  test('link changes color on hover', async ({ page }) => {
    await goto(page, 'breadcrumb');
    const link = preview(page).locator('.breadcrumb a').first();

    const before = await css(link, 'color');

    await link.hover();
    await expect(async () => {
      expect(await css(link, 'color')).not.toBe(before);
    }).toPass({ timeout: 1000 });
  });

  test('link has no underline on hover', async ({ page }) => {
    await goto(page, 'breadcrumb');
    const link = preview(page).locator('.breadcrumb a').first();

    await link.hover();
    await expect(async () => {
      expect(await css(link, 'textDecorationLine')).toBe('none');
    }).toPass({ timeout: 1000 });
  });
});
