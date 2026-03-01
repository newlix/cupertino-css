import { test, expect } from '@playwright/test';
import { goto, css } from './helpers.js';

/**
 * Verify that CiderUI @scope(.cider) component styles do NOT leak
 * outside the .cider boundary, and that .cider-reset stops them.
 */

const TEST_HTML = `
  <div id="outside">
    <h1>Heading</h1>
    <a href="#">Link</a>
    <input type="text" placeholder="text">
    <textarea></textarea>
    <select><option>Opt</option></select>
    <button class="btn-filled">Button</button>
    <div class="card"><p>Card</p></div>
    <label>Label</label>
    <code>code</code>
    <table><thead><tr><th>H</th></tr></thead><tbody><tr><td>C</td></tr></tbody></table>
    <input type="checkbox">
  </div>
  <div id="inside" class="cider">
    <h1>Heading</h1>
    <a href="#">Link</a>
    <input type="text" placeholder="text">
    <textarea></textarea>
    <select><option>Opt</option></select>
    <button class="btn-filled">Button</button>
    <div class="card"><p>Card</p></div>
    <label>Label</label>
    <code>code</code>
    <table><thead><tr><th>H</th></tr></thead><tbody><tr><td>C</td></tr></tbody></table>
    <input type="checkbox">
  </div>
  <div id="reset-wrapper" class="cider">
    <div id="reset" class="cider-reset">
      <h1>Heading</h1>
      <a href="#">Link</a>
      <input type="text" placeholder="text">
      <button class="btn-filled">Button</button>
      <div class="card"><p>Card</p></div>
      <input type="checkbox">
    </div>
  </div>
`;

async function setupIsolationPage(page) {
  await goto(page, 'button');
  await page.evaluate((html) => {
    document.body.className = '';
    document.body.innerHTML = html;
  }, TEST_HTML);
  await page.waitForTimeout(100);
}

test.describe('Scope Isolation — styles stay inside .cider', () => {
  test('h1 typography only applies inside .cider', async ({ page }) => {
    await setupIsolationPage(page);
    const inside = page.locator('#inside h1');
    const outside = page.locator('#outside h1');

    // CiderUI sets h1 to 34px
    expect(await css(inside, 'fontSize')).toBe('34px');
    expect(await css(outside, 'fontSize')).not.toBe('34px');
  });

  test('anchor color only set to primary inside .cider', async ({ page }) => {
    await setupIsolationPage(page);
    const inside = page.locator('#inside a');
    const outside = page.locator('#outside a');

    // CiderUI sets color to --color-primary on links inside .cider
    const insideColor = await css(inside, 'color');
    const outsideColor = await css(outside, 'color');
    expect(insideColor).not.toBe(outsideColor);
  });

  test('text input border-radius only applies inside .cider', async ({ page }) => {
    await setupIsolationPage(page);
    const inside = page.locator('#inside input[type="text"]');
    const outside = page.locator('#outside input[type="text"]');

    // CiderUI sets border-radius to 12px
    const insideRadius = parseFloat(await css(inside, 'borderRadius'));
    const outsideRadius = parseFloat(await css(outside, 'borderRadius'));
    expect(insideRadius).toBe(12);
    expect(outsideRadius).toBeLessThan(12);
  });

  test('textarea border-radius only applies inside .cider', async ({ page }) => {
    await setupIsolationPage(page);
    const inside = page.locator('#inside textarea');
    const outside = page.locator('#outside textarea');

    const insideRadius = parseFloat(await css(inside, 'borderRadius'));
    const outsideRadius = parseFloat(await css(outside, 'borderRadius'));
    expect(insideRadius).toBe(12);
    expect(outsideRadius).toBeLessThan(12);
  });

  test('select appearance only overridden inside .cider', async ({ page }) => {
    await setupIsolationPage(page);
    const inside = page.locator('#inside select');
    const outside = page.locator('#outside select');

    // CiderUI sets height to 44px (h-11) and border-radius 12px
    const insideRadius = parseFloat(await css(inside, 'borderRadius'));
    const outsideRadius = parseFloat(await css(outside, 'borderRadius'));
    expect(insideRadius).toBe(12);
    expect(outsideRadius).toBeLessThan(12);
  });

  test('.btn-filled only styled inside .cider', async ({ page }) => {
    await setupIsolationPage(page);
    const inside = page.locator('#inside .btn-filled');
    const outside = page.locator('#outside .btn-filled');

    // CiderUI sets display: inline-flex and border-radius: 12px
    expect(await css(inside, 'display')).toBe('inline-flex');
    expect(await css(outside, 'display')).not.toBe('inline-flex');

    const insideRadius = parseFloat(await css(inside, 'borderRadius'));
    const outsideRadius = parseFloat(await css(outside, 'borderRadius'));
    expect(insideRadius).toBe(12);
    expect(outsideRadius).toBeLessThan(12);
  });

  test('.card only styled inside .cider', async ({ page }) => {
    await setupIsolationPage(page);
    const inside = page.locator('#inside .card');
    const outside = page.locator('#outside .card');

    // CiderUI sets box-shadow on .card
    expect(await css(inside, 'boxShadow')).not.toBe('none');
    expect(await css(outside, 'boxShadow')).toBe('none');
  });

  test('label display only overridden inside .cider', async ({ page }) => {
    await setupIsolationPage(page);
    const inside = page.locator('#inside label');
    const outside = page.locator('#outside label');

    // CiderUI sets label to display: block
    expect(await css(inside, 'display')).toBe('block');
    expect(await css(outside, 'display')).toBe('inline');
  });

  test('code background only styled inside .cider', async ({ page }) => {
    await setupIsolationPage(page);
    const inside = page.locator('#inside code');
    const outside = page.locator('#outside code');

    // CiderUI gives code a background
    const insideBg = await css(inside, 'backgroundColor');
    const outsideBg = await css(outside, 'backgroundColor');
    expect(insideBg).not.toBe('rgba(0, 0, 0, 0)');
    expect(outsideBg).toBe('rgba(0, 0, 0, 0)');
  });

  test('table border-collapse only overridden inside .cider', async ({ page }) => {
    await setupIsolationPage(page);
    const inside = page.locator('#inside table');
    const outside = page.locator('#outside table');

    // CiderUI sets border-collapse: separate
    expect(await css(inside, 'borderCollapse')).toBe('separate');
    expect(await css(outside, 'borderCollapse')).toBe('collapse');
  });

  test('checkbox appearance only overridden inside .cider', async ({ page }) => {
    await setupIsolationPage(page);
    const inside = page.locator('#inside input[type="checkbox"]');
    const outside = page.locator('#outside input[type="checkbox"]');

    // CiderUI sets explicit 18px width
    const insideW = parseFloat(await css(inside, 'width'));
    const outsideW = parseFloat(await css(outside, 'width'));
    expect(insideW).toBe(18);
    expect(outsideW).not.toBe(18);
  });
});

