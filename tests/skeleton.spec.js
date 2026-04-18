import { test, expect } from "@playwright/test";
import { goto, preview, css, setDark } from "./helpers.js";

test.describe("Skeleton", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "skeleton");
  });

  test("renders with a tinted background", async ({ page }) => {
    const sk = preview(page).locator(".skeleton").first();
    await expect(sk).toBeVisible();
    const bg = await css(sk, "backgroundColor");
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("shimmer ::after animates", async ({ page }) => {
    const sk = preview(page).locator(".skeleton").first();
    const animationName = await sk.evaluate(
      (el) => getComputedStyle(el, "::after").animationName,
    );
    expect(animationName).toBe("skeleton-shimmer");
  });

  test("reduced-motion collapses shimmer animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await goto(page, "skeleton");
    const sk = preview(page).locator(".skeleton").first();
    // Global blanket rule forces animation-duration to 0.01ms under reduce
    const duration = await sk.evaluate(
      (el) => getComputedStyle(el, "::after").animationDuration,
    );
    const ms = parseFloat(duration);
    expect(ms).toBeLessThanOrEqual(0.01);
  });

  test("dark mode: still visible against dark card background", async ({
    page,
  }) => {
    await setDark(page);
    const sk = preview(page).locator(".skeleton").first();
    const bg = await css(sk, "backgroundColor");
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });
});
