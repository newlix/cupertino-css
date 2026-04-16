/**
 * Empty-state rendering — components with zero content (no tokens,
 * no items, no options) should still render intact input affordances
 * rather than collapse to zero height.
 */
import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test("empty token-field still accepts input", async ({ page }) => {
  await goto(page, "token-field");

  const rendered = await page.evaluate(() => {
    const field = document.createElement("div");
    field.className = "token-field";
    field.setAttribute("data-token-field", "");
    field.innerHTML =
      '<input type="text" placeholder="Add a tag" aria-label="tags">';
    document.querySelector(".cider")?.appendChild(field);

    window.CiderUI.tokenField.init();

    const input = field.querySelector("input");
    input.value = "first-tag";
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    const tokens = field.querySelectorAll(".token").length;
    field.remove();
    return { tokens };
  });

  expect(rendered.tokens).toBe(1);
});

test("picker with single item still renders", async ({ page }) => {
  await goto(page, "picker");

  const rendered = await page.evaluate(() => {
    const picker = document.createElement("div");
    picker.className = "picker";
    picker.setAttribute("data-picker", "");
    picker.innerHTML = `
      <div class="picker-column" tabindex="0" aria-label="Single">
        <div>Only Option</div>
      </div>
    `;
    document.querySelector(".cider")?.appendChild(picker);

    window.CiderUI.picker.init();

    const rect = picker.getBoundingClientRect();
    const singleItem = picker.querySelector(".picker-column > div");
    picker.remove();
    return {
      width: rect.width,
      height: rect.height,
      hasItem: !!singleItem,
    };
  });

  // Picker should still have visible dimensions with a single item
  expect(rendered.width).toBeGreaterThan(0);
  expect(rendered.height).toBeGreaterThan(0);
  expect(rendered.hasItem).toBe(true);
});
