import { test, expect } from '@playwright/test';
import { goto, preview, css, setDark, focusViaKeyboard } from './helpers.js';

test.describe('Toolbar', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'toolbar');
  });

  test('toolbar renders with glass background and min-height', async ({ page }) => {
    const toolbar = preview(page).locator('.toolbar');
    await expect(toolbar).toBeVisible();
    const h = parseFloat(await css(toolbar, 'minHeight'));
    expect(h).toBe(44);
    const bg = await css(toolbar, 'backgroundColor');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('toolbar-group has background and border-radius', async ({ page }) => {
    const group = preview(page).locator('.toolbar-group').first();
    const bg = await css(group, 'backgroundColor');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    const radius = parseFloat(await css(group, 'borderRadius'));
    expect(radius).toBeGreaterThan(0);
  });

  test('toolbar-group buttons are connected with separators', async ({ page }) => {
    const buttons = preview(page).locator('.toolbar-group').first().locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(2);
    // Second button should have left border
    const secondBtn = buttons.nth(1);
    const borderLeft = await css(secondBtn, 'borderLeftStyle');
    expect(borderLeft).toBe('solid');
  });

  test('toolbar-spacer expands to fill space', async ({ page }) => {
    const spacer = preview(page).locator('.toolbar-spacer');
    const width = parseFloat(await css(spacer, 'width'));
    expect(width).toBeGreaterThan(0);
  });

  test('toolbar-bottom has top border instead of bottom', async ({ page }) => {
    const toolbar = preview(page, 1).locator('.toolbar-bottom');
    const borderTop = await css(toolbar, 'borderTopStyle');
    expect(borderTop).toBe('solid');
  });

  test('toolbar-title is visible with correct font weight', async ({ page }) => {
    const title = preview(page, 2).locator('.toolbar-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Document.txt');
    const weight = await css(title, 'fontWeight');
    expect(parseInt(weight)).toBeGreaterThanOrEqual(600);
  });

  test('focus-visible shows box-shadow ring on group button', async ({ page }) => {
    const btn = preview(page).locator('.toolbar-group button').first();
    await focusViaKeyboard(page, btn);
    await expect(async () => {
      const shadow = await css(btn, 'boxShadow');
      expect(shadow).not.toBe('none');
    }).toPass({ timeout: 1000 });
  });

  test('dark mode changes toolbar background', async ({ page }) => {
    const toolbar = preview(page).locator('.toolbar');
    const lightBg = await css(toolbar, 'backgroundColor');
    await setDark(page);
    const darkBg = await css(toolbar, 'backgroundColor');
    expect(darkBg).not.toBe(lightBg);
  });
});
