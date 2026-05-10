import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 25000,
  retries: 1,
  // One worker: Electron windows compete for focus; parallel causes flakiness
  workers: 1,
  fullyParallel: false,
  reporter: [['list'], ['html', { outputFolder: 'test-results/html', open: 'never' }]],
  use: { screenshot: 'only-on-failure' },
  webServer: {
    command: 'npx vite',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30000,
  },
});
