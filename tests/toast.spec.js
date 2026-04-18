import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test.describe("Toast", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "toast");
  });

  test("showToast() renders a toast and auto-dismisses", async ({ page }) => {
    await page.evaluate(() => window.showToast("Saved", { duration: 300 }));
    const toast = page.locator(".toast-container .toast");
    await expect(toast).toBeVisible();
    await expect(toast.locator(".toast-title")).toHaveText("Saved");

    // Duration 300ms + animation + fallback can take ~1s; allow 5s.
    await expect(toast).toHaveCount(0, { timeout: 5000 });
  });

  test("dismiss button removes toast", async ({ page }) => {
    await page.evaluate(() =>
      window.showToast({ title: "Sticky", duration: 0 }),
    );
    const toast = page.locator(".toast-container .toast");
    await expect(toast).toBeVisible();
    await toast.locator(".toast-dismiss").click();
    await expect(toast).toHaveCount(0, { timeout: 2000 });
  });

  test("success variant uses green icon", async ({ page }) => {
    await page.evaluate(() =>
      window.showToast({
        title: "Done",
        variant: "success",
        duration: 0,
      }),
    );
    const toast = page.locator(".toast");
    await expect(toast).toHaveAttribute("data-variant", "success");
    // role=status for non-error
    await expect(toast).toHaveAttribute("role", "status");
  });

  test("error variant uses role=alert for assertive announcement", async ({
    page,
  }) => {
    await page.evaluate(() =>
      window.showToast({
        title: "Failed",
        variant: "error",
        duration: 0,
      }),
    );
    const toast = page.locator(".toast");
    await expect(toast).toHaveAttribute("role", "alert");
  });

  test("multiple toasts stack in container", async ({ page }) => {
    await page.evaluate(() => {
      window.showToast({ title: "First", duration: 0 });
      window.showToast({ title: "Second", duration: 0 });
      window.showToast({ title: "Third", duration: 0 });
    });
    const toasts = page.locator(".toast-container .toast");
    await expect(toasts).toHaveCount(3);
  });

  test("title string escaped (no HTML injection)", async ({ page }) => {
    await page.evaluate(() =>
      window.showToast({
        title: "<img src=x onerror='window.__xss=true'>",
        duration: 0,
      }),
    );
    const titleText = await page.locator(".toast-title").textContent();
    expect(titleText).toBe("<img src=x onerror='window.__xss=true'>");
    const fired = await page.evaluate(() => window.__xss);
    expect(fired).toBeFalsy();
  });
});
