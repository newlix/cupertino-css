/**
 * Shared test utilities for ciderui Playwright tests.
 */

/** Navigate to a component doc page and wait for ready. */
export async function goto(page, component, section = 'components') {
  await page.goto(`/site/${section}/${component}.html`);
  await page.waitForLoadState('networkidle');
}

/** Get the nth example preview container. */
export function preview(page, nth = 0) {
  return page.locator('.snippet-preview > figure').nth(nth);
}

/** Get the nth preview container in dark mode (call setDark first). */
export function darkPreview(page, nth = 0) {
  return page.locator('.snippet-preview > figure').nth(nth);
}

/** Get a computed CSS property from a locator. */
export async function css(locator, prop) {
  return locator.evaluate((el, p) => getComputedStyle(el)[p], prop);
}

/** Toggle dark mode on. */
export async function setDark(page) {
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await page.waitForTimeout(50);
}

/** Toggle dark mode off. */
export async function setLight(page) {
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  await page.waitForTimeout(50);
}

/**
 * Activate keyboard navigation mode, then focus the element.
 * In Chromium, pressing Tab sets the keyboard-navigation flag,
 * so subsequent .focus() calls trigger :focus-visible.
 */
export async function focusViaKeyboard(page, locator) {
  await page.keyboard.press('Tab');
  await locator.evaluate(el => el.focus());
  await page.waitForTimeout(50);
}

/** Parse "rgb(r, g, b)" or "rgba(r, g, b, a)" to [r, g, b]. */
export function parseRgb(s) {
  const m = s.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
  return m ? [Math.round(+m[1]), Math.round(+m[2]), Math.round(+m[3])] : null;
}

/** WCAG relative luminance from [r, g, b]. */
export function luminance([r, g, b]) {
  const f = v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** WCAG contrast ratio between two [r, g, b] colors. */
export function contrast(c1, c2) {
  const l1 = luminance(c1), l2 = luminance(c2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
