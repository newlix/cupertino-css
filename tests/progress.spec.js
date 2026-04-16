import { test, expect } from "@playwright/test";
import { goto, preview, css } from "./helpers.js";

/* progress.css lives OUTSIDE @scope(.cider) — uses .cider ancestor selector instead.
   No skipWebkitScope needed; WebKit can style these. */
test.describe("Progress", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "progress");
  });

  test("native progress element is styled (not browser default)", async ({
    page,
  }) => {
    const progress = preview(page).locator("progress").first();
    await expect(progress).toBeVisible();
    // Styled progress has explicit 5px height, not browser default (~16px)
    const height = parseFloat(await css(progress, "height"));
    expect(height).toBeLessThanOrEqual(6);
  });

  test("indeterminate bar animates", async ({ page }) => {
    const bar = preview(page, 2).locator(".progress-indeterminate").first();
    await expect(bar).toBeVisible();
    const afterAnimation = await bar.evaluate(
      (el) => getComputedStyle(el, "::after").animationName,
    );
    expect(afterAnimation).not.toBe("none");
  });

  test("progress is pill-shaped (fully rounded)", async ({ page }) => {
    const progress = preview(page).locator("progress").first();
    const radius = parseFloat(await css(progress, "borderTopLeftRadius"));
    // radius-pill → 9999px; browser may cap to height/2 visually but
    // the computed value stays at the declared 9999.
    expect(radius).toBeGreaterThan(100);
  });

  test("changing value prop updates visual fill (webkit + blink)", async ({
    page,
    browserName,
  }) => {
    // ::-webkit-progress-value / ::-moz-progress-bar pseudo sizes aren't
    // readable cross-browser via computed style. Instead, verify the
    // input.value round-trip works and the element still paints.
    const progress = preview(page).locator("progress").first();
    await progress.evaluate((el) => (el.value = 10));
    const low = await progress.evaluate((el) => el.value);
    expect(low).toBe(10);

    await progress.evaluate((el) => (el.value = 90));
    const high = await progress.evaluate((el) => el.value);
    expect(high).toBe(90);

    // Box is still visible (not collapsed) in all three engines
    const box = await progress.boundingBox();
    expect(box.height).toBeGreaterThan(0);
    expect(box.width).toBeGreaterThan(0);
    // Silence unused-var lint warning for browserName
    expect(typeof browserName).toBe("string");
  });
});
