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

  // อัปเดตสินค้า (Swagger Spec: PATCH /api/v1/products/{id})
  updateProduct: async (id: string, data: Partial<CreateProductDTO>) => {
    const response = await apiClient.patch(`/products/${id}`, data);
    return response.data?.data || response.data;
  },

  // ลบสินค้า (Deactivate - Soft delete: isActive=false)
  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  // อัปโหลดรูปภาพสินค้า (POST /products/{id}/images)
  uploadImages: async (id: string, formData: FormData) => {
    const response = await apiClient.post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ลบรูปภาพสินค้า (DELETE /products/{id}/images/{imageId})
  deleteImage: async (id: string, imageId: string) => {
    const response = await apiClient.delete(`/products/${id}/images/${imageId}`);
    return response.data;
  },

  // จัดลำดับรูปภาพ (PATCH /products/{id}/images/reorder)
  reorderImages: async (id: string, imageIds: string[]) => {
    const response = await apiClient.patch(`/products/${id}/images/reorder`, { imageIds });
    return response.data;
  },
};
