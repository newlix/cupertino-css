import { test, expect } from "@playwright/test";
import {
  goto,
  preview,
  css,
  focusViaKeyboard,
  skipWebkitScope,
} from "./helpers.js";

/* textarea is a bare element selector inside @scope — skip WebKit */
test.describe("Textarea", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "textarea");
  });

  test("focus changes border color", async ({ page, browserName }) => {
    skipWebkitScope(browserName);
    const textarea = preview(page).locator("textarea").first();
    const before = await css(textarea, "borderColor");
    await focusViaKeyboard(page, textarea);
    const after = await css(textarea, "borderColor");
    expect(after).not.toBe(before);
  });

  test("aria-invalid textarea has different border than normal", async ({
    page,
    browserName,
  }) => {
    skipWebkitScope(browserName);
    const normal = preview(page).locator("textarea").first();
    const invalid = preview(page, 2).locator('[aria-invalid="true"]').first();
    expect(await css(invalid, "borderColor")).not.toBe(
      await css(normal, "borderColor"),
    );
  });
});
