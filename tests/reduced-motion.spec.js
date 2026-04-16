/**
 * Contract: the global @media (prefers-reduced-motion: reduce) rule in
 * ciderui.css squashes animation/transition durations to ~0 for every
 * element in the .cider scope. Components that explicitly re-enable a
 * short fade (dialog/hud/action-sheet) still do, but for all others
 * the movement should stop.
 *
 * Playwright's `emulateMedia` flips the media query without touching
 * any styles, so we can assert the expected runtime behaviour
 * precisely.
 */
import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test.describe("prefers-reduced-motion", () => {
  test("button transition duration collapses to ~0ms", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await goto(page, "button");

    const btn = page.locator(".snippet-preview > .cider .btn-filled").first();
    const duration = await btn.evaluate(
      (el) => getComputedStyle(el).transitionDuration,
    );
    // Global rule forces 0.01ms; browser may serialise as 0.01ms or 0s.
    // Assert the longest component (.btn transitions) is ≤ 0.01s.
    const maxDuration = Math.max(
      ...duration.split(",").map((d) => parseFloat(d.trim())),
    );
    expect(maxDuration).toBeLessThanOrEqual(0.01);
  });

  test("activity indicator static opacity instead of spinning", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await goto(page, "activity-indicator");

    const indicator = page
      .locator(".snippet-preview > .cider .activity-indicator")
      .first();
    const animationName = await indicator.evaluate(
      (el) => getComputedStyle(el).animationName,
    );
    // activity-indicator.css sets `animation: none` under reduce
    expect(animationName).toBe("none");

    const opacity = await indicator.evaluate((el) =>
      parseFloat(getComputedStyle(el).opacity),
    );
    // The static-state opacity = 0.65
    expect(opacity).toBeCloseTo(0.65, 2);
  });

  test("dialog still fades in (deliberate override)", async ({ page }) => {
    // Dialog is one of three components (dialog, hud, action-sheet) that
    // deliberately keeps a quick fade under reduce — avoids abrupt pop-in.
    // The !important override in dialog.css reintroduces a short animation.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await goto(page, "dialog");

    // Poke at the CSS rule directly rather than opening a dialog — the
    // modal lifecycle is tested elsewhere. We just verify the rule
    // survives the reduce blanket.
    const animationName = await page.evaluate(() => {
      const d = document.createElement("dialog");
      d.className = "dialog";
      document.querySelector(".cider")?.appendChild(d);
      d.open = true;
      const n = getComputedStyle(d).animationName;
      d.remove();
      return n;
    });
    // Override substitutes fadeIn (non-movement) — name should not be "none"
    expect(animationName).not.toBe("none");
  });
});
