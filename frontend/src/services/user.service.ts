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

// Initial demo users for offline/review testing
let MOCK_TENANT_USERS: TenantUserItem[] = [
  {
    id: 'u-001',
    name: 'สมศักดิ์ ผู้ดูแลระบบ (Admin)',
    email: 'admin@siamfoods.co.th',
    department: 'ฝ่ายเทคโนโลยีสารสนเทศ (IT & System)',
    role: 'admin',
    status: 'active',
    createdAt: '2026-06-01T08:00:00.000Z',
    lastLoginAt: '2026-09-09T09:15:00.000Z',
  },
  {
    id: 'u-002',
    name: 'มนัส ผู้จัดการคลัง (Manager)',
    email: 'manager@siamfoods.co.th',
    department: 'ฝ่ายบริหารจัดการคลังสินค้า (Warehouse Ops)',
    role: 'manager',
    status: 'active',
    createdAt: '2026-06-10T10:30:00.000Z',
    lastLoginAt: '2026-09-09T08:45:00.000Z',
  },
  {
    id: 'u-003',
    name: 'วิชัย พนักงานคลังสินค้า (Staff)',
    email: 'whstaff@siamfoods.co.th',
    department: 'ฝ่ายปฏิบัติการคลังและสแกน (Stock In/Out)',
    role: 'warehouse_staff',
    status: 'active',
    createdAt: '2026-07-01T09:00:00.000Z',
    lastLoginAt: '2026-09-08T17:20:00.000Z',
  },
  {
    id: 'u-004',
    name: 'พรทิพย์ เจ้าหน้าที่จัดซื้อ (Purchaser)',
    email: 'purchasing@siamfoods.co.th',
    department: 'ฝ่ายจัดซื้อและผู้จัดจำหน่าย (Procurement)',
    role: 'purchasing_staff',
    status: 'active',
    createdAt: '2026-07-15T11:00:00.000Z',
    lastLoginAt: '2026-09-09T10:10:00.000Z',
  },
];

export const userService = {
  // 1. ดึงรายชื่อพนักงานทั้งหมดใน Tenant ปัจจุบัน
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
    } catch {
      // Fallback สำหรับกรณี Offline / Dev
    }
    return [...MOCK_TENANT_USERS];
  },

  // 2. ปรับเปลี่ยนบทบาท (Role) ของพนักงาน
  updateUserRole: async (userId: string, newRole: UserRole): Promise<boolean> => {
    try {
      await apiClient.patch(`/users/${userId}`, { role: newRole });
    } catch {
      // Fallback
    }
    MOCK_TENANT_USERS = MOCK_TENANT_USERS.map((u) =>
      u.id === userId ? { ...u, role: newRole } : u
    );
    return true;
  },

  // 3. ปิดการใช้งานบัญชีพนักงาน (Deactivate)
  deactivateUser: async (userId: string): Promise<boolean> => {
    try {
      await apiClient.patch(`/users/${userId}/deactivate`);
    } catch {
      // Fallback
    }
    MOCK_TENANT_USERS = MOCK_TENANT_USERS.filter((u) => u.id !== userId);
    return true;
  },

  // 4. เชิญ / สร้างผู้ใช้งานใหม่ใน Tenant
  createUser: async (payload: {
    fullName?: string;
    name?: string;
    email: string;
    role: UserRole;
    department?: string;
  }): Promise<TenantUserItem> => {
    const finalName = payload.fullName || payload.name || (payload.email ? payload.email.split('@')[0] : 'User');
    try {
      const res = await apiClient.post('/users', {
        fullName: finalName,
        email: payload.email,
        role: payload.role,
        department: payload.department,
        password: 'TemporaryPassword123!',
      });
      if (res.data?.data) {
        return res.data.data;
      }
    } catch {
      // Fallback
    }

    const newUser: TenantUserItem = {
      id: `u-${Date.now()}`,
      name: finalName,
      email: payload.email,
      department: payload.department || 'ฝ่ายคลังสินค้า',
      role: payload.role,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    MOCK_TENANT_USERS.unshift(newUser);
    return newUser;
  },
};
