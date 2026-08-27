import { apiClient } from './api.client';

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
}

export interface CreateProductDTO {
  code?: string;
  sku?: string;
  slug?: string;
  name: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  manufacturerId?: string;
  supplierId?: string;
  unitId?: string;
  unitOfMeasure?: string;
  uom?: string;
  brand?: string;
  price?: number;
  stockOnHand?: number;
  sellingPriceMinor?: number;
  costPriceMinor?: number;
  currency?: string;
  weightValue?: number;
  weightKg?: number;
  widthValue?: number;
  widthCm?: number;
  lengthValue?: number;
  lengthCm?: number;
  heightValue?: number;
  heightCm?: number;
  dimensionUnitId?: string;
  weightUnitId?: string;
  reorderPoint?: number;
  reorderLevel?: number;
  minReorderQuantity?: number;
  minReorderQty?: number;
  barcodeValue?: string;
  barcodeSymbologyId?: string;
  barcode?: string;
  lotControlled?: boolean;
  isLotControl?: boolean;
  isReturnable?: boolean;
  warrantyPeriodDays?: number;
  isActive?: boolean;
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
    return response.data?.data || response.data;
  },

  // สร้างสินค้าใหม่ (POST /products)
  createProduct: async (data: CreateProductDTO) => {
    const payload: Record<string, any> = {
      name: data.name,
      code: data.code || data.sku,
      sku: data.sku || data.code,
      slug: data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined),
      description: data.description,
      categoryId: data.categoryId,
      brandId: data.brandId,
      manufacturerId: data.manufacturerId,
      supplierId: data.supplierId,
      unitId: data.unitId,
      unitOfMeasure: data.unitOfMeasure || data.uom,
      sellingPriceMinor: data.sellingPriceMinor ?? (data.price !== undefined ? Math.round(data.price * 100) : undefined),
      costPriceMinor: data.costPriceMinor,
      currency: data.currency || 'THB',
      widthValue: data.widthValue ?? data.widthCm,
      lengthValue: data.lengthValue ?? data.lengthCm,
      heightValue: data.heightValue ?? data.heightCm,
      weightValue: data.weightValue ?? data.weightKg,
      reorderPoint: data.reorderPoint ?? data.reorderLevel,
      minReorderQuantity: data.minReorderQuantity ?? data.minReorderQty,
      barcodeValue: data.barcodeValue || data.barcode,
      barcodeSymbologyId: data.barcodeSymbologyId,
      lotControlled: data.lotControlled ?? data.isLotControl,
      isReturnable: data.isReturnable,
      warrantyPeriodDays: data.warrantyPeriodDays,
      isActive: data.isActive ?? true,
    };
    const response = await apiClient.post('/products', payload);
    return response.data?.data || response.data;
  },

  // อัปเดตสินค้า (PATCH /products/{id})
  updateProduct: async (id: string, data: Partial<CreateProductDTO>) => {
    const payload: Record<string, any> = {
      ...data,
      sellingPriceMinor: data.sellingPriceMinor ?? (data.price !== undefined ? Math.round(data.price * 100) : undefined),
      widthValue: data.widthValue ?? data.widthCm,
      lengthValue: data.lengthValue ?? data.lengthCm,
      heightValue: data.heightValue ?? data.heightCm,
      weightValue: data.weightValue ?? data.weightKg,
      reorderPoint: data.reorderPoint ?? data.reorderLevel,
      minReorderQuantity: data.minReorderQuantity ?? data.minReorderQty,
      barcodeValue: data.barcodeValue || data.barcode,
      lotControlled: data.lotControlled ?? data.isLotControl,
    };
    const response = await apiClient.patch(`/products/${id}`, payload);
    return response.data?.data || response.data;
  },

  // ปิดการใช้งาน/ลบสินค้า (POST /products/{id}/deactivate หรือ DELETE /products/{id})
  deleteProduct: async (id: string) => {
    try {
      const response = await apiClient.post(`/products/${id}/deactivate`);
      return response.data;
    } catch {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    }
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
