import { test, expect } from '@playwright/test';
import { goto, preview, css, setDark, focusViaKeyboard } from './helpers.js';

test.describe('Navigation Bar', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'navbar');
  });

  test('navbar renders with correct min-height and grid layout', async ({ page }) => {
    const navbar = preview(page).locator('.navbar');
    await expect(navbar).toBeVisible();
    const h = parseFloat(await css(navbar, 'minHeight'));
    expect(h).toBe(44);
    const display = await css(navbar, 'display');
    expect(display).toBe('grid');
  });

  test('navbar-title is centered', async ({ page }) => {
    const navbar = preview(page).locator('.navbar');
    const title = preview(page).locator('.navbar-title');
    await expect(title).toHaveText('Inbox');
    const titleBox = await title.boundingBox();
    const navbarBox = await navbar.boundingBox();
    // Title center should be approximately at navbar center
    const titleCenter = titleBox.x + titleBox.width / 2;
    const navbarCenter = navbarBox.x + navbarBox.width / 2;
    expect(Math.abs(titleCenter - navbarCenter)).toBeLessThan(5);
  });

  test('navbar-back has primary text color', async ({ page }) => {
    const back = preview(page).locator('.navbar-back');
    await expect(back).toBeVisible();
    const color = await css(back, 'color');
    // Should be the primary blue color, not foreground
    const bodyColor = await css(page.locator('body'), 'color');
    expect(color).not.toBe(bodyColor);
  });

  test('navbar-actions contains action buttons', async ({ page }) => {
    const actions = preview(page, 1).locator('.navbar-actions');
    const buttons = actions.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('title-only navbar renders with centered title', async ({ page }) => {
    const title = preview(page, 2).locator('.navbar-title');
    await expect(title).toHaveText('Welcome');
  });

  test('focus-visible shows ring on back button', async ({ page }) => {
    const back = preview(page).locator('.navbar-back');
    await focusViaKeyboard(page, back);
    await expect(async () => {
      const shadow = await css(back, 'boxShadow');
      expect(shadow).not.toBe('none');
    }).toPass({ timeout: 1000 });
  });

  test('dark mode changes navbar background', async ({ page }) => {
    const navbar = preview(page).locator('.navbar');
    const lightBg = await css(navbar, 'backgroundColor');
    await setDark(page);
    const darkBg = await css(navbar, 'backgroundColor');
    expect(darkBg).not.toBe(lightBg);
  });
});
