import { test, expect } from '@playwright/test';
import { goto, preview, css, setDark, setLight, focusViaKeyboard } from './helpers.js';

test.describe('Segmented Control', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'segmented-control');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('clicking segment switches active panel', async ({ page }) => {
    const seg1 = preview(page).locator('[data-tab="seg-1"]');
    const seg2 = preview(page).locator('[data-tab="seg-2"]');
    const panel1 = preview(page).locator('[data-tab-panel="seg-1"]');
    const panel2 = preview(page).locator('[data-tab-panel="seg-2"]');

    await expect(seg1).toHaveAttribute('data-active', '');
    await expect(panel1).toHaveAttribute('data-active', '');
    await expect(panel2).not.toHaveAttribute('data-active', '');

    await seg2.click();

    await expect(seg2).toHaveAttribute('data-active', '');
    await expect(seg1).not.toHaveAttribute('data-active', '');
    await expect(panel2).toHaveAttribute('data-active', '');
    await expect(panel1).not.toHaveAttribute('data-active', '');
  });

  test('active segment has background and box-shadow', async ({ page }) => {
    const active = preview(page).locator('[data-tab="seg-1"]');
    const bg = await css(active, 'backgroundColor');
    const shadow = await css(active, 'boxShadow');

    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(shadow).not.toBe('none');
  });

  test('inactive segment has no box-shadow', async ({ page }) => {
    const inactive = preview(page).locator('[data-tab="seg-2"]');
    const shadow = await css(inactive, 'boxShadow');
    expect(shadow).toBe('none');
  });

  test('keyboard arrow navigation switches segments', async ({ page }) => {
    const seg1 = preview(page).locator('[data-tab="seg-1"]');
    const seg2 = preview(page).locator('[data-tab="seg-2"]');

    await seg1.focus();
    await page.keyboard.press('ArrowRight');

    await expect(seg2).toHaveAttribute('data-active', '');
    await expect(seg2).toBeFocused();
  });

  test('ARIA attributes are set correctly', async ({ page }) => {
    const seg1 = preview(page).locator('[data-tab="seg-1"]');
    await expect(seg1).toHaveAttribute('role', 'tab');
    await expect(seg1).toHaveAttribute('aria-selected', 'true');

    const seg2 = preview(page).locator('[data-tab="seg-2"]');
    await expect(seg2).toHaveAttribute('role', 'tab');
    await expect(seg2).toHaveAttribute('aria-selected', 'false');

    const panel1 = preview(page).locator('[data-tab-panel="seg-1"]');
    await expect(panel1).toHaveAttribute('role', 'tabpanel');
  });

  test('dark mode: active segment still has background', async ({ page }) => {
    await setDark(page);
    const active = preview(page).locator('[data-tab="seg-1"]');
    const bg = await css(active, 'backgroundColor');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    await setLight(page);
  });
});
