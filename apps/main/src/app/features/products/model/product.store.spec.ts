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
      getProducts: vi.fn().mockReturnValue(
        of({
          products: [{ id: 1, title: 'Item 1', category: 'c', price: 10, stock: 5 }],
          total: 1,
          skip: 0,
          limit: 10,
        })
      ),
      getCategories: vi.fn().mockReturnValue(of([{ slug: 'smartphones', name: 'Smartphones' }])),
      createProduct: vi.fn().mockReturnValue(
        of({
          id: 101,
          title: 'New Item',
          category: 'c',
          price: 20,
          stock: 10,
        })
      ),
      updateProduct: vi.fn().mockReturnValue(
        of({
          id: 1,
          title: 'Updated Item',
          category: 'c',
          price: 15,
          stock: 5,
        })
      ),
      deleteProduct: vi.fn().mockReturnValue(of({ id: 1, isDeleted: true })),
    };

    TestBed.configureTestingModule({
      providers: [ProductStore, { provide: ProductApiService, useValue: mockApi }],
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

  it('should clear category when searching to avoid DummyJSON filter conflict', () => {
    store.setCategory('smartphones');
    expect(store.$params().category).toBe('smartphones');

    store.setSearch('laptop');
    expect(store.$params().search).toBe('laptop');
    expect(store.$params().category).toBeFalsy();
  });

  it('should clear search when choosing a category to avoid DummyJSON filter conflict', () => {
    store.setSearch('laptop');
    expect(store.$params().search).toBe('laptop');

    store.setCategory('smartphones');
    expect(store.$params().category).toBe('smartphones');
    expect(store.$params().search).toBeFalsy();
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

  it('should handle mock create mutation', () => {
    store.loadProducts();
    store
      .createProduct({
        title: 'New Item',
        category: 'c',
        price: 20,
        stock: 10,
        description: 'New product description',
      })
      .subscribe();
    expect(store.$products().length).toBe(2);
    expect(store.$products()[0].id).toBe(101);
    expect(store.$total()).toBe(2);
  });

  it('should handle mock update mutation', () => {
    store.loadProducts();
    store.updateProduct(1, { title: 'Updated Item' }).subscribe();
    expect(store.$products()[0].title).toBe('Updated Item');
  });

  it('should handle mock delete mutation', () => {
    store.loadProducts();
    store.deleteProduct(1).subscribe();
    expect(store.$products().length).toBe(0);
    expect(store.$total()).toBe(0);
  });
});
