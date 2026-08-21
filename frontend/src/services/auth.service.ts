import { apiClient } from './api.client';

export interface LoginPayload {
  tenantSlug: string;
  email: string;
  password: string;
}

export interface BackendUser {
  id: string;
  email: string;
  fullName?: string;
  role: 'admin' | 'owner' | 'manager' | 'warehouse_staff' | 'purchasing_staff' | string;
  tenantId: string;
}

export interface BackendSubscription {
  planCode: string;
  status: string;
  features: string[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken?: string;
    user: BackendUser;
    subscription?: BackendSubscription;
  };
  token?: string; // For backward compatibility
  user?: BackendUser;
  tenant?: { id: string; companyName: string; status: string };
}

export const authService = {
  // 1. เข้าสู่ระบบผ่าน API จริง
  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      const resData = response.data;
      
      const token = resData.data?.accessToken || resData.token;
      const tenantId = resData.data?.user?.tenantId || resData.tenant?.id;
      const user = resData.data?.user || resData.user;

      if (token) {
        localStorage.setItem('matchstock_token', token);
      }
      if (tenantId) {
        localStorage.setItem('matchstock_tenant_id', tenantId);
      }
      if (user) {
        localStorage.setItem('matchstock_user', JSON.stringify(user));
      }
      return resData;
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
