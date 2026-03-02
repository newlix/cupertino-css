import { test, expect } from '@playwright/test';
import { goto, preview, css } from './helpers.js';

test.describe('Breadcrumb', () => {
  test('link changes color on hover', async ({ page }) => {
    await goto(page, 'breadcrumb');
    const link = preview(page).locator('.breadcrumb a').first();

    const before = await css(link, 'color');

    await link.hover();
    await page.waitForTimeout(200);
    const after = await css(link, 'color');

    // Hover changes text color (tertiary → foreground)
    expect(after).not.toBe(before);
  });

  test('link has underline on hover', async ({ page }) => {
    await goto(page, 'breadcrumb');
    const link = preview(page).locator('.breadcrumb a').first();

    await link.hover();
    await page.waitForTimeout(200);
    const deco = await css(link, 'textDecorationLine');
    expect(deco).toBe('underline');
  });
});
