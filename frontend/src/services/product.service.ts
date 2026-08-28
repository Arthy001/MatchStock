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
  baseUnitId?: string;
  unitId?: string;
  unitOfMeasure?: string;
  uom?: string;
  brand?: string;
  price?: number;
  stockOnHand?: number;
  sellingPriceMinor?: number;
  costPriceMinor?: number;
  costPrice?: number;
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
  taxTypeId?: string;
  lotControlled?: boolean;
  isLotControl?: boolean;
  isReturnable?: boolean;
  warrantyPeriodDays?: number;
  isActive?: boolean;
  imageUrl?: string;
}

export const resolveImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  // หากเป็น URL จาก Server match-stock.ddns.net ให้แปลงเป็น Relative Path
  // เพื่อให้วิ่งผ่าน Vite Proxy บน Localhost และหลีกเลี่ยง Helmet (ERR_BLOCKED_BY_RESPONSE.NotSameOrigin)
  if (trimmed.includes('match-stock.ddns.net/uploads/')) {
    return trimmed.substring(trimmed.indexOf('/uploads/'));
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
};

const isUUID = (val: any): boolean => {
  return typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());
};

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

  // สร้างสินค้าใหม่ (POST /products) - รองรับทั้ง Express backend & OpenAPI NestJS
  createProduct: async (data: CreateProductDTO) => {
    const code = data.code?.trim() || data.sku?.trim() || `PRD-${Date.now().toString().slice(-4)}`;
    const sku = data.sku?.trim() || data.code?.trim() || `SKU-${Date.now().toString().slice(-4)}`;
    const slug = data.slug || `${sku.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const barcode = data.barcode?.trim() || data.barcodeValue?.trim() || undefined;
    const price = typeof data.price === 'number' && !isNaN(data.price) ? data.price : (typeof data.sellingPriceMinor === 'number' ? data.sellingPriceMinor / 100 : 0);
    const sellingPriceMinor = typeof data.sellingPriceMinor === 'number' ? Math.round(data.sellingPriceMinor) : Math.round(price * 100);
    const costPriceMinor = typeof data.costPriceMinor === 'number' ? Math.round(data.costPriceMinor) : (typeof data.costPrice === 'number' ? Math.round(data.costPrice * 100) : 0);

    const categoryId = isUUID(data.categoryId) ? data.categoryId : undefined;
    const brandId = isUUID(data.brandId) ? data.brandId : undefined;
    const manufacturerId = isUUID(data.manufacturerId) ? data.manufacturerId : undefined;
    const supplierId = isUUID(data.supplierId) ? data.supplierId : undefined;
    const baseUnitId = isUUID(data.baseUnitId) ? data.baseUnitId : (isUUID(data.unitId) ? data.unitId : undefined);
    const unitId = isUUID(data.unitId) ? data.unitId : (isUUID(data.baseUnitId) ? data.baseUnitId : undefined);
    const barcodeSymbologyId = isUUID(data.barcodeSymbologyId) ? data.barcodeSymbologyId : undefined;
    const taxTypeId = isUUID(data.taxTypeId) ? data.taxTypeId : undefined;
    const dimensionUnitId = isUUID(data.dimensionUnitId) ? data.dimensionUnitId : undefined;
    const weightUnitId = isUUID(data.weightUnitId) ? data.weightUnitId : undefined;

    const width = typeof data.widthValue === 'number' && data.widthValue > 0 ? data.widthValue : (typeof data.widthCm === 'number' && data.widthCm > 0 ? data.widthCm : undefined);
    const length = typeof data.lengthValue === 'number' && data.lengthValue > 0 ? data.lengthValue : (typeof data.lengthCm === 'number' && data.lengthCm > 0 ? data.lengthCm : undefined);
    const height = typeof data.heightValue === 'number' && data.heightValue > 0 ? data.heightValue : (typeof data.heightCm === 'number' && data.heightCm > 0 ? data.heightCm : undefined);
    const weight = typeof data.weightValue === 'number' && data.weightValue > 0 ? data.weightValue : (typeof data.weightKg === 'number' && data.weightKg > 0 ? data.weightKg : undefined);
    const reorder = typeof data.reorderPoint === 'number' && data.reorderPoint > 0 ? Math.round(data.reorderPoint) : (typeof data.reorderLevel === 'number' && data.reorderLevel > 0 ? Math.round(data.reorderLevel) : undefined);
    const minReorder = typeof data.minReorderQuantity === 'number' && data.minReorderQuantity > 0 ? Math.round(data.minReorderQuantity) : (typeof data.minReorderQty === 'number' && data.minReorderQty > 0 ? Math.round(data.minReorderQty) : undefined);

    const payload: Record<string, any> = {
      name: data.name?.trim(),
      code,
      sku,
      slug,
      description: data.description?.trim() || undefined,
      categoryId,
      brandId,
      manufacturerId,
      supplierId,
      baseUnitId,
      unitId,
      dimensionUnitId,
      weightUnitId,
      unitOfMeasure: data.unitOfMeasure || data.uom || 'PCS',
      price: price > 0 ? price : undefined,
      sellingPriceMinor: sellingPriceMinor > 0 ? sellingPriceMinor : undefined,
      costPriceMinor: costPriceMinor > 0 ? costPriceMinor : undefined,
      currency: data.currency || 'THB',
      widthValue: width,
      widthCm: width,
      lengthValue: length,
      lengthCm: length,
      heightValue: height,
      heightCm: height,
      weightValue: weight,
      weightKg: weight,
      reorderPoint: reorder,
      reorderLevel: reorder,
      minReorderQuantity: minReorder,
      minReorderQty: minReorder,
      barcode,
      barcodeValue: barcode,
      barcodeSymbologyId,
      taxTypeId,
      lotControlled: data.lotControlled ?? data.isLotControl ?? false,
      isLotControl: data.isLotControl ?? data.lotControlled ?? false,
      isReturnable: data.isReturnable ?? false,
      warrantyPeriodDays: typeof data.warrantyPeriodDays === 'number' && data.warrantyPeriodDays > 0 ? Math.round(data.warrantyPeriodDays) : undefined,
      isActive: data.isActive ?? true,
      imageUrl: data.imageUrl || undefined,
    };

    // ลบ keys ที่มีค่า undefined หรือ null หรือ empty string ออก
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
        delete payload[key];
      }
    });

    const response = await apiClient.post('/products', payload);
    return response.data?.data || response.data;
  },

  // อัปเดตสินค้า (PATCH /products/{id} หรือ PUT /products/{id})
  updateProduct: async (id: string, data: Partial<CreateProductDTO>) => {
    const price = data.price !== undefined ? data.price : (data.sellingPriceMinor !== undefined ? data.sellingPriceMinor / 100 : undefined);
    const sellingPriceMinor = data.sellingPriceMinor ?? (price !== undefined ? Math.round(price * 100) : undefined);
    const barcode = data.barcode?.trim() || data.barcodeValue?.trim();

    const categoryId = isUUID(data.categoryId) ? data.categoryId : undefined;
    const brandId = isUUID(data.brandId) ? data.brandId : undefined;
    const manufacturerId = isUUID(data.manufacturerId) ? data.manufacturerId : undefined;
    const supplierId = isUUID(data.supplierId) ? data.supplierId : undefined;
    const baseUnitId = isUUID(data.baseUnitId) ? data.baseUnitId : (isUUID(data.unitId) ? data.unitId : undefined);
    const unitId = isUUID(data.unitId) ? data.unitId : (isUUID(data.baseUnitId) ? data.baseUnitId : undefined);
    const barcodeSymbologyId = isUUID(data.barcodeSymbologyId) ? data.barcodeSymbologyId : undefined;
    const taxTypeId = isUUID(data.taxTypeId) ? data.taxTypeId : undefined;

    const payload: Record<string, any> = {
      ...data,
      ...(data.name && { name: data.name.trim() }),
      ...(data.code && { code: data.code.trim() }),
      ...(data.sku && { sku: data.sku.trim() }),
      ...(price !== undefined && price > 0 && { price }),
      ...(sellingPriceMinor !== undefined && sellingPriceMinor > 0 && { sellingPriceMinor }),
      ...(barcode !== undefined && { barcode, barcodeValue: barcode }),
      ...(categoryId && { categoryId }),
      ...(brandId && { brandId }),
      ...(manufacturerId && { manufacturerId }),
      ...(supplierId && { supplierId }),
      ...(baseUnitId && { baseUnitId }),
      ...(unitId && { unitId }),
      ...(barcodeSymbologyId && { barcodeSymbologyId }),
      ...(taxTypeId && { taxTypeId }),
      ...(data.widthCm !== undefined && data.widthCm > 0 && { widthCm: data.widthCm, widthValue: data.widthCm }),
      ...(data.lengthCm !== undefined && data.lengthCm > 0 && { lengthCm: data.lengthCm, lengthValue: data.lengthCm }),
      ...(data.heightCm !== undefined && data.heightCm > 0 && { heightCm: data.heightCm, heightValue: data.heightCm }),
      ...(data.weightKg !== undefined && data.weightKg > 0 && { weightKg: data.weightKg, weightValue: data.weightKg }),
      ...(data.reorderLevel !== undefined && data.reorderLevel > 0 && { reorderPoint: data.reorderLevel, reorderLevel: data.reorderLevel }),
      ...(data.minReorderQty !== undefined && data.minReorderQty > 0 && { minReorderQty: data.minReorderQty, minReorderQuantity: data.minReorderQty }),
      ...(data.isLotControl !== undefined && { isLotControl: data.isLotControl, lotControlled: data.isLotControl }),
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === null || payload[key] === '' || payload[key] === 0) {
        // preserve boolean false, but remove 0 for dimensions/null/undefined
        if (payload[key] === 0 && key !== 'price' && key !== 'sellingPriceMinor') {
          delete payload[key];
        }
      }
    });

    try {
      const response = await apiClient.patch(`/products/${id}`, payload);
      return response.data?.data || response.data;
    } catch {
      // Fallback to PUT if backend only has PUT route
      const response = await apiClient.put(`/products/${id}`, payload);
      return response.data?.data || response.data;
    }
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
};
