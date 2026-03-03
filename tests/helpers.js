/**
 * Shared test utilities for ciderui Playwright tests.
 */

/** Navigate to a component doc page and wait for ready. */
export async function goto(page, component, section = 'components') {
  await page.goto(`/${section}/${component}.html`);
  await page.waitForLoadState('load');
}

/** Get the nth example preview container. */
export function preview(page, nth = 0) {
  return page.locator('.snippet-preview > figure').nth(nth);
}

/** Get a computed CSS property from a locator. */
export async function css(locator, prop) {
  return locator.evaluate((el, p) => getComputedStyle(el)[p], prop);
}

/** Toggle dark mode on. */
export async function setDark(page) {
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.evaluate(() => getComputedStyle(document.documentElement).color);
}

/** Toggle dark mode off. */
export async function setLight(page) {
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  await page.evaluate(() => getComputedStyle(document.documentElement).color);
}

/**
 * Activate keyboard navigation mode, then focus the element.
 * In Chromium, pressing Tab sets the keyboard-navigation flag,
 * so subsequent .focus() calls trigger :focus-visible.
 */
export async function focusViaKeyboard(page, locator) {
  await page.keyboard.press('Tab');
  await locator.evaluate(el => el.focus());
  await locator.evaluate(el => getComputedStyle(el).outlineStyle);
}

/**
 * Compute WCAG contrast ratio between two CSS properties on two locators.
 * Evaluates in-browser via canvas, so it handles oklch, color-mix, etc.
 * Returns the contrast ratio (>= 1.0).
 */
export async function contrastBetween(locator1, prop1, locator2, prop2) {
  const page = locator1.page();
  const el1 = await locator1.elementHandle();
  const el2 = await locator2.elementHandle();
  return page.evaluate(([e1, p1, e2, p2]) => {
    function cssToRgb(color) {
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return [r, g, b];
    }
    function luminance([r, g, b]) {
      const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    }
    const c1 = cssToRgb(getComputedStyle(e1)[p1]);
    const c2 = cssToRgb(getComputedStyle(e2)[p2]);
    const l1 = luminance(c1), l2 = luminance(c2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }, [el1, prop1, el2, prop2]);
}
