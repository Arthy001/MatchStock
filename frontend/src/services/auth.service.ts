import { apiClient } from './api.client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'admin' | 'manager' | 'warehouse_staff' | 'purchasing_staff';
  };
  tenant: {
    id: string;
    companyName: string;
    status: string;
  };
  subscription?: {
    planCode: string;
    planName: string;
    status: string;
    features: {
      hasLotTracking: boolean;
      hasBarcodeScanner: boolean;
      hasCycleCount: boolean;
      hasAnalyticsReports: boolean;
      hasImportExport: boolean;
      hasApiAccess: boolean;
    };
  };
}

export const authService = {
  // 1. เข้าสู่ระบบผ่าน API จริง
  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      if (response.data.success && response.data.token) {
        localStorage.setItem('matchstock_token', response.data.token);
        localStorage.setItem('matchstock_tenant_id', response.data.tenant.id);
        localStorage.setItem('matchstock_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('API Login failed, returning error or check fallback', error);
      throw error;
    }
  },

  // 2. ดึงข้อมูล User Profile และ Feature Flags ปัจจุบัน
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // 3. ออกจากระบบ
  logout: () => {
    localStorage.removeItem('matchstock_token');
    localStorage.removeItem('matchstock_tenant_id');
    localStorage.removeItem('matchstock_user');
  },
};
