import { apiClient } from './api.client';
import { UserRole } from '../types';

export interface TenantUserItem {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  status: string;
  createdAt?: string;
  lastLoginAt?: string | null;
}

export const userService = {
  // 1. ดึงรายชื่อพนักงานทั้งหมดใน Tenant ปัจจุบันจาก Real API
  getUsers: async (): Promise<TenantUserItem[]> => {
    try {
      const response = await apiClient.get('/users');
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data.map((u: any) => ({
          id: u.id,
          name: u.fullName || u.name || (u.email ? u.email.split('@')[0] : 'User'),
          email: u.email || '',
          department: u.department || 'ฝ่ายปฏิบัติการคลังสินค้า',
          role: (u.role as UserRole) || 'warehouse_staff',
          status: u.isActive ? 'active' : 'inactive',
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch real users from API:', err);
      throw err;
    }
    return [];
  },

  // 2. ปรับเปลี่ยนบทบาท (Role) ของพนักงาน ผ่าน Real API
  updateUserRole: async (userId: string, newRole: UserRole): Promise<boolean> => {
    const res = await apiClient.patch(`/users/${userId}`, { role: newRole });
    return res.data?.success ?? true;
  },

  // 3. ปิดการใช้งานบัญชีพนักงาน (Deactivate) ผ่าน Real API
  deactivateUser: async (userId: string): Promise<boolean> => {
    const res = await apiClient.patch(`/users/${userId}/deactivate`);
    return res.data?.success ?? true;
  },

  // 4. เชิญ / สร้างผู้ใช้งานใหม่ใน Tenant ผ่าน Real API
  createUser: async (payload: {
    fullName?: string;
    name?: string;
    email: string;
    role: UserRole;
    department?: string;
  }): Promise<TenantUserItem> => {
    const finalName = payload.fullName || payload.name || (payload.email ? payload.email.split('@')[0] : 'User');
    const res = await apiClient.post('/users', {
      fullName: finalName,
      email: payload.email,
      role: payload.role,
      department: payload.department,
      password: 'TemporaryPassword123!',
    });
    const u = res.data?.data;
    return {
      id: u?.id || `usr-${Date.now()}`,
      name: u?.fullName || finalName,
      email: u?.email || payload.email,
      department: u?.department || payload.department || 'ฝ่ายคลังสินค้า',
      role: (u?.role as UserRole) || payload.role,
      status: u?.isActive ? 'active' : 'active',
      createdAt: u?.createdAt || new Date().toISOString(),
      lastLoginAt: u?.lastLoginAt,
    };
  },
};
