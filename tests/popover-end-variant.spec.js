/**
 * `.popover-end`: popover's right edge should align with the trigger's
 * right edge, not default left-alignment.
 */
import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test(".popover-end variant right-aligns with the trigger", async ({ page }) => {
  await goto(page, "popover");

  const result = await page.evaluate(async () => {
    const wrapper = document.querySelector(
      ".popover.popover-end:not(.popover-top)",
    );
    const trigger = wrapper?.querySelector("button");
    const popover = wrapper?.querySelector("[popover]");
    if (!wrapper || !popover || !trigger) return { found: false };

    trigger.click();
    // Popover positioning happens on a double-RAF after open. Give extra
    // frames for the reposition logic to settle.
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => requestAnimationFrame(r));
    }

    const pr = popover.getBoundingClientRect();
    const tr = trigger.getBoundingClientRect();
    const out = {
      found: true,
      popoverRight: pr.right,
      triggerRight: tr.right,
    };
    popover.hidePopover();
    return out;
  });

  expect(result.found).toBe(true);
  // Allow 2px slop for sub-pixel rounding
  expect(Math.abs(result.popoverRight - result.triggerRight)).toBeLessThan(2);
});
