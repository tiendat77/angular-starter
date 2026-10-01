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
