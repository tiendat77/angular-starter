import { expect, test as base } from '@playwright/test';

/**
 * `test` with a safety net: every test fails when the page logged an error or threw, and requests
 * to hosts outside the app get an empty answer instead of the network.
 */
export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page, baseURL }, use) => {
      const errors: string[] = [];

      page.on('pageerror', (error) => errors.push(`exception: ${error.message}`));
      page.on('console', (message) => {
        if (message.type() === 'error') {
          errors.push(`console.error: ${message.text()}`);
        }
      });

      // Third parties (avatars, fonts, analytics) must not decide whether a test passes
      await page.route(
        (url) => url.origin !== baseURL && !url.protocol.startsWith('data'),
        (route) => {
          const type = route.request().resourceType();

          return route.fulfill({
            status: 200,
            contentType:
              type === 'image' ? 'image/svg+xml' : type === 'stylesheet' ? 'text/css' : 'text/plain',
            body: type === 'image' ? '<svg xmlns="http://www.w3.org/2000/svg"/>' : '',
          });
        }
      );

      await use(errors);

      expect(errors, 'the page logged errors').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
