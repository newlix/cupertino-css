import { test, expect } from '@playwright/test';
import { goto, preview, css, focusViaKeyboard } from './helpers.js';

test.describe('List', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'list');
  });

  test('renders list items with headings and descriptions', async ({ page }) => {
    const list = preview(page).locator('.list');
    await expect(list).toBeVisible();

    const items = list.locator('> *');
    await expect(items).toHaveCount(3);

    await expect(list.locator('h3').first()).toHaveText('Project Files');
    await expect(list.locator('h3').nth(1)).toHaveText('Your profile has been verified');
  });

  test('separator lines appear between items', async ({ page }) => {
    const secondItem = preview(page).locator('.list > *').nth(1);
    const before = await secondItem.evaluate(el => {
      const s = getComputedStyle(el, '::before');
      return { height: s.height, position: s.position };
    });
    expect(before.position).toBe('absolute');
    expect(parseFloat(before.height)).toBeLessThanOrEqual(1);
  });

  test('interactive item (link) has hover background', async ({ page }) => {
    const link = preview(page).locator('.list > a').first();
    const bgBefore = await css(link, 'backgroundColor');

    await link.hover();
    const bgAfter = await css(link, 'backgroundColor');
    expect(bgAfter).not.toBe(bgBefore);
  });

  test('interactive item has focus-visible background highlight', async ({ page }) => {
    const link = preview(page).locator('.list > a').first();
    await focusViaKeyboard(page, link);

    const bg = await css(link, 'backgroundColor');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('inset-grouped list renders with card styling', async ({ page }) => {
    const groupedList = preview(page, 3).locator('.list-inset-grouped');
    await expect(groupedList).toBeVisible();

    const items = groupedList.locator('> *');
    await expect(items).toHaveCount(2);
  });

  test('icon has no background (Apple HIG: plain inline icons)', async ({ page }) => {
    const icon = preview(page).locator('.list > * > svg').first();
    const bg = await css(icon, 'backgroundColor');
    expect(bg).toBe('rgba(0, 0, 0, 0)');
  });
});
