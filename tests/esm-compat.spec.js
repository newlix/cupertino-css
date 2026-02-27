import { test, expect } from '@playwright/test';

test.describe('ESM Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/esm-compat.html');
    await page.waitForLoadState('networkidle');
  });

  test('tabs work when loaded as type="module"', async ({ page }) => {
    const tab2 = page.locator('[data-tab="esm-2"]');
    const panel1 = page.locator('[data-tab-panel="esm-1"]');
    const panel2 = page.locator('[data-tab-panel="esm-2"]');

    await expect(panel1).toHaveAttribute('data-active', '');
    await expect(panel2).not.toHaveAttribute('data-active', '');

    await tab2.click();

    await expect(tab2).toHaveAttribute('data-active', '');
    await expect(panel2).toHaveAttribute('data-active', '');
    await expect(panel1).not.toHaveAttribute('data-active', '');
  });

  test('dialog backdrop close works when loaded as type="module"', async ({ page }) => {
    const dialog = page.locator('#esm-dialog');

    await page.locator('#open-dialog').click();
    await expect(dialog).toBeVisible();

    // Backdrop click (e.target === dialog)
    await dialog.evaluate(d => {
      d.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await expect(dialog).not.toBeVisible();
  });

  test('custom select works when loaded as type="module"', async ({ page }) => {
    const trigger = page.locator('[data-select-trigger]');
    const content = page.locator('[data-select-content]');
    const value = page.locator('[data-select-value]');

    await expect(content).toHaveClass(/hidden/);

    await trigger.click();
    await expect(content).not.toHaveClass(/hidden/);

    await page.locator('[data-select-item="b"]').click();
    await expect(value).toHaveText('Beta');
    await expect(content).toHaveClass(/hidden/);
  });
});
