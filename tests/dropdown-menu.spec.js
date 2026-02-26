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

    // Dropdown starts without hidden class in docs preview.
    // First click on trigger: JS sees it as open → closes it.
    await trigger.click();
    await expect(content).toHaveClass(/hidden/);

    // Second click: JS sees it as closed → opens it.
    await trigger.click();
    await expect(content).not.toHaveClass(/hidden/);
  });

  test('click outside closes dropdown', async ({ page }) => {
    const preview = page.locator('.docs-example-preview').first();
    const trigger = preview.locator('[data-dropdown-trigger]');
    const content = preview.locator('[data-dropdown-content]');

    // Close first, then open
    await trigger.click();
    await trigger.click();
    await expect(content).not.toHaveClass(/hidden/);

    // Click outside to close
    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await expect(content).toHaveClass(/hidden/);
  });

  test('click menu item closes dropdown', async ({ page }) => {
    const preview = page.locator('.docs-example-preview').first();
    const trigger = preview.locator('[data-dropdown-trigger]');
    const content = preview.locator('[data-dropdown-content]');

    // Close first, then open
    await trigger.click();
    await trigger.click();
    await expect(content).not.toHaveClass(/hidden/);

    // Use dispatchEvent since .dropdown-menu CSS has display:none baked in
    await content.locator('button:has-text("Profile")').dispatchEvent('click');
    await expect(content).toHaveClass(/hidden/);
  });

  test('Escape key closes dropdown', async ({ page }) => {
    const preview = page.locator('.docs-example-preview').first();
    const trigger = preview.locator('[data-dropdown-trigger]');
    const content = preview.locator('[data-dropdown-content]');

    // Close first, then open
    await trigger.click();
    await trigger.click();
    await expect(content).not.toHaveClass(/hidden/);

    await page.keyboard.press('Escape');
    await expect(content).toHaveClass(/hidden/);
  });
});
