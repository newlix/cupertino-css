import { test, expect } from '@playwright/test';

test.describe('Carousel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/site/components/carousel.html');
    await page.waitForFunction(() => typeof window.showToast === 'function');
  });

  test('prev button is disabled at start', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const prev = preview.locator('.carousel-prev');

    // carousel.js updateState() sets prev.disabled = true when at index 0
    await expect(prev).toBeDisabled();
  });

  test('clicking next scrolls to next item', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const next = preview.locator('.carousel-next');
    const prev = preview.locator('.carousel-prev');

    await next.click();
    // After scrolling, prev should become enabled
    await expect(prev).toBeEnabled();
  });

  test('clicking next then prev returns to start', async ({ page }) => {
    const preview = page.locator('.snippet > figure').first();
    const next = preview.locator('.carousel-next');
    const prev = preview.locator('.carousel-prev');

    await next.click();
    await expect(prev).toBeEnabled();

    await prev.click();
    // Back at start, prev should be disabled again
    await expect(prev).toBeDisabled();
  });

  test('indicators update on scroll', async ({ page }) => {
    // "With Indicators" example (fourth example)
    const preview = page.locator('.snippet > figure').nth(3);
    const indicators = preview.locator('.carousel-indicator');
    const next = preview.locator('.carousel-next');

    await expect(indicators.nth(0)).toHaveAttribute('data-active', '');

    await next.click();
    await expect(indicators.nth(1)).toHaveAttribute('data-active', '');
    await expect(indicators.nth(0)).not.toHaveAttribute('data-active', '');
  });
});
