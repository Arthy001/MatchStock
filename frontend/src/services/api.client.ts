import axios from 'axios';

// Base API URL จาก .env หรือ fallback ไปที่ Localhost Back-End
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
      // ถ้า Token หมดอายุ ให้เคลียร์และพาไปหน้า Login
      localStorage.removeItem('matchstock_token');
      localStorage.removeItem('matchstock_user');
      console.warn('Session expired. Please log in again.');
    }
    return Promise.reject(error);
  }
);
