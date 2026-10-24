import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from './fixtures';

/** The docs routes, read from the router config so a new page is covered without touching this file. */
const ROUTES = [
  ...readFileSync(join(__dirname, '../apps/docs/src/app/app.routes.ts'), 'utf8').matchAll(
    /path:\s*'([^'*][^']*)'/g
  ),
].map((match) => match[1]);

test('has routes to visit', () => {
  expect(ROUTES.length).toBeGreaterThan(20);
});

for (const route of ROUTES) {
  test(`/${route} renders without errors`, async ({ page }) => {
    await page.goto(`/${route}`);

    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });
}

test('switches the theme', async ({ page }) => {
  await page.goto('/button');
  const html = page.locator('html');
  const before = await html.getAttribute('data-theme');

  await page.getByRole('button', { name: /Switch to (dark|light) mode/ }).click();

  await expect(html).not.toHaveAttribute('data-theme', before ?? '');
});
