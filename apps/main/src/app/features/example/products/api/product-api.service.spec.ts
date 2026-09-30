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

    const req = httpMock.expectOne(
      (r) =>
        r.url.includes('dummyjson.com/products') &&
        !r.url.includes('/category') &&
        !r.url.includes('/search')
    );
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
      {
        slug: 'beauty',
        name: 'Beauty',
        url: 'https://dummyjson.com/products/category/beauty',
      },
    ];
    service.getCategories().subscribe((cats) => {
      expect(cats.length).toBe(1);
      expect(cats[0].slug).toBe('beauty');
    });

    const req = httpMock.expectOne('https://dummyjson.com/products/categories');
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories);
  });

  it('should create product', () => {
    const newProduct = {
      title: 'New',
      category: 'cat',
      price: 20,
      stock: 5,
      description: 'Desc',
    };
    service.createProduct(newProduct).subscribe((res) => {
      expect(res.id).toBe(101);
      expect(res.title).toBe('New');
    });

    const req = httpMock.expectOne('https://dummyjson.com/products/add');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 101, ...newProduct });
  });

  it('should trim string fields before creating product', () => {
    const untrimmed = {
      title: '   Untrimmed Title   ',
      category: '   smartphones   ',
      price: 100,
      stock: 5,
      description: '   Untrimmed Description   ',
    };
    service.createProduct(untrimmed).subscribe();

    const req = httpMock.expectOne('https://dummyjson.com/products/add');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe('Untrimmed Title');
    expect(req.request.body.category).toBe('smartphones');
    expect(req.request.body.description).toBe('Untrimmed Description');
    req.flush({
      id: 102,
      ...untrimmed,
      title: 'Untrimmed Title',
      category: 'smartphones',
      description: 'Untrimmed Description',
    });
  });

  it('should update product', () => {
    service.updateProduct(1, { title: 'Updated' }).subscribe((res) => {
      expect(res.title).toBe('Updated');
    });

    const req = httpMock.expectOne('https://dummyjson.com/products/1');
    expect(req.request.method).toBe('PUT');
    req.flush({
      id: 1,
      title: 'Updated',
      category: 'cat',
      price: 10,
      stock: 5,
    });
  });

  it('should delete product', () => {
    service.deleteProduct(1).subscribe((res) => {
      expect(res.isDeleted).toBe(true);
    });

    const req = httpMock.expectOne('https://dummyjson.com/products/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ id: 1, isDeleted: true });
  });
});
