import { test, expect } from '@playwright/test';
import { goto, css, focusViaKeyboard } from './helpers.js';

test.describe('Focus Visible Accessibility', () => {
  test('radio shows box-shadow on keyboard focus', async ({ page }) => {
    await goto(page, 'radio-group');

    const radio = page.locator('.docs-example-preview .radio').first();
    const before = await css(radio, 'boxShadow');

    await focusViaKeyboard(page, radio);
    const after = await css(radio, 'boxShadow');

    expect(after).not.toBe('none');
    expect(after).not.toBe(before);
  });

  test('checkbox shows box-shadow on keyboard focus', async ({ page }) => {
    await goto(page, 'checkbox');

    const cb = page.locator('.docs-example-preview .checkbox').first();
    await focusViaKeyboard(page, cb);

    expect(await css(cb, 'boxShadow')).not.toBe('none');
  });

  test('switch shows box-shadow on keyboard focus', async ({ page }) => {
    await goto(page, 'switch');

    const sw = page.locator('.docs-example-preview .switch').first();
    await focusViaKeyboard(page, sw);

    expect(await css(sw, 'boxShadow')).not.toBe('none');
  });

  test('button shows outline on keyboard focus', async ({ page }) => {
    await goto(page, 'button');

    const btn = page.locator('.docs-example-preview .btn').first();
    await focusViaKeyboard(page, btn);

    expect(await css(btn, 'outlineStyle')).not.toBe('none');
  });

  test('toggle shows outline on keyboard focus', async ({ page }) => {
    await goto(page, 'toggle');

    const toggle = page.locator('.docs-example-preview .toggle').first();
    await focusViaKeyboard(page, toggle);

    expect(await css(toggle, 'outlineStyle')).not.toBe('none');
  });

  test('accordion summary shows outline on keyboard focus', async ({ page }) => {
    await goto(page, 'accordion');

    const summary = page.locator('.docs-example-preview .accordion summary').first();
    await focusViaKeyboard(page, summary);

    expect(await css(summary, 'outlineStyle')).not.toBe('none');
  });

  test('slider removes default outline on keyboard focus', async ({ page }) => {
    await goto(page, 'slider');

    const slider = page.locator('.docs-example-preview .slider').first();
    await focusViaKeyboard(page, slider);

    // The slider sets outline: none and applies box-shadow on ::-webkit-slider-thumb (pseudo-element).
    // We can verify the outline is explicitly removed (custom focus styling is applied via pseudo-element).
    const outline = await css(slider, 'outlineStyle');
    expect(outline).toBe('none');
  });

  test('tabs trigger shows outline on keyboard focus', async ({ page }) => {
    await goto(page, 'tabs');

    const tab = page.locator('.docs-example-preview [data-tab]').first();
    await focusViaKeyboard(page, tab);

    expect(await css(tab, 'outlineStyle')).not.toBe('none');
  });
});
