import { test, expect } from "@playwright/test";
import { goto, preview, css, setDark } from "./helpers.js";

test.describe("Table", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "table");
  });

  test("table renders with rounded corners and shadow", async ({ page }) => {
    const table = preview(page).locator("table").first();
    await expect(table).toBeVisible();
    const shadow = await css(table, "boxShadow");
    expect(shadow).not.toBe("none");
    const radius = parseFloat(await css(table, "borderRadius"));
    expect(radius).toBeGreaterThan(0);
  });

  test("thead has background tint", async ({ page }) => {
    const thead = preview(page).locator("thead tr").first();
    const bg = await css(thead, "backgroundColor");
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("th has correct font size and style", async ({ page }) => {
    const th = preview(page).locator("th").first();
    expect(parseFloat(await css(th, "fontSize"))).toBe(13);
    expect(await css(th, "textTransform")).toBe("none");
  });

  test("table-striped has alternating row backgrounds", async ({ page }) => {
    const rows = preview(page, 3).locator("tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(2);
    const bg1 = await css(rows.nth(0), "backgroundColor");
    const bg2 = await css(rows.nth(1), "backgroundColor");
    expect(bg1).not.toBe(bg2);
  });

  test("tfoot has background and top border", async ({ page }) => {
    const tfoot = preview(page).locator("tfoot td").first();
    const border = await css(tfoot, "borderTopWidth");
    expect(parseFloat(border)).toBeGreaterThan(0);
  });

  test("table clips thead/tfoot backgrounds to border-radius", async ({
    page,
  }) => {
    const table = preview(page).locator("table").first();
    // overflow:clip + border-radius is the mechanism that prevents
    // thead/tfoot backgrounds from bleeding past the rounded corners.
    // clip is preferred over hidden — it clips visually without creating
    // a scroll container or blocking popover overflow.
    const radius = parseFloat(await css(table, "borderRadius"));
    expect(radius).toBeGreaterThanOrEqual(12);
    expect(await css(table, "overflow")).toBe("clip");
    // Confirm the bleed condition exists: thead and tfoot have backgrounds
    const theadBg = await css(
      preview(page).locator("thead tr").first(),
      "backgroundColor",
    );
    expect(theadBg).not.toBe("rgba(0, 0, 0, 0)");
    const tfootBg = await css(
      preview(page).locator("tfoot tr").first(),
      "backgroundColor",
    );
    expect(tfootBg).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("dark mode table is visible", async ({ page }) => {
    const table = preview(page).locator("table").first();
    await setDark(page);
    await expect(table).toBeVisible();
    const shadow = await css(table, "boxShadow");
    expect(shadow).not.toBe("none");
  });
});
