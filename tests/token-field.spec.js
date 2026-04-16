import { test, expect } from "@playwright/test";
import { goto, preview, css, setDark, focusViaKeyboard } from "./helpers.js";

test.describe("Token Field", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "token-field");
  });

  test("renders existing tokens", async ({ page }) => {
    const tokens = preview(page).locator(".token");
    await expect(tokens.first()).toBeVisible();
    expect(await tokens.count()).toBeGreaterThanOrEqual(2);
  });

  test("typing and pressing Enter adds a token", async ({ page }) => {
    const field = preview(page, 2).locator(".token-field");
    const input = field.locator("input");
    await input.fill("NewTag");
    await input.press("Enter");
    const tokens = field.locator(".token");
    expect(await tokens.count()).toBeGreaterThanOrEqual(1);
    const lastToken = tokens.last();
    await expect(lastToken).toContainText("NewTag");
  });

  test("clicking remove button removes a token", async ({ page }) => {
    const field = preview(page).locator(".token-field");
    const countBefore = await field.locator(".token").count();
    await field.locator(".token button").first().click();
    await expect(async () => {
      const countAfter = await field.locator(".token").count();
      expect(countAfter).toBe(countBefore - 1);
    }).toPass({ timeout: 2000 });
  });

  test("removing middle token preserves surrounding tokens", async ({
    page,
  }) => {
    const field = preview(page).locator(".token-field");
    const input = field.locator("input");

    // Add three distinct tokens so we know exact order
    for (const t of ["one-rm", "two-rm", "three-rm"]) {
      await input.fill(t);
      await input.press("Enter");
    }

    // Remove the middle one by finding its remove button
    const middleToken = field.locator(".token", { hasText: "two-rm" });
    await middleToken.locator("button").click();

    const remaining = await field
      .locator(".token")
      .evaluateAll((els) => els.map((e) => e.dataset.value).filter(Boolean));
    expect(remaining).toContain("one-rm");
    expect(remaining).toContain("three-rm");
    expect(remaining).not.toContain("two-rm");
  });

  test("duplicate tokens are not added", async ({ page }) => {
    const field = preview(page).locator(".token-field");
    const input = field.locator("input");
    const firstTokenText = await field
      .locator(".token")
      .first()
      .evaluate((el) => el.firstChild.textContent.trim());
    const countBefore = await field.locator(".token").count();
    await input.fill(firstTokenText);
    await input.press("Enter");
    const countAfter = await field.locator(".token").count();
    expect(countAfter).toBe(countBefore);
  });

  test("blue token variant has distinct background", async ({ page }) => {
    const defaultToken = preview(page).locator(".token").first();
    const blueToken = preview(page, 1).locator(".token-blue").first();
    const defaultBg = await css(defaultToken, "backgroundColor");
    const blueBg = await css(blueToken, "backgroundColor");
    expect(blueBg).not.toBe(defaultBg);
  });

  test("focus-within shows focus ring on container", async ({ page }) => {
    const field = preview(page).locator(".token-field");
    const input = field.locator("input");
    await focusViaKeyboard(page, input);
    const shadow = await css(field, "boxShadow");
    expect(shadow).not.toBe("none");
  });

  test("disabled token field has reduced opacity", async ({ page }) => {
    const field = preview(page, 3).locator(".token-field").first();
    const opacity = parseFloat(await css(field, "opacity"));
    expect(opacity).toBeLessThan(1);
  });

  test("dark mode changes token background", async ({ page }) => {
    const token = preview(page).locator(".token").first();
    const lightBg = await css(token, "backgroundColor");
    await setDark(page);
    const darkBg = await css(token, "backgroundColor");
    expect(darkBg).not.toBe(lightBg);
  });
});
