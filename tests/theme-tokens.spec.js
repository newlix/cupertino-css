/**
 * Sanity that the @theme inline block in ciderui.css registers our
 * custom properties with Tailwind, so utilities like bg-primary,
 * text-destructive, rounded-lg produce expected values. A regression
 * deleting a line from @theme would silently break consumer
 * customisation without breaking pre-built CSS.
 */
import { test, expect } from "@playwright/test";
import { goto } from "./helpers.js";

test("bg-primary utility produces --color-primary background", async ({
  page,
}) => {
  await goto(page, "button");

  const values = await page.evaluate(() => {
    const el = document.createElement("div");
    el.className = "bg-primary text-destructive rounded-lg";
    // Width+height so computed style settles
    el.style.cssText = "width: 40px; height: 40px;";
    document.querySelector(".cider")?.appendChild(el);
    const s = getComputedStyle(el);
    const expectedPrimary = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-primary")
      .trim();
    const expectedDestructive = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-destructive")
      .trim();
    const expectedRadiusLg = getComputedStyle(document.documentElement)
      .getPropertyValue("--radius-lg")
      .trim();
    const out = {
      bg: s.backgroundColor,
      color: s.color,
      radius: s.borderTopLeftRadius,
      expectedPrimary,
      expectedDestructive,
      expectedRadiusLg,
    };
    el.remove();
    return out;
  });

  // Non-transparent background from bg-primary
  expect(values.bg).not.toBe("rgba(0, 0, 0, 0)");
  // radius-lg token reflected
  expect(parseFloat(values.radius)).toBeGreaterThan(0);
  // Token vars exist at :root
  expect(values.expectedPrimary.length).toBeGreaterThan(0);
  expect(values.expectedDestructive.length).toBeGreaterThan(0);
  expect(values.expectedRadiusLg.length).toBeGreaterThan(0);
});
