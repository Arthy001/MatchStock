import { apiClient } from './api.client';

export interface RfidTagItem {
  id: string;
  tagId: string;
  tenantId: string;
  productId?: string | null;
  status: 'bound' | 'unbound' | string;
  boundAt?: string | null;
  receivedAt?: string | null;
  lotNumber?: string | null;
  productionDate?: string | null;
  expiryDate?: string | null;
  unitCostMinor?: number | null;
  createdAt?: string;
  updatedAt?: string;
  product?: {
    id: string;
    name: string;
    sku?: string;
    code?: string;
    barcode?: string;
  };
}

export const rfidService = {
  // ดึงรายการ RFID Tags ทั้งหมด (GET /tags)
  getTags: async (params?: { status?: string; productId?: string; page?: number; limit?: number }) => {
    try {
      const response = await apiClient.get('/tags', { params });
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('rfidService.getTags fallback:', err);
      return [];
    }
  },

  // ดึงรายการ RFID Tags ที่ยังไม่ได้ผูก (GET /tags/unbound)
  getUnboundTags: async (page = 1, limit = 50) => {
    try {
      const response = await apiClient.get('/tags/unbound', { params: { page, limit } });
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('rfidService.getUnboundTags fallback:', err);
      return [];
    }
  },

  // ผูก RFID Tag เข้ากับสินค้า (POST /tags/{tagId}/bind)
  bindTag: async (tagId: string, data: { productId: string; receivedAt?: string }) => {
    const response = await apiClient.post(`/tags/${encodeURIComponent(tagId)}/bind`, data);
    return response.data?.data || response.data;
  },

  // ปลดการผูก RFID Tag (POST /tags/{tagId}/unbind)
  unbindTag: async (tagId: string) => {
    const response = await apiClient.post(`/tags/${encodeURIComponent(tagId)}/unbind`);
    return response.data?.data || response.data;
  },

  // ลบ RFID Tag ที่บันทึกผิดพลาด (DELETE /tags/{tagId})
  deleteTag: async (tagId: string) => {
    const response = await apiClient.delete(`/tags/${encodeURIComponent(tagId)}`);
    return response.data?.data || response.data;
  },
};
