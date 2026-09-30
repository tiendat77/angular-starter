# Product Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a gold-standard reference CRUD feature module ("Quản lý Sản phẩm") in `apps/main/src/app/features/products/` following Feature-Sliced Design (FSD), Angular 22 Signals, `@libs/ui` library suite, and Zod validation against DummyJSON Products API.

**Architecture:** FSD feature slice with technical segments (`api/`, `model/`, `ui/`, `routes.ts`, `index.ts`). Signal-driven Single Source of Truth via `ProductStore`. Presentation using `@libs/ui/table`, `@libs/ui/paginator`, `@libs/ui/dialog`, `@libs/ui/button`, `@libs/ui/select`, and `@libs/ui/tag`.

**Tech Stack:** Angular 22, TypeScript 6, Vitest, Zod, RxJS, Tailwind CSS 4, DaisyUI 5, `@libs/ui/*`.

**Spec:** `docs/superpowers/specs/2026-09-29-product-management-feature-design.md`

## Global Constraints

- Standalone components with `ChangeDetectionStrategy.OnPush` throughout.
- Use `inject()` for dependency injection; prefix private injected services with `_`.
- Prefix Signals with `$` (`$products`, `$loading`, `$params`).
- Vietnamese is the primary locale for UI strings.
- Feature-Sliced Design strictly maintained: all cross-feature imports come via slice root `index.ts`.
- Commands running Node/npm/npx must have `PATH="/run/user/501/fnm_multishells/376814_1790691424839/bin:$PATH"` available.

## Review Focus

- Empty state handling: when API returns 0 products, the UI renders the empty placeholder cleanly without breaking table layout.
- Category filter switching: selecting a category resets `skip` / page index to 1 and fetches category-filtered items.
- Debounced search: typing in the search bar debounces API requests by 300ms and resets pagination to page 1.
- Form validation: submitting empty required fields in Add/Edit modal triggers Zod validation errors on form controls.
- Delete confirmation: deleting a product requires user confirmation via `DialogService.confirm` before invoking API and updating store state.

---

### Task 1: Product Data Model & Zod Schemas

**Files:**
- Create: `apps/main/src/app/features/products/model/product.model.ts`
- Create: `apps/main/src/app/features/products/model/index.ts`
- Test: `apps/main/src/app/features/products/model/product.model.spec.ts`

**Interfaces:**
- Produces: `ProductSchema`, `ProductModel`, `ProductFormSchema`, `ProductFormModel`, `ProductListResponseSchema`, `ProductListResponse`, `ProductQueryParams`, `ProductCategory`.

- [ ] **Step 1: Write the failing test**

```typescript
// apps/main/src/app/features/products/model/product.model.spec.ts
import { describe, expect, it } from 'vitest';
import { ProductFormSchema, ProductListResponseSchema, ProductSchema } from './product.model';

describe('Product Model & Zod Schemas', () => {
  it('should validate a valid product', () => {
    const raw = {
      id: 1,
      title: 'iPhone 15',
      category: 'smartphones',
      price: 999,
      stock: 50,
      description: 'Latest model',
    };
    const parsed = ProductSchema.parse(raw);
    expect(parsed.id).toBe(1);
    expect(parsed.title).toBe('iPhone 15');
    expect(parsed.availabilityStatus).toBe('In Stock');
  });

  it('should reject invalid product data', () => {
    const raw = { id: 1, price: -10 };
    expect(() => ProductSchema.parse(raw)).toThrow();
  });

  it('should validate form schema', () => {
    const formRaw = {
      title: 'New Product',
      category: 'beauty',
      price: 25.5,
      stock: 100,
      description: 'Good perfume',
    };
    const parsed = ProductFormSchema.parse(formRaw);
    expect(parsed.title).toBe('New Product');
  });

  it('should validate product list response schema', () => {
    const responseRaw = {
      products: [
        {
          id: 1,
          title: 'Laptop',
          category: 'laptops',
          price: 1200,
          stock: 10,
        },
      ],
      total: 1,
      skip: 0,
      limit: 10,
    };
    const parsed = ProductListResponseSchema.parse(responseRaw);
    expect(parsed.products.length).toBe(1);
    expect(parsed.total).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test main --watch=false`
