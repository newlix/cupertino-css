import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('Popover', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'popover');
  });

  test('click trigger opens popover', async ({ page }) => {
    const p = preview(page, 0);
    const trigger = p.locator('.popover > button').first();
    const popover = p.locator('[popover]');

    await expect(popover).not.toBeVisible();
    await trigger.click();
    await expect(popover).toBeVisible();
  });

  test('click outside closes popover', async ({ page }) => {
    const p = preview(page, 0);
    const trigger = p.locator('.popover > button').first();
    const popover = p.locator('[popover]');

    await trigger.click();
    await expect(popover).toBeVisible();

    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await expect(popover).not.toBeVisible();
  });

  test('Escape key closes popover', async ({ page }) => {
    const p = preview(page, 0);
    const trigger = p.locator('.popover > button').first();
    const popover = p.locator('[popover]');

    await trigger.click();
    await expect(popover).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(popover).not.toBeVisible();
  });
});

test.describe('Popover Menu', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'popover');
  });

  test('click trigger opens menu', async ({ page }) => {
    const p = preview(page, 1);
    const trigger = p.locator('.popover-menu > button').first();
    const popover = p.locator('[popover]');

    await expect(popover).not.toBeVisible();
    await trigger.click();
    await expect(popover).toBeVisible();
  });

  test('click outside closes menu', async ({ page }) => {
    const p = preview(page, 1);
    const trigger = p.locator('.popover-menu > button').first();
    const popover = p.locator('[popover]');

    await trigger.click();
    await expect(popover).toBeVisible();

    await page.locator('body').click({ position: { x: 0, y: 0 } });
    await expect(popover).not.toBeVisible();
  });

  test('click menu item closes menu', async ({ page }) => {
    const p = preview(page, 1);
    const trigger = p.locator('.popover-menu > button').first();
    const popover = p.locator('[popover]');

    await trigger.click();
    await expect(popover).toBeVisible();

    await popover.locator('button:has-text("Profile")').click();
    await expect(popover).not.toBeVisible();
  });

  test('Escape key closes menu', async ({ page }) => {
    const p = preview(page, 1);
    const trigger = p.locator('.popover-menu > button').first();
    const popover = p.locator('[popover]');

    await trigger.click();
    await expect(popover).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(popover).not.toBeVisible();
  });

  test('arrow keys navigate menu items', async ({ page }) => {
    const p = preview(page, 1);
    const trigger = p.locator('.popover-menu > button').first();
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

test.describe('Popover Auto-flip', () => {
  test('auto-flips horizontally when popover would overflow right edge', async ({ page }) => {
    // Narrow viewport so the "Default" popover (left-aligned) overflows right
    await page.setViewportSize({ width: 600, height: 720 });
    await goto(page, 'popover');

    const p = preview(page, 2); // Positioning example
    // "Default" popover-menu (index 0), no popover-end class
    const wrapper = p.locator('.popover-menu').nth(0);
    const trigger = wrapper.locator('button').first();
    const popover = wrapper.locator('[popover]');

    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await expect(popover).toBeVisible();

    // Popover should not overflow the viewport right edge
    const vw = await page.evaluate(() => document.documentElement.clientWidth);
    const popoverBox = await popover.boundingBox();
    expect(popoverBox.x + popoverBox.width).toBeLessThanOrEqual(vw);
  });

  test('auto-flips vertically when popover would overflow bottom edge', async ({ page }) => {
    // Short viewport so popover can't open below
    await page.setViewportSize({ width: 1280, height: 400 });
    await goto(page, 'popover');

    const p = preview(page, 1); // Menu example
    const wrapper = p.locator('.popover-menu');
    const trigger = wrapper.locator('button').first();
    const popover = wrapper.locator('[popover]');

    // Scroll trigger to near the bottom of the viewport
    await trigger.evaluate(el => {
      const rect = el.getBoundingClientRect();
      window.scrollBy(0, rect.top - (window.innerHeight - rect.height - 10));
    });
    await page.waitForTimeout(50);

    await trigger.click();
    await expect(popover).toBeVisible();

    // Popover should appear above the trigger
    const triggerBox = await trigger.boundingBox();
    const popoverBox = await popover.boundingBox();
    expect(popoverBox.y + popoverBox.height).toBeLessThanOrEqual(triggerBox.y);
  });
});
