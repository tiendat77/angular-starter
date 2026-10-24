import { defineConfig } from '@playwright/test';

const MAIN_URL = 'http://127.0.0.1:4310';
const DOCS_URL = 'http://127.0.0.1:4311';

/**
 * Smoke tests against the production builds (`npm run e2e:build` makes them). The real nginx
 * config is not involved; `serve.mjs` only mimics its SPA fallback.
 */
export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  outputDir: '../dist/e2e/results',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI']
    ? [['list'], ['html', { outputFolder: '../dist/e2e/report', open: 'never' }]]
    : 'list',
  use: {
    // The Google Chrome that is installed on the machine (GitHub's runners have it); no download.
    channel: 'chrome',
    trace: 'retain-on-failure',
    // Animations make clicks and screenshots wait for nothing
    reducedMotion: 'reduce',
    locale: 'en-US',
  },
  projects: [
    { name: 'main', testMatch: 'main.spec.ts', use: { baseURL: MAIN_URL } },
    { name: 'docs', testMatch: 'docs.spec.ts', use: { baseURL: DOCS_URL } },
  ],
  webServer: [
    {
      command: 'node serve.mjs ../dist/main/browser 4310',
      url: MAIN_URL,
      reuseExistingServer: !process.env['CI'],
    },
    {
      command: 'node serve.mjs ../dist/docs/browser 4311',
      url: DOCS_URL,
      reuseExistingServer: !process.env['CI'],
    },
  ],
});
