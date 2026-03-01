import { test, expect } from '@playwright/test';

test.describe('Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/site/components/tabs.html');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('clicking tab switches active panel', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();

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

  test('disabled tab cannot be activated', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();

    const tab3 = preview.locator('[data-tab="tab-3"]');
    const tab1 = preview.locator('[data-tab="tab-1"]');

    await expect(tab3).toBeDisabled();
    await expect(tab1).toHaveAttribute('data-active', '');
  });

  test('arrow key navigation moves between tabs', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();

    const tab1 = preview.locator('[data-tab="tab-1"]');
    const tab2 = preview.locator('[data-tab="tab-2"]');

    await tab1.focus();
    await page.keyboard.press('ArrowRight');

    await expect(tab2).toBeFocused();
    await expect(tab2).toHaveAttribute('data-active', '');
  });

  test('arrow key skips disabled tab', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();

    const tab1 = preview.locator('[data-tab="tab-1"]');
    const tab2 = preview.locator('[data-tab="tab-2"]');

    // tab-3 is disabled, so ArrowRight from tab-2 should wrap to tab-1
    await tab2.click();
    await expect(tab2).toHaveAttribute('data-active', '');

    await page.keyboard.press('ArrowRight');

    await expect(tab1).toBeFocused();
    await expect(tab1).toHaveAttribute('data-active', '');
  });

  test('Home and End keys navigate to first and last enabled tab', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();

    const tab1 = preview.locator('[data-tab="tab-1"]');
    const tab2 = preview.locator('[data-tab="tab-2"]');

    await tab2.click();
    await expect(tab2).toHaveAttribute('data-active', '');

    await page.keyboard.press('Home');
    await expect(tab1).toBeFocused();
    await expect(tab1).toHaveAttribute('data-active', '');

    await page.keyboard.press('End');
    // tab-3 is disabled, so End should go to tab-2
    await expect(tab2).toBeFocused();
    await expect(tab2).toHaveAttribute('data-active', '');
  });

  test('ARIA attributes are set on tabs and panels', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();

    const tab1 = preview.locator('[data-tab="tab-1"]');
    await expect(tab1).toHaveAttribute('role', 'tab');
    await expect(tab1).toHaveAttribute('aria-selected', 'true');
    await expect(tab1).toHaveAttribute('tabindex', '0');

    const tab2 = preview.locator('[data-tab="tab-2"]');
    await expect(tab2).toHaveAttribute('role', 'tab');
    await expect(tab2).toHaveAttribute('aria-selected', 'false');
    await expect(tab2).toHaveAttribute('tabindex', '-1');

    const panel1 = preview.locator('[data-tab-panel="tab-1"]');
    await expect(panel1).toHaveAttribute('role', 'tabpanel');

    const tablist = preview.locator('[data-tab-list]');
    await expect(tablist).toHaveAttribute('role', 'tablist');
  });

  test('tabindex updates when switching tabs', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();

    const tab1 = preview.locator('[data-tab="tab-1"]');
    const tab2 = preview.locator('[data-tab="tab-2"]');

    await expect(tab1).toHaveAttribute('tabindex', '0');
    await expect(tab2).toHaveAttribute('tabindex', '-1');

    await tab2.click();

    await expect(tab1).toHaveAttribute('tabindex', '-1');
    await expect(tab2).toHaveAttribute('tabindex', '0');
  });
});
