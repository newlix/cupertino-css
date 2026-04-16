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
  timeout: 15000,
  // Cap workers so the :3000 test server isn't saturated by 3 browser
  // projects × many workers — flaked page.goto under default (cpu/2 = 8).
  workers: process.env.CI ? 2 : 4,
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
