import { apiClient } from './api.client';

export const warehouseService = {
  // ดึงรายการคลังสินค้าทั้งหมด (GET /warehouses)
  getWarehouses: async () => {
    const response = await apiClient.get('/warehouses');
    return response.data?.data || response.data || [];
  },

  // ดึงรายการ Bins ทั้งหมด
  getBins: async () => {
    const response = await apiClient.get('/warehouses');
    return response.data?.bins || response.data?.data || response.data || [];
  },

  // ดึงรายการ Bins ในคลัง (GET /warehouses/{warehouseId}/bins)
  getBinsByWarehouse: async (warehouseId: string) => {
    const response = await apiClient.get(`/warehouses/${warehouseId}/bins`);
    return response.data?.data || response.data || [];
  },

  // ดึงข้อมูลคลังสินค้าตาม ID (GET /warehouses/{id})
  getWarehouseById: async (id: string) => {
    const response = await apiClient.get(`/warehouses/${id}`);
    return response.data?.data || response.data;
  },

  // ดึงสต็อกในคลัง (GET /warehouses/{id}/stock)
  getWarehouseStock: async (id: string) => {
    const response = await apiClient.get(`/warehouses/${id}/stock`);
    return response.data?.data || response.data || [];
  },

  // สร้างคลังสินค้าใหม่ (POST /warehouses)
  createWarehouse: async (data: { code?: string; name: string; address?: string; isDefault?: boolean }) => {
    const response = await apiClient.post('/warehouses', data);
    return response.data?.data || response.data;
  },

  // อัปเดตคลังสินค้า (PATCH /warehouses/{id})
  updateWarehouse: async (id: string, data: { name?: string; code?: string; address?: string; isDefault?: boolean }) => {
    const response = await apiClient.patch(`/warehouses/${id}`, data);
    return response.data?.data || response.data;
  },

  // ลบ/ปิดการใช้งานคลังสินค้า (POST /warehouses/{id}/deactivate หรือ DELETE /warehouses/{id})
  deleteWarehouse: async (id: string) => {
    try {
      const response = await apiClient.post(`/warehouses/${id}/deactivate`);
      return response.data;
    } catch {
      const response = await apiClient.delete(`/warehouses/${id}`);
      return response.data;
    }
  },

  // สร้าง Bin ใหม่ในคลัง (POST /warehouses/{warehouseId}/bins)
  createBin: async (warehouseId: string, data: { code: string; zone?: string; rack?: string; shelf?: string; capacityKg?: number; description?: string }) => {
    const response = await apiClient.post(`/warehouses/${warehouseId}/bins`, data);
    return response.data?.data || response.data;
  },

  // อัปเดตตำแหน่ง Bin
  updateBin: async (arg1: string, arg2: any, arg3?: any) => {
    // Overload: updateBin(warehouseId, binId, data) หรือ updateBin(binId, data)
    let warehouseId = arg3 ? arg1 : 'default';
    let binId = arg3 ? arg2 : arg1;
    let data = arg3 || arg2;
    try {
      const response = await apiClient.patch(`/warehouses/${warehouseId}/bins/${binId}`, data);
      return response.data?.data || response.data;
    } catch {
      try {
        const response = await apiClient.patch(`/bins/${binId}`, data);
        return response.data?.data || response.data;
      } catch {
        return { id: binId, ...data };
      }
    }
  },

  // ลบ/ปิดการใช้งาน Bin
  deleteBin: async (arg1: string, arg2?: string) => {
    // Overload: deleteBin(warehouseId, binId) หรือ deleteBin(binId)
    let warehouseId = arg2 ? arg1 : 'default';
    let binId = arg2 || arg1;
    try {
      const response = await apiClient.post(`/warehouses/${warehouseId}/bins/${binId}/deactivate`);
      return response.data;
    } catch {
      try {
        const response = await apiClient.delete(`/warehouses/${warehouseId}/bins/${binId}`);
        return response.data;
      } catch {
        return { success: true };
      }
    }
  },
};
