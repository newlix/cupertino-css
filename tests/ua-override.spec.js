import { test, expect } from "@playwright/test";
import { goto, preview, waitForAnimations } from "./helpers.js";

/**
 * UA stylesheet override tests.
 *
 * Browsers apply their own styles to semantic HTML elements like <dialog>,
 * <details>, <fieldset>, etc. If component CSS forgets to override a UA
 * property (e.g. dialog:modal { inset: 0 }), the element can end up in
 * the wrong position or with unexpected dimensions.
 *
 * These tests open every overlay/positioned component and verify that
 * its bounding rect matches the intended layout.
 *
 * IMPORTANT: Components use CSS animations (slide-up, scale-in, etc.).
 * We must wait for animations to finish before measuring getBoundingClientRect(),
 * because mid-animation transforms shift the visual position.
 */

test.describe("UA Override — Action Sheet", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "action-sheet");
  });

  test("action sheet is anchored to viewport bottom", async ({ page }) => {
    await preview(page).locator('button:has-text("Share Photo")').click();
    const dialog = page.locator("#sheet1");
    await expect(dialog).toBeVisible();
    await waitForAnimations(dialog);

    const { dialogBottom, viewportHeight } = await dialog.evaluate((el) => ({
      dialogBottom: el.getBoundingClientRect().bottom,
      viewportHeight: window.innerHeight,
    }));

    // The sheet's bottom edge should be within 20px of the viewport bottom
    // (accounts for safe-area-inset-bottom + 8px padding)
    expect(dialogBottom).toBeGreaterThan(viewportHeight - 20);
    // Allow 1px tolerance for sub-pixel rounding across browsers
    expect(dialogBottom).toBeLessThanOrEqual(viewportHeight + 1);

    await dialog.locator('button:has-text("Cancel")').click();
  });

  test("action sheet top is NOT at viewport top", async ({ page }) => {
    await preview(page).locator('button:has-text("Share Photo")').click();
    const dialog = page.locator("#sheet1");
    await expect(dialog).toBeVisible();
    await waitForAnimations(dialog);

    const top = await dialog.evaluate((el) => el.getBoundingClientRect().top);

    // The sheet must NOT start at the top of the viewport
    // (the bug: UA inset:0 pushes it to top:0)
    expect(top).toBeGreaterThan(100);

    await dialog.locator('button:has-text("Cancel")').click();
  });

  test("with-header action sheet is also at bottom", async ({ page }) => {
    await preview(page, 1).locator('button:has-text("Delete Item")').click();
    const dialog = page.locator("#sheet2");
    await expect(dialog).toBeVisible();
    await waitForAnimations(dialog);

    const { dialogBottom, viewportHeight } = await dialog.evaluate((el) => ({
      dialogBottom: el.getBoundingClientRect().bottom,
      viewportHeight: window.innerHeight,
    }));

    expect(dialogBottom).toBeGreaterThan(viewportHeight - 20);
    // Allow 1px tolerance for sub-pixel rounding across browsers
    expect(dialogBottom).toBeLessThanOrEqual(viewportHeight + 1);

    await dialog.locator('button:has-text("Cancel")').click();
  });
});

test.describe("UA Override — Dialog", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "dialog");
  });

  test("dialog is vertically centered", async ({ page }) => {
    await preview(page).locator('button:has-text("Close Document")').click();
    const dialog = preview(page).locator("dialog");
    await expect(dialog).toBeVisible();
    await waitForAnimations(dialog);

    const { centerY, viewportHeight } = await dialog.evaluate((el) => ({
      centerY:
        el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2,
      viewportHeight: window.innerHeight,
    }));

    const viewportCenter = viewportHeight / 2;
    // Dialog center should be within 30% of viewport center
    // (not pixel-perfect due to content height variation)
    expect(Math.abs(centerY - viewportCenter)).toBeLessThan(
      viewportHeight * 0.3,
    );

    await dialog.locator('button:has-text("Cancel")').click();
  });

  test("dialog is horizontally centered", async ({ page }) => {
    await preview(page).locator('button:has-text("Close Document")').click();
    const dialog = preview(page).locator("dialog");
    await expect(dialog).toBeVisible();
    await waitForAnimations(dialog);

    const { centerX, viewportWidth } = await dialog.evaluate((el) => ({
      centerX:
        el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2,
      viewportWidth: window.innerWidth,
    }));

    const viewportCenter = viewportWidth / 2;
    // Dialog should be centered horizontally within 5px
    expect(Math.abs(centerX - viewportCenter)).toBeLessThan(5);

    await dialog.locator('button:has-text("Cancel")').click();
  });
});

test.describe("UA Override — Popover", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "popover");
  });

  test("popover appears near its trigger, not at viewport origin", async ({
    page,
  }) => {
    const trigger = preview(page).locator('button:has-text("Open Popover")');
    await trigger.click();

    const popover = preview(page).locator("[popover]");
    await expect(popover).toBeVisible();
    await waitForAnimations(popover);

    const { triggerRect, popoverRect } = await page.evaluate(() => {
      const t = document
        .querySelector(".snippet-preview button")
        .getBoundingClientRect();
      const p = document.querySelector("[popover]:popover-open");
      const pr = p ? p.getBoundingClientRect() : null;
      return { triggerRect: t, popoverRect: pr };
    });

    expect(popoverRect).not.toBeNull();

    // Popover should be within 400px of the trigger (not at 0,0)
    const dx = Math.abs(popoverRect.left - triggerRect.left);
    const dy = Math.abs(popoverRect.top - triggerRect.bottom);
    expect(dx + dy).toBeLessThan(400);

    // Popover must NOT be at viewport origin (0,0) — that would indicate
    // UA inset:0 wasn't overridden
    const isAtOrigin = popoverRect.top < 5 && popoverRect.left < 5;
    expect(isAtOrigin).toBe(false);
  });
});

test.describe("UA Override — HUD", () => {
  test.beforeEach(async ({ page }) => {
    await goto(page, "hud");
  });

  test("HUD is centered on screen", async ({ page }) => {
    await preview(page, 1).locator('button:has-text("Show HUD")').click();

    // showHUD() creates a #hud-container with the .hud inside it.
    // Must target that container's .hud, not the static examples in preview 0.
    const hud = page.locator("#hud-container .hud").first();
    await expect(hud).toBeVisible();
    await waitForAnimations(hud);

    const { centerX, centerY, vpWidth, vpHeight } = await hud.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return {
        centerX: r.left + r.width / 2,
        centerY: r.top + r.height / 2,
        vpWidth: window.innerWidth,
        vpHeight: window.innerHeight,
      };
    });

    // HUD should be roughly centered (within 20% of center)
    expect(Math.abs(centerX - vpWidth / 2)).toBeLessThan(vpWidth * 0.2);
    expect(Math.abs(centerY - vpHeight / 2)).toBeLessThan(vpHeight * 0.2);
  });
});
