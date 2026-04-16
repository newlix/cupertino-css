/**
 * The Playwright test server should return 404 for nonexistent paths
 * rather than leaking 200 with an unexpected body (which would mask
 * broken links in docs-site.spec.js's "all nav links return 200"
 * assertion by making every path "succeed").
 */
import { test, expect } from "@playwright/test";

test("server 404s on missing path", async ({ page }) => {
  const resp = await page.request.get("/this-path-does-not-exist.html");
  expect(resp.status()).toBe(404);
});

test("server serves existing path with 200", async ({ page }) => {
  const resp = await page.request.get("/components/button.html");
  expect(resp.status()).toBe(200);
});

test("server refuses to traverse outside site/", async ({ page }) => {
  // Path traversal attempt — ../../../etc/passwd style. Must resolve
  // back inside site/ and 404, never 200 with contents outside.
  const resp = await page.request.get("/../../package.json");
  // Either 403 or 404 is acceptable; must never be 200.
  expect(resp.status()).not.toBe(200);
});
