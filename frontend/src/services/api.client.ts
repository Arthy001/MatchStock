import axios, { AxiosRequestConfig, AxiosError } from 'axios';

const isLocalDev =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (isLocalDev ? '/api/v1' : 'https://match-stock.ddns.net/api/v1');

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
    
    // Dynamically retrieve tenantId from user session object or storage
    let tenantId = localStorage.getItem('matchstock_tenant_id');
    if (!tenantId) {
      try {
        const userStr = localStorage.getItem('matchstock_user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          tenantId = userObj?.tenantId || userObj?.tenant_id;
        }
      } catch {}
    }

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

// State สำหรับจัดการ Silent Token Refresh และ Request Queuing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: จัดการ Error มาตรฐาน และ Auto Silent Refresh เมื่อ 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // หากเกิด 401 Unauthorized และยังไม่ได้ retry
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const url = originalRequest.url || '';
      const isAuthEndpoint =
        url.includes('/auth/login') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/logout');

      // ถ้าเป็น endpoint เกี่ยวกับ auth โดยตรง ไม่ต้องพยายาม refresh
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem('matchstock_refresh_token');

      // ถ้าไม่มี refresh token ให้ทำการ logout ทันที
      if (!refreshToken) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('matchstock_token');
          localStorage.removeItem('matchstock_refresh_token');
          localStorage.removeItem('matchstock_user');
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(error);
      }

      // ถ้ากำลังอยู่ในกระบวนการ refresh ให้เข้าคิวรอ
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ยิงขอ Token ใหม่ผ่าน POST /api/v1/auth/refresh
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const resData = refreshResponse.data;
        const newAccessToken =
          resData.accessToken || resData.token || resData.data?.accessToken;
        const newRefreshToken = resData.refreshToken || resData.data?.refreshToken;

        if (!newAccessToken) {
          throw new Error('No access token returned from refresh');
        }

        // อัปเดต Token ใน localStorage
        localStorage.setItem('matchstock_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('matchstock_refresh_token', newRefreshToken);
        }

        // อัปเดต Authorization header ใน original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // ปล่อยคิวคำขอที่รออยู่ทั้งหมด
        processQueue(null, newAccessToken);

        // ดำเนินการยิงคำขอเดิมซ้ำอีกครั้งด้วย Token ใหม่
        return apiClient(originalRequest);
      } catch (refreshErr) {
        // หาก Refresh Token หมดอายุหรือล้มเหลว ล้าง Session และส่งไปหน้า Login
        processQueue(refreshErr, null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('matchstock_token');
          localStorage.removeItem('matchstock_refresh_token');
          localStorage.removeItem('matchstock_user');
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // จัดการ 403 Forbidden (Quota Exceeded หรือ Feature Not Included ในแพ็กเกจปัจจุบัน)
    if (error.response?.status === 403 && typeof window !== 'undefined') {
      const data: any = error.response.data;
      if (data && (data.error === 'FEATURE_NOT_INCLUDED' || data.error === 'QUOTA_EXCEEDED')) {
        window.dispatchEvent(new CustomEvent('billing:upgrade-required', { detail: data }));
      }
    }

    return Promise.reject(error);
  }
);
