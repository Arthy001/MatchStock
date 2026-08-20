import { apiClient } from './api.client';

export const warehouseService = {
  // ดึงรายการคลังสินค้าทั้งหมด
  getWarehouses: async () => {
    const response = await apiClient.get('/warehouses');
    return response.data;
  },

  // ดึงรายการ Bins ในคลัง
  getBinsByWarehouse: async (warehouseId: string) => {
    const response = await apiClient.get(`/warehouses/${warehouseId}/bins`);
    return response.data;
  },

  // สร้างคลังสินค้าใหม่
  createWarehouse: async (data: { code: string; name: string }) => {
    const response = await apiClient.post('/warehouses', data);
    return response.data;
  },

  // สร้าง Bin ใหม่ในคลัง
  createBin: async (warehouseId: string, data: { code: string }) => {
    const response = await apiClient.post(`/warehouses/${warehouseId}/bins`, data);
    return response.data;
  },
};
