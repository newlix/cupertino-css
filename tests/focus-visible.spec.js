import { test, expect } from "@playwright/test";
import { goto, css, focusViaKeyboard, skipWebkitScope } from "./helpers.js";

test.describe("Focus Visible Accessibility", () => {
  test("radio shows box-shadow on keyboard focus", async ({ page }) => {
    await goto(page, "radio-group");

    const radio = page
      .locator('.snippet-preview > figure input[type="radio"]')
      .first();
    const before = await css(radio, "boxShadow");

    await focusViaKeyboard(page, radio);

    await expect(async () => {
      const after = await css(radio, "boxShadow");
      expect(after).not.toBe("none");
      expect(after).not.toBe(before);
    }).toPass({ timeout: 1000 });
  });

  test("checkbox shows box-shadow on keyboard focus", async ({ page }) => {
    await goto(page, "checkbox");

    const cb = page
      .locator('.snippet-preview > figure input[type="checkbox"]')
      .first();
    await focusViaKeyboard(page, cb);

    await expect(async () => {
      expect(await css(cb, "boxShadow")).not.toBe("none");
    }).toPass({ timeout: 1000 });
  });

  test("switch shows box-shadow on keyboard focus", async ({ page }) => {
    await goto(page, "switch");

    const sw = page
      .locator('.snippet-preview > figure input[role="switch"]')
      .first();
    await focusViaKeyboard(page, sw);

    await expect(async () => {
      expect(await css(sw, "boxShadow")).not.toBe("none");
    }).toPass({ timeout: 1000 });
  });

  test("button shows box-shadow on keyboard focus", async ({ page }) => {
    await goto(page, "button");

    const btn = page.locator(".snippet-preview > figure button").first();
    await focusViaKeyboard(page, btn);

    await expect(async () => {
      expect(await css(btn, "boxShadow")).not.toBe("none");
    }).toPass({ timeout: 1000 });
  });

  test("slider removes default outline on keyboard focus", async ({
    page,
    browserName,
  }) => {
    skipWebkitScope(browserName);
    await goto(page, "slider");

    const slider = page.locator(".snippet-preview > figure .slider").first();
    await focusViaKeyboard(page, slider);

    // The slider sets outline: none and applies box-shadow on ::-webkit-slider-thumb (pseudo-element).
    // We can verify the outline is explicitly removed (custom focus styling is applied via pseudo-element).
    await expect(async () => {
      const outline = await css(slider, "outlineStyle");
      expect(outline).toBe("none");
    }).toPass({ timeout: 1000 });
  });
});
