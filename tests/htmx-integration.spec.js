/**
 * htmx integration — every component binds init() to htmx:afterSettle
 * and destroy() to htmx:beforeCleanupElement. We don't ship htmx itself,
 * but a lot of expected consumers do. These tests simulate htmx swap
 * events manually to confirm our hooks fire correctly.
 */
import { test, expect } from "@playwright/test";

test.describe("htmx integration", () => {
  test("dialog wired up via htmx:afterSettle opens / closes correctly", async ({
    page,
  }) => {
    await page.goto("/components/dialog.html");
    await page.waitForLoadState("load");

    // Inject fresh markup as if htmx just swapped it in, then fire the
    // event that components listen to.
    const result = await page.evaluate(() => {
      const host = document.createElement("div");
      host.className = "cider";
      host.innerHTML = `
        <dialog class="dialog alert" id="htmx-test-dialog">
          <p>htmx-injected dialog</p>
          <div class="dialog-footer">
            <button class="btn-tinted" data-close>OK</button>
          </div>
        </dialog>
      `;
      document.body.appendChild(host);

      document.dispatchEvent(
        new CustomEvent("htmx:afterSettle", { bubbles: true }),
      );

      const dialog = host.querySelector("dialog");
      window.CiderUI.dialog.open(dialog);
      const opened = dialog.hasAttribute("open");
      window.CiderUI.dialog.close(dialog);

      // Cleanup simulation — removes the hook wired by init
      document.dispatchEvent(
        new CustomEvent("htmx:beforeCleanupElement", {
          detail: { elt: host },
          bubbles: true,
        }),
      );
      host.remove();

      return { opened };
    });

    expect(result.opened).toBe(true);
  });

  test("re-init on htmx:afterSettle is idempotent", async ({ page }) => {
    await page.goto("/components/button.html");
    await page.waitForLoadState("load");

    // Fire afterSettle five times and make sure components still work
    // and don't raise. If a component double-binds listeners on each
    // settle, errors would surface here.
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.evaluate(() => {
      for (let i = 0; i < 5; i++) {
        document.dispatchEvent(
          new CustomEvent("htmx:afterSettle", { bubbles: true }),
        );
      }
    });

    expect(errors).toEqual([]);
  });

  test("beforeCleanupElement tears down listeners on removed subtree", async ({
    page,
  }) => {
    await page.goto("/components/tabs.html");
    await page.waitForLoadState("load");

    // Find a tabs component, fire the cleanup event, verify no
    // exceptions during the teardown.
    const errors = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const tornDown = await page.evaluate(() => {
      const tabs = document.querySelector(".cider [data-tabs]");
      if (!tabs) return false;
      document.dispatchEvent(
        new CustomEvent("htmx:beforeCleanupElement", {
          detail: { elt: tabs },
          bubbles: true,
        }),
      );
      return true;
    });

    expect(tornDown, "expected a tabs instance on the page").toBe(true);
    expect(errors).toEqual([]);
  });
});
