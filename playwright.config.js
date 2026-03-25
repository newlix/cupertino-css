import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  webServer: {
    // Use a dedicated Node script instead of `npx serve` so that killing
    // the test server won't accidentally take down the dev server (which
    // also runs `npx serve`).
    command: "node scripts/build-docs.js && node scripts/test-server.js",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  timeout: 10000,
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    /* WebKit + Firefox run in CI only (requires `npx playwright install --with-deps`).
       To test locally: `npx playwright install webkit firefox` then `npx playwright test`. */
    ...(process.env.CI
      ? [
          { name: "webkit", use: { ...devices["Desktop Safari"] } },
          { name: "firefox", use: { ...devices["Desktop Firefox"] } },
        ]
      : []),
  ],
});
