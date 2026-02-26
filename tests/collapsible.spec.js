import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('Collapsible', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'collapsible');
  });

  test('clicking summary toggles collapsible open/closed', async ({ page }) => {
    const details = preview(page).locator('.collapsible').first();
    const summary = details.locator('summary');

    // Starts open
    await expect(details).toHaveAttribute('open', '');

    // Click to close
    await summary.click();
    await expect(details).not.toHaveAttribute('open', '');
  });

  test('clicking closed collapsible opens it again', async ({ page }) => {
    const details = preview(page).locator('.collapsible').first();
    const summary = details.locator('summary');

    // Close first
    await summary.click();
    await expect(details).not.toHaveAttribute('open', '');

    // Re-open
    await summary.click();
    await expect(details).toHaveAttribute('open', '');
  });
});
