import { test, expect } from '@playwright/test';
import { goto, preview, css, setDark, setLight, focusViaKeyboard } from './helpers.js';

test.describe('Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'pagination');
  });

  test('active button has distinct background', async ({ page }) => {
    const active = preview(page).locator('.pagination button[data-active]');
    await expect(active).toBeVisible();

    const bg = await css(active, 'backgroundColor');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('disabled button has reduced opacity and pointer-events none', async ({ page }) => {
    const disabled = preview(page).locator('.pagination button[disabled]');
    await expect(disabled).toBeVisible();

    const opacity = await css(disabled, 'opacity');
    expect(Number(opacity)).toBeLessThan(1);

    const pe = await css(disabled, 'pointerEvents');
    expect(pe).toBe('none');
  });

  test('non-active button has focus-visible outline', async ({ page }) => {
    const btn = preview(page).locator('.pagination button:not([data-active]):not([disabled])').first();
    await focusViaKeyboard(page, btn);

    const outline = await css(btn, 'outlineStyle');
    expect(outline).toBe('solid');
  });

  test('ellipsis span is present', async ({ page }) => {
    const ellipsis = preview(page).locator('.pagination > span');
    await expect(ellipsis).toBeVisible();
    await expect(ellipsis).toHaveText('...');
  });

  test('simple pagination has no disabled buttons', async ({ page }) => {
    const disabled = preview(page, 1).locator('.pagination button[disabled]');
    await expect(disabled).toHaveCount(0);

    const buttons = preview(page, 1).locator('.pagination button');
    await expect(buttons).toHaveCount(5);
  });

  test('dark mode: active button retains visible background', async ({ page }) => {
    const active = preview(page).locator('.pagination button[data-active]');
    const lightBg = await css(active, 'backgroundColor');

    await setDark(page);
    const darkBg = await css(active, 'backgroundColor');
    expect(darkBg).not.toBe('rgba(0, 0, 0, 0)');

    await setLight(page);
  });
});
