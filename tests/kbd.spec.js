import { test, expect } from '@playwright/test';
import { goto, preview, css } from './helpers.js';

test.describe('Kbd', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'kbd');
  });

  test('kbd element renders with background and box-shadow', async ({ page }) => {
    const kbd = preview(page).locator('kbd').first();
    await expect(kbd).toBeVisible();
    const bg = await css(kbd, 'backgroundColor');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    const shadow = await css(kbd, 'boxShadow');
    expect(shadow).not.toBe('none');
  });

  test('kbd has correct font size and min dimensions', async ({ page }) => {
    const kbd = preview(page).locator('kbd').first();
    expect(await css(kbd, 'fontSize')).toBe('13px');
    const height = parseFloat(await css(kbd, 'height'));
    expect(height).toBeGreaterThanOrEqual(20);
    const width = parseFloat(await css(kbd, 'minWidth'));
    expect(width).toBeGreaterThanOrEqual(20);
  });

  test('kbd renders inline within text', async ({ page }) => {
    const kbd = preview(page, 2).locator('kbd').first();
    expect(await css(kbd, 'display')).toContain('inline');
  });

  test('multiple kbd elements in shortcut have consistent height', async ({ page }) => {
    const keys = preview(page, 1).locator('kbd');
    const count = await keys.count();
    expect(count).toBeGreaterThan(1);
    const heights = new Set();
    for (let i = 0; i < Math.min(count, 4); i++) {
      heights.add(await css(keys.nth(i), 'height'));
    }
    expect(heights.size).toBe(1);
  });
});
