import { computed, inject, Injectable, signal } from '@angular/core';

import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

import {
  ProductApiService,
  ProductCategory,
  ProductFormModel,
  ProductModel,
  ProductQueryParams,
} from '@/entities/product';

@Injectable({
  providedIn: 'root',
})
export class ProductListStore {
  // -----------------------------------------------------------------------------------------------------
  // @ Public properties (Signals & Computed)
  // -----------------------------------------------------------------------------------------------------

  readonly $products = signal<ProductModel[]>([]);
  readonly $total = signal<number>(0);
  readonly $loading = signal<boolean>(false);
  readonly $error = signal<string | null>(null);
  readonly $categories = signal<ProductCategory[]>([]);
  readonly $params = signal<ProductQueryParams>({
    page: 1,
    pageSize: 10,
  });

  readonly $isEmpty = computed(
    () => !this.$loading() && this.$products().length === 0 && !this.$error()
  );
  readonly $pageIndex = computed(() => this.$params().page);
  readonly $pageSize = computed(() => this.$params().pageSize);

  // -----------------------------------------------------------------------------------------------------
  // @ Private properties
  // -----------------------------------------------------------------------------------------------------

  private _api = inject(ProductApiService);

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Fetch products based on current $params
   */
  loadProducts(): void {
    this.$loading.set(true);
    this.$error.set(null);

    this._api
      .getProducts(this.$params())
      .pipe(finalize(() => this.$loading.set(false)))
      .subscribe({
        next: (response) => {
          this.$products.set(response.products);
          this.$total.set(response.total);
        },
        error: (err) => {
          this.$error.set(err?.message || 'Không thể tải danh sách sản phẩm');
        },
      });
  }

  /**
   * Fetch categories list
   */
  loadCategories(): void {
    this._api.getCategories().subscribe({
      next: (categories) => {
        this.$categories.set(categories);
      },
      error: () => {
        // Silently keep empty categories
      },
    });
  }

  /**
   * Apply keyword search and reset to page 1
   * Clears category filter to avoid DummyJSON API filter conflict
   */
  setSearch(keyword: string): void {
    const search = keyword.trim();
    this.$params.update((prev) => ({
      ...prev,
      search,
      category: search ? undefined : prev.category,
      page: 1,
    }));
    this.loadProducts();
  }

  /**
   * Filter by category and reset to page 1
   * Clears search filter to avoid DummyJSON API filter conflict
   */
  setCategory(category: string): void {
    const cat = category.trim();
    this.$params.update((prev) => ({
      ...prev,
      category: cat,
      search: cat ? undefined : prev.search,
      page: 1,
    }));
    this.loadProducts();
  }

  /**
   * Change pagination page and pageSize
   */
  setPage(page: number, size: number): void {
    this.$params.update((prev) => ({
      ...prev,
      page,
      pageSize: size,
    }));
    this.loadProducts();
  }

  /**
   * Change sort options
   */
  setSort(sortBy: string, order: 'asc' | 'desc'): void {
    this.$params.update((prev) => ({
      ...prev,
      sortBy,
      order,
    }));
    this.loadProducts();
  }

  /**
   * Add a new product (mock mutation) and update store signals
   */
  createProduct(data: ProductFormModel): Observable<ProductModel> {
    return this._api.createProduct(data).pipe(
      tap((newProduct) => {
        this.$products.update((items) => [newProduct, ...items]);
        this.$total.update((total) => total + 1);
      })
    );
  }

  /**
   * Update a product (mock mutation) and update store signals
   */
  updateProduct(id: number, data: Partial<ProductFormModel>): Observable<ProductModel> {
    return this._api.updateProduct(id, data).pipe(
      tap((updated) => {
        this.$products.update((items) =>
          items.map((item) => (item.id === id ? { ...item, ...updated } : item))
        );
      })
    );
  }

  /**
   * Delete a product (mock mutation) and update store signals
   */
  deleteProduct(id: number): Observable<{ id: number; isDeleted: boolean }> {
    return this._api.deleteProduct(id).pipe(
      tap(() => {
        this.$products.update((items) => items.filter((item) => item.id !== id));
        this.$total.update((total) => Math.max(total - 1, 0));
      })
    );
  }
}
