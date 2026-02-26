import { test, expect } from '@playwright/test';

test.describe('Dropdown Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/components/dropdown-menu.html');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('click trigger toggles menu visibility', async ({ page }) => {
    const preview = page.locator('.docs-example-preview').first();
    const trigger = preview.locator('[data-dropdown-trigger]');
    const content = preview.locator('[data-dropdown-content]');

    await expect(content).not.toHaveAttribute('data-open', '');

    await trigger.click();
    await expect(content).toHaveAttribute('data-open', '');
  });

  test('click outside closes dropdown', async ({ page }) => {
    const preview = page.locator('.docs-example-preview').first();
    const trigger = preview.locator('[data-dropdown-trigger]');
    const content = preview.locator('[data-dropdown-content]');

    await trigger.click();
    await expect(content).toHaveAttribute('data-open', '');

    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await expect(content).not.toHaveAttribute('data-open', '');
  });

  test('click menu item closes dropdown', async ({ page }) => {
    const preview = page.locator('.docs-example-preview').first();
    const trigger = preview.locator('[data-dropdown-trigger]');
    const content = preview.locator('[data-dropdown-content]');

    await trigger.click();
    await expect(content).toHaveAttribute('data-open', '');

    await content.locator('button:has-text("Profile")').dispatchEvent('click');
    await expect(content).not.toHaveAttribute('data-open', '');
  });

  test('Escape key closes dropdown', async ({ page }) => {
    const preview = page.locator('.docs-example-preview').first();
    const trigger = preview.locator('[data-dropdown-trigger]');
    const content = preview.locator('[data-dropdown-content]');

    await trigger.click();
    await expect(content).toHaveAttribute('data-open', '');

    await page.keyboard.press('Escape');
    await expect(content).not.toHaveAttribute('data-open', '');
  });
});
