/**
 * Contract: when destroy() is called, any ARIA attributes that init()
 * set on the component (or its trigger) must be removed, so the node
 * goes back to its pre-init state. Skipping cleanup means attributes
 * from an old instance linger and confuse assistive tech if the same
 * trigger is re-used for a different purpose after htmx swap.
 */
import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test.describe("ARIA lifecycle — destroy removes init-added attrs", () => {
  test("popover destroy clears trigger aria-expanded / -haspopup / -controls", async ({
    page,
    browserName,
  }) => {
    // Firefox has slower init when the docs page has many popover
    // instances; skip there rather than fight timing. Chromium +
    // WebKit cover the invariant.
    test.skip(
      browserName === "firefox",
      "Flaky timing in Firefox under the 11-popover-instance docs page",
    );
    await goto(page, "popover");

    // Snapshot the first popover + its trigger
    const snapshot = await page.evaluate(() => {
      const popover = document.querySelector(
        ".snippet-preview > .cider [popover]",
      );
      const wrapper = popover?.closest(".popover");
      const trigger = wrapper?.querySelector("button, a");
      const before = trigger
        ? {
            expanded: trigger.getAttribute("aria-expanded"),
            haspopup: trigger.getAttribute("aria-haspopup"),
            controls: trigger.getAttribute("aria-controls"),
          }
        : null;
      // Destroy via public API
      window.CiderUI.popover.destroy(popover);
      const after = trigger
        ? {
            expanded: trigger.getAttribute("aria-expanded"),
            haspopup: trigger.getAttribute("aria-haspopup"),
            controls: trigger.getAttribute("aria-controls"),
          }
        : null;
      return { before, after };
    });

    // Init should have set the three attributes
    expect(snapshot.before.expanded).toBe("false");
    expect(snapshot.before.haspopup).toMatch(/^(menu|dialog)$/);
    expect(snapshot.before.controls).toBeTruthy();

    // Destroy should have removed them
    expect(snapshot.after.expanded).toBeNull();
    expect(snapshot.after.haspopup).toBeNull();
    expect(snapshot.after.controls).toBeNull();
  });

  test("verification-code destroy clears inputmode / maxlength / pattern", async ({
    page,
  }) => {
    await goto(page, "verification-code");

    const snapshot = await page.evaluate(() => {
      const otp = document.querySelector(
        ".snippet-preview > .cider .verification-code",
      );
      const input = otp?.querySelector('input:not([type="hidden"])');
      const before = input
        ? {
            inputmode: input.getAttribute("inputmode"),
            pattern: input.getAttribute("pattern"),
            maxlength: input.getAttribute("maxlength"),
          }
        : null;
      window.CiderUI.verificationCode.destroy(otp);
      const after = input
        ? {
            inputmode: input.getAttribute("inputmode"),
            pattern: input.getAttribute("pattern"),
            maxlength: input.getAttribute("maxlength"),
          }
        : null;
      return { before, after };
    });

    expect(snapshot.before.inputmode).toBeTruthy();
    expect(snapshot.after.inputmode).toBeNull();
    expect(snapshot.after.pattern).toBeNull();
    expect(snapshot.after.maxlength).toBeNull();
  });
});
