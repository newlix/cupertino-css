import { test, expect } from "@playwright/test";
import { goto, preview, css, setDark, contrastBetween } from "./helpers.js";

test.describe("Dark Mode", () => {
  test("verification code slots have visible background against card", async ({
    page,
  }) => {
    await goto(page, "verification-code");
    await setDark(page);

    const slot = preview(page)
      .locator('.verification-code input:not([type="hidden"])')
      .first();
    const container = preview(page);

    expect(await css(slot, "backgroundColor")).not.toBe(
      await css(container, "backgroundColor"),
    );
  });

  test("switch on/off are distinguishable", async ({ page }) => {
    await goto(page, "switch");
    await setDark(page);

    const checked = page
      .locator('.snippet-preview > figure input[role="switch"]:checked')
      .first();
    const unchecked = page
      .locator(
        '.snippet-preview > figure input[role="switch"]:not(:checked):not(:disabled)',
      )
      .first();

    expect(await css(checked, "backgroundColor")).not.toBe(
      await css(unchecked, "backgroundColor"),
    );
  });

  test("badges have sufficient text contrast", async ({ page }) => {
    await goto(page, "badge");
    await setDark(page);

    const badge = page.locator(".snippet-preview > figure .badge").first();
    const ratio = await contrastBetween(
      badge,
      "color",
      badge,
      "backgroundColor",
    );
    expect(ratio, "badge contrast").toBeGreaterThan(3);
  });

  test("card border is visible against card background", async ({ page }) => {
    await goto(page, "card");
    await setDark(page);

    const card = preview(page, 0).locator(".card").first();
    const ratio = await contrastBetween(
      card,
      "borderColor",
      card,
      "backgroundColor",
    );
    expect(ratio).toBeGreaterThan(1.05);
  });

  test("radio checked state is visible", async ({ page }) => {
    await goto(page, "radio-group");
    await setDark(page);

    const checked = page
      .locator('.snippet-preview > figure input[type="radio"]:checked')
      .first();
    const unchecked = page
      .locator(
        '.snippet-preview > figure input[type="radio"]:not(:checked):not(:disabled)',
      )
      .first();

    expect(await css(checked, "borderColor")).not.toBe(
      await css(unchecked, "borderColor"),
    );
  });

  test("callout has distinct styling in dark mode", async ({ page }) => {
    await goto(page, "callout");
    const alert = page.locator(".snippet-preview > figure .callout").first();
    const lightBg = await css(alert, "backgroundColor");
    await setDark(page);
    const darkBg = await css(alert, "backgroundColor");
    expect(darkBg).not.toBe(lightBg);
  });

  test("input border is visible against background", async ({ page }) => {
    await goto(page, "input");
    await setDark(page);

    const input = preview(page).locator('input[type="text"]').first();
    const ratio = await contrastBetween(
      input,
      "borderColor",
      input,
      "backgroundColor",
    );
    expect(ratio).toBeGreaterThan(1.05);
  });

  test("progress bar is visible", async ({ page }) => {
    await goto(page, "progress");
    await setDark(page);

    const bar = preview(page).locator("progress").first();
    await expect(bar).toBeVisible();
    // Progress track should have a background
    const bg = await css(bar, "backgroundColor");
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });
});
