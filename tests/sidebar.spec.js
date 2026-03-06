import { test, expect } from '@playwright/test';
import { goto, preview, css, setDark, setLight, focusViaKeyboard } from './helpers.js';

test.describe('Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'sidebar');
  });

  test('renders section headers and links', async ({ page }) => {
    const sidebar = preview(page).locator('.sidebar');
    await expect(sidebar).toBeVisible();

    const headers = sidebar.locator('h2');
    await expect(headers).toHaveCount(2);
    await expect(headers.first()).toHaveText('Getting Started');

    const links = sidebar.locator('a');
    await expect(links).toHaveCount(7);
  });

  test('active item has background highlight', async ({ page }) => {
    const active = preview(page).locator('.sidebar a[data-active]');
    const bg = await css(active, 'backgroundColor');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('active item is font-semibold', async ({ page }) => {
    const active = preview(page).locator('.sidebar a[data-active]');
    const weight = await css(active, 'fontWeight');
    expect(Number(weight)).toBeGreaterThanOrEqual(600);
  });

  test('non-active items have tertiary color', async ({ page }) => {
    const link = preview(page).locator('.sidebar a:not([data-active])').first();
    const active = preview(page).locator('.sidebar a[data-active]');
    const linkColor = await css(link, 'color');
    const activeColor = await css(active, 'color');
    expect(linkColor).not.toBe(activeColor);
  });

  test('hover changes background on non-active item', async ({ page }) => {
    const link = preview(page).locator('.sidebar a:not([data-active])').first();
    const bgBefore = await css(link, 'backgroundColor');

    await link.hover();
    await expect(async () => {
      const bgAfter = await css(link, 'backgroundColor');
      expect(bgAfter).not.toBe(bgBefore);
    }).toPass({ timeout: 1000 });
  });

  test('items have rounded corners', async ({ page }) => {
    const link = preview(page).locator('.sidebar a').first();
    const radius = await css(link, 'borderRadius');
    expect(radius).not.toBe('0px');
  });

  test('section header is uppercase', async ({ page }) => {
    const header = preview(page).locator('.sidebar h2').first();
    const transform = await css(header, 'textTransform');
    expect(transform).toBe('uppercase');
  });

  test('with-icons example shows SVG icons', async ({ page }) => {
    const icons = preview(page, 1).locator('.sidebar a > svg');
    await expect(icons.first()).toBeVisible();
    const size = await icons.first().boundingBox();
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
  });

  test('tinted variant uses primary color for active background', async ({ page }) => {
    const tinted = preview(page, 2).locator('.sidebar-tinted a[data-active]');
    const bg = await css(tinted, 'backgroundColor');
    // Tinted active should not be pure gray — it has a blue hue
    const defaultActive = preview(page).locator('.sidebar a[data-active]');
    const defaultBg = await css(defaultActive, 'backgroundColor');
    expect(bg).not.toBe(defaultBg);
  });

  test('disabled item has reduced opacity', async ({ page }) => {
    const disabled = preview(page, 3).locator('.sidebar a[aria-disabled="true"]');
    const opacity = await css(disabled, 'opacity');
    expect(parseFloat(opacity)).toBeLessThan(1);
  });

  test('disabled item has pointer-events none', async ({ page }) => {
    const disabled = preview(page, 3).locator('.sidebar a[aria-disabled="true"]');
    const pe = await css(disabled, 'pointerEvents');
    expect(pe).toBe('none');
  });

  test('aria-current="page" activates same style as data-active', async ({ page }) => {
    const ariaCurrent = preview(page, 4).locator('.sidebar a[aria-current="page"]');
    const bg = await css(ariaCurrent, 'backgroundColor');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    const weight = await css(ariaCurrent, 'fontWeight');
    expect(Number(weight)).toBeGreaterThanOrEqual(600);
  });

  test('focus-visible shows focus ring', async ({ page }) => {
    const link = preview(page).locator('.sidebar a').first();
    await focusViaKeyboard(page, link);

    const shadow = await css(link, 'boxShadow');
    expect(shadow).not.toBe('none');
  });

  test('dark mode — active item still has visible background', async ({ page }) => {
    await setDark(page);
    const active = preview(page).locator('.sidebar a[data-active]');
    const bg = await css(active, 'backgroundColor');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    await setLight(page);
  });
});
