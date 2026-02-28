import { test, expect } from '@playwright/test';

test.describe('HUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/site/components/hud.html');
    await page.waitForFunction(() => typeof window.showHUD === 'function');
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

  test('programmatic showHUD creates monochrome HUD', async ({ page }) => {
    const programmaticPreview = page.locator('.snippet-preview > figure').nth(2);
    await programmaticPreview.locator('button:has-text("Show HUD")').click();

    const hud = page.locator('#hud-container .hud').first();
    await expect(hud).toBeVisible();
    await expect(hud.locator('.hud-label')).toHaveText('Saved');
    const classes = await hud.getAttribute('class');
    expect(classes).toBe('hud');
  });

  test('notification mode shows icon, title and message', async ({ page }) => {
    const notificationPreview = page.locator('.snippet-preview > figure').nth(1);
    const hud = notificationPreview.locator('.hud-notification').first();

    await expect(hud).toBeVisible();
    await expect(hud.locator('.hud-title')).toHaveText('Payment Received');
    await expect(hud.locator('.hud-message')).toHaveText('$49.00 has been added to your account.');
  });

  test('programmatic notification mode creates HUD with message and type', async ({ page }) => {
    const programmaticPreview = page.locator('.snippet-preview > figure').nth(2);
    await programmaticPreview.locator('button:has-text("Error Notification")').click();

    const hud = page.locator('#hud-container .hud-notification').first();
    await expect(hud).toBeVisible();
    await expect(hud.locator('.hud-title')).toHaveText('Error');
    await expect(hud.locator('.hud-message')).toHaveText('Something went wrong.');
    const classes = await hud.getAttribute('class');
    expect(classes).toContain('hud-destructive');
  });

  test('backward-compatible showToast alias works', async ({ page }) => {
    await page.evaluate(() => {
      window.showToast('Legacy Title', 'Legacy message text', 'error');
    });

    const hud = page.locator('#hud-container .hud-notification').first();
    await expect(hud).toBeVisible();
    await expect(hud.locator('.hud-title')).toHaveText('Legacy Title');
    await expect(hud.locator('.hud-message')).toHaveText('Legacy message text');
  });
});
