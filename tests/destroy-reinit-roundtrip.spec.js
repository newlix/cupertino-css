/**
 * Contract: destroy(el) followed by init() must re-wire the component
 * to a clean working state. If destroy leaves state behind or init
 * refuses to re-wire (because _xxxInit flag is stale), htmx swap
 * cycles that destroy + re-scan would leave zombie instances.
 */
import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test("stepper survives destroy → init round-trip", async ({ page }) => {
  await goto(page, "stepper");
  await page.waitForFunction(
    () => document.querySelector("[data-stepper]")?._stepperInit,
  );

  const result = await page.evaluate(() => {
    // Use the "With Value" example (index 1) — it has an <output> so we
    // can actually observe value change.
    const stepper = document.querySelectorAll(
      ".snippet-preview > .cider [data-stepper]",
    )[1];
    const initialInit = stepper._stepperInit;

    window.CiderUI.stepper.destroy(stepper);
    const afterDestroy = stepper._stepperInit;

    window.CiderUI.stepper.init();
    const afterReinit = stepper._stepperInit;

    // Click increment; if re-wired, value should change
    const before = Number(
      stepper.querySelector("[data-stepper-value], output")?.textContent ?? 0,
    );
    stepper.querySelector("[data-stepper-increment]").click();
    const after = Number(
      stepper.querySelector("[data-stepper-value], output")?.textContent ?? 0,
    );

    return {
      initialInit,
      afterDestroy,
      afterReinit,
      valueChanged: after !== before,
    };
  });

  expect(result.initialInit).toBe(true);
  expect(result.afterDestroy).toBe(false);
  expect(result.afterReinit).toBe(true);
  expect(
    result.valueChanged,
    "re-initialised stepper increment must still fire handler",
  ).toBe(true);
});

test("tokenField survives destroy → init round-trip", async ({ page }) => {
  await goto(page, "token-field");
  await page.waitForFunction(
    () => document.querySelector("[data-token-field]")?._tokenFieldInit,
  );

  const ok = await page.evaluate(() => {
    const field = document.querySelector(
      ".snippet-preview > .cider [data-token-field]",
    );
    window.CiderUI.tokenField.destroy(field);
    window.CiderUI.tokenField.init();

    const input = field.querySelector("input");
    const before = field.querySelectorAll(".token").length;
    input.value = "round-trip-test";
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    const after = field.querySelectorAll(".token").length;
    return after === before + 1;
  });

  expect(ok, "tokenField should add a token after destroy → init").toBe(true);
});
