import * as z from 'zod/mini';

export const ProductSchema = z.object({
  id: z.number(),
  title: z.string().check(z.minLength(1, 'Tên sản phẩm không được để trống')),
  description: z._default(z.string(), ''),
  category: z.string().check(z.minLength(1, 'Vui lòng chọn danh mục')),
  price: z.number().check(z.gte(0, 'Giá sản phẩm không được nhỏ hơn 0')),
  discountPercentage: z._default(z.number(), 0),
  rating: z._default(z.number(), 0),
  stock: z.int('Số lượng tồn kho không hợp lệ').check(z.gte(0, 'Số lượng tồn kho không hợp lệ')),
  brand: z._default(z.string(), ''),
  sku: z._default(z.string(), ''),
  thumbnail: z._default(z.string(), ''),
  availabilityStatus: z._default(z.string(), 'In Stock'),
  warrantyInformation: z._default(z.string(), ''),
  shippingInformation: z._default(z.string(), ''),
  returnPolicy: z._default(z.string(), ''),
});

export type ProductModel = z.infer<typeof ProductSchema>;

export const ProductFormSchema = z.pick(ProductSchema, {
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
