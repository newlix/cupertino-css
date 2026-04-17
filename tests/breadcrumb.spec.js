import { test, expect } from "@playwright/test";
import { goto, preview, css, focusViaKeyboard } from "./helpers.js";

test.describe("Breadcrumb", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "breadcrumb");
  });

  test("link changes color on hover", async ({ page }) => {
    const link = preview(page).locator(".breadcrumb a").first();
    const before = await css(link, "color");

    await link.hover();
    await expect(async () => {
      expect(await css(link, "color")).not.toBe(before);
    }).toPass({ timeout: 3000 });
  });

  test("link has no underline on hover", async ({ page }) => {
    const link = preview(page).locator(".breadcrumb a").first();

    await link.hover();
    await expect(async () => {
      expect(await css(link, "textDecorationLine")).toBe("none");
    }).toPass({ timeout: 3000 });
  });

  test("chevron separator renders between items via ::before", async ({
    page,
  }) => {
    // Second child should have a ::before pseudo with mask-image (chevron SVG)
    const secondChild = preview(page)
      .locator(".breadcrumb > :nth-child(2)")
      .first();
    const beforeBg = await secondChild.evaluate(
      (el) => getComputedStyle(el, "::before").background,
    );
    expect(beforeBg).not.toBe("none");
  });

  test("focus-visible shows ring on link", async ({ page }) => {
    const link = preview(page).locator(".breadcrumb a").first();
    await focusViaKeyboard(page, link);
    const shadow = await css(link, "boxShadow");
    expect(shadow).not.toBe("none");
  });
});
