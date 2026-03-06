import { test, expect } from "@playwright/test";
import { goto, preview, css, setDark } from "./helpers.js";

test.describe("Tag", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "tag");
  });

  test("all 7 color dots render as circles", async ({ page }) => {
    const colors = [
      "red",
      "orange",
      "yellow",
      "green",
      "blue",
      "purple",
      "gray",
    ];
    for (const color of colors) {
      const tag = preview(page).locator(`.tag-${color}`).first();
      await expect(tag).toBeVisible();
      expect(await css(tag, "borderRadius")).toBe("50%");
      expect(await css(tag, "width")).toBe("12px");
      expect(await css(tag, "height")).toBe("12px");
    }
  });

  test("each color variant has a distinct background", async ({ page }) => {
    const colors = [
      "red",
      "orange",
      "yellow",
      "green",
      "blue",
      "purple",
      "gray",
    ];
    const backgrounds = new Set();
    for (const color of colors) {
      const tag = preview(page).locator(`.tag-${color}`).first();
      const bg = await css(tag, "backgroundColor");
      backgrounds.add(bg);
    }
    expect(backgrounds.size).toBe(7);
  });

  test("dark mode changes tag colors", async ({ page }) => {
    const tag = preview(page).locator(".tag-orange").first();
    const lightBg = await css(tag, "backgroundColor");

    await setDark(page);
    const darkBg = await css(tag, "backgroundColor");
    expect(darkBg).not.toBe(lightBg);
  });

  test("interactive tag buttons are focusable", async ({ page }) => {
    const btn = preview(page, 2).locator("button.tag-red").first();
    await expect(btn).toBeVisible();
    expect(await btn.getAttribute("aria-label")).toBe("Red");
    await btn.focus();
    await expect(btn).toBeFocused();
  });
});
