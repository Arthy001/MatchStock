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
  updateWarehouse: async (id: string, data: { name?: string; code?: string; address?: string; isDefault?: boolean; isActive?: boolean }) => {
    const remotePayload: any = {};
    if (data.name !== undefined) remotePayload.name = data.name;
    if (data.code !== undefined) remotePayload.code = data.code;
    if (data.address !== undefined) remotePayload.address = data.address;
    if (data.isDefault !== undefined) remotePayload.isDefault = data.isDefault;
    if (data.isActive !== undefined) remotePayload.isActive = data.isActive;

    const response = await apiClient.patch(`/warehouses/${id}`, remotePayload);
    return response.data?.data || response.data;
  },

  // ลบ/ปิดการใช้งานคลังสินค้า (POST /warehouses/{id}/deactivate หรือ DELETE /warehouses/{id})
  deleteWarehouse: async (id: string) => {
    try {
      const response = await apiClient.post(`/warehouses/${id}/deactivate`);
      return response.data?.data || response.data;
    } catch {
      const response = await apiClient.delete(`/warehouses/${id}`);
      return response.data?.data || response.data;
    }
  },

  // สร้าง Bin ใหม่ในคลัง (POST /warehouses/{warehouseId}/bins)
  createBin: async (warehouseId: string, data: { code: string; zone?: string; rack?: string; shelf?: string; capacityKg?: number; maxCapacity?: number; description?: string }) => {
    const response = await apiClient.post(`/warehouses/${warehouseId}/bins`, data);
    return response.data?.data || response.data;
  },

  // อัปเดตตำแหน่ง Bin
  updateBin: async (arg1: string, arg2: any, arg3?: any) => {
    let warehouseId = arg3 ? arg1 : undefined;
    let binId = arg3 ? arg2 : arg1;
    let data = arg3 || arg2;

    const remotePayload: any = {};
    if (data.code !== undefined) remotePayload.code = data.code;
    if (data.name !== undefined) remotePayload.name = data.name;
    if (data.zone !== undefined) remotePayload.zone = data.zone;
    if (data.zoneName !== undefined) remotePayload.zoneName = data.zoneName;
    if (data.rack !== undefined) remotePayload.rack = data.rack;
    if (data.shelf !== undefined) remotePayload.shelf = data.shelf;
    if (data.capacityKg !== undefined) remotePayload.capacityKg = data.capacityKg;
    if (data.maxCapacity !== undefined) remotePayload.maxCapacity = data.maxCapacity;
    if (data.isActive !== undefined) remotePayload.isActive = data.isActive;

    if (warehouseId && warehouseId !== 'default' && warehouseId !== binId) {
      const response = await apiClient.patch(`/warehouses/${warehouseId}/bins/${binId}`, remotePayload).catch(async () => {
        return (await apiClient.patch(`/bins/${binId}`, remotePayload)).data?.data;
      });
      return response.data?.data || response.data || response;
    } else {
      // Editing warehouse directly
      const response = await apiClient.patch(`/warehouses/${binId}`, remotePayload).catch(async () => {
        return (await apiClient.patch(`/bins/${binId}`, remotePayload)).data?.data;
      });
      return response.data?.data || response.data || response;
    }
  },

  // ลบ/ปิดการใช้งาน Bin (หรือคลังสินค้าเอง ถ้าเรียกแบบ 1 argument - ดู updateBin ด้านบนที่ทำแบบเดียวกัน)
  deleteBin: async (arg1: string, arg2?: string) => {
    const warehouseId = arg2 ? arg1 : undefined;
    const binId = arg2 || arg1;
    // ไม่มี warehouseId แยก = โมดัลนี้กำลังแก้/ลบ "คลังสินค้า" เองตรงๆ (ไม่ใช่ bin ในคลัง)
    // เดิมจุดนี้ใส่ warehouseId เป็น string "default" ไปตรงๆ ทำให้ยิง
    // /warehouses/default/bins/{id}/... ซึ่งไม่ใช่ id จริง (500/404 จริงที่เจอ)
    if (!warehouseId || warehouseId === binId) {
      try {
        const response = await apiClient.post(`/warehouses/${binId}/deactivate`);
        return response.data?.data || response.data;
      } catch {
        const response = await apiClient.delete(`/warehouses/${binId}`);
        return response.data?.data || response.data;
      }
    }
    try {
      const response = await apiClient.post(`/warehouses/${warehouseId}/bins/${binId}/deactivate`);
      return response.data?.data || response.data;
    } catch {
      const response = await apiClient.delete(`/warehouses/${warehouseId}/bins/${binId}`);
      return response.data?.data || response.data;
    }
  },

  // บันทึกรายการ Bins แบบชุดใหญ่ (POST /warehouses/{warehouseId}/bins/batch)
  batchSaveBins: async (
    warehouseId: string,
    payload: {
      mode: 'overwrite' | 'merge';
      bins: Array<{
        binCode: string;
        zone?: string;
        rack?: string;
        shelf?: string;
        capacityKg?: number;
        maxCapacity?: number;
        status?: 'available' | 'full' | 'maintenance';
        isActive?: boolean;
      }>;
    }
  ) => {
    const response = await apiClient.post(`/warehouses/${warehouseId}/bins/batch`, payload);
    return response.data?.data || response.data;
  },

  // บันทึกแปลนภาพพิมพ์เขียว CAD/2D และโครงสร้าง 3D (PUT /warehouses/{warehouseId}/blueprint)
  updateBlueprint: async (
    warehouseId: string,
    payload: {
      blueprintUrl: string;
      opacity?: number;
      dimensions?: {
        widthMeters?: number;
        depthMeters?: number;
      };
      zonesConfig?: Record<string, any>;
      walls?: Array<{
        id: string;
        startX: number;
        startZ: number;
        endX: number;
        endZ: number;
        heightMeters?: number;
        thicknessMeters?: number;
      }>;
      doors?: Array<{
        id: string;
        x: number;
        z: number;
        widthMeters?: number;
        heightMeters?: number;
        type?: 'dock' | 'entrance' | 'emergency_exit';
      }>;
      [key: string]: any;
    }
  ) => {
    const response = await apiClient.put(`/warehouses/${warehouseId}/blueprint`, payload);
    return response.data?.data || response.data;
  },
};
