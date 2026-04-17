import { test, expect } from "@playwright/test";
import { goto, preview, css, setDark, focusViaKeyboard } from "./helpers.js";

test.describe("Avatar", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "avatar");
  });

  test("avatar stays square via aspect-ratio even in flex containers", async ({
    page,
  }) => {
    const avatar = preview(page).locator("div.avatar").first();
    const width = parseFloat(await css(avatar, "width"));
    const height = parseFloat(await css(avatar, "height"));
    expect(Math.abs(width - height)).toBeLessThan(1);
  });

  test("avatar-group hovered item rises above siblings via z-index", async ({
    page,
  }) => {
    const group = page
      .locator(".snippet-preview > .cider .avatar-group")
      .first();
    await expect(group).toBeVisible();
    const avatar = group.locator(".avatar").first();
    await avatar.hover();
    await expect(async () => {
      const z = await css(avatar, "zIndex");
      expect(z).toBe("1");
    }).toPass({ timeout: 3000 });
  });

  test("dark mode changes avatar ring shadow", async ({ page }) => {
    const avatar = preview(page).locator("div.avatar").first();
    const lightShadow = await css(avatar, "boxShadow");
    await setDark(page);
    const darkShadow = await css(avatar, "boxShadow");
    // Avatar has explicit .dark & { --avatar-ring: ... } override
    expect(darkShadow).not.toBe(lightShadow);
  });
});
