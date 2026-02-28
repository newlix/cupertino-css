import { test, expect } from '@playwright/test';

test.describe('Input OTP', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/site/components/input-otp.html');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('typing digit fills slot and auto-advances', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();
    const slots = preview.locator('.input-otp-slot');

    await slots.nth(0).click();
    await expect(slots.nth(0)).toHaveAttribute('data-active', '');

    await page.keyboard.press('1');
    await expect(slots.nth(0)).toHaveText('1');
    await expect(slots.nth(1)).toHaveAttribute('data-active', '');

    await page.keyboard.press('2');
    await expect(slots.nth(1)).toHaveText('2');
    await page.keyboard.press('3');
    await expect(slots.nth(2)).toHaveText('3');
  });

  test('backspace clears current slot and moves back', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();
    const slots = preview.locator('.input-otp-slot');

    await slots.nth(0).click();
    await page.keyboard.press('1');
    await page.keyboard.press('2');

    await page.keyboard.press('Backspace');
    await expect(slots.nth(1)).toHaveText('');

    await page.keyboard.press('Backspace');
    await expect(slots.nth(0)).toHaveText('');
  });

  test('paste fills multiple slots', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();
    const slots = preview.locator('.input-otp-slot');

    await slots.nth(0).click();

    // Dispatch paste event with clipboard data
    await page.evaluate(() => {
      const slot = document.querySelector('.snippet-preview > figure .input-otp-slot[data-active]');
      const dt = new DataTransfer();
      dt.setData('text/plain', '123456');
      slot.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true }));
    });

    await expect(slots.nth(0)).toHaveText('1');
    await expect(slots.nth(1)).toHaveText('2');
    await expect(slots.nth(2)).toHaveText('3');
    await expect(slots.nth(3)).toHaveText('4');
    await expect(slots.nth(4)).toHaveText('5');
    await expect(slots.nth(5)).toHaveText('6');

    const hidden = preview.locator('input[type="hidden"]');
    await expect(hidden).toHaveValue('123456');
  });
});
