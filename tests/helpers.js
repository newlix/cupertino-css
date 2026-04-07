/**
 * Shared test utilities for ciderui Playwright tests.
 */

import { test } from "@playwright/test";

/**
 * Skip test in WebKit due to @scope element selector bug.
 * WebKit applies @scope styles to class-based selectors (.btn-filled, .card)
 * but fails on bare element selectors (input, details, summary, textarea)
 * even when qualified by ancestor classes (.search-field input).
 */
export function skipWebkitScope(browserName) {
  test.fixme(
    browserName === "webkit",
    "WebKit @scope bug: element selectors not applied",
  );
}

/** Navigate to a component doc page and wait for ready. */
export async function goto(page, component, section = "components") {
  await page.goto(`/${section}/${component}.html`);
  await page.waitForLoadState("load");
}

/** Get the nth example preview container. */
export function preview(page, nth = 0) {
  return page.locator(".snippet-preview > .cider").nth(nth);
}

/** Get a computed CSS property from a locator. */
export async function css(locator, prop) {
  return locator.evaluate((el, p) => getComputedStyle(el)[p], prop);
}

/** Toggle dark mode on. */
export async function setDark(page) {
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
    getComputedStyle(document.documentElement).color; // flush styles
  });
}

/** Toggle dark mode off. */
export async function setLight(page) {
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    getComputedStyle(document.documentElement).color; // flush styles
  });
}

/** Wait for all CSS animations on an element to finish. */
export async function waitForAnimations(locator) {
  await locator.evaluate((el) =>
    Promise.all(
      el.getAnimations().map((a) =>
        a.finished.catch((e) => {
          if (e.name !== "AbortError") throw e;
        }),
      ),
    ),
  );
}

/**
 * Activate keyboard navigation mode, then focus the element.
 * In Chromium, pressing Tab sets the keyboard-navigation flag,
 * so subsequent .focus() calls trigger :focus-visible.
 */
export async function focusViaKeyboard(page, locator) {
  await page.keyboard.press("Tab");
  await locator.evaluate((el) => el.focus());
  await locator.evaluate((el) => getComputedStyle(el).outlineStyle);
}

/**
 * Compute WCAG contrast ratio between two CSS properties on two locators.
 * Evaluates in-browser via canvas, so it handles oklch, color-mix, etc.
 * Returns the contrast ratio (>= 1.0).
 */
export async function contrastBetween(locator1, prop1, locator2, prop2) {
  const page = locator1.page();
  const color1 = await locator1.evaluate(
    (el, p) => getComputedStyle(el)[p],
    prop1,
  );
  const color2 = await locator2.evaluate(
    (el, p) => getComputedStyle(el)[p],
    prop2,
  );
  return page.evaluate(
    ([c1, c2]) => {
      function cssToRgb(color) {
        const ctx = document.createElement("canvas").getContext("2d");
        // Sentinel: set a known non-black color first to detect invalid inputs
        ctx.fillStyle = "#ff0000";
        ctx.fillStyle = color;
        // getComputedStyle returns rgb() format; canvas normalizes to hex.
        // Exempt all forms of pure red to avoid false positives on the sentinel.
        if (
          ctx.fillStyle === "#ff0000" &&
          color !== "#ff0000" &&
          color !== "red" &&
          color !== "rgb(255, 0, 0)"
        )
          throw new Error("cssToRgb: unparseable color: " + color);
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return [r, g, b];
      }
      function luminance([r, g, b]) {
        const f = (v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      }
      const l1 = luminance(cssToRgb(c1)),
        l2 = luminance(cssToRgb(c2));
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    },
    [color1, color2],
  );
}