Expected: FAIL with "Cannot find module './product.model'"

- [ ] **Step 3: Implement `product.model.ts` and `index.ts`**

Define `ProductSchema`, `ProductFormSchema`, `ProductListResponseSchema`, and exported interfaces matching the Spec. Export them through `apps/main/src/app/features/products/model/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ng test main --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/main/src/app/features/products/model/
git commit -m "feat(products): ✨ define product models and zod schemas"
```

---

### Task 2: Product API Service

**Files:**
- Create: `apps/main/src/app/features/products/api/product-api.service.ts`
- Create: `apps/main/src/app/features/products/api/index.ts`
- Test: `apps/main/src/app/features/products/api/product-api.service.spec.ts`

**Interfaces:**
- Consumes: `ProductModel`, `ProductFormModel`, `ProductListResponse`, `ProductQueryParams`, `ProductCategory` from `../model`.
- Produces: `ProductApiService` with methods:
  - `getProducts(params: ProductQueryParams): Observable<ProductListResponse>`
  - `getCategories(): Observable<ProductCategory[]>`
  - `getProduct(id: number): Observable<ProductModel>`
  - `createProduct(data: ProductFormModel): Observable<ProductModel>`
  - `updateProduct(id: number, data: Partial<ProductFormModel>): Observable<ProductModel>`
  - `deleteProduct(id: number): Observable<{ id: number; isDeleted: boolean }>`

- [ ] **Step 1: Write the failing test**

```typescript
// apps/main/src/app/features/products/api/product-api.service.spec.ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ProductApiService } from './product-api.service';

describe('ProductApiService', () => {
  let service: ProductApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch paginated products', () => {
    const mockData = {
      products: [{ id: 1, title: 'Item 1', category: 'cat', price: 10, stock: 5 }],
      total: 1,
      skip: 0,
      limit: 10,
    };

    service.getProducts({ page: 1, pageSize: 10 }).subscribe((res) => {
      expect(res.products.length).toBe(1);
      expect(res.total).toBe(1);
    });

    const req = httpMock.expectOne((r) => r.url.includes('dummyjson.com/products') && !r.url.includes('/category'));
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should search products with query', () => {
    service.getProducts({ page: 1, pageSize: 10, search: 'phone' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/products/search?q=phone'));
    expect(req.request.method).toBe('GET');
    req.flush({ products: [], total: 0, skip: 0, limit: 10 });
  });

  it('should filter products by category', () => {
    service.getProducts({ page: 1, pageSize: 10, category: 'smartphones' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/products/category/smartphones'));
    expect(req.request.method).toBe('GET');
    req.flush({ products: [], total: 0, skip: 0, limit: 10 });
  });

  it('should fetch categories list', () => {
    const mockCategories = [
      { slug: 'beauty', name: 'Beauty', url: 'https://dummyjson.com/products/category/beauty' },
    ];
    service.getCategories().subscribe((cats) => {
      expect(cats.length).toBe(1);
      expect(cats[0].slug).toBe('beauty');
    });

    const req = httpMock.expectOne('https://dummyjson.com/products/categories');
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test main --watch=false`
Expected: FAIL with "Cannot find module './product-api.service'"

- [ ] **Step 3: Implement `ProductApiService` and `index.ts`**

Implement `ProductApiService` extending `BaseApiService<ProductModel>` with `override _baseUrl = 'https://dummyjson.com/products'`. Support `getProducts`, `getCategories`, `getProduct`, `createProduct`, `updateProduct`, and `deleteProduct`. Export via `apps/main/src/app/features/products/api/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ng test main --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/main/src/app/features/products/api/
git commit -m "feat(products): ✨ implement product api service"
```

---

### Task 3: Signal-based Product Store

**Files:**
- Create: `apps/main/src/app/features/products/model/product.store.ts`
- Modify: `apps/main/src/app/features/products/model/index.ts`
- Test: `apps/main/src/app/features/products/model/product.store.spec.ts`

