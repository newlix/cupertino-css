import { test, expect } from '@playwright/test';
import { goto, preview, css, focusViaKeyboard } from './helpers.js';

test.describe('Page Control', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'page-control');
  });

  test('current page dot has full opacity', async ({ page }) => {
    const current = preview(page).locator('.page-control button[aria-current="page"]');
    await expect(current).toBeVisible();

    const opacity = await css(current, 'opacity');
    expect(Number(opacity)).toBe(1);
  });

  test('inactive dots have reduced opacity', async ({ page }) => {
    const inactive = preview(page).locator('.page-control button:not([aria-current="page"])').first();
    const opacity = await css(inactive, 'opacity');
    expect(Number(opacity)).toBeLessThan(1);
  });

  test('dot has focus-visible outline', async ({ page }) => {
    const dot = preview(page).locator('.page-control button').first();
    await focusViaKeyboard(page, dot);

    const outline = await css(dot, 'outlineStyle');
    expect(outline).toBe('solid');
  });

  test('middle active example shows third dot as current', async ({ page }) => {
    const dots = preview(page, 1).locator('.page-control button');
    await expect(dots).toHaveCount(5);

    const third = dots.nth(2);
    await expect(third).toHaveAttribute('aria-current', 'page');

    const first = dots.nth(0);
    await expect(first).not.toHaveAttribute('aria-current', 'page');
  });

  test('many pages example renders all 10 dots', async ({ page }) => {
    const dots = preview(page, 2).locator('.page-control button');
    await expect(dots).toHaveCount(10);
  });
});
