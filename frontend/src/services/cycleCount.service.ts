import { apiClient } from './api.client';

export interface CreateCycleCountPayload {
  warehouseId: string;
  binLocationId?: string;
  notes?: string;
}

export interface SubmitCountPayload {
  tagIds?: string[];
  countedItems?: Array<{
    productId: string;
    countedQuantity: number;
    notes?: string;
  }>;
}

export const cycleCountService = {
  // ดึงรายการรอบตรวจนับทั้งหมด
  async getCycleCounts(params?: { page?: number; limit?: number }) {
    try {
      const response = await apiClient.get('/cycle-counts', { params });
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch cycle counts from API, falling back', error);
      throw error;
    }
  },

  // ดึงรายละเอียดรอบตรวจนับตาม ID
  async getCycleCountById(id: string) {
    const response = await apiClient.get(`/cycle-counts/${id}`);
    return response.data;
  },

  // เปิดรอบตรวจนับใหม่
  async createCycleCount(payload: CreateCycleCountPayload) {
    const response = await apiClient.post('/cycle-counts', payload);
    return response.data;
  },

  // ส่งผลการนับจริง
  async submitCount(id: string, payload: SubmitCountPayload) {
    const response = await apiClient.post(`/cycle-counts/${id}/submit-count`, payload);
    return response.data;
  },

  // ปิดรอบการนับและคำนวณผลต่าง
  async closeCycleCount(id: string) {
    const response = await apiClient.post(`/cycle-counts/${id}/close`);
    return response.data;
  },

  // อนุมัติการปรับยอดสต็อกตามผลต่าง
  async approveCycleCount(id: string) {
    const response = await apiClient.post(`/cycle-counts/${id}/approve`);
    return response.data;
  },
};
