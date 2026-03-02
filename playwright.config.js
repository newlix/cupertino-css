import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  webServer: {
    // Use a dedicated Node script instead of `npx serve` so that killing
    // the test server won't accidentally take down the dev server (which
    // also runs `npx serve`).
    command: 'node scripts/build-docs.js && node scripts/test-server.js',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  timeout: 10000,
  use: {
    baseURL: 'http://localhost:3000',
  },
});
