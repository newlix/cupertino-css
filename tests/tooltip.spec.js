import { test, expect } from '@playwright/test';
import { goto, preview, css } from './helpers.js';

test.describe('Tooltip', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'tooltip');
  });

  test('tooltip content is hidden by default', async ({ page }) => {
    const content = preview(page).locator('.tooltip-content').first();
    // Tooltip content should be hidden (opacity 0 or visibility hidden or display none)
    const opacity = await css(content, 'opacity');
    const visibility = await css(content, 'visibility');

    const isHidden = opacity === '0' || visibility === 'hidden';
    expect(isHidden).toBe(true);
  });

  test('hover shows tooltip content', async ({ page }) => {
    const tooltip = preview(page).locator('.tooltip').first();
    const content = tooltip.locator('.tooltip-content');

    await tooltip.hover();
    await page.waitForTimeout(1300);

    const opacity = await css(content, 'opacity');
    const visibility = await css(content, 'visibility');

    const isVisible = opacity === '1' && visibility === 'visible';
    expect(isVisible).toBe(true);
  });
});
