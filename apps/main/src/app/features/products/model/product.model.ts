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
