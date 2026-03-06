import { test, expect } from '@playwright/test';
import { goto, preview, css, setDark, setLight, focusViaKeyboard } from './helpers.js';

test.describe('Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, 'sidebar');
  });

  test('renders section headers and links', async ({ page }) => {
    const sidebar = preview(page).locator('.sidebar');
    await expect(sidebar).toBeVisible();

    const headers = sidebar.locator('h2');
    await expect(headers).toHaveCount(2);
    await expect(headers.first()).toHaveText('Getting Started');

    const links = sidebar.locator('a');
    await expect(links).toHaveCount(7);
  });

  test('active item has background highlight', async ({ page }) => {
    const active = preview(page).locator('.sidebar a[data-active]');
    const bg = await css(active, 'backgroundColor');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('active item is font-semibold', async ({ page }) => {
    const active = preview(page).locator('.sidebar a[data-active]');
    const weight = await css(active, 'fontWeight');
    expect(Number(weight)).toBeGreaterThanOrEqual(600);
  });

  test('non-active items have tertiary color', async ({ page }) => {
    const link = preview(page).locator('.sidebar a:not([data-active])').first();
    const active = preview(page).locator('.sidebar a[data-active]');
    const linkColor = await css(link, 'color');
    const activeColor = await css(active, 'color');
    expect(linkColor).not.toBe(activeColor);
  });

  test('hover changes background on non-active item', async ({ page }) => {
    const link = preview(page).locator('.sidebar a:not([data-active])').first();
    const bgBefore = await css(link, 'backgroundColor');

    await link.hover();
    await expect(async () => {
      const bgAfter = await css(link, 'backgroundColor');
      expect(bgAfter).not.toBe(bgBefore);
    }).toPass({ timeout: 1000 });
  });

  test('items have rounded corners', async ({ page }) => {
    const link = preview(page).locator('.sidebar a').first();
    const radius = await css(link, 'borderRadius');
    expect(radius).not.toBe('0px');
  });

  test('section header is uppercase', async ({ page }) => {
    const header = preview(page).locator('.sidebar h2').first();
    const transform = await css(header, 'textTransform');
    expect(transform).toBe('uppercase');
  });

  test('with-icons example shows SVG icons', async ({ page }) => {
    const icons = preview(page, 1).locator('.sidebar a > svg');
    await expect(icons.first()).toBeVisible();
    const size = await icons.first().boundingBox();
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
  });

  test('tinted variant uses primary color for active background', async ({ page }) => {
    const tinted = preview(page, 2).locator('.sidebar-tinted a[data-active]');
    const bg = await css(tinted, 'backgroundColor');
    // Tinted active should not be pure gray — it has a blue hue
    const defaultActive = preview(page).locator('.sidebar a[data-active]');
    const defaultBg = await css(defaultActive, 'backgroundColor');
    expect(bg).not.toBe(defaultBg);
  });

  test('disabled item has reduced opacity', async ({ page }) => {
    const disabled = preview(page, 3).locator('.sidebar a[aria-disabled="true"]');
    const opacity = await css(disabled, 'opacity');
    expect(parseFloat(opacity)).toBeLessThan(1);
  });

  test('disabled item has pointer-events none', async ({ page }) => {
    const disabled = preview(page, 3).locator('.sidebar a[aria-disabled="true"]');
    const pe = await css(disabled, 'pointerEvents');
    expect(pe).toBe('none');
  });

  test('aria-current="page" activates same style as data-active', async ({ page }) => {
    const ariaCurrent = preview(page, 4).locator('.sidebar a[aria-current="page"]');
    const bg = await css(ariaCurrent, 'backgroundColor');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    const weight = await css(ariaCurrent, 'fontWeight');
    expect(Number(weight)).toBeGreaterThanOrEqual(600);
  });

  test('focus-visible shows focus ring', async ({ page }) => {
    const link = preview(page).locator('.sidebar a').first();
    await focusViaKeyboard(page, link);

    const shadow = await css(link, 'boxShadow');
    expect(shadow).not.toBe('none');
  });

  test('dark mode — active item still has visible background', async ({ page }) => {
    await setDark(page);
    const active = preview(page).locator('.sidebar a[data-active]');
    const bg = await css(active, 'backgroundColor');
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    await setLight(page);
  });
});