**Interfaces:**
- Consumes: `ProductApiService` from `../api`, `ProductModel`, `ProductFormModel`, `ProductQueryParams`, `ProductCategory` from `./product.model`.
- Produces: `ProductStore` injectable service with:
  - Signals: `$products`, `$total`, `$loading`, `$error`, `$categories`, `$params`
  - Computed: `$isEmpty`, `$pageIndex`, `$pageSize`
  - Methods: `loadProducts()`, `loadCategories()`, `setSearch(q: string)`, `setCategory(cat: string)`, `setPage(page: number, size: number)`, `createProduct(data: ProductFormModel)`, `updateProduct(id: number, data: Partial<ProductFormModel>)`, `deleteProduct(id: number)`

- [ ] **Step 1: Write the failing test**

```typescript
// apps/main/src/app/features/products/model/product.store.spec.ts
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductApiService } from '../api';
import { ProductStore } from './product.store';

describe('ProductStore', () => {
  let store: ProductStore;
  let mockApi: {
    getProducts: ReturnType<typeof vi.fn>;
    getCategories: ReturnType<typeof vi.fn>;
    createProduct: ReturnType<typeof vi.fn>;
    updateProduct: ReturnType<typeof vi.fn>;
    deleteProduct: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockApi = {
      getProducts: vi.fn().mockReturnValue(of({ products: [{ id: 1, title: 'Item 1', category: 'c', price: 10, stock: 5 }], total: 1, skip: 0, limit: 10 })),
      getCategories: vi.fn().mockReturnValue(of([{ slug: 'smartphones', name: 'Smartphones' }])),
      createProduct: vi.fn().mockReturnValue(of({ id: 101, title: 'New Item', category: 'c', price: 20, stock: 10 })),
      updateProduct: vi.fn().mockReturnValue(of({ id: 1, title: 'Updated Item', category: 'c', price: 15, stock: 5 })),
      deleteProduct: vi.fn().mockReturnValue(of({ id: 1, isDeleted: true })),
    };

    TestBed.configureTestingModule({
      providers: [
        ProductStore,
        { provide: ProductApiService, useValue: mockApi },
      ],
    });
    store = TestBed.inject(ProductStore);
  });

  it('should initialize with default state', () => {
    expect(store.$products()).toEqual([]);
    expect(store.$loading()).toBe(false);
    expect(store.$error()).toBeNull();
    expect(store.$pageIndex()).toBe(1);
    expect(store.$pageSize()).toBe(10);
  });

  it('should load products and update signals', () => {
    store.loadProducts();
    expect(mockApi.getProducts).toHaveBeenCalled();
    expect(store.$products().length).toBe(1);
    expect(store.$total()).toBe(1);
    expect(store.$loading()).toBe(false);
    expect(store.$isEmpty()).toBe(false);
  });

  it('should handle search filter and reset page', () => {
    store.setSearch('laptop');
    expect(store.$params().search).toBe('laptop');
    expect(store.$params().page).toBe(1);
    expect(mockApi.getProducts).toHaveBeenCalled();
  });

  it('should handle category filter and reset page', () => {
    store.setCategory('smartphones');
    expect(store.$params().category).toBe('smartphones');
    expect(store.$params().page).toBe(1);
    expect(mockApi.getProducts).toHaveBeenCalled();
  });

  it('should handle pagination changes', () => {
    store.setPage(2, 20);
    expect(store.$params().page).toBe(2);
    expect(store.$params().pageSize).toBe(20);
    expect(mockApi.getProducts).toHaveBeenCalled();
  });

  it('should handle load error gracefully', () => {
    mockApi.getProducts.mockReturnValueOnce(throwError(() => new Error('Network error')));
    store.loadProducts();
    expect(store.$error()).toBe('Network error');
    expect(store.$loading()).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test main --watch=false`
Expected: FAIL with "Cannot find module './product.store'"

- [ ] **Step 3: Implement `ProductStore` and export in `model/index.ts`**

