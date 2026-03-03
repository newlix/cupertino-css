import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('HUD', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'hud');
  });

  test('static HUD renders with hud-label', async ({ page }) => {
    const hud = preview(page).locator('.hud').first();

    await expect(hud).toBeVisible();
    await expect(hud.locator('.hud-label')).toHaveText('Saved');
  });

  test('HUD has no close button and no type class', async ({ page }) => {
    const hud = preview(page).locator('.hud').first();

    await expect(hud.locator('button')).toHaveCount(0);
    const classes = await hud.getAttribute('class');
    expect(classes).toBe('hud');
  });

  test('showHUD creates HUD inside aria-live container', async ({ page }) => {
    await page.waitForFunction(() => typeof window.showHUD === 'function');

    await page.evaluate(() => window.showHUD('Test notification'));

    const container = page.locator('#hud-container');
    await expect(container).toHaveAttribute('role', 'status');
    await expect(container).toHaveAttribute('aria-live', 'polite');

    const hud = container.locator('.hud').last();
    await expect(hud).toBeVisible();
    await expect(hud.locator('.hud-label')).toHaveText('Test notification');
  });

  test('showHUD auto-dismisses after duration', async ({ page }) => {
    await page.waitForFunction(() => typeof window.showHUD === 'function');

    // Use a short duration for test speed
    await page.evaluate(() => window.showHUD('Dismiss test', { duration: 500 }));

    const hud = page.locator('#hud-container .hud').last();
    await expect(hud).toBeVisible();

    // Auto-retry assertion waits for dismiss + exit animation
    await expect(hud).not.toBeAttached({ timeout: 2000 });
  });

  test('showHUD dismiss function removes HUD immediately', async ({ page }) => {
    await page.waitForFunction(() => typeof window.showHUD === 'function');

    await page.evaluate(() => {
      window._testHud = window.showHUD('Manual dismiss', { duration: 60000 });
    });

    const hud = page.locator('#hud-container .hud').last();
    await expect(hud).toBeVisible();

    await page.evaluate(() => window._testHud.dismiss());
    await expect(hud).not.toBeAttached({ timeout: 2000 });
  });
});
