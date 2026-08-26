import axios from 'axios';

const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocalDev ? '/api/v1' : 'https://match-stock.ddns.net/api/v1');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: แนบ JWT Token และ Tenant ID ไปกับทุก Request อัตโนมัติ
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('matchstock_token');
    const tenantId =
      localStorage.getItem('matchstock_tenant_id') || 'f97fe2dc-486e-4054-931c-aadf92823e69';

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['x-tenant-id'] = tenantId;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: จัดการ Error มาตรฐาน และ Auto-Logout เมื่อ Session หมดอายุ (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest && typeof window !== 'undefined') {
        localStorage.removeItem('matchstock_token');
        localStorage.removeItem('matchstock_user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);
