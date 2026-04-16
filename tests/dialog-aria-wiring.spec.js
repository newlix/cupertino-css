/**
 * Accessible dialog requires aria-labelledby → heading and optionally
 * aria-describedby → description paragraph. dialog.js auto-wires
 * these if the heading/description exist and don't already carry
 * IDs. Without the wiring, screen readers announce a dialog with no
 * title.
 */
import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test("dialog auto-wires aria-labelledby to its heading", async ({ page }) => {
  await goto(page, "dialog");

  const result = await page.evaluate(async () => {
    const d = document.createElement("dialog");
    d.className = "dialog alert";
    d.innerHTML = `
      <header>
        <h3>My Dialog Title</h3>
        <p>Body description content.</p>
      </header>
    `;
    document.querySelector(".cider")?.appendChild(d);
    window.CiderUI.dialog.init();
    window.openDialog(d);
    // Wait one microtask + rAF — wireAria runs on the native toggle event
    // which is dispatched async relative to showModal().
    await new Promise((r) => requestAnimationFrame(r));

    const labelId = d.getAttribute("aria-labelledby");
    const descId = d.getAttribute("aria-describedby");
    const labelEl = labelId ? document.getElementById(labelId) : null;
    const descEl = descId ? document.getElementById(descId) : null;

    const out = {
      labelId,
      labelText: labelEl?.textContent.trim(),
      descId,
      descText: descEl?.textContent.trim(),
    };
    window.closeDialog(d);
    setTimeout(() => d.remove(), 300);
    return out;
  });

  expect(result.labelId).toBeTruthy();
  expect(result.labelText).toBe("My Dialog Title");
  expect(result.descId).toBeTruthy();
  expect(result.descText).toBe("Body description content.");
});