test.describe('Sidebar Mobile Layout', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.beforeEach(async ({ page }) => {
    // Use a standalone page with the full sidebar layout
    await page.goto('/components/sidebar.html');
    await page.waitForLoadState('load');
  });

  test('sidebar-toggle is visible on mobile', async ({ page }) => {
    // The docs site sidebar has a mobile toggle already, but we test the
    // component CSS class .sidebar-toggle visibility via inline test markup
    const visible = await page.evaluate(() => {
      const el = document.createElement('button');
      el.className = 'sidebar-toggle';
      document.querySelector('.cider').appendChild(el);
      const display = getComputedStyle(el).display;
      el.remove();
      return display;
    });
    expect(visible).not.toBe('none');
  });

  test('sidebar-toggle is hidden on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    const hidden = await page.evaluate(() => {
      const el = document.createElement('button');
      el.className = 'sidebar-toggle';
      document.querySelector('.cider').appendChild(el);
      const display = getComputedStyle(el).display;
      el.remove();
      return display;
    });
    expect(hidden).toBe('none');
  });

  test('sidebar-panel is off-screen on mobile by default', async ({ page }) => {
    const transform = await page.evaluate(() => {
      const el = document.createElement('aside');
      el.className = 'sidebar-panel';
      el.style.cssText = 'visibility:hidden';
      document.querySelector('.cider').appendChild(el);
      const t = getComputedStyle(el).transform;
      el.remove();
      return t;
    });
    // translateX(-100%) results in a matrix with a negative X translation
    expect(transform).not.toBe('none');
  });

  test('JS toggle opens and closes sidebar-panel', async ({ page }) => {
    // Inject a sidebar layout into the page
    await page.evaluate(() => {
      const container = document.querySelector('.cider');
      container.insertAdjacentHTML('beforeend', `
        <button class="sidebar-toggle" data-sidebar-toggle aria-controls="test-sidebar" aria-expanded="false">Menu</button>
        <aside class="sidebar-panel" id="test-sidebar">
          <nav class="sidebar"><a href="#">Link</a></nav>
        </aside>
        <div class="sidebar-overlay"></div>
      `);
      // Re-init sidebar JS
      if (window.CiderUI && window.CiderUI.sidebar) window.CiderUI.sidebar.init();
    });

    const toggle = page.locator('[data-sidebar-toggle]');
    const panel = page.locator('#test-sidebar');

    // Initially closed
    expect(await panel.getAttribute('data-open')).toBeNull();

    // Open
    await toggle.click();
    expect(await panel.getAttribute('data-open')).toBe('');
    expect(await toggle.getAttribute('aria-expanded')).toBe('true');

    // Close — use force because the open panel (width:100%) covers the toggle
    await toggle.click({ force: true });
    expect(await panel.getAttribute('data-open')).toBeNull();
    expect(await toggle.getAttribute('aria-expanded')).toBe('false');
  });

  test('overlay click closes sidebar', async ({ page }) => {
    await page.evaluate(() => {
      const container = document.querySelector('.cider');
      container.insertAdjacentHTML('beforeend', `
        <button class="sidebar-toggle" data-sidebar-toggle aria-controls="test-sidebar2" aria-expanded="false">Menu</button>
        <aside class="sidebar-panel" id="test-sidebar2">
          <nav class="sidebar"><a href="#">Link</a></nav>
        </aside>
        <div class="sidebar-overlay" id="test-overlay2"></div>
      `);
      if (window.CiderUI && window.CiderUI.sidebar) window.CiderUI.sidebar.init();
    });

    const toggle = page.locator('[aria-controls="test-sidebar2"]');
    const panel = page.locator('#test-sidebar2');
    const overlay = page.locator('#test-overlay2');

    await toggle.click();
    expect(await panel.getAttribute('data-open')).toBe('');

    // Click overlay to close
    await overlay.click({ force: true });
    expect(await panel.getAttribute('data-open')).toBeNull();
  });

  test('Escape key closes sidebar', async ({ page }) => {
    await page.evaluate(() => {
      const container = document.querySelector('.cider');
      container.insertAdjacentHTML('beforeend', `
        <button class="sidebar-toggle" data-sidebar-toggle aria-controls="test-sidebar3" aria-expanded="false">Menu</button>
        <aside class="sidebar-panel" id="test-sidebar3">
          <nav class="sidebar"><a href="#">Link</a></nav>
        </aside>
        <div class="sidebar-overlay"></div>
      `);
      if (window.CiderUI && window.CiderUI.sidebar) window.CiderUI.sidebar.init();
    });

    const toggle = page.locator('[aria-controls="test-sidebar3"]');
    const panel = page.locator('#test-sidebar3');

    await toggle.click();
    expect(await panel.getAttribute('data-open')).toBe('');

    await page.keyboard.press('Escape');
    expect(await panel.getAttribute('data-open')).toBeNull();
  });

  test('link click inside sidebar closes panel', async ({ page }) => {
    await page.evaluate(() => {
      const container = document.querySelector('.cider');
      container.insertAdjacentHTML('beforeend', `
        <button class="sidebar-toggle" data-sidebar-toggle aria-controls="test-sidebar4" aria-expanded="false">Menu</button>
        <aside class="sidebar-panel" id="test-sidebar4">
          <nav class="sidebar"><a href="#" id="test-link4">Link</a></nav>
        </aside>
        <div class="sidebar-overlay"></div>
      `);
      if (window.CiderUI && window.CiderUI.sidebar) window.CiderUI.sidebar.init();
    });

    const toggle = page.locator('[aria-controls="test-sidebar4"]');
    const panel = page.locator('#test-sidebar4');
    const link = page.locator('#test-link4');

    await toggle.click({ force: true });
    expect(await panel.getAttribute('data-open')).toBe('');

    // Dispatch click programmatically — the panel transition may not have finished
    await page.evaluate(() => document.getElementById('test-link4').click());
    expect(await panel.getAttribute('data-open')).toBeNull();
  });
});
