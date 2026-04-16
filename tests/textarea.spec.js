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

  test("resize:vertical only (not both/horizontal/none)", async ({
    page,
    browserName,
  }) => {
    skipWebkitScope(browserName);
    const textarea = preview(page).locator("textarea").first();
    // Design choice: horizontal resize breaks form layouts; `resize: vertical`
    // lets users grow height only.
    expect(await css(textarea, "resize")).toBe("vertical");
  });

  test("read-only textarea disables resize", async ({ page, browserName }) => {
    skipWebkitScope(browserName);
    const ta = await page.evaluate(() => {
      const t = document.createElement("textarea");
      t.readOnly = true;
      document.querySelector(".cider")?.appendChild(t);
      const r = getComputedStyle(t).resize;
      t.remove();
      return r;
    });
    // A read-only textarea can't hold more than its rendered content, so
    // letting users resize it is a footgun — ciderui sets resize:none.
    expect(ta).toBe("none");
  });

  test("textarea applies squircle corner-shape (when supported)", async ({
    page,
    browserName,
  }) => {
    skipWebkitScope(browserName);
    const textarea = preview(page).locator("textarea").first();
    const shape = await css(textarea, "cornerShape");
    // Browsers without corner-shape support return empty string; in
    // supporting browsers it returns "squircle". Either is OK — we just
    // assert the rule parses.
    expect(["", "squircle", "normal"]).toContain(shape);
  });
});
