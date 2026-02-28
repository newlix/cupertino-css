import { test, expect } from '@playwright/test';
import { goto, preview, css } from './helpers.js';

test.describe('Help Tag', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'help-tag');
  });

  test('help-tag content is hidden by default', async ({ page }) => {
    const content = preview(page).locator('.help-tag-content').first();
    // Help tag content should be hidden (opacity 0 or visibility hidden or display none)
    const opacity = await css(content, 'opacity');
    const visibility = await css(content, 'visibility');

    const isHidden = opacity === '0' || visibility === 'hidden';
    expect(isHidden).toBe(true);
  });

  test('hover shows help-tag content', async ({ page }) => {
    const helpTag = preview(page).locator('.help-tag').first();
    const content = helpTag.locator('.help-tag-content');

    await helpTag.hover();
    await page.waitForTimeout(1300);

    const opacity = await css(content, 'opacity');
    const visibility = await css(content, 'visibility');

    const isVisible = opacity === '1' && visibility === 'visible';
    expect(isVisible).toBe(true);
  });
});
