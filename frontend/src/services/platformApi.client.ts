import axios from 'axios';
import { API_BASE_URL } from './api.client';

export const platformApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: แนบ Platform Admin JWT Token เสมอ และ "ห้าม" แนบ x-tenant-id
platformApiClient.interceptors.request.use(
  (config) => {
    const platformToken = localStorage.getItem('matchstock_platform_token');
    if (platformToken) {
      config.headers.Authorization = `Bearer ${platformToken}`;
    }
    // Make sure x-tenant-id is never sent for platform operations
    delete config.headers['x-tenant-id'];
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: จัดการ Error 401 ของ Platform Admin
platformApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Platform Admin session expired or invalid.');
      // Optional: Auto clear platform tokens on 401
      localStorage.removeItem('matchstock_platform_token');
      localStorage.removeItem('matchstock_platform_admin');
    }
    return Promise.reject(error);
  }
);
