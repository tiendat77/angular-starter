import type { Page } from '@playwright/test';

import { expect, test } from './fixtures';
import { mockProductApi, PRODUCTS, type ProductCalls } from './products.mock';

/** An unsigned JWT the app accepts: it only reads the claims and the expiry. */
function fakeJwt(claims: Record<string, unknown> = {}): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const payload = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    permissions: [],
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...claims,
  };

  return `${encode({ alg: 'none' })}.${encode(payload)}.signature`;
}

async function mockSignIn(page: Page, ok: boolean) {
  await page.route('**/api/auth/login', (route) =>
    ok
      ? route.fulfill({
          json: {
            isError: false,
            data: { accessToken: fakeJwt(), refreshToken: fakeJwt({ exp: 9_999_999_999 }) },
          },
        })
      : route.fulfill({ status: 401, json: { isError: true, message: 'Unauthorized' } })
  );
}

test.describe('shell', () => {
  test('boots and lands on the example app', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/app\/example\/welcome$/);
    await expect(page.getByRole('link', { name: 'Product Management' })).toBeVisible();
  });

  test('navigates between pages from the side navigation', async ({ page }) => {
    await mockProductApi(page);
    await page.goto('/app/example/welcome');

    await page.getByRole('link', { name: 'Product Management' }).click();
    await expect(page).toHaveURL(/\/app\/example\/products$/);
    await expect(page.getByRole('heading', { name: 'Quản lý Sản phẩm' })).toBeVisible();

    await page.getByRole('link', { name: 'Welcome' }).click();
    await expect(page).toHaveURL(/\/app\/example\/welcome$/);
  });

  test('switches the theme', async ({ page }) => {
    await page.goto('/app/example/welcome');
    const html = page.locator('html');

    await page.getByRole('button', { name: 'Change theme' }).click();
    await page.getByRole('menuitem', { name: 'Dark' }).click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: 'Change theme' }).click();
    await page.getByRole('menuitem', { name: 'Light' }).click();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('shows the not-found page for an unknown route', async ({ page }) => {
    await page.goto('/this/does/not/exist');

    await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
  });

  test('every lazy route loads without errors', async ({ page }) => {
    await mockProductApi(page);

    for (const route of [
      '/sign-in',
      '/sign-up',
      '/forgot-password',
      '/reset-password',
      '/app/example/welcome',
      '/app/example/products',
    ]) {
      await page.goto(route);
      await expect(page.locator('main, section, h1').first()).toBeVisible();
    }
  });
});

