/**
 * End-to-end smoke test for the five documented global helpers:
 * window.{openDialog, closeDialog, openActionSheet, closeActionSheet, showHUD}.
 *
 * These are the contract users see in READMEs and CDN snippets; any
 * surface drift (arg signature, missing function, wrong element type
 * handled) is an immediate breaking change.
 */
import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test.describe("Public global API", () => {
  test("showHUD returns an instance with dismiss()", async ({ page }) => {
    await goto(page, "hud");

    const ok = await page.evaluate(() => {
      const inst = window.showHUD("Test");
      return (
        inst &&
        typeof inst.dismiss === "function" &&
        inst.element instanceof HTMLElement &&
        document.querySelector("#hud-container .hud") !== null
      );
    });
    expect(ok).toBe(true);
  });

  test("openDialog / closeDialog programmatic control", async ({ page }) => {
    await goto(page, "dialog");

    const result = await page.evaluate(() => {
      const d = document.createElement("dialog");
      d.className = "dialog alert";
      d.innerHTML = "<p>api test</p>";
      document.querySelector(".cider")?.appendChild(d);
      window.CiderUI.dialog.init();

      window.openDialog(d);
      const opened = d.hasAttribute("open");
      window.closeDialog(d);
      // hides via animation — open remains false at minimum
      const initiallyClosed =
        !d.hasAttribute("open") || d.hasAttribute("data-closing");

      d.remove();
      return { opened, initiallyClosed };
    });

    expect(result.opened).toBe(true);
    expect(result.initiallyClosed).toBe(true);
  });

  test("openActionSheet / closeActionSheet programmatic control", async ({
    page,
  }) => {
    await goto(page, "action-sheet");

    const result = await page.evaluate(() => {
      // Reuse an existing sheet in the page
      const sheet = document.querySelector(".cider dialog.action-sheet");
      if (!sheet) return { setupOK: false };
      window.openActionSheet(sheet);
      const opened = sheet.hasAttribute("open");
      window.closeActionSheet(sheet);
      const closing =
        sheet.hasAttribute("data-closing") || !sheet.hasAttribute("open");
      return { setupOK: true, opened, closing };
    });

    expect(result.setupOK).toBe(true);
    expect(result.opened).toBe(true);
    expect(result.closing).toBe(true);
  });
});
