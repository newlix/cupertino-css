import { test, expect } from "@playwright/test";
import { goto, preview, css, setDark, focusViaKeyboard } from "./helpers.js";

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

  test("dark mode: card has visible boundary via shadow", async ({ page }) => {
    await setDark(page);
    const card = preview(page, 0).locator(".card").first();
    // Card renders its boundary via box-shadow (panel-ring + shadow-sm),
    // not border-width — which is 0. Earlier version of this test
    // asserted borderColor vs backgroundColor contrast but since
    // border-width is 0 that comparison is both meaningless (border
    // isn't drawn) and flaky (tiny color-mix() float deltas between
    // browsers/hosts drift the ratio around 1.03-1.05). What matters
    // is that the box-shadow is non-none in dark mode.
    expect(await css(card, "boxShadow")).not.toBe("none");
  });
});
