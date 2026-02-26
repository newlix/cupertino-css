import { test, expect } from '@playwright/test';

test.describe('Context Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/components/context-menu.html');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('right-click trigger shows context menu', async ({ page }) => {
    const preview = page.locator('.docs-example-preview').first();
    const trigger = preview.locator('.context-menu-trigger');
    const menu = preview.locator('.context-menu-content');

    await expect(menu).not.toHaveAttribute('data-open', '');

    await trigger.click({ button: 'right' });
    await expect(menu).toHaveAttribute('data-open', '');
  });

  test('clicking anywhere closes context menu', async ({ page }) => {
    const preview = page.locator('.docs-example-preview').first();
    const trigger = preview.locator('.context-menu-trigger');
    const menu = preview.locator('.context-menu-content');

    await trigger.click({ button: 'right' });
    await expect(menu).toHaveAttribute('data-open', '');

    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await expect(menu).not.toHaveAttribute('data-open', '');
  });

  test('Escape key closes context menu', async ({ page }) => {
    const preview = page.locator('.docs-example-preview').first();
    const trigger = preview.locator('.context-menu-trigger');
    const menu = preview.locator('.context-menu-content');

    await trigger.click({ button: 'right' });
    await expect(menu).toHaveAttribute('data-open', '');

    await page.keyboard.press('Escape');
    await expect(menu).not.toHaveAttribute('data-open', '');
  });

  test('context menu has correct items', async ({ page }) => {
    const preview = page.locator('.docs-example-preview').first();
    const trigger = preview.locator('.context-menu-trigger');
    const menu = preview.locator('.context-menu-content');

    await trigger.click({ button: 'right' });

    await expect(menu.locator('button:has-text("Back")')).toBeVisible();
    await expect(menu.locator('button:has-text("Forward")')).toBeVisible();
    await expect(menu.locator('button:has-text("Reload")')).toBeVisible();
  });
});