test.describe('Scope Isolation — .cider-reset stops styles', () => {
  test('h1 inside .cider-reset does not get CiderUI h1 styles', async ({ page }) => {
    await setupIsolationPage(page);
    const reset = page.locator('#reset h1');

    // CiderUI h1 is 34px; inside .cider-reset it should NOT be 34px
    expect(await css(reset, 'fontSize')).not.toBe('34px');
  });

  test('anchor inside .cider-reset does not get primary color', async ({ page }) => {
    await setupIsolationPage(page);
    const reset = page.locator('#reset a');
    const inside = page.locator('#inside a');

    // Inside .cider, anchor gets primary color; inside .cider-reset it should not
    const resetColor = await css(reset, 'color');
    const insideColor = await css(inside, 'color');
    expect(resetColor).not.toBe(insideColor);
  });

  test('input inside .cider-reset has no CiderUI border-radius', async ({ page }) => {
    await setupIsolationPage(page);
    const reset = page.locator('#reset input[type="text"]');
    const outside = page.locator('#outside input[type="text"]');

    const resetRadius = parseFloat(await css(reset, 'borderRadius'));
    const outsideRadius = parseFloat(await css(outside, 'borderRadius'));
    expect(resetRadius).toBe(outsideRadius);
    expect(resetRadius).toBeLessThan(12);
  });

  test('.btn-filled inside .cider-reset is unstyled', async ({ page }) => {
    await setupIsolationPage(page);
    const reset = page.locator('#reset .btn-filled');

    expect(await css(reset, 'display')).not.toBe('inline-flex');
  });

  test('.card inside .cider-reset has no box-shadow', async ({ page }) => {
    await setupIsolationPage(page);
    const reset = page.locator('#reset .card');

    expect(await css(reset, 'boxShadow')).toBe('none');
  });

  test('checkbox inside .cider-reset has browser default size', async ({ page }) => {
    await setupIsolationPage(page);
    const reset = page.locator('#reset input[type="checkbox"]');
    const outside = page.locator('#outside input[type="checkbox"]');

    const resetW = parseFloat(await css(reset, 'width'));
    const outsideW = parseFloat(await css(outside, 'width'));
    expect(resetW).toBe(outsideW);
    expect(resetW).not.toBe(18);
  });
});
