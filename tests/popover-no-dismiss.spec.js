/**
 * data-no-dismiss: clicking a menu item with this attribute must NOT
 * auto-close the popover-menu. Useful for sub-actions (a checkbox
 * row, a copy-to-clipboard button inside the menu) where closing
 * the menu would be surprising.
 *
 * Documented selector, but there's no example in the docs — so the
 * only coverage is this test.
 */
import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test("data-no-dismiss item click keeps popover open", async ({ page }) => {
  await goto(page, "popover");

  await page.evaluate(() => {
    const host = document.querySelector(".cider");
    host.insertAdjacentHTML(
      "beforeend",
      `
      <div class="popover popover-menu" id="nd-test">
        <button class="btn-plain">Open</button>
        <div popover>
          <button data-no-dismiss id="nd-sticky">Sticky action</button>
          <button id="nd-normal">Normal action</button>
        </div>
      </div>
    `,
    );
    window.CiderUI.popover.init();
  });

  const trigger = page.locator("#nd-test > button");
  const popover = page.locator("#nd-test [popover]");

  await trigger.scrollIntoViewIfNeeded();
  // Use showPopover() directly — native click on injected popover may be
  // intercepted by other positioned content in the docs page.
  await popover.evaluate((el) => el.showPopover());
  await expect(popover).toBeVisible();

  // Click the sticky item — menu should stay open
  await page.locator("#nd-sticky").click();
  await expect(popover).toBeVisible();

  // Click the normal item — menu should close
  await page.locator("#nd-normal").click();
  await expect(popover).not.toBeVisible();
});
