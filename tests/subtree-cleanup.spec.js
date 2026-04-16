/**
 * htmx:beforeCleanupElement fires with the element that's about to be
 * removed. If that element CONTAINS multiple component instances, each
 * component's handler must recursively destroy them all — a subtree
 * that only had the parent wrapper removed would leak all child
 * instances' listeners.
 */
import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test("htmx:beforeCleanupElement tears down all component instances in subtree", async ({
  page,
}) => {
  await goto(page, "button"); // any page — we inject our own markup

  const result = await page.evaluate(() => {
    const host = document.createElement("div");
    host.className = "cider";
    host.innerHTML = `
      <div id="wrapper">
        <dialog class="dialog alert" id="d1"></dialog>
        <dialog class="dialog alert" id="d2"></dialog>
        <div class="slider-wrap"><input type="range" class="slider" min="0" max="100" value="10"></div>
        <div class="slider-wrap"><input type="range" class="slider" min="0" max="100" value="20"></div>
      </div>
    `;
    document.body.appendChild(host);

    // Re-init so new elements pick up listeners
    document.dispatchEvent(new CustomEvent("htmx:afterSettle"));

    // Confirm init ran
    const d1 = host.querySelector("#d1");
    const sliders = host.querySelectorAll(".slider");
    const initOK =
      d1._dialogInit === true &&
      [...sliders].every((s) => s._sliderInit === true);

    // Fire cleanup on the wrapper, not the individual dialogs
    const wrapper = host.querySelector("#wrapper");
    document.dispatchEvent(
      new CustomEvent("htmx:beforeCleanupElement", {
        detail: { elt: wrapper },
        bubbles: true,
      }),
    );

    const cleanedUp = {
      d1: d1._dialogInit !== true,
      sliders: [...sliders].every((s) => s._sliderInit !== true),
    };

    host.remove();
    return { initOK, cleanedUp };
  });

  expect(result.initOK, "init should have run on all injected instances").toBe(
    true,
  );
  expect(result.cleanedUp.d1, "dialog inside wrapper cleaned up").toBe(true);
  expect(
    result.cleanedUp.sliders,
    "all sliders inside wrapper cleaned up",
  ).toBe(true);
});
