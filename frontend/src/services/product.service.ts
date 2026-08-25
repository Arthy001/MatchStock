import { apiClient } from './api.client';

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
}

export interface CreateProductDTO {
  code: string;
  sku: string;
  barcode?: string;
  barcodeValue?: string;
  name: string;
  description?: string;
  baseUnitId?: string;
  categoryId?: string;
  brandId?: string;
  brand?: string;
  uom?: string;
  stockOnHand?: number;
  price: number;
  weightKg?: number;
  widthCm?: number;
  lengthCm?: number;
  heightCm?: number;
  reorderPoint?: number;
  reorderLevel?: number;
  minReorderQty?: number;
  isLotControl?: boolean;
}

export const productService = {
  // ดึงรายการสินค้าแบบแบ่งหน้า + ค้นหา
  getProducts: async (params?: ProductFilterParams) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  // ดึงรายการสินค้าทั้งหมด
  getAllProducts: async () => {
    const response = await apiClient.get('/products');
    return response.data?.data || response.data || [];
  },

  // ดึงข้อมูลสินค้าตาม ID
  getProductById: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // สร้างสินค้าใหม่
  createProduct: async (data: CreateProductDTO) => {
    const response = await apiClient.post('/products', data);
    return response.data?.data || response.data;
  },

  // อัปเดตสินค้า
  updateProduct: async (id: string, data: Partial<CreateProductDTO>) => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data?.data || response.data;
  },

  // ลบสินค้า
  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
