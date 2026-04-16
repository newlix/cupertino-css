/**
 * Inactive tab panels should not be visible. The WAI-ARIA Tabs pattern
 * requires only the active panel be perceivable — assistive tech reads
 * the entire tab group; without visual hiding of inactive panels, all
 * content renders simultaneously.
 */
import { test, expect } from "@playwright/test";
import { goto, preview } from "./helpers.js";

test("inactive tab panels are not visible", async ({ page }) => {
  await goto(page, "tabs");

  const panels = preview(page).locator("[data-tab-panel]");
  const states = await panels.evaluateAll((els) =>
    els.map((p) => ({
      id: p.getAttribute("data-tab-panel"),
      active: p.hasAttribute("data-active"),
      display: getComputedStyle(p).display,
      visibility: getComputedStyle(p).visibility,
      rect: p.getBoundingClientRect(),
    })),
  );

  // At most one panel is active
  const actives = states.filter((s) => s.active);
  expect(actives).toHaveLength(1);

  // Inactive panels must be either display:none, visibility:hidden,
  // or zero-height — any of these stops them rendering content.
  const inactives = states.filter((s) => !s.active);
  for (const p of inactives) {
    const hidden =
      p.display === "none" || p.visibility === "hidden" || p.rect.height === 0;
    expect(
      hidden,
      `panel ${p.id} should be hidden when not data-active (display=${p.display}, visibility=${p.visibility}, h=${p.rect.height})`,
    ).toBe(true);
  }
});
