import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('Menu', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'menu');
  });

  test('click trigger opens popover menu', async ({ page }) => {
    const p = preview(page, 0);
    const trigger = p.locator('.menu > button').first();
    const popover = p.locator('[popover]');

    await expect(popover).not.toBeVisible();
    await trigger.click();
    await expect(popover).toBeVisible();
  });

  test('click outside closes popover menu', async ({ page }) => {
    const p = preview(page, 0);
    const trigger = p.locator('.menu > button').first();
    const popover = p.locator('[popover]');

    await trigger.click();
    await expect(popover).toBeVisible();

    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await expect(popover).not.toBeVisible();
  });

  test('click menu item closes popover', async ({ page }) => {
    const p = preview(page, 0);
    const trigger = p.locator('.menu > button').first();
    const popover = p.locator('[popover]');

    await trigger.click();
    await expect(popover).toBeVisible();

    await popover.locator('button:has-text("Profile")').click();
    await expect(popover).not.toBeVisible();
  });

  test('Escape key closes popover', async ({ page }) => {
    const p = preview(page, 0);
    const trigger = p.locator('.menu > button').first();
    const popover = p.locator('[popover]');

    await trigger.click();
    await expect(popover).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(popover).not.toBeVisible();
  });

  test('arrow keys navigate menu items', async ({ page }) => {
    const p = preview(page, 0);
    const trigger = p.locator('.menu > button').first();
    const popover = p.locator('[popover]');

    await trigger.click();
    await expect(popover).toBeVisible();

    // First non-disabled item should be focused
    const firstItem = popover.locator('button:not([disabled])').first();
    await expect(firstItem).toBeFocused();

    // ArrowDown moves to next item
    await page.keyboard.press('ArrowDown');
    const secondItem = popover.locator('button:not([disabled])').nth(1);
    await expect(secondItem).toBeFocused();

    // ArrowUp moves back
    await page.keyboard.press('ArrowUp');
    await expect(firstItem).toBeFocused();
  });

});
