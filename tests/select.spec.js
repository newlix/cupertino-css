import { test, expect } from "@playwright/test";
import { goto, preview } from "./helpers.js";

test.describe("Select", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "select");
  });

  test("native select allows choosing an option", async ({ page }) => {
    const select = preview(page).locator("select");

    await expect(select).toHaveValue("");

    await select.selectOption("1");
    await expect(select).toHaveValue("1");
  });

  test("grouped select works", async ({ page }) => {
    const select = preview(page, 1).locator("select");

    await select.selectOption("strawberry");
    await expect(select).toHaveValue("strawberry");
  });

  test("disabled select cannot be changed", async ({ page }) => {
    const select = preview(page, 3).locator("select");

    await expect(select).toBeDisabled();
  });
});