Implement `ProductStore` using Angular Signals (`signal`, `computed`). Handle `loadProducts`, `loadCategories`, `setSearch`, `setCategory`, `setPage`, `createProduct`, `updateProduct`, and `deleteProduct`. Export in `model/index.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ng test main --watch=false`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/main/src/app/features/products/model/
git commit -m "feat(products): ✨ implement signal-based product store"
```

---

### Task 4: UI Filter Component (`ui/product-filter/`)

**Files:**
- Create: `apps/main/src/app/features/products/ui/product-filter/product-filter.component.ts`
- Create: `apps/main/src/app/features/products/ui/product-filter/product-filter.component.html`
- Create: `apps/main/src/app/features/products/ui/product-filter/index.ts`

**Interfaces:**
- Consumes: `ProductStore` from `../../model`, `ProductCategory` from `../../model`, `UiButton` from `@libs/ui/button`, `UiInput` from `@libs/ui/input`, `UiSelectComponent`, `UiOptionComponent` from `@libs/ui/select`, `SvgIcon` from `@libs/ui/svg-icon`.
- Produces: `ProductFilterComponent` with output event `addClicked` emitting `void`.

- [ ] **Step 1: Write component and template**

Create `ProductFilterComponent` with search input (debounced with RxJS `Subject` / `takeUntilDestroyed`), category dropdown (`UiSelectComponent` with all categories + option "Tất cả danh mục"), and "Thêm sản phẩm" button emitting `addClicked`.

- [ ] **Step 2: Verify component compiles**

Run: `npx ng build main`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/main/src/app/features/products/ui/product-filter/
git commit -m "feat(products): ✨ implement product filter component"
```

---

### Task 5: UI Dialogs (Add/Edit Dialog & Detail Dialog)

**Files:**
- Create: `apps/main/src/app/features/products/ui/product-dialog/product-dialog.component.ts`
- Create: `apps/main/src/app/features/products/ui/product-dialog/product-dialog.component.html`
- Create: `apps/main/src/app/features/products/ui/product-dialog/index.ts`
- Create: `apps/main/src/app/features/products/ui/product-detail-dialog/product-detail-dialog.component.ts`
- Create: `apps/main/src/app/features/products/ui/product-detail-dialog/product-detail-dialog.component.html`
- Create: `apps/main/src/app/features/products/ui/product-detail-dialog/index.ts`

**Interfaces:**
- Consumes: `ProductModel`, `ProductFormModel`, `ProductFormSchema`, `ProductCategory` from `../../model`, `@angular/cdk/dialog` (`DialogRef`, `DIALOG_DATA`), `@libs/ui/button`, `@libs/ui/input`, `@libs/ui/select`, `@libs/ui/svg-icon`, `@libs/ui/tag`.
- Produces:
  - `ProductDialogComponent`: dialog for adding or editing a product with Reactive Forms + Zod validation. Accepts `{ product?: ProductModel; categories: ProductCategory[] }` data. Returns `ProductFormModel` on save.
  - `ProductDetailDialogComponent`: quick preview modal for viewing a product's full attributes (images, price, rating, stock status, sku, return policy, warranty). Accepts `ProductModel` data.

- [ ] **Step 1: Implement `ProductDialogComponent` and template**

Implement ReactiveForm with `title`, `category`, `price`, `stock`, `description`. Validate fields using `ProductFormSchema`. Render form inputs, category select, error messages, Save button (with loading spinner), and Cancel button.

- [ ] **Step 2: Implement `ProductDetailDialogComponent` and template**

Implement detail presentation with image thumbnail, title, badge for category, pricing, stock status tag, rating stars, and details grid (SKU, brand, warranty, return policy). Close button.

- [ ] **Step 3: Verify build**

