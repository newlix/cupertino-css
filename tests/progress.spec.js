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
});
