/**
 * `.popover-top` modifier: popover must open ABOVE its trigger
 * regardless of available space below.
 */
import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test(".popover-top variant opens above the trigger", async ({
  page,
  browserName,
}) => {
  // Firefox + WebKit timing with the native popover API differs enough
  // that the double-RAF wait for positioning isn't stable. The
  // positioning math is exercised in Chromium; cross-browser
  // visibility is covered by other popover tests.
  test.skip(
    browserName !== "chromium",
    "popover positioning timing requires Chromium's native popover support",
  );
  await goto(page, "popover");

  const result = await page.evaluate(async () => {
    const wrapper = document.querySelector(".popover.popover-top");
    const trigger = wrapper?.querySelector("button");
    const popover = wrapper?.querySelector("[popover]");
    if (!wrapper || !popover || !trigger) return { found: false };

    trigger.click();
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => requestAnimationFrame(r));

    const popoverRect = popover.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const out = {
      found: true,
      popoverBottom: popoverRect.bottom,
      triggerTop: triggerRect.top,
      flipped: popover.classList.contains("popover-flipped-top"),
    };
    popover.hidePopover();
    return out;
  });

  expect(result.found).toBe(true);
  // Popover's bottom edge should be at or above the trigger's top — that's
  // "above" visually.
  expect(result.popoverBottom).toBeLessThanOrEqual(result.triggerTop + 2);
});
