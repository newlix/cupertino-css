/**
 * Perf budget on kitchen-sink (the page with the most component
 * instances). Init runs on DOMContentLoaded + every htmx:afterSettle,
 * so quadratic scanning would show up here first.
 *
 * Not a tight benchmark — CI machines vary — but a loose ceiling
 * catches accidental O(n²) selectors or synchronous layout thrashing.
 */
import { test, expect } from "@playwright/test";

test("kitchen-sink init + layout budget under 1500ms", async ({ page }) => {
  await page.goto("/components/kitchen-sink.html");

  // Navigation Timing v2 — relative timestamps, no subtraction.
  const timings = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    return {
      domInteractive: nav.domInteractive,
      domContentLoaded: nav.domContentLoadedEventEnd,
      load: nav.loadEventEnd,
    };
  });

  // domContentLoaded covers DOM parse + inline script init. Generous
  // ceiling of 1.5s — if this trips in CI with a normal machine,
  // something became a lot slower.
  expect(timings.domContentLoaded).toBeLessThan(1500);
});
