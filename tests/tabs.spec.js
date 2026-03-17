import { test, expect } from "@playwright/test";
import { goto, preview } from "./helpers.js";

test.describe("Tabs", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "tabs");
    await page.waitForFunction(() => {
      const tab = document.querySelector("[data-tab]");
      return tab && tab.getAttribute("role") === "tab";
    });
  });

  test("clicking tab switches active panel", async ({ page }) => {
    const tab1 = preview(page).locator('[data-tab="t1"]');
    const tab2 = preview(page).locator('[data-tab="t2"]');
    const panel1 = preview(page).locator('[data-tab-panel="t1"]');
    const panel2 = preview(page).locator('[data-tab-panel="t2"]');

    await expect(tab1).toHaveAttribute("data-active", "");
    await expect(panel1).toHaveAttribute("data-active", "");
    await expect(panel2).not.toHaveAttribute("data-active", "");

    await tab2.click();

    await expect(tab2).toHaveAttribute("data-active", "");
    await expect(tab1).not.toHaveAttribute("data-active", "");
    await expect(panel2).toHaveAttribute("data-active", "");
    await expect(panel1).not.toHaveAttribute("data-active", "");
  });

  test("ARIA roles are set on tablist, tabs, and panels", async ({ page }) => {
    const list = preview(page).locator("[data-tab-list]");
    await expect(list).toHaveAttribute("role", "tablist");

    const tab1 = preview(page).locator('[data-tab="t1"]');
    await expect(tab1).toHaveAttribute("role", "tab");
    await expect(tab1).toHaveAttribute("aria-selected", "true");

    const tab2 = preview(page).locator('[data-tab="t2"]');
    await expect(tab2).toHaveAttribute("role", "tab");
    await expect(tab2).toHaveAttribute("aria-selected", "false");

    const panel1 = preview(page).locator('[data-tab-panel="t1"]');
    await expect(panel1).toHaveAttribute("role", "tabpanel");
  });

  test("aria-controls and aria-labelledby link tabs to panels", async ({
    page,
  }) => {
    const tab1 = preview(page).locator('[data-tab="t1"]');
    const panel1 = preview(page).locator('[data-tab-panel="t1"]');

    const panelId = await panel1.getAttribute("id");
    await expect(tab1).toHaveAttribute("aria-controls", panelId);

    const tabId = await tab1.getAttribute("id");
    await expect(panel1).toHaveAttribute("aria-labelledby", tabId);
  });

  test("ArrowRight moves to next tab", async ({ page }) => {
    const tab1 = preview(page).locator('[data-tab="t1"]');
    const tab2 = preview(page).locator('[data-tab="t2"]');

    await tab1.focus();
    await page.keyboard.press("ArrowRight");

    await expect(tab2).toHaveAttribute("data-active", "");
    await expect(tab2).toBeFocused();
  });

  test("ArrowLeft moves to previous tab", async ({ page }) => {
    const tab1 = preview(page).locator('[data-tab="t1"]');
    const tab2 = preview(page).locator('[data-tab="t2"]');

    await tab2.click();
    await page.keyboard.press("ArrowLeft");

    await expect(tab1).toHaveAttribute("data-active", "");
    await expect(tab1).toBeFocused();
  });

  test("Home key moves to first tab", async ({ page }) => {
    const tab1 = preview(page).locator('[data-tab="t1"]');
    const tab3 = preview(page).locator('[data-tab="t3"]');

    await tab3.click();
    await page.keyboard.press("Home");

    await expect(tab1).toHaveAttribute("data-active", "");
    await expect(tab1).toBeFocused();
  });

  test("End key moves to last tab", async ({ page }) => {
    const tab1 = preview(page).locator('[data-tab="t1"]');
    const tab3 = preview(page).locator('[data-tab="t3"]');

    await tab1.focus();
    await page.keyboard.press("End");

    await expect(tab3).toHaveAttribute("data-active", "");
    await expect(tab3).toBeFocused();
  });

  test("disabled tab is skipped during keyboard navigation", async ({
    page,
  }) => {
    const tab1 = preview(page, 1).locator('[data-tab="d1"]');
    const tab2 = preview(page, 1).locator('[data-tab="d2"]');
    const tab3 = preview(page, 1).locator('[data-tab="d3"]');

    // d1 (active) → ArrowRight → should land on d2 (skip d3 which is disabled)
    await tab1.focus();
    await page.keyboard.press("ArrowRight");
    await expect(tab2).toHaveAttribute("data-active", "");
    await expect(tab2).toBeFocused();

    // d2 → ArrowRight → should wrap around, skipping d3
    await page.keyboard.press("ArrowRight");
    await expect(tab1).toHaveAttribute("data-active", "");
    await expect(tab1).toBeFocused();

    // Verify d3 was never activated
    await expect(tab3).not.toHaveAttribute("data-active", "");
  });

  test("vertical orientation uses ArrowDown/ArrowUp", async ({ page }) => {
    const tab1 = preview(page, 2).locator('[data-tab="v1"]');
    const tab2 = preview(page, 2).locator('[data-tab="v2"]');

    const list = preview(page, 2).locator("[data-tab-list]");
    await expect(list).toHaveAttribute("aria-orientation", "vertical");

    await tab1.focus();
    await page.keyboard.press("ArrowDown");

    await expect(tab2).toHaveAttribute("data-active", "");
    await expect(tab2).toBeFocused();

    await page.keyboard.press("ArrowUp");

    await expect(tab1).toHaveAttribute("data-active", "");
    await expect(tab1).toBeFocused();
  });

  test("tabindex roving: active tab has 0, others have -1", async ({
    page,
  }) => {
    const tab1 = preview(page).locator('[data-tab="t1"]');
    const tab2 = preview(page).locator('[data-tab="t2"]');
    const tab3 = preview(page).locator('[data-tab="t3"]');

    await expect(tab1).toHaveAttribute("tabindex", "0");
    await expect(tab2).toHaveAttribute("tabindex", "-1");
    await expect(tab3).toHaveAttribute("tabindex", "-1");

    await tab2.click();

    await expect(tab1).toHaveAttribute("tabindex", "-1");
    await expect(tab2).toHaveAttribute("tabindex", "0");
  });

  test("destroy removes ARIA attributes and event listeners", async ({
    page,
  }) => {
    const tab1 = preview(page).locator('[data-tab="t1"]');
    const panel1 = preview(page).locator('[data-tab-panel="t1"]');
    const list = preview(page).locator("[data-tab-list]");

    await page.evaluate(() => {
      const group = document.querySelector("[data-tabs]");
      window.CiderUI.tabs.destroy(group);
    });

    await expect(tab1).not.toHaveAttribute("role");
    await expect(tab1).not.toHaveAttribute("aria-selected");
    await expect(tab1).not.toHaveAttribute("aria-controls");
    await expect(panel1).not.toHaveAttribute("role");
    await expect(panel1).not.toHaveAttribute("aria-labelledby");
    await expect(list).not.toHaveAttribute("role");
  });
});
