import { test, expect } from '@playwright/test';
import { goto, preview, css, setDark } from './helpers.js';

test.describe('Gauge', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'gauge');
  });

  test('gauge renders with correct default size', async ({ page }) => {
    const gauge = preview(page).locator('.gauge').first();
    await expect(gauge).toBeVisible();
    const w = parseFloat(await css(gauge, 'width'));
    const h = parseFloat(await css(gauge, 'height'));
    expect(w).toBe(64);
    expect(h).toBe(64);
  });

  test('gauge has conic-gradient ring via ::before', async ({ page }) => {
    const gauge = preview(page).locator('.gauge').first();
    const hasBefore = await gauge.evaluate(el => {
      const before = getComputedStyle(el, '::before');
      return before.content !== 'none' && before.position === 'absolute';
    });
    expect(hasBefore).toBe(true);
  });

  test('gauge label is visible with correct text', async ({ page }) => {
    const labels = preview(page).locator('.gauge > span');
    await expect(labels.nth(0)).toHaveText('25%');
    await expect(labels.nth(1)).toHaveText('50%');
    await expect(labels.nth(2)).toHaveText('75%');
  });

  test('gauge-sm is smaller than default', async ({ page }) => {
    const sm = preview(page, 1).locator('.gauge-sm');
    const def = preview(page, 1).locator('.gauge:not(.gauge-sm):not(.gauge-lg)');
    const smW = parseFloat(await css(sm, 'width'));
    const defW = parseFloat(await css(def, 'width'));
    expect(smW).toBeLessThan(defW);
  });

  test('gauge-lg is larger than default', async ({ page }) => {
    const lg = preview(page, 1).locator('.gauge-lg');
    const def = preview(page, 1).locator('.gauge:not(.gauge-sm):not(.gauge-lg)');
    const lgW = parseFloat(await css(lg, 'width'));
    const defW = parseFloat(await css(def, 'width'));
    expect(lgW).toBeGreaterThan(defW);
  });

  test('gauge-sm is 40px and gauge-lg is 96px', async ({ page }) => {
    const sm = preview(page, 1).locator('.gauge-sm');
    const lg = preview(page, 1).locator('.gauge-lg');
    expect(parseFloat(await css(sm, 'width'))).toBe(40);
    expect(parseFloat(await css(lg, 'width'))).toBe(96);
  });

  test('color variants have distinct backgrounds', async ({ page }) => {
    const gauges = preview(page, 2).locator('.gauge');
    const backgrounds = [];
    for (let i = 0; i < 4; i++) {
      const bg = await gauges.nth(i).evaluate(el => {
        return getComputedStyle(el, '::before').backgroundImage;
      });
      backgrounds.push(bg);
    }
    // Each color variant should produce a different conic-gradient
    const unique = new Set(backgrounds);
    expect(unique.size).toBe(4);
  });

  test('without-label gauge renders without text', async ({ page }) => {
    const gauge = preview(page, 3).locator('.gauge').first();
    await expect(gauge).toBeVisible();
    const span = gauge.locator('span');
    const count = await span.count();
    expect(count).toBe(0);
  });

  test('dark mode changes gauge track color', async ({ page }) => {
    const gauge = preview(page).locator('.gauge').first();
    const lightBg = await gauge.evaluate(el =>
      getComputedStyle(el, '::before').backgroundImage
    );
    await setDark(page);
    const darkBg = await gauge.evaluate(el =>
      getComputedStyle(el, '::before').backgroundImage
    );
    expect(darkBg).not.toBe(lightBg);
  });
});
