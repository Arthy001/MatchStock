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
  createWarehouse: async (data: { code?: string; name: string; binCode?: string }) => {
    const response = await apiClient.post('/warehouses', data);
    return response.data;
  },

  // ลบคลังสินค้า
  deleteWarehouse: async (id: string) => {
    const response = await apiClient.delete(`/warehouses/${id}`);
    return response.data;
  },

  // อัปเดตคลังสินค้า
  updateWarehouse: async (id: string, data: { name?: string; code?: string }) => {
    const response = await apiClient.put(`/warehouses/${id}`, data);
    return response.data;
  },

  // สร้าง Bin ใหม่ในคลัง
  createBin: async (warehouseId: string, data: { code: string }) => {
    const response = await apiClient.post(`/warehouses/${warehouseId}/bins`, data);
    return response.data;
  },

  // อัปเดตตำแหน่ง Bin
  updateBin: async (id: string, data: { code: string }) => {
    const response = await apiClient.put(`/bins/${id}`, data);
    return response.data;
  },

  // ลบ Bin
  deleteBin: async (id: string) => {
    const response = await apiClient.delete(`/bins/${id}`);
    return response.data;
  },
};
