import { test, expect } from '@playwright/test';
import { goto, preview, css, setDark, setLight } from './helpers.js';

test.describe('Activity Indicator', () => {
  test('uses foreground color, not currentColor', async ({ page }) => {
    await goto(page, 'activity-indicator');
    const indicator = preview(page).locator('.activity-indicator').first();
    const bg = await css(indicator, 'backgroundColor');

    // Apply a text color utility — background should NOT change
    await indicator.evaluate(el => el.classList.add('text-red-500'));
    await page.waitForTimeout(100);
    const bgAfter = await css(indicator, 'backgroundColor');

    expect(bgAfter).toBe(bg);
  });

  test('foreground color swaps in dark mode', async ({ page }) => {
    await goto(page, 'activity-indicator');
    const indicator = preview(page).locator('.activity-indicator').first();

    await setLight(page);
    const lightBg = await css(indicator, 'backgroundColor');

    await setDark(page);
    const darkBg = await css(indicator, 'backgroundColor');

    // Light and dark should have different background colors
    expect(darkBg).not.toBe(lightBg);
  });
});
