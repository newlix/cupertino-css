/**
 * Contract: every interactive component's destroy(el) must be safe
 * when called on an element that was never init'd — either because
 * the element has no matching markup, or because destroy was called
 * twice, or because htmx cleanup fires for a subtree that didn't
 * contain any of our components.
 *
 * Without this guarantee, teardown in error paths throws and masks
 * the original error.
 */
import { test, expect } from "@playwright/test";

test("destroy on never-initialised elements throws nothing", async ({
  page,
}) => {
  await page.goto("/components/button.html");
  await page.waitForLoadState("load");

  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));

  const result = await page.evaluate(() => {
    const dummy = document.createElement("div");
    document.body.appendChild(dummy);

    const api = window.CiderUI;
    const attempts = [];

    // Each component: destroy on a never-initialised element + double-call
    // must both be no-ops. destroy(undefined) is NOT required to be safe —
    // consumers are expected to pass a real element.
    for (const name of [
      "dialog",
      "actionSheet",
      "picker",
      "popover",
      "sidebar",
      "slider",
      "stepper",
      "tabs",
      "tokenField",
      "verificationCode",
    ]) {
      try {
        api[name].destroy(dummy);
        api[name].destroy(dummy);
        attempts.push([name, "ok"]);
      } catch (e) {
        attempts.push([name, `threw: ${e.message}`]);
      }
    }

    // HUD's destroy takes no arg
    try {
      api.hud.destroy();
      api.hud.destroy();
      attempts.push(["hud", "ok"]);
    } catch (e) {
      attempts.push(["hud", `threw: ${e.message}`]);
    }

    dummy.remove();
    return attempts;
  });

  const threw = result.filter(([, status]) => status !== "ok");
  expect(threw, "components whose destroy() is unsafe").toEqual([]);
  expect(errors).toEqual([]);
});
