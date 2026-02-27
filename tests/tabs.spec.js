import { test, expect } from '@playwright/test';

test.describe('Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/components/tabs.html');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('clicking tab switches active panel', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();

    const tab1 = preview.locator('[data-tab="tab-1"]');
    const tab2 = preview.locator('[data-tab="tab-2"]');
    const panel1 = preview.locator('[data-tab-panel="tab-1"]');
    const panel2 = preview.locator('[data-tab-panel="tab-2"]');

    await expect(tab1).toHaveAttribute('data-active', '');
    await expect(panel1).toHaveAttribute('data-active', '');
    await expect(panel2).not.toHaveAttribute('data-active', '');

    await tab2.click();

    await expect(tab2).toHaveAttribute('data-active', '');
    await expect(tab1).not.toHaveAttribute('data-active', '');
    await expect(panel2).toHaveAttribute('data-active', '');
    await expect(panel1).not.toHaveAttribute('data-active', '');
  });

  test('clicking third tab shows third panel', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();

    const tab3 = preview.locator('[data-tab="tab-3"]');
    const panel3 = preview.locator('[data-tab-panel="tab-3"]');

    await tab3.click();

    await expect(tab3).toHaveAttribute('data-active', '');
    await expect(panel3).toHaveAttribute('data-active', '');
    await expect(panel3).toContainText('notification settings');
  });
});