Run: `npx ng build main`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/main/src/app/features/products/ui/product-dialog/ apps/main/src/app/features/products/ui/product-detail-dialog/
git commit -m "feat(products): ✨ implement product add/edit and detail dialogs"
```

---

### Task 6: UI List / Table Component & UI Segment Exports

**Files:**
- Create: `apps/main/src/app/features/products/ui/product-list/product-list.component.ts`
- Create: `apps/main/src/app/features/products/ui/product-list/product-list.component.html`
- Create: `apps/main/src/app/features/products/ui/product-list/index.ts`
- Create: `apps/main/src/app/features/products/ui/index.ts`

**Interfaces:**
- Consumes: `ProductStore` from `../../model`, `ProductModel` from `../../model`, `ProductFilterComponent`, `ProductDialogComponent`, `ProductDetailDialogComponent`, `UI_TABLE` from `@libs/ui/table`, `Paginator` from `@libs/ui/paginator`, `DialogService` from `@libs/ui/dialog`, `ToastService` from `@libs/ui/toast`, `UiTag` from `@libs/ui/tag`, `UiButton` from `@libs/ui/button`, `SvgIcon` from `@libs/ui/svg-icon`.
- Produces: `ProductListComponent` (the main feature view component).

- [ ] **Step 1: Implement `ProductListComponent` logic**

Inject `ProductStore`, `DialogService`, `ToastService`. In `ngOnInit()`, trigger `store.loadCategories()` and `store.loadProducts()`. Implement actions:
- `onAddProduct()`: open `ProductDialogComponent`, on close call `store.createProduct()`, show success toast.
- `onEditProduct(product)`: open `ProductDialogComponent`, on close call `store.updateProduct()`, show success toast.
- `onViewDetail(product)`: open `ProductDetailDialogComponent`.
- `onDeleteProduct(product)`: open `dialog.confirm(...)`, on confirm call `store.deleteProduct()`, show success toast.
- `onPageChange(event)`: call `store.setPage(event.pageIndex, event.pageSize)`.

- [ ] **Step 2: Implement `ProductListComponent` template**

Template with:
1. Header section: Title "Quản lý Sản phẩm", subtitle "Danh sách sản phẩm từ DummyJSON API".
2. Filter section: `<product-filter>` emitting `addClicked`.
3. Table section: `@libs/ui/table` (`table [data]="store.$products()"`) with columns:
   - Ảnh & Tên: Thumbnail preview + title + SKU
   - Danh mục: Category badge
   - Giá: Formatted currency ($)
   - Tồn kho: Tag with status color (green for > 20, amber for <= 20, red for 0)
   - Đánh giá: Rating badge with star icon
   - Thao tác: Actions dropdown / buttons for View, Edit, Delete
4. Empty & Error state placeholders.
5. Footer section: `<paginator>` bound to `store.$total()`, `store.$pageSize()`, `store.$pageIndex()`.

- [ ] **Step 3: Export in `ui/index.ts`**

Export `ProductListComponent`, `ProductFilterComponent`, `ProductDialogComponent`, `ProductDetailDialogComponent`.

- [ ] **Step 4: Verify build**

Run: `npx ng build main`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/main/src/app/features/products/ui/
git commit -m "feat(products): ✨ implement product table list component and ui exports"
```

---

### Task 7: Routes, Navigation Integration & Verification

**Files:**
- Create: `apps/main/src/app/features/products/routes.ts`
- Create: `apps/main/src/app/features/products/index.ts`
- Modify: `apps/main/src/app/app.routes.ts`
- Modify: `apps/main/src/configs/navigation.config.ts`

**Interfaces:**
- Produces: lazy route default export in `routes.ts`, public API in `features/products/index.ts`, route `/app/products` in `app.routes.ts`, sidebar navigation item in `navigation.config.ts`.

- [ ] **Step 1: Create `routes.ts` and `index.ts`**

`routes.ts`:
```typescript
import { Routes } from '@angular/router';
import { ProductListComponent } from './ui';

export default [
  {
    path: '',
    component: ProductListComponent,
  },
] as Routes;
```
`index.ts`: export public API of feature slice.

- [ ] **Step 2: Register route in `apps/main/src/app/app.routes.ts`**

Under guarded children of `/app`:
```typescript
{
  path: 'products',
  canActivate: [ngxPermissionsGuard],
  data: {
    permissions: {
      only: [PERMISSION.OVERVIEW],
      redirectTo: '/access-denied',
    },
  },
  loadChildren: () => import('@/features/products/routes'),
},
```

- [ ] **Step 3: Register navigation item in `apps/main/src/configs/navigation.config.ts`**

Add "Sản phẩm" with `icon: 'heroicons_outline:shopping-bag'` and `link: '/app/products'`.

- [ ] **Step 4: Run full verification suite**

Run:
1. `npx ng test main --watch=false`
2. `npx ng build main`
3. `npx eslint .`

Expected: All tests pass, build completes without errors, linter reports 0 errors.

- [ ] **Step 5: Commit**

```bash
git add apps/main/src/app/features/products/ apps/main/src/app/app.routes.ts apps/main/src/configs/navigation.config.ts
git commit -m "feat(products): ✨ integrate products feature into routing and navigation"
```
