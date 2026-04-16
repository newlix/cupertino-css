/**
 * Under prefers-reduced-motion, transition durations collapse to
 * ~0ms. The focus ring must still appear — a regression zeroing the
 * box-shadow instead of the transition would kill keyboard focus
 * visibility.
 */
import { test, expect } from "@playwright/test";
import {
  goto,
  preview,
  focusViaKeyboard,
  css,
  skipWebkitScope,
} from "./helpers.js";

test("focus ring is visible under prefers-reduced-motion", async ({
  page,
  browserName,
}) => {
  skipWebkitScope(browserName);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await goto(page, "text-field");

  const input = preview(page).locator("input").first();
  await focusViaKeyboard(page, input);

  // Focus ring is applied via box-shadow; it should be non-none.
  const shadow = await css(input, "boxShadow");
  expect(shadow, "focus ring should remain visible").not.toBe("none");
});
