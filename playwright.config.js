// playwright.config.js
// Central configuration for all Playwright tests.
// Sets base URL, browser defaults, timeouts, and reporters.

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Directory where test files live
  testDir: './tests',

  // Run tests sequentially within each file (easier to debug for entry-level devs)
  fullyParallel: false,

  // Fail the build on CI if any test.only is accidentally left in source
  forbidOnly: !!process.env.CI,

  // No retries by default; set to 2 on CI for flakiness resilience
  retries: process.env.CI ? 2 : 0,

  // One worker keeps output readable; bump to 2+ on CI
  workers: 1,

  // Reporters: 'list' for console, 'html' for browseable report
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // Base URL — all page.goto('/path') calls resolve against this
    baseURL: 'https://horizon-plus.dfp8hwwhcxnpq.amplifyapp.com',

    // Capture screenshot only when a test fails
    screenshot: 'only-on-failure',

    // Record a trace on the first retry for debugging
    trace: 'on-first-retry',

    // Generous timeout for an externally hosted app (cold starts are slow)
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  // Test timeout per test
  timeout: 60_000,

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
