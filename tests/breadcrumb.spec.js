import { test, expect } from '@playwright/test';
import { goto, preview, css } from './helpers.js';

test.describe('Breadcrumb', () => {
  test('link shows underline on hover', async ({ page }) => {
    await goto(page, 'breadcrumb');
    const link = preview(page).locator('.breadcrumb a').first();

    // Before hover: no underline
    const before = await css(link, 'textDecorationLine');
    expect(before).toBe('none');

    // Hover: underline appears
    await link.hover();
    await page.waitForTimeout(200);
    const after = await css(link, 'textDecorationLine');
    expect(after).toBe('underline');
  });

  test('hover underline uses muted foreground color', async ({ page }) => {
    await goto(page, 'breadcrumb');
    const link = preview(page).locator('.breadcrumb a').first();

    await link.hover();
    await page.waitForTimeout(200);
    const decoColor = await css(link, 'textDecorationColor');
    const textColor = await css(link, 'color');

    // Underline color should differ from the hovered text color (muted, not foreground)
    expect(decoColor).not.toBe(textColor);
  });
});
