import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseApiService } from '@/shared/api/base/api.base';
import { DataHelper } from '@/shared/lib';
import {
  ProductCategory,
  ProductFormModel,
  ProductListResponse,
  ProductListResponseSchema,
  ProductModel,
  ProductQueryParams,
  ProductSchema,
} from '../model';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService extends BaseApiService<ProductModel> {
  protected override _baseUrl = 'https://dummyjson.com/products';
  protected override _schema = ProductSchema;

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get products with pagination, search, and category filters
   */
  getProducts(params: ProductQueryParams): Observable<ProductListResponse> {
    const limit = params.pageSize;
    const skip = Math.max((params.page - 1) * params.pageSize, 0);

    let url: string;
    if (params.search?.trim()) {
      url = `${this._baseUrl}/search?q=${encodeURIComponent(params.search.trim())}&limit=${limit}&skip=${skip}`;
    } else if (params.category?.trim()) {
      url = `${this._baseUrl}/category/${encodeURIComponent(params.category.trim())}?limit=${limit}&skip=${skip}`;
    } else {
      url = `${this._baseUrl}?limit=${limit}&skip=${skip}`;
    }

    if (params.sortBy) {
      url += `&sortBy=${encodeURIComponent(params.sortBy)}&order=${params.order || 'asc'}`;
    }

    return this._http
      .get<ProductListResponse>(url)
      .pipe(map((res) => ProductListResponseSchema.parse(res)));
  }

  /**
   * Get list of categories
   */
  getCategories(): Observable<ProductCategory[]> {
    return this._http
      .get<any[]>(`${this._baseUrl}/categories`)
      .pipe(
        map((items) =>
          items.map((item) =>
            typeof item === 'string'
              ? { slug: item, name: item }
              : { slug: item.slug, name: item.name }
          )
        )
      );
  }

  /**
   * Get a single product by ID
   */
  getProduct(id: number): Observable<ProductModel> {
    return this._http
      .get<ProductModel>(`${this._baseUrl}/${id}`)
      .pipe(map((res) => ProductSchema.parse(res)));
  }

  /**
   * Add a new product (mock mutation)
   */
  createProduct(data: ProductFormModel): Observable<ProductModel> {
    const payload = DataHelper.trim({ ...data });
    return this._http
      .post<ProductModel>(`${this._baseUrl}/add`, payload)
      .pipe(map((res) => ProductSchema.parse(res)));
  }

  /**
   * Update a product (mock mutation)
   */
  updateProduct(id: number, data: Partial<ProductFormModel>): Observable<ProductModel> {
    const payload = DataHelper.trim({ ...data });
    return this._http
      .put<ProductModel>(`${this._baseUrl}/${id}`, payload)
      .pipe(map((res) => ProductSchema.parse(res)));
  }

  /**
   * Delete a product (mock mutation)
   */
  deleteProduct(id: number): Observable<{ id: number; isDeleted: boolean }> {
    return this._http.delete<{ id: number; isDeleted: boolean }>(`${this._baseUrl}/${id}`);
  }
}