test.describe('navigation', () => {
  const nav = (page: Page) => page.locator('vertical-navigation');

  test('collapses to the dense appearance and back', async ({ page }) => {
    await page.goto('/app/example/welcome');
    await expect(nav(page)).toHaveClass(/vertical-navigation-appearance-default/);

    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await expect(nav(page)).toHaveClass(/vertical-navigation-appearance-dense/);

    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    await expect(nav(page)).toHaveClass(/vertical-navigation-appearance-default/);
  });

  test('expands and collapses a collapsable item', async ({ page }) => {
    await page.goto('/app/example/welcome');
    const child = page.getByRole('link', { name: 'All products' });

    await expect(child).toBeHidden();
    await page.getByRole('button', { name: 'Catalog' }).click();
    await expect(child).toBeVisible();
    await expect(page.locator('vertical-navigation-collapsable-item').first()).toHaveClass(
      /vertical-navigation-item-expanded/
    );

    await page.getByRole('button', { name: 'Catalog' }).click();
    await expect(child).toBeHidden();
  });

  test('marks the current page as active', async ({ page }) => {
    await page.goto('/app/example/products');

    await expect(page.getByRole('link', { name: 'Product Management' })).toHaveClass(
      /vertical-navigation-item-active/
    );
    await expect(page.getByRole('link', { name: 'Welcome' })).not.toHaveClass(
      /vertical-navigation-item-active/
    );
  });

  test('opens an aside panel and closes it from the overlay', async ({ page }) => {
    await page.goto('/app/example/welcome');
    const panel = page.locator('.vertical-navigation-aside-wrapper');

    await expect(panel).toHaveCount(0);
    await page.getByText('Workspace', { exact: true }).click();
    await expect(panel).toBeVisible();

    await page.locator('.vertical-navigation-aside-overlay').click({ position: { x: 600, y: 300 } });
    await expect(panel).toHaveCount(0);
  });

  test.describe('on a small screen', () => {
    test.use({ viewport: { width: 600, height: 800 } });

    test('covers the whole screen and closes from its button or a link', async ({ page }) => {
      await page.goto('/app/example/welcome');
      await expect(nav(page)).toBeHidden();

      await page.getByRole('button', { name: 'Toggle navigation' }).click();
      await expect(nav(page)).toBeVisible();
      await expect(nav(page)).toHaveClass(/vertical-navigation-opened/);
      await expect(page.locator('.vertical-navigation-overlay')).toBeVisible();
      await expect
        .poll(async () => (await nav(page).boundingBox())?.width)
        .toBe(page.viewportSize()!.width);

      await page.getByRole('button', { name: 'Close navigation' }).click();
      await expect(nav(page)).toBeHidden();
      await expect(page.locator('.vertical-navigation-overlay')).toHaveCount(0);

      await page.getByRole('button', { name: 'Toggle navigation' }).click();
      await page.getByRole('link', { name: 'Product Management' }).click();
      await expect(page).toHaveURL(/\/app\/example\/products$/);
      await expect(nav(page)).toBeHidden();
    });

    test('stays a drawer on a tablet', async ({ page }) => {
      await page.setViewportSize({ width: 800, height: 800 });
      await page.goto('/app/example/welcome');
      await page.getByRole('button', { name: 'Toggle navigation' }).click();

      await expect(nav(page)).toBeVisible();
      await expect
        .poll(async () => (await nav(page).boundingBox())?.width)
        .toBeLessThan(400);
      await expect(page.getByRole('button', { name: 'Close navigation' })).toBeHidden();
    });
  });
});

test.describe('sign in', () => {
  test('rejects wrong credentials', async ({ page, consoleErrors }) => {
    await mockSignIn(page, false);
    await page.goto('/sign-in');

    await page.getByPlaceholder('Username / Email').fill('someone');
    await page.getByPlaceholder('••••••••').fill('wrong');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('alert')).toContainText('Invalid username or password');
    await expect(page).toHaveURL(/\/sign-in$/);

    // The page reports the failed request itself
    consoleErrors.length = 0;
  });

  test('signs in and goes to the app', async ({ page }) => {
    await mockSignIn(page, true);
    await mockProductApi(page);
    await page.goto('/sign-in');

    await page.getByPlaceholder('Username / Email').fill('someone');
    await page.getByPlaceholder('••••••••').fill('secret');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/app\/example\/welcome$/);
    expect(await page.evaluate(() => Object.keys(localStorage))).not.toHaveLength(0);
  });

  test('keeps a signed-in user away from the sign-in page', async ({ page }) => {
    const token = fakeJwt();
    await page.addInitScript((value) => {
      localStorage.setItem('access_token', value);
      localStorage.setItem('refresh_token', value);
    }, token);
    await page.goto('/sign-in');

    await expect(page).toHaveURL(/\/app\/example\/welcome$/);
  });
});

