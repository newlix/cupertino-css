import { test, expect } from '@playwright/test';
import { css } from './helpers.js';

test.describe('CSS State Specificity', () => {
  test('radio: hover preserves checked border-color', async ({ page }) => {
    await page.goto('/docs/components/radio-group.html');
    await page.waitForLoadState('networkidle');

    // First radio in the Default example is pre-checked
    const radio = page.locator('.docs-example-preview input[type="radio"]:checked').first();
    const before = await css(radio, 'borderColor');

    await radio.hover();
    await page.waitForTimeout(300);
    const after = await css(radio, 'borderColor');

    expect(after).toBe(before);
  });

  test('radio: hover changes unchecked border-color', async ({ page }) => {
    await page.goto('/docs/components/radio-group.html');
    await page.waitForLoadState('networkidle');

    const radio = page.locator('.docs-example-preview input[type="radio"]:not(:checked):not(:disabled)').first();
    const before = await css(radio, 'borderColor');

    await radio.hover();
    await page.waitForTimeout(300);
    const after = await css(radio, 'borderColor');

    expect(after).not.toBe(before);
  });

  test('checkbox: hover preserves checked background and border', async ({ page }) => {
    await page.goto('/docs/components/checkbox.html');
    await page.waitForLoadState('networkidle');

    // Second example ("Checked") has a pre-checked checkbox
    const cb = page.locator('.docs-example-preview').nth(1).locator('input[type="checkbox"]');
    const bgBefore = await css(cb, 'backgroundColor');
    const borderBefore = await css(cb, 'borderColor');

    await cb.hover();
    await page.waitForTimeout(300);

    expect(await css(cb, 'backgroundColor')).toBe(bgBefore);
    expect(await css(cb, 'borderColor')).toBe(borderBefore);
  });

  test('switch: checked and unchecked have distinct backgrounds', async ({ page }) => {
    await page.goto('/docs/components/switch.html');
    await page.waitForLoadState('networkidle');

    const checked = page.locator('.docs-example-preview input[role="switch"]:checked').first();
    const unchecked = page.locator('.docs-example-preview input[role="switch"]:not(:checked):not(:disabled)').first();

    const bgOn = await css(checked, 'backgroundColor');
    const bgOff = await css(unchecked, 'backgroundColor');

    expect(bgOn).not.toBe(bgOff);
  });

  test('disabled radio has opacity <= 0.5', async ({ page }) => {
    await page.goto('/docs/components/radio-group.html');
    await page.waitForLoadState('networkidle');

    const disabled = page.locator('.docs-example-preview input[type="radio"][disabled]').first();
    expect(parseFloat(await css(disabled, 'opacity'))).toBeLessThanOrEqual(0.5);
  });

  test('disabled checkbox has cursor not-allowed', async ({ page }) => {
    await page.goto('/docs/components/checkbox.html');
    await page.waitForLoadState('networkidle');

    const disabled = page.locator('.docs-example-preview input[type="checkbox"][disabled]').first();
    expect(await css(disabled, 'cursor')).toBe('not-allowed');
  });

  test('disabled button has reduced opacity and no pointer-events', async ({ page }) => {
    await page.goto('/docs/components/button.html');
    await page.waitForLoadState('networkidle');

    const disabled = page.locator('.docs-example-preview button[disabled]').first();
    expect(parseFloat(await css(disabled, 'opacity'))).toBeLessThan(1);
    expect(await css(disabled, 'pointerEvents')).toBe('none');
  });

  test('input focus changes border-color to primary', async ({ page }) => {
    await page.goto('/docs/components/input.html');
    await page.waitForLoadState('networkidle');

    const input = page.locator('.docs-example-preview input[type="text"]').first();
    const beforeColor = await css(input, 'borderColor');

    await input.focus();
    await page.waitForTimeout(250);
    const focusColor = await css(input, 'borderColor');

    // Focus should change border color (from gray to primary blue)
    expect(focusColor).not.toBe(beforeColor);
  });
});
