# Product Management Feature Design Spec

**Date:** 2026-09-29  
**Feature:** Product Management (Quản lý Sản phẩm)  
**Location:** `apps/main/src/app/features/products/`  
**Purpose:** Gold-standard reference CRUD feature module showcasing Feature-Sliced Design (FSD), Angular 22 Signals, `@libs/ui` library suite, and Zod validation against DummyJSON API.

---

## 1. Architectural Standards & Overview

This module acts as a reference implementation for developers building feature slices in `apps/main`.
Key architectural rules followed:
1. **Feature-Sliced Design (FSD):** Organized into standard technical segments:
   - `api/`: API resources extending `BaseApiService`
   - `model/`: TypeScript models, Zod schemas, and Signal-based Store
   - `ui/`: Focused presentational and dialog components
   - `routes.ts`: Lazy-loaded feature routing
   - `index.ts`: Public API barrel export
2. **Signals-First State:** Component and business state is completely managed by `ProductStore` using Angular Signals (`signal`, `computed`).
3. **Standalone & OnPush:** All components are standalone and explicitly specify `changeDetection: ChangeDetectionStrategy.OnPush`.
4. **Validation & Typing:** Zod schemas (`ProductSchema`, `ProductFormSchema`) ensure runtime and compile-time type safety.
5. **Design System Integration:** Uses `@libs/ui/table`, `@libs/ui/paginator`, `@libs/ui/dialog`, `@libs/ui/toast`, `@libs/ui/tag`, `@libs/ui/badge`, `@libs/ui/button`, and `@libs/ui/select`.

---

## 2. Directory & File Structure

```text
apps/main/src/app/features/products/
├── api/
│   ├── index.ts
│   └── product-api.service.ts
├── model/
│   ├── index.ts
│   ├── product.model.ts
│   └── product.store.ts
├── ui/
│   ├── product-detail-dialog/
│   │   ├── product-detail-dialog.component.html
│   │   ├── product-detail-dialog.component.ts
│   │   └── index.ts
│   ├── product-dialog/
│   │   ├── product-dialog.component.html
│   │   ├── product-dialog.component.ts
│   │   └── index.ts
│   ├── product-filter/
│   │   ├── product-filter.component.html
│   │   ├── product-filter.component.ts
│   │   └── index.ts
│   ├── product-list/
│   │   ├── product-list.component.html
│   │   ├── product-list.component.ts
│   │   └── index.ts
│   └── index.ts
├── routes.ts
└── index.ts
```

---

## 3. Data Models & Zod Schemas (`model/product.model.ts`)

```typescript
import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.number(),
  title: z.string().min(1, 'Tên sản phẩm không được để trống'),
  description: z.string().optional().default(''),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  price: z.number().min(0, 'Giá sản phẩm không được nhỏ hơn 0'),
  discountPercentage: z.number().optional().default(0),
  rating: z.number().optional().default(0),
  stock: z.number().int().min(0, 'Số lượng tồn kho không hợp lệ'),
  brand: z.string().optional().default(''),
  sku: z.string().optional().default(''),
  thumbnail: z.string().optional().default(''),
  availabilityStatus: z.string().optional().default('In Stock'),
  warrantyInformation: z.string().optional().default(''),
  shippingInformation: z.string().optional().default(''),
  returnPolicy: z.string().optional().default(''),
});

export type ProductModel = z.infer<typeof ProductSchema>;

export const ProductFormSchema = ProductSchema.pick({
  title: true,
  category: true,
  price: true,
  stock: true,
  description: true,
});

export type ProductFormModel = z.infer<typeof ProductFormSchema>;

export const ProductListResponseSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;

export interface ProductQueryParams {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface ProductCategory {
  slug: string;
  name: string;
}
```

---

## 4. API Service (`api/product-api.service.ts`)

Endpoints:
- `https://dummyjson.com/products`: list with `limit`, `skip`, `sortBy`, `order`
- `https://dummyjson.com/products/search?q={search}`: search with `limit`, `skip`
- `https://dummyjson.com/products/category/{category}`: filter by category
- `https://dummyjson.com/products/categories`: list of categories
- `https://dummyjson.com/products/{id}`: get single product
- `https://dummyjson.com/products/add`: POST product creation
- `https://dummyjson.com/products/{id}`: PUT product update
- `https://dummyjson.com/products/{id}`: DELETE product deletion

---

## 5. State Management: Signal Store (`model/product.store.ts`)

- Signals:
  - `$products`: List of current products
  - `$total`: Total number of products from API
  - `$loading`: Loading indicator boolean
  - `$error`: Error message or null
  - `$categories`: Category filter options
  - `$params`: Query parameters object
- Computed:
  - `$isEmpty`: True when not loading, product list is empty, and no error
  - `$pageIndex`: 0-indexed page for paginator
  - `$pageSize`: Current page size
- Actions:
  - `loadProducts()`
  - `loadCategories()`
  - `setSearch(keyword: string)`
  - `setCategory(category: string)`
  - `setPage(page: number, size: number)`
  - `setSort(sortBy: string, order: 'asc' | 'desc')`
  - `createProduct(data: ProductFormModel)`
  - `updateProduct(id: number, data: Partial<ProductFormModel>)`
  - `deleteProduct(id: number)`

---

## 6. UI Components

1. **`ProductFilterComponent`:**
   - Search input with debounce 300ms
   - Category select dropdown (`UiSelectComponent`, `UiOptionComponent`)
   - Add product button with `plus` icon triggering dialog
2. **`ProductListComponent`:**
   - Table view using `@libs/ui/table`
   - Formatted columns: Thumbnail, Title & SKU, Category Tag, Price (currency), Stock status Tag, Rating, Actions
   - Paginator using `@libs/ui/paginator`
   - Placeholder states for empty and error
3. **`ProductDialogComponent`:**
   - Add / Edit product modal dialog
   - Reactive Form validated with Zod `ProductFormSchema`
   - Fields: Title, Category (Select), Price & Stock (2-col grid), Description (textarea)
   - Save / Cancel actions with loading state
4. **`ProductDetailDialogComponent`:**
   - Quick preview modal displaying full image, description, rating, SKU, warranty, shipping, and return policy

---

## 7. Routing & Integration

- Route `/app/products` registered in `apps/main/src/app/app.routes.ts` with `LayoutComponent` (`layout: 'dense'`).
- Item "Sản phẩm" added to navigation sidebar in `apps/main/src/configs/navigation.config.ts`.

---

## 8. Verification Plan
- Unit tests for `ProductStore` and `ProductApiService`.
- E2E / integration verification: `yarn build`, `yarn test`, `yarn lint`.
- Verify table rendering, search, category filter, modal opening, and mock CRUD operations.
