import { test, expect } from "@playwright/test";
import {
  goto,
  preview,
  css,
  focusViaKeyboard,
  skipWebkitScope,
} from "./helpers.js";

test.describe("Disclosure Group", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "disclosure-group");
  });

  test("renders grouped details in a card container", async ({ page }) => {
    const group = preview(page).locator(".disclosure-group");
    await expect(group).toBeVisible();

    const items = group.locator("> details");
    await expect(items).toHaveCount(3);
  });

  test("grouped details have no individual border", async ({
    page,
    browserName,
  }) => {
    skipWebkitScope(browserName);
    const detail = preview(page).locator(".disclosure-group > details").first();
    const border = await css(detail, "borderStyle");
    expect(border).toBe("none");
  });

  test("separator appears between grouped details", async ({ page }) => {
    const second = preview(page).locator(".disclosure-group > details").nth(1);
    const borderTop = await css(second, "borderTopStyle");
    expect(borderTop).toBe("solid");
  });

  test("summary has hover background in group", async ({
    page,
    browserName,
  }) => {
    skipWebkitScope(browserName);
    const summary = preview(page)
      .locator(".disclosure-group > details > summary")
      .first();
    const bgBefore = await css(summary, "backgroundColor");

    await summary.hover();
    await expect(async () => {
      const bgAfter = await css(summary, "backgroundColor");
      expect(bgAfter).not.toBe(bgBefore);
    }).toPass({ timeout: 3000 });
  });

  test("clicking summary toggles open state", async ({ page }) => {
    const detail = preview(page).locator(".disclosure-group > details").first();
    await expect(detail).not.toHaveAttribute("open");

    await detail.locator("summary").click();
    await expect(detail).toHaveAttribute("open");

    await detail.locator("summary").click();
    await expect(detail).not.toHaveAttribute("open");
  });

  test("summary has focus-visible ring", async ({ page }) => {
    const summary = preview(page)
      .locator(".disclosure-group > details > summary")
      .first();
    await focusViaKeyboard(page, summary);

    // Disclosure group uses outline (not box-shadow) because parent has overflow:hidden
    const outline = await css(summary, "outlineStyle");
    expect(outline).toBe("solid");
  });

  test("standalone details has border", async ({ page }) => {
    const standalone = preview(page, 4).locator("details");
    await expect(standalone).toBeVisible();

    const borderStyle = await css(standalone, "borderStyle");
    expect(borderStyle).toBe("solid");
  });

  test("card container has rounded corners", async ({ page }) => {
    const group = preview(page).locator(".disclosure-group");
    const radius = await css(group, "borderRadius");
    expect(parseFloat(radius)).toBeGreaterThan(0);
  });
});
