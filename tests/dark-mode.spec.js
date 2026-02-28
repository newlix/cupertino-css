import { test, expect } from '@playwright/test';
import { goto, darkPreview, css, setDark, parseRgb, contrast } from './helpers.js';

test.describe('Dark Mode', () => {
  test('OTP slots have visible background against card', async ({ page }) => {
    await goto(page, 'input-otp');
    await setDark(page);

    const slot = darkPreview(page).locator('.input-otp-slot').first();
    const container = darkPreview(page);

    expect(await css(slot, 'backgroundColor')).not.toBe(await css(container, 'backgroundColor'));
  });

  test('switch on/off are distinguishable', async ({ page }) => {
    await goto(page, 'switch');
    await setDark(page);

    const checked = page.locator('.snippet-preview > figure input[role="switch"]:checked').first();
    const unchecked = page.locator('.snippet-preview > figure input[role="switch"]:not(:checked):not(:disabled)').first();

    expect(await css(checked, 'backgroundColor')).not.toBe(await css(unchecked, 'backgroundColor'));
  });

  test('badges have sufficient text contrast', async ({ page }) => {
    await goto(page, 'badge');
    await setDark(page);

    for (const sel of ['.badge', '.badge-destructive']) {
      const badge = page.locator(`.snippet-preview > figure ${sel}`).first();
      if ((await badge.count()) === 0) continue;

      const color = parseRgb(await css(badge, 'color'));
      const bg = parseRgb(await css(badge, 'backgroundColor'));

      if (color && bg) {
        expect(contrast(color, bg), `${sel} contrast`).toBeGreaterThan(3);
      }
    }
  });

  test('card border is visible against card background', async ({ page }) => {
    await goto(page, 'card');
    await setDark(page);

    const card = darkPreview(page, 0).locator('.card').first();
    const borderRgb = parseRgb(await css(card, 'borderColor'));
    const bgRgb = parseRgb(await css(card, 'backgroundColor'));

    if (borderRgb && bgRgb) {
      expect(contrast(borderRgb, bgRgb)).toBeGreaterThan(1.05);
    }
  });

  test('radio checked state is visible', async ({ page }) => {
    await goto(page, 'radio-group');
    await setDark(page);

    const checked = page.locator('.snippet-preview > figure input[type="radio"]:checked').first();
    const unchecked = page.locator('.snippet-preview > figure input[type="radio"]:not(:checked):not(:disabled)').first();

    expect(await css(checked, 'borderColor')).not.toBe(await css(unchecked, 'borderColor'));
  });

  test('banner variants are visible in dark mode', async ({ page }) => {
    await goto(page, 'banner');
    await setDark(page);

    for (const sel of ['.banner', '.banner-destructive']) {
      const banner = page.locator(`.snippet-preview > figure ${sel}`).first();
      if ((await banner.count()) === 0) continue;
      await expect(banner).toBeVisible();
    }
  });

  test('input border is visible against background', async ({ page }) => {
    await goto(page, 'input');
    await setDark(page);

    const input = darkPreview(page).locator('input[type="text"]').first();
    const borderRgb = parseRgb(await css(input, 'borderColor'));
    const bgRgb = parseRgb(await css(input, 'backgroundColor'));

    if (borderRgb && bgRgb) {
      expect(contrast(borderRgb, bgRgb)).toBeGreaterThan(1.05);
    }
  });

  test('progress bar is visible', async ({ page }) => {
    await goto(page, 'progress');
    await setDark(page);

    const bar = darkPreview(page).locator('progress').first();
    await expect(bar).toBeVisible();
    // Progress track should have a background
    const bg = await css(bar, 'backgroundColor');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });
});
