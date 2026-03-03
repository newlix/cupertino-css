import { test, expect } from '@playwright/test';
import { goto, preview, css, setDark, focusViaKeyboard } from './helpers.js';

test.describe('Button', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'button');
  });

  test('all 5 variants render with correct min-height', async ({ page }) => {
    const variants = ['filled', 'gray', 'tinted', 'bezelled', 'plain'];
    for (const v of variants) {
      const btn = preview(page).locator(`.btn-${v}`).first();
      await expect(btn).toBeVisible();
      const h = parseFloat(await css(btn, 'minHeight'));
      expect(h, `btn-${v} min-height`).toBe(44);
    }
  });

  test('filled button has non-transparent background', async ({ page }) => {
    const btn = preview(page).locator('.btn-filled').first();
    const bg = await css(btn, 'backgroundColor');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('disabled buttons have reduced opacity', async ({ page }) => {
    const btn = preview(page).locator('.btn-filled[disabled]').first();
    const opacity = parseFloat(await css(btn, 'opacity'));
    expect(opacity).toBeLessThan(1);
    expect(await css(btn, 'pointerEvents')).toBe('none');
  });

  test('btn-sm has smaller min-height than default', async ({ page }) => {
    const sm = preview(page, 1).locator('.btn-sm').first();
    const def = preview(page, 1).locator('.btn-filled:not(.btn-sm):not(.btn-lg)').first();
    const smH = parseFloat(await css(sm, 'minHeight'));
    const defH = parseFloat(await css(def, 'minHeight'));
    expect(smH).toBeLessThan(defH);
  });

  test('btn-lg has larger min-height than default', async ({ page }) => {
    const lg = preview(page, 1).locator('.btn-lg').first();
    const def = preview(page, 1).locator('.btn-filled:not(.btn-sm):not(.btn-lg)').first();
    const lgH = parseFloat(await css(lg, 'minHeight'));
    const defH = parseFloat(await css(def, 'minHeight'));
    expect(lgH).toBeGreaterThan(defH);
  });

  test('btn-capsule has pill border-radius', async ({ page }) => {
    const capsule = preview(page, 2).locator('.btn-capsule').first();
    const radius = await css(capsule, 'borderRadius');
    // Pill = 9999px
    expect(parseFloat(radius)).toBeGreaterThan(100);
  });

  test('destructive buttons have red text or background', async ({ page }) => {
    const btn = preview(page, 3).locator('.btn-filled.btn-destructive').first();
    await expect(btn).toBeVisible();
    // Filled destructive should have a red-ish background (not blue primary)
    const bg = await css(btn, 'backgroundColor');
    expect(bg).not.toBe(await css(preview(page).locator('.btn-filled').first(), 'backgroundColor'));
  });

  test('focus-visible shows box-shadow ring', async ({ page }) => {
    const btn = preview(page).locator('.btn-filled').first();
    await focusViaKeyboard(page, btn);

    await expect(async () => {
      const shadow = await css(btn, 'boxShadow');
      expect(shadow).not.toBe('none');
    }).toPass({ timeout: 1000 });
  });

  test('dark mode changes filled button background', async ({ page }) => {
    const btn = preview(page).locator('.btn-filled').first();
    const lightBg = await css(btn, 'backgroundColor');
    await setDark(page);
    const darkBg = await css(btn, 'backgroundColor');
    expect(darkBg).not.toBe(lightBg);
  });
});
