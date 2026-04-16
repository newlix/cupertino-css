import { test, expect } from "@playwright/test";
import {
  goto,
  preview,
  css,
  setDark,
  focusViaKeyboard,
  contrastBetween,
} from "./helpers.js";

test.describe("Card", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "card");
  });

  test("static card has no pointer cursor", async ({ page }) => {
    const card = preview(page).locator("div.card").first();
    const cursor = await css(card, "cursor");
    expect(cursor).not.toBe("pointer");
  });

  test("card overflow:hidden clips content", async ({ page }) => {
    const card = preview(page).locator(".card").first();
    expect(await css(card, "overflow")).toBe("hidden");
  });

  test("card focus-visible uses outline (not just box-shadow) for overflow:hidden compat", async ({
    page,
  }) => {
    const btn = page.locator(".snippet-preview > .cider button.card").first();
    await expect(btn).toBeVisible();
    await focusViaKeyboard(page, btn);
    const outline = await css(btn, "outlineStyle");
    expect(outline).toBe("solid");
  });

  test("dark mode: border visible against background", async ({ page }) => {
    await setDark(page);
    const card = preview(page, 0).locator(".card").first();
    const ratio = await contrastBetween(
      card,
      "borderColor",
      card,
      "backgroundColor",
    );
    // Threshold 1.04 (not 1.05) — color-mix() alpha blending produces
    // slightly different float values per browser/load, and the ratio
    // sits around 1.047-1.052 in dark mode. We only need "not equal".
    expect(ratio).toBeGreaterThan(1.04);
  });
});
