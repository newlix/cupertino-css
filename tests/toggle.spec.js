import { test, expect } from '@playwright/test';

test.describe('Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/components/toggle.html');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('clicking toggle flips data-active and aria-pressed', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const toggle = preview.locator('.toggle');

    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).not.toHaveAttribute('data-active', '');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('data-active', '');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).not.toHaveAttribute('data-active', '');
  });

  test('toggle group single-select: only one active at a time', async ({ page }) => {
    const preview = page.locator('.snippet > figure').last();
    const toggles = preview.locator('.toggle-group .toggle');

    await expect(toggles.nth(0)).toHaveAttribute('aria-pressed', 'true');
    await expect(toggles.nth(1)).toHaveAttribute('aria-pressed', 'false');

    await toggles.nth(1).click();
    await expect(toggles.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(toggles.nth(0)).toHaveAttribute('aria-pressed', 'false');
  });
});
