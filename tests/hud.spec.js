import { test, expect } from '@playwright/test';

test.describe('HUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/site/components/hud.html');
  });

  test('static HUD renders with hud-label', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();
    const hud = preview.locator('.hud').first();

    await expect(hud).toBeVisible();
    await expect(hud.locator('.hud-label')).toHaveText('Saved');
  });

  test('HUD has no close button and no type class', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();
    const hud = preview.locator('.hud').first();

    await expect(hud.locator('button')).toHaveCount(0);
    const classes = await hud.getAttribute('class');
    expect(classes).toBe('hud');
  });

  test('showHUD creates HUD with aria-live attribute', async ({ page }) => {
    await page.waitForFunction(() => typeof window.showHUD === 'function');

    await page.evaluate(() => window.showHUD('Test notification'));

    const hud = page.locator('#hud-container .hud').last();
    await expect(hud).toBeVisible();
    await expect(hud).toHaveAttribute('role', 'status');
    await expect(hud).toHaveAttribute('aria-live', 'polite');
    await expect(hud.locator('.hud-label')).toHaveText('Test notification');
  });

  test('showHUD auto-dismisses after duration', async ({ page }) => {
    await page.waitForFunction(() => typeof window.showHUD === 'function');

    // Use a short duration for test speed
    await page.evaluate(() => window.showHUD('Dismiss test', { duration: 500 }));

    const hud = page.locator('#hud-container .hud').last();
    await expect(hud).toBeVisible();

    // Wait for dismiss + exit animation
    await page.waitForTimeout(900);
    await expect(hud).not.toBeAttached();
  });

  test('showHUD dismiss function removes HUD immediately', async ({ page }) => {
    await page.waitForFunction(() => typeof window.showHUD === 'function');

    await page.evaluate(() => {
      window._testHud = window.showHUD('Manual dismiss', { duration: 60000 });
    });

    const hud = page.locator('#hud-container .hud').last();
    await expect(hud).toBeVisible();

    await page.evaluate(() => window._testHud.dismiss());
    // Wait for exit animation (200ms)
    await page.waitForTimeout(300);
    await expect(hud).not.toBeAttached();
  });
});
