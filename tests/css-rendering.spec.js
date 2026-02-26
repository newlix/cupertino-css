import { test, expect } from '@playwright/test';

test.describe('CSS Rendering', () => {
  test('button is visible and has correct styling', async ({ page }) => {
    await page.goto('/docs/components/button.html');
    await page.waitForLoadState('networkidle');

    const preview = page.locator('.docs-example-preview').first();
    const btn = preview.locator('button.btn').first();

    await expect(btn).toBeVisible();

    // Button should have reasonable dimensions
    const box = await btn.boundingBox();
    expect(box.width).toBeGreaterThan(20);
    expect(box.height).toBeGreaterThan(20);
  });

  test('card has border-radius', async ({ page }) => {
    await page.goto('/docs/components/card.html');
    await page.waitForLoadState('networkidle');

    const preview = page.locator('.docs-example-preview').first();
    const card = preview.locator('.card').first();

    await expect(card).toBeVisible();

    const borderRadius = await card.evaluate(el =>
      getComputedStyle(el).borderRadius
    );
    // Should have some border-radius (not "0px")
    expect(borderRadius).not.toBe('0px');
  });

  test('skeleton has pulse animation', async ({ page }) => {
    await page.goto('/docs/components/skeleton.html');
    await page.waitForLoadState('networkidle');

    const preview = page.locator('.docs-example-preview').first();
    const skeleton = preview.locator('.skeleton').first();

    await expect(skeleton).toBeVisible();

    const animation = await skeleton.evaluate(el =>
      getComputedStyle(el).animationName
    );
    // Skeleton should have an animation applied
    expect(animation).not.toBe('none');
  });

  test('dark mode toggle works', async ({ page }) => {
    await page.goto('/docs/components/button.html');
    await page.waitForLoadState('networkidle');

    // Initially should not have dark class (or may have it depending on system pref)
    const html = page.locator('html');

    // Click theme toggle
    const themeToggle = page.locator('#docs-theme-toggle');
    const hadDark = await html.evaluate(el => el.classList.contains('dark'));

    await themeToggle.click();

    const hasDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(hasDark).toBe(!hadDark);

    // Toggle back
    await themeToggle.click();
    const backToDark = await html.evaluate(el => el.classList.contains('dark'));
    expect(backToDark).toBe(hadDark);
  });
});
