import { test, expect } from '@playwright/test';
import { goto, preview, css } from './helpers.js';

test.describe('CSS Rendering', () => {
  test('button has correct dimensions and border-radius', async ({ page }) => {
    await goto(page, 'button');
    const btn = preview(page).locator('button').first();
    await expect(btn).toBeVisible();

    const box = await btn.boundingBox();
    expect(box.width).toBeGreaterThan(20);
    expect(box.height).toBeGreaterThan(20);
    expect(await css(btn, 'borderRadius')).not.toBe('0px');
  });

  test('card has border-radius and shadow', async ({ page }) => {
    await goto(page, 'card');
    const card = preview(page).locator('.card').first();
    await expect(card).toBeVisible();
    expect(await css(card, 'borderRadius')).not.toBe('0px');
  });

  test('skeleton has pulse animation', async ({ page }) => {
    await goto(page, 'skeleton');
    const skeleton = preview(page).locator('.skeleton').first();
    await expect(skeleton).toBeVisible();
    expect(await css(skeleton, 'animationName')).not.toBe('none');
  });

  test('dark mode toggle works', async ({ page }) => {
    await goto(page, 'button');
    const html = page.locator('html');
    const themeToggle = page.locator('#docs-theme-toggle');
    const hadDark = await html.evaluate(el => el.classList.contains('dark'));

    await themeToggle.click();
    expect(await html.evaluate(el => el.classList.contains('dark'))).toBe(!hadDark);

    await themeToggle.click();
    expect(await html.evaluate(el => el.classList.contains('dark'))).toBe(hadDark);
  });

  test('progress bar has correct width from style', async ({ page }) => {
    await goto(page, 'progress');
    const bar = preview(page).locator('progress').first();
    await expect(bar).toBeVisible();
    expect(await css(bar, 'borderRadius')).not.toBe('0px');
  });

  test('badge variants are visible with distinct colors', async ({ page }) => {
    await goto(page, 'badge');
    const badges = preview(page).locator('span');
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < Math.min(count, 2); i++) {
      await expect(badges.nth(i)).toBeVisible();
      const box = await badges.nth(i).boundingBox();
      expect(box.height).toBeGreaterThan(10);
    }
  });

  test('avatar has circular shape', async ({ page }) => {
    await goto(page, 'avatar');
    const avatar = preview(page).locator('.avatar').first();
    await expect(avatar).toBeVisible();
    const radius = parseFloat(await css(avatar, 'borderRadius'));
    expect(radius).toBeGreaterThan(100);
  });

  test('alert variants are visible', async ({ page }) => {
    await goto(page, 'alert');
    for (const cls of ['.alert-info', '.alert-success', '.alert-warning', '.alert-destructive']) {
      const alert = page.locator(`.snippet-preview > figure ${cls}`).first();
      await expect(alert).toBeVisible();
      const box = await alert.boundingBox();
      expect(box.height).toBeGreaterThan(30);
    }
  });

  test('spinner has animation', async ({ page }) => {
    await goto(page, 'spinner');
    const spinner = preview(page).locator('.spinner').first();
    await expect(spinner).toBeVisible();
    expect(await css(spinner, 'animationName')).not.toBe('none');
  });

  test('breadcrumb renders links and separators', async ({ page }) => {
    await goto(page, 'breadcrumb');
    const nav = preview(page).locator('.breadcrumb').first();
    await expect(nav).toBeVisible();
    const links = nav.locator('a');
    expect(await links.count()).toBeGreaterThanOrEqual(1);
  });

  test('separator renders as thin line', async ({ page }) => {
    await goto(page, 'separator');
    const sep = preview(page).locator('hr').first();
    await expect(sep).toBeVisible();
    const box = await sep.boundingBox();
    expect(box.height).toBeLessThanOrEqual(2);
  });
});
