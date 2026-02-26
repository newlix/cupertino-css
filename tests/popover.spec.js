import { test, expect } from '@playwright/test';

test.describe('Popover', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/components/popover.html');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('click trigger opens popover', async ({ page }) => {
    const preview = page.locator('.docs-example-preview').first();
    const trigger = preview.locator('[data-popover-trigger]');
    const content = preview.locator('.popover-content');

    await expect(content).not.toHaveAttribute('data-open', '');

    await trigger.click();
    await expect(content).toHaveAttribute('data-open', '');
  });

  test('click outside closes popover', async ({ page }) => {
    const preview = page.locator('.docs-example-preview').first();
    const trigger = preview.locator('[data-popover-trigger]');
    const content = preview.locator('.popover-content');

    await trigger.click();
    await expect(content).toHaveAttribute('data-open', '');

    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await expect(content).not.toHaveAttribute('data-open', '');
  });

  test('Escape key closes popover', async ({ page }) => {
    const preview = page.locator('.docs-example-preview').first();
    const trigger = preview.locator('[data-popover-trigger]');
    const content = preview.locator('.popover-content');

    await trigger.click();
    await expect(content).toHaveAttribute('data-open', '');

    await page.keyboard.press('Escape');
    await expect(content).not.toHaveAttribute('data-open', '');
  });
});
