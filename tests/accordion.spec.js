import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('Accordion', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'accordion');
  });

  test('clicking summary opens a closed details panel', async ({ page }) => {
    const acc = preview(page).locator('.accordion').first();
    // Second details starts closed (first is open by default)
    const second = acc.locator('details').nth(1);
    const summary = second.locator('summary');

    await expect(second).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(second).toHaveAttribute('open', '');
  });

  test('exclusive accordion: opening one closes another', async ({ page }) => {
    const acc = preview(page).locator('.accordion').first();
    const first = acc.locator('details').first();
    const second = acc.locator('details').nth(1);

    // First starts open, second starts closed
    await expect(first).toHaveAttribute('open', '');
    await expect(second).not.toHaveAttribute('open', '');

    // Opening second should close first (name attribute exclusivity)
    await second.locator('summary').click();
    await expect(second).toHaveAttribute('open', '');
    await expect(first).not.toHaveAttribute('open', '');
  });

  test('clicking open summary closes it', async ({ page }) => {
    const acc = preview(page).locator('.accordion').first();
    const first = acc.locator('details').first();
    const summary = first.locator('summary');

    await expect(first).toHaveAttribute('open', '');
    await summary.click();
    await expect(first).not.toHaveAttribute('open', '');
  });
});
