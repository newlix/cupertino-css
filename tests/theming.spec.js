/**
 * Contract: consumers should be able to re-theme ciderui purely by
 * overriding the documented CSS custom properties (--color-primary,
 * --radius, --shadow, …). This only works if the component styles
 * reference the vars rather than inlining concrete colours.
 *
 * Regressions here are hard to spot visually — a hard-coded #007aff
 * somewhere would cause a consumer's red-themed button to render
 * blue for one specific state.
 */
import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test.describe("Theming", () => {
  test("overriding --color-primary recolours .btn-filled", async ({ page }) => {
    await goto(page, "button");

    const btn = page.locator(".snippet-preview > .cider .btn-filled").first();
    const originalBg = await btn.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    await page.evaluate(() => {
      const styleEl = document.createElement("style");
      styleEl.textContent =
        ".cider { --color-primary: rgb(220, 20, 60); --color-primary-hover: rgb(180, 16, 49); --color-primary-active: rgb(140, 12, 38); }";
      document.head.appendChild(styleEl);
    });

    const overriddenBg = await btn.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    // Browser may serialise as rgb()/oklab() depending on how the var flowed
    // through @apply + Tailwind theme. We only care that the override took
    // effect, not the exact string.
    expect(overriddenBg).not.toBe(originalBg);
  });

  test("overriding --radius recalculates card corners", async ({ page }) => {
    await goto(page, "card");

    const card = page.locator(".snippet-preview > .cider .card").first();
    const original = await card.evaluate(
      (el) => getComputedStyle(el).borderTopLeftRadius,
    );
    expect(parseFloat(original)).toBeGreaterThan(0);

    await page.evaluate(() => {
      const styleEl = document.createElement("style");
      styleEl.textContent = ".cider { --radius: 40px; }";
      document.head.appendChild(styleEl);
    });

    const overridden = await card.evaluate(
      (el) => getComputedStyle(el).borderTopLeftRadius,
    );
    expect(parseFloat(overridden)).toBe(40);
  });

  test("overriding --color-destructive recolours destructive buttons", async ({
    page,
  }) => {
    await goto(page, "button");

    const btn = page
      .locator(".snippet-preview > .cider .btn-filled.btn-destructive")
      .first();
    await expect(btn).toBeVisible();
    const originalBg = await btn.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    await page.evaluate(() => {
      const styleEl = document.createElement("style");
      styleEl.textContent = ".cider { --color-destructive: rgb(0, 128, 0); }";
      document.head.appendChild(styleEl);
    });

    const bg = await btn.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe(originalBg);
  });
});
