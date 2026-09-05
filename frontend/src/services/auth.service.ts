import { apiClient, API_BASE_URL } from './api.client';
import axios from 'axios';
import { masterDataCache } from '../features/common/cache/useMasterDataCache';

export interface LoginPayload {
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
  features?: string[];
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  user?: BackendUser;
  tenant?: { id: string; name?: string; companyName?: string; status?: string };
  subscription?: BackendSubscription;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    user?: BackendUser;
    tenant?: { id: string; name?: string };
    subscription?: BackendSubscription;
  };
}

export const authService = {
  // 1. เข้าสู่ระบบผ่าน API ตาม OpenAPI Spec (/api/v1/auth/login)
  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    try {
      const payload: Record<string, any> = {
        email: credentials.email,
        password: credentials.password,
      };

      const response = await apiClient.post<AuthResponse>('/auth/login', payload);
      const resData = response.data;
      
      const token = resData.accessToken || resData.token || resData.data?.accessToken;
      const refreshToken = resData.refreshToken || resData.data?.refreshToken;
      const user = resData.user || resData.data?.user;
      const tenantId = user?.tenantId || resData.tenant?.id || resData.data?.tenant?.id;

      if (token) {
        localStorage.setItem('matchstock_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('matchstock_refresh_token', refreshToken);
      }
      if (tenantId) {
        localStorage.setItem('matchstock_tenant_id', tenantId);
      }
      if (user) {
        localStorage.setItem('matchstock_user', JSON.stringify(user));
      }

      // Mark success flag if not present
      if (resData.success === undefined) {
        resData.success = true;
      }

      // Invalidate memory cache on login so new tenant data is always fresh
      masterDataCache.invalidate();

      return resData;
    } catch (error: any) {
      console.error('API Login failed with response data:', error.response?.data || error.message);
      throw error;
    }
  },

  // 2. ต่ออายุ Access Token ผ่าน Refresh Token (/api/v1/auth/refresh)
  refreshToken: async (): Promise<{ accessToken: string; refreshToken?: string }> => {
    const currentRefreshToken = localStorage.getItem('matchstock_refresh_token');
    if (!currentRefreshToken) {
      throw new Error('No refresh token available in storage');
    }

    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken: currentRefreshToken,
    });

    const resData = response.data;
    const newAccessToken = resData.accessToken || resData.token || resData.data?.accessToken;
    const newRefreshToken = resData.refreshToken || resData.data?.refreshToken;

    if (!newAccessToken) {
      throw new Error('Failed to obtain new access token from refresh endpoint');
    }

    localStorage.setItem('matchstock_token', newAccessToken);
    if (newRefreshToken) {
      localStorage.setItem('matchstock_refresh_token', newRefreshToken);
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  // 3. ดึงข้อมูล User Profile และ Feature Flags ปัจจุบัน
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // 4. ออกจากระบบ (แจ้ง Server เพื่อ Revoke Refresh Token และล้าง Storage & In-Memory Cache)
  logout: async () => {
    const currentRefreshToken = localStorage.getItem('matchstock_refresh_token');
    if (currentRefreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken: currentRefreshToken });
      } catch (err) {
        // Silently catch in case offline or already expired
        console.warn('Backend logout notification skipped or failed:', err);
      }
    }

    localStorage.removeItem('matchstock_token');
    localStorage.removeItem('matchstock_refresh_token');
    localStorage.removeItem('matchstock_tenant_id');
    localStorage.removeItem('matchstock_user');

    // Completely purge In-Memory RAM Cache to eliminate cross-user tenant data leakage
    masterDataCache.invalidate();
  },
};
