/**
 * verification-code uses a MutationObserver to sync the data-error
 * attribute → aria-invalid on each input. This spec covers:
 * 1. The observer fires on data-error add/remove.
 * 2. destroy() disconnects the observer (no stale callbacks after
 *    the OTP element is torn down).
 */
import { test, expect } from "@playwright/test";
import { goto, preview } from "./helpers.js";

test.describe("Verification Code — error observer", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "verification-code");
    await page.waitForFunction(
      () => document.querySelector(".verification-code")?._vcInit,
    );
  });

  test("adding data-error propagates aria-invalid to inputs", async ({
    page,
  }) => {
    const otp = preview(page).locator(".verification-code").first();

    await otp.evaluate((el) => el.setAttribute("data-error", ""));
    // MutationObserver dispatches microtask-ish; wait until propagation
    const invalid = otp.locator('input[aria-invalid="true"]');
    await expect.poll(async () => invalid.count()).toBeGreaterThan(0);

    await otp.evaluate((el) => el.removeAttribute("data-error"));
    await expect.poll(async () => invalid.count()).toBe(0);
  });

  test("destroy disconnects the observer", async ({ page }) => {
    const result = await page.evaluate(() => {
      const otp = document.querySelector(
        ".snippet-preview > .cider .verification-code",
      );
      window.CiderUI.verificationCode.destroy(otp);

      // Observer should be null after destroy
      const observerGone = otp._errorObserver == null;

      // Set data-error post-destroy — aria-invalid must NOT appear
      otp.setAttribute("data-error", "");
      // Give the (detached) observer a chance to fire — if it didn't
      // disconnect, this would flip aria-invalid within a microtask
      return new Promise((resolve) =>
        setTimeout(() => {
          const anyInvalid = !!otp.querySelector('input[aria-invalid="true"]');
          resolve({ observerGone, anyInvalid });
          otp.removeAttribute("data-error");
        }, 30),
      );
    });

    expect(result.observerGone).toBe(true);
    expect(
      result.anyInvalid,
      "observer still active after destroy — aria-invalid set on torn-down inputs",
    ).toBe(false);
  });
});
