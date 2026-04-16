/**
 * When a popover closes, the trigger's aria-expanded must flip to
 * "false" before the next open. A regression where close fails to
 * reset would cause assistive tech to announce the popover as
 * "expanded" even while it's hidden.
 */
import { test, expect } from "@playwright/test";
import { goto, preview } from "./helpers.js";

test("trigger aria-expanded='false' after popover closes", async ({ page }) => {
  await goto(page, "popover");

  const p = preview(page, 0);
  const trigger = p.locator(".popover > button").first();
  const popover = p.locator("[popover]").first();

  // Initial state
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  await trigger.click();
  await expect(popover).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  // Close via Escape
  await page.keyboard.press("Escape");
  await expect(popover).not.toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");

  // Reopen — verifies state is clean for a second cycle
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
});