test.describe('account forms', () => {
  test('sign-up shows the server error and unlocks the form', async ({ page, consoleErrors }) => {
    await page.route('**/api/auth/sign-up', (route) =>
      route.fulfill({ status: 400, json: { detail: 'Email already used' } })
    );
    await page.goto('/sign-up');

    await page.getByPlaceholder('Your name').fill('Test User');
    await page.getByPlaceholder('Email address').fill('test@example.com');
    await page.getByPlaceholder('••••••••').fill('abc123');
    await page.getByRole('button', { name: 'Sign up', exact: true }).click();

    await expect(page.getByRole('alert')).toContainText('Email already used');
    await expect(page.getByRole('button', { name: 'Sign up', exact: true })).toBeEnabled();

    // The page reports the failed request itself
    consoleErrors.length = 0;
  });

  test('forgot-password shows the error for an unknown account', async ({
    page,
    consoleErrors,
  }) => {
    await page.route('**/api/authentication/forgot-password', (route) =>
      route.fulfill({ status: 404, json: {} })
    );
    await page.goto('/forgot-password');

    await page.getByPlaceholder('Email address').fill('nobody@example.com');
    await page.getByRole('button', { name: 'Send me reset link' }).click();

    await expect(page.getByRole('alert')).toContainText("We could't find an account");
    await expect(page.getByRole('button', { name: 'Send me reset link' })).toBeEnabled();

    consoleErrors.length = 0;
  });
});

test.describe('products', () => {
  let calls: ProductCalls;

  test.beforeEach(async ({ page }) => {
    calls = await mockProductApi(page);
    await page.goto('/app/example/products');
  });

  test('lists the first page and filters by search', async ({ page }) => {
    await expect(page.getByRole('row')).toHaveCount(11); // header + 10

    await page.getByPlaceholder('Tìm kiếm sản phẩm...').fill(PRODUCTS[4].title);
    await expect(page.getByRole('row')).toHaveCount(2);
    await expect(page.getByRole('button', { name: PRODUCTS[4].title })).toBeVisible();

    await page.getByPlaceholder('Tìm kiếm sản phẩm...').fill('no such product');
    await expect(page.getByText('Không tìm thấy sản phẩm nào')).toBeVisible();
  });

  test('shows the product detail', async ({ page }) => {
    await page.getByRole('button', { name: PRODUCTS[0].title, exact: true }).click();

    await expect(page.getByRole('dialog')).toContainText(PRODUCTS[0].title);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('validates and creates a product', async ({ page }) => {
    await page.getByRole('button', { name: 'Thêm sản phẩm' }).click();
    const dialog = page.getByRole('dialog');

    // The form starts empty: the Vietnamese zod messages come back from the schema
    await dialog.getByRole('button', { name: 'Thêm mới' }).click();
    await expect(dialog.getByText('Tên sản phẩm không được để trống').first()).toBeVisible();
    expect(calls.created).toHaveLength(0);

    await dialog.getByLabel('Tên sản phẩm').fill('Playwright widget');
    await dialog.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Laptops' }).click();
    await dialog.getByLabel('Giá bán ($)').fill('19.5');
    await dialog.getByLabel('Số lượng tồn kho').fill('7');
    await dialog.getByRole('button', { name: 'Thêm mới' }).click();

    await expect(page.getByRole('alert')).toContainText('Thêm sản phẩm thành công');
    expect(calls.created).toEqual([
      expect.objectContaining({ title: 'Playwright widget', category: 'laptops', price: 19.5, stock: 7 }),
    ]);
  });

  test('edits a product', async ({ page }) => {
    await page.getByRole('row').nth(1).getByTitle('Chỉnh sửa').click();
    const dialog = page.getByRole('dialog');

    await dialog.getByLabel('Tên sản phẩm').fill('Renamed');
    await dialog.getByRole('button', { name: 'Cập nhật' }).click();

    await expect(page.getByRole('alert')).toContainText('Cập nhật sản phẩm thành công');
    expect(calls.updated).toEqual([expect.objectContaining({ title: 'Renamed' })]);
  });

  test('deletes a product after confirming', async ({ page }) => {
    await page.getByRole('row').nth(1).getByTitle('Xóa').click();
    await expect(page.getByRole('dialog')).toContainText('Xác nhận xóa sản phẩm');
    await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByRole('alert')).toContainText('Đã xóa sản phẩm thành công');
    expect(calls.deleted).toEqual(['1']);
  });
});
