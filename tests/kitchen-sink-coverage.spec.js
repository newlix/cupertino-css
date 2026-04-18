/**
 * Kitchen-sink serves double duty: a showcase page for visual QA and
 * the implicit integration test (docs-site.spec.js loads it with
 * no console errors). It should therefore instantiate every
 * interactive component we ship, so a bug in any one's init() path
 * surfaces in the smoke.
 *
 * This spec asserts the presence of one marker per component. Stale
 * entries here (after a component rename) or missing ones (new
 * component added without a kitchen-sink demo) fail loudly.
 */
import { test, expect } from "@playwright/test";

test("kitchen-sink demos every interactive component", async ({ page }) => {
  await page.goto("/components/kitchen-sink.html");
  await page.waitForLoadState("load");

  const markers = {
    button: ".btn-filled, .btn-tinted, .btn-plain, .btn-gray, .btn-bezelled",
    card: ".card",
    dialog: "dialog.dialog, [data-kitchen='dialog']",
    "action-sheet": "dialog.action-sheet, [data-kitchen='action-sheet']",
    popover: "[popover]",
    tabs: "[data-tabs]",
    "tab-bar": ".tab-bar",
    navbar: ".navbar",
    sidebar: ".sidebar",
    slider: ".slider",
    stepper: "[data-stepper]",
    "token-field": "[data-token-field]",
    "verification-code": ".verification-code",
    picker: "[data-picker]",
    toolbar: ".toolbar",
    "segmented-control": ".segmented-control",
    list: ".list",
    "page-control": ".page-control",
    pagination: ".pagination",
    breadcrumb: ".breadcrumb",
    "disclosure-group": ".disclosure-group",
    "search-field": ".search-field",
    callout: ".callout",
    badge: ".badge, .badge-dot",
    avatar: ".avatar",
    tag: "[class*='tag-']",
    gauge: ".gauge",
    progress: "progress, .progress-indeterminate",
    "activity-indicator": ".activity-indicator",
    separator: "hr, .separator-vertical",
    hud: ".hud, button[onclick*='showHUD']",
    tooltip: "[data-tooltip]",
    skeleton: ".skeleton",
    toast: "button[onclick*='showToast']",
  };

  const missing = [];
  for (const [name, selector] of Object.entries(markers)) {
    const count = await page.locator(selector).count();
    if (count === 0) missing.push(name);
  }

  expect(
    missing,
    "kitchen-sink is missing examples for these components",
  ).toEqual([]);
});
