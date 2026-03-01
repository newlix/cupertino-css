import { test, expect } from '@playwright/test';

test.describe('Sheet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/site/components/sheet.html');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('open sheet via button, close via close button', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();
    const sheet = preview.locator('dialog');

    await expect(sheet).not.toBeVisible();

    await preview.locator('button:has-text("Open Sheet")').click();
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('h2')).toHaveText('Move Goal');

    await sheet.locator('.sheet-close').click();
    await expect(sheet).not.toBeVisible();
  });

  test('close sheet via backdrop click', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();
    const sheet = preview.locator('dialog');

    await preview.locator('button:has-text("Open Sheet")').click();
    await expect(sheet).toBeVisible();

    // Dispatch click directly on sheet element (e.target === sheet triggers close)
    await sheet.evaluate(s => {
      s.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await expect(sheet).not.toBeVisible();
  });

  test('close sheet via Escape key', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();
    const sheet = preview.locator('dialog');

    await preview.locator('button:has-text("Open Sheet")').click();
    await expect(sheet).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(sheet).not.toBeVisible();
  });

  test('scroll lock is set when sheet is open', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();
    const sheet = preview.locator('dialog');

    await preview.locator('button:has-text("Open Sheet")').click();
    await expect(sheet).toBeVisible();

    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe('hidden');

    await sheet.locator('.sheet-close').click();
    await expect(sheet).not.toBeVisible();

    const overflowAfter = await page.evaluate(() => document.body.style.overflow);
    expect(overflowAfter).toBe('');
  });

  test('focus is restored to trigger after sheet closes', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').first();
    const trigger = preview.locator('button:has-text("Open Sheet")');
    const sheet = preview.locator('dialog');

    await trigger.click();
    await expect(sheet).toBeVisible();

    await sheet.locator('.sheet-close').click();
    await expect(sheet).not.toBeVisible();

    await expect(trigger).toBeFocused();
  });

  test('focus trap wraps within sheet', async ({ page }) => {
    const preview = page.locator('.snippet-preview > figure').nth(1);
    const sheet = preview.locator('dialog');

    await preview.locator('button:has-text("Create Account")').click();
    await expect(sheet).toBeVisible();

    // Focus the last focusable element, then Tab should wrap to first
    await sheet.evaluate(s => {
      const sel = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const els = s.querySelectorAll(sel);
      els[els.length - 1].focus();
    });
    await page.keyboard.press('Tab');

    const wrappedToFirst = await sheet.evaluate(s => {
      const sel = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return document.activeElement === s.querySelectorAll(sel)[0];
    });
    expect(wrappedToFirst).toBe(true);

    await sheet.locator('.sheet-close').click();
  });
});
