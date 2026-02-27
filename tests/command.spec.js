import { test, expect } from '@playwright/test';

test.describe('Command', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/site/components/command.html');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('search filters menu items', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const command = preview.locator('.command');
    const input = command.locator('header input');
    const items = command.locator('[role="menuitem"]');

    const initialCount = await items.count();
    expect(initialCount).toBeGreaterThan(0);

    await input.fill('calendar');

    const visibleItems = command.locator('[role="menuitem"]:not([hidden])');
    await expect(visibleItems).toHaveCount(1);
    await expect(visibleItems.first()).toContainText('Calendar');

    await input.fill('');
    await expect(command.locator('[role="menuitem"]:not([hidden])')).toHaveCount(initialCount);
  });

  test('search with no matches shows empty state', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const command = preview.locator('.command');
    const input = command.locator('header input');

    await input.fill('xyznonexistent');

    const visibleItems = command.locator('[role="menuitem"]:not([hidden])');
    await expect(visibleItems).toHaveCount(0);

    const menu = command.locator('[role="menu"]');
    await expect(menu).toHaveClass(/command-empty/);
  });
});
