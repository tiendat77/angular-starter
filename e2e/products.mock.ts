import type { Page, Route } from '@playwright/test';

export interface MockProduct {
  id: number;
  title: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  description: string;
  sku: string;
  thumbnail: string;
}

const CATEGORIES = [
  { slug: 'beauty', name: 'Beauty' },
  { slug: 'laptops', name: 'Laptops' },
  { slug: 'groceries', name: 'Groceries' },
];

export const PRODUCTS: MockProduct[] = Array.from({ length: 25 }, (_, index) => {
  const category = CATEGORIES[index % CATEGORIES.length];

  return {
    id: index + 1,
    title: `${category.name} item ${index + 1}`,
    category: category.slug,
    price: 10 + index,
    stock: index % 5 === 0 ? 0 : 5 + index * 3,
    rating: 3 + (index % 20) / 10,
    description: `Description of item ${index + 1}`,
    sku: `SKU-${String(index + 1).padStart(3, '0')}`,
    thumbnail: '',
  };
});

/** What the page asked for, to assert on in tests. */
export interface ProductCalls {
  created: unknown[];
  updated: unknown[];
  deleted: string[];
}

/** Answers the DummyJSON endpoints the products page uses (list, search, category, mutations). */
export async function mockProductApi(page: Page): Promise<ProductCalls> {
  const calls: ProductCalls = { created: [], updated: [], deleted: [] };
  const json = (route: Route, body: unknown) => route.fulfill({ json: body });

  await page.route(/^https:\/\/dummyjson\.com\/products(\/|\?|$)/, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/products', '');

    if (request.method() === 'POST') {
      const body = request.postDataJSON();
      calls.created.push(body);

      return json(route, { id: 101, ...body });
    }
    if (request.method() === 'PUT') {
      const body = request.postDataJSON();
      calls.updated.push(body);

      return json(route, { ...PRODUCTS[0], ...body });
    }
    if (request.method() === 'DELETE') {
      calls.deleted.push(path.slice(1));

      return json(route, { id: Number(path.slice(1)), isDeleted: true });
    }
    if (path === '/categories') {
      return json(route, CATEGORIES);
    }

    let items = PRODUCTS;
    if (path === '/search') {
      const query = (url.searchParams.get('q') ?? '').toLowerCase();
      items = PRODUCTS.filter((product) => product.title.toLowerCase().includes(query));
    } else if (path.startsWith('/category/')) {
      items = PRODUCTS.filter((product) => product.category === path.split('/')[2]);
    }

    const skip = Number(url.searchParams.get('skip') ?? 0);
    const limit = Number(url.searchParams.get('limit') ?? 10);

    return json(route, {
      products: items.slice(skip, skip + limit),
      total: items.length,
      skip,
      limit,
    });
  });

  return calls;
}
