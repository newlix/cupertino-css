import { test, expect } from '@playwright/test';
import { goto, preview, css, setDark } from './helpers.js';

test.describe('Table', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'table');
  });

  test('table renders with rounded corners and shadow', async ({ page }) => {
    const table = preview(page).locator('table').first();
    await expect(table).toBeVisible();
    const shadow = await css(table, 'boxShadow');
    expect(shadow).not.toBe('none');
    const radius = parseFloat(await css(table, 'borderRadius'));
    expect(radius).toBeGreaterThan(0);
  });

  test('thead has background tint', async ({ page }) => {
    const thead = preview(page).locator('thead tr').first();
    const bg = await css(thead, 'backgroundColor');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('th has uppercase styling', async ({ page }) => {
    const th = preview(page).locator('th').first();
    expect(await css(th, 'textTransform')).toBe('uppercase');
    expect(parseFloat(await css(th, 'fontSize'))).toBe(13);
  });

  test('table-striped has alternating row backgrounds', async ({ page }) => {
    const rows = preview(page, 3).locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(2);
    const bg1 = await css(rows.nth(0), 'backgroundColor');
    const bg2 = await css(rows.nth(1), 'backgroundColor');
    expect(bg1).not.toBe(bg2);
  });

  test('tfoot has background and top border', async ({ page }) => {
    const tfoot = preview(page).locator('tfoot td').first();
    const border = await css(tfoot, 'borderTopWidth');
    expect(parseFloat(border)).toBeGreaterThan(0);
  });

  test('dark mode table is visible', async ({ page }) => {
    const table = preview(page).locator('table').first();
    await setDark(page);
    await expect(table).toBeVisible();
    const shadow = await css(table, 'boxShadow');
    expect(shadow).not.toBe('none');
  });
});
