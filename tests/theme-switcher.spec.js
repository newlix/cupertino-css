import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('Theme Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'theme-switcher');
  });

  test('light button has data-active by default', async ({ page }) => {
    const switcher = preview(page).locator('.theme-switcher').first();
    const lightBtn = switcher.locator('button[title="Light"]');

    await expect(lightBtn).toHaveAttribute('data-active', '');
  });

  test('switcher renders three buttons', async ({ page }) => {
    const switcher = preview(page).locator('.theme-switcher').first();
    const buttons = switcher.locator('button');
    expect(await buttons.count()).toBe(3);
  });
});
