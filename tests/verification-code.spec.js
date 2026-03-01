import { test, expect } from '@playwright/test';
import { goto, preview } from './helpers.js';

test.describe('Verification Code', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'verification-code');
  });

  test('typing digit fills slot and auto-advances', async ({ page }) => {
    const inputs = preview(page).locator('.verification-code input:not([type="hidden"])');

    await inputs.nth(0).click();
    await page.keyboard.press('1');
    await expect(inputs.nth(0)).toHaveValue('1');
    await expect(inputs.nth(1)).toBeFocused();

    await page.keyboard.press('2');
    await expect(inputs.nth(1)).toHaveValue('2');
    await page.keyboard.press('3');
    await expect(inputs.nth(2)).toHaveValue('3');
  });

  test('backspace clears current slot and moves back', async ({ page }) => {
    const inputs = preview(page).locator('.verification-code input:not([type="hidden"])');

    await inputs.nth(0).click();
    await page.keyboard.press('1');
    await page.keyboard.press('2');

    await page.keyboard.press('Backspace');
    await expect(inputs.nth(1)).toHaveValue('');

    await page.keyboard.press('Backspace');
    await expect(inputs.nth(0)).toHaveValue('');
  });

  test('paste fills multiple slots', async ({ page }) => {
    const inputs = preview(page).locator('.verification-code input:not([type="hidden"])');

    await inputs.nth(0).click();

    await page.evaluate(() => {
      const input = document.querySelector('.snippet-preview > figure .verification-code input:not([type="hidden"])');
      const dt = new DataTransfer();
      dt.setData('text/plain', '123456');
      input.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true }));
    });

    await expect(inputs.nth(0)).toHaveValue('1');
    await expect(inputs.nth(1)).toHaveValue('2');
    await expect(inputs.nth(2)).toHaveValue('3');
    await expect(inputs.nth(3)).toHaveValue('4');
    await expect(inputs.nth(4)).toHaveValue('5');
    await expect(inputs.nth(5)).toHaveValue('6');

    const hidden = preview(page).locator('input[type="hidden"]');
    await expect(hidden).toHaveValue('123456');
  });

  test('hidden input syncs value as digits are typed', async ({ page }) => {
    const inputs = preview(page).locator('.verification-code input:not([type="hidden"])');
    const hidden = preview(page).locator('input[type="hidden"]');

    await inputs.nth(0).click();
    await page.keyboard.press('4');
    await expect(hidden).toHaveValue('4');

    await page.keyboard.press('2');
    await expect(hidden).toHaveValue('42');

    await page.keyboard.press('0');
    await expect(hidden).toHaveValue('420');
  });

  test('non-numeric input is rejected', async ({ page }) => {
    const inputs = preview(page).locator('.verification-code input:not([type="hidden"])');

    await inputs.nth(0).click();
    await page.keyboard.press('a');
    await expect(inputs.nth(0)).toHaveValue('');

    // Should stay on the same input since no digit was entered
    await page.keyboard.press('1');
    await expect(inputs.nth(0)).toHaveValue('1');
    await expect(inputs.nth(1)).toBeFocused();
  });

  test('arrow keys navigate between slots', async ({ page }) => {
    const inputs = preview(page).locator('.verification-code input:not([type="hidden"])');

    await inputs.nth(1).click();
    await expect(inputs.nth(1)).toBeFocused();

    await page.keyboard.press('ArrowLeft');
    await expect(inputs.nth(0)).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(inputs.nth(1)).toBeFocused();
  });
});
