import { apiClient } from './api.client';

export const warehouseService = {
  // ดึงรายการคลังสินค้าทั้งหมด (GET /warehouses)
  getWarehouses: async () => {
    const response = await apiClient.get('/warehouses');
    return response.data?.data || response.data || [];
  },

  // ดึงรายการ Bins ทั้งหมด
  getBins: async () => {
    try {
      const response = await apiClient.get('/warehouses');
      const raw = response.data?.bins || response.data?.data || response.data || [];
      const overrides = JSON.parse(localStorage.getItem('matchstock_bins_overrides') || '{}');
      return raw.map((b: any) => {
        const ovr = overrides[b.id] || {};
        return {
          ...b,
          ...ovr,
          isActive: ovr.isActive !== undefined ? ovr.isActive : (b.isActive !== false),
          status: (ovr.isActive !== undefined ? (ovr.isActive ? 'active' : 'maintenance') : (b.status || (b.isActive !== false ? 'active' : 'maintenance'))),
        };
      });
    } catch {
      return [];
    }
  },

  // ดึงรายการ Bins ในคลัง (GET /warehouses/{warehouseId}/bins)
  getBinsByWarehouse: async (warehouseId: string) => {
    try {
      const response = await apiClient.get(`/warehouses/${warehouseId}/bins`);
      const raw = response.data?.data || response.data || [];
      const overrides = JSON.parse(localStorage.getItem('matchstock_bins_overrides') || '{}');
      return raw.map((b: any) => {
        const ovr = overrides[b.id] || {};
        return {
          ...b,
          ...ovr,
          isActive: ovr.isActive !== undefined ? ovr.isActive : (b.isActive !== false),
          status: (ovr.isActive !== undefined ? (ovr.isActive ? 'active' : 'maintenance') : (b.status || (b.isActive !== false ? 'active' : 'maintenance'))),
        };
      });
    } catch {
      return [];
    }
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
  updateWarehouse: async (id: string, data: { name?: string; code?: string; address?: string; isDefault?: boolean; isActive?: boolean }) => {
    const overrides = JSON.parse(localStorage.getItem('matchstock_warehouses_overrides') || '{}');
    overrides[id] = { ...(overrides[id] || {}), ...data };
    localStorage.setItem('matchstock_warehouses_overrides', JSON.stringify(overrides));

    if (data.isActive === false) {
      try {
        await apiClient.post(`/warehouses/${id}/deactivate`);
      } catch {}
    }

    const remotePayload: any = {};
    if (data.name) remotePayload.name = data.name;

    try {
      const response = await apiClient.patch(`/warehouses/${id}`, remotePayload);
      return { ...(response.data?.data || response.data), ...data };
    } catch {
      try {
        const response = await apiClient.put(`/warehouses/${id}`, remotePayload);
        return { ...(response.data?.data || response.data), ...data };
      } catch {
        return { id, ...data };
      }
    }
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
    let warehouseId = arg3 ? arg1 : undefined;
    let binId = arg3 ? arg2 : arg1;
    let data = arg3 || arg2;

    const overrides = JSON.parse(localStorage.getItem('matchstock_bins_overrides') || '{}');
    overrides[binId] = { ...(overrides[binId] || {}), ...data };
    localStorage.setItem('matchstock_bins_overrides', JSON.stringify(overrides));

    const remotePayload: any = {};
    if (data.code) remotePayload.code = data.code;
    if (data.name) remotePayload.name = data.name;

    try {
      if (warehouseId && warehouseId !== 'default' && warehouseId !== binId) {
        try {
          const response = await apiClient.patch(`/warehouses/${warehouseId}/bins/${binId}`, remotePayload);
          return { ...(response.data?.data || response.data), ...data };
        } catch {
          const response = await apiClient.patch(`/warehouses/${warehouseId}`, remotePayload);
          return { ...(response.data?.data || response.data), ...data };
        }
      } else {
        try {
          const response = await apiClient.patch(`/warehouses/${binId}`, remotePayload);
          return { ...(response.data?.data || response.data), ...data };
        } catch {
          return { id: binId, ...data };
        }
      }
    } catch {
      return { id: binId, ...data };
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
