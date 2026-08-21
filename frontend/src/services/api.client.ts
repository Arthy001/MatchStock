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
    const tenantId = localStorage.getItem('matchstock_tenant_id');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: จัดการ Error มาตรฐาน (401 Unauthorized, 403 Forbidden)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('matchstock_token');
      localStorage.removeItem('matchstock_tenant_id');
      localStorage.removeItem('matchstock_user');
      console.warn('Session expired or unauthorized. Please log in again.');
    }
    return Promise.reject(error);
  }
);
