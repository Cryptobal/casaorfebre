import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  retries: 0,
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    headless: false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'on',
    video: 'on-first-retry',
    trace: 'on',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
