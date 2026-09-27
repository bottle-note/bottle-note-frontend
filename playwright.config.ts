import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3107',
    channel: 'chrome',
    viewport: { width: 390, height: 844 },
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm exec next dev --hostname 127.0.0.1 --port 3107',
        url: 'http://127.0.0.1:3107/settings',
        timeout: 120_000,
      },
});
