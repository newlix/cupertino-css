/**
 * showHUD() creates its own <div class="cider hud-container"> appended
 * to body so it works even when the page has no .cider root. This
 * matters for consumers who only include the library CSS for the
 * HUD overlay and don't wrap their entire app in .cider.
 */
import { test, expect } from "@playwright/test";

test("showHUD renders regardless of host .cider class", async ({ page }) => {
  // Go to a page with no .cider on body (the docs homepage wraps its
  // content in .cider but we can strip it first).
  await page.goto("/components/hud.html");
  await page.waitForLoadState("load");

  const result = await page.evaluate(() => {
    // Simulate a consumer app where body has no .cider class.
    document.body.classList.remove("cider");

    window.showHUD("outside cider");

    const container = document.getElementById("hud-container");
    const hasCider = container?.classList.contains("cider");
    const rendered = !!container?.querySelector(".hud");
    const hudEl = container?.querySelector(".hud");
    const hudBox = hudEl?.getBoundingClientRect();

    if (container) container.remove();
    return {
      hasCider,
      rendered,
      visible: hudBox ? hudBox.width > 0 && hudBox.height > 0 : false,
    };
  });

  expect(result.hasCider).toBe(true);
  expect(result.rendered).toBe(true);
  expect(result.visible).toBe(true);
});
