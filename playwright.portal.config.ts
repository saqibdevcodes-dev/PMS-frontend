import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/portal-ui',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:3102',
    screenshot: 'only-on-failure',
  },
  outputDir: 'test-results/portal',
  webServer: {
    command: 'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 3102 --strictPort',
    url: 'http://127.0.0.1:3102',
    reuseExistingServer: false,
    // Every API request is intercepted by the tests; no backend service is started or contacted.
    env: { PMS_BACKEND_URL: 'https://api.etihadrealestate.tech' },
  },
});
