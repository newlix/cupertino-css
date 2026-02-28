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
});
