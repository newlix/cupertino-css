import { test, expect } from '@playwright/test';
import { goto, preview, css, setDark, setLight, focusViaKeyboard } from './helpers.js';

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
    expect(before.height).toBe('1px');
  });

  test('interactive item (link) has hover background', async ({ page }) => {
    const link = preview(page).locator('.list > a').first();
    const bgBefore = await css(link, 'backgroundColor');

    await link.hover();
    const bgAfter = await css(link, 'backgroundColor');
    expect(bgAfter).not.toBe(bgBefore);
  });

  test('interactive item has focus-visible outline', async ({ page }) => {
    const link = preview(page).locator('.list > a').first();
    await focusViaKeyboard(page, link);

    const outline = await css(link, 'outlineStyle');
    expect(outline).toBe('solid');
  });

  test('list renders inside a card', async ({ page }) => {
    const cardList = preview(page, 2).locator('.card .list');
    await expect(cardList).toBeVisible();

    const items = cardList.locator('> *');
    await expect(items).toHaveCount(2);
  });

  test('dark mode changes icon background', async ({ page }) => {
    const icon = preview(page).locator('.list > * > svg').first();
    const lightBg = await css(icon, 'backgroundColor');

    await setDark(page);
    const darkBg = await css(icon, 'backgroundColor');
    expect(darkBg).not.toBe(lightBg);

    await setLight(page);
  });
});
