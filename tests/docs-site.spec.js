/**
 * Docs site integration tests — catch issues that component-level tests miss:
 * - Console errors (JS bugs surfacing in real pages)
 * - Empty previews (CSS regressions making components invisible)
 * - Broken nav links
 * - Dark mode toggle
 * - Component composition (multiple components interacting on one page)
 */
import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const navPath = resolve(
  new URL("../docs/_data/nav.json", import.meta.url).pathname,
);
const nav = JSON.parse(await readFile(navPath, "utf-8"));
const allLinks = nav.flatMap((section) =>
  section.items
    .filter((item) => item.href.endsWith(".html"))
    .map((item) => ({
      label: item.label,
      path: `/${item.href}`,
    })),
);

// ── Smoke: every page loads without console errors ──

test.describe("Docs Smoke", () => {
  for (const { label, path } of allLinks) {
    test(`${label} — no console errors`, async ({ page }) => {
      const errors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(err.message));

      await page.goto(path);
      await page.waitForLoadState("load");

      expect(errors, `console errors on ${path}`).toEqual([]);
    });
  }
});

// ── Preview rendering: every example has visible content ──

const componentLinks = allLinks.filter(
  (l) =>
    l.path.startsWith("/components/") &&
    !l.path.includes("kitchen-sink") &&
    !l.path.includes("essentials"),
);

test.describe("Preview Rendering", () => {
  for (const { label, path } of componentLinks) {
    test(`${label} — all previews have visible content`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("load");

      const previews = page.locator(".snippet-preview > .cider");
      const count = await previews.count();
      expect(count, `${path} should have at least one preview`).toBeGreaterThan(
        0,
      );

      for (let i = 0; i < count; i++) {
        const fig = previews.nth(i);
        const box = await fig.boundingBox();
        expect(box, `preview ${i} on ${path} should be visible`).not.toBeNull();
        // Content height > 0 means something rendered inside
        expect(box.height, `preview ${i} on ${path} not empty`).toBeGreaterThan(
          0,
        );
      }
    });
  }
});

// ── Navigation: all sidebar links resolve ──

test("all nav links return 200", async ({ page }) => {
  await page.goto("/");
  for (const { path } of allLinks) {
    const resp = await page.request.get(path);
    expect(resp.status(), `${path} should be 200`).toBe(200);
  }
});

// ── Dark mode toggle ──

test("theme toggle adds .dark to html", async ({ page }) => {
  await page.goto("/components/button.html");
  await page.waitForLoadState("load");

  const toggle = page.locator(".docs-theme-toggle").last();
  await expect(toggle).toBeVisible();

  const wasDark = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );
  await toggle.click();
  const isDark = await page.evaluate(() =>
    document.documentElement.classList.contains("dark"),
  );
  expect(isDark).not.toBe(wasDark);
});

// ── Copy button ──

test("code copy button populates clipboard", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(browserName !== "chromium", "Clipboard API requires Chromium");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/components/button.html");
  await page.waitForLoadState("load");

  const copyBtn = page.locator(".snippet header button").first();
  await copyBtn.click();

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard.length, "clipboard should have content").toBeGreaterThan(0);
  expect(clipboard).toContain("<"); // HTML content
});

// ── Kitchen Sink: composition stress test ──

test("kitchen-sink page loads all components without errors", async ({
  page,
}) => {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));

  await page.goto("/components/kitchen-sink.html");
  await page.waitForLoadState("load");

  // Kitchen-sink renders components directly (no snippet-preview wrapper)
  // Verify the page has substantial content
  const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
  expect(bodyHeight, "kitchen-sink should have content").toBeGreaterThan(500);

  expect(errors, "kitchen-sink console errors").toEqual([]);
});
