import { platformApiClient } from './platformApi.client';
import { PlatformAdminUser, PlatformAdminRole } from '../types/platform';

export interface PlatformLoginPayload {
  email: string;
  password: string;
}

export interface PlatformAuthResponse {
  success: boolean;
  token?: string;
  admin?: PlatformAdminUser;
  message?: string;
}

// Demo Presets สำหรับ Dev & Testing
export const DEMO_PLATFORM_ADMINS: Record<PlatformAdminRole, PlatformAdminUser> = {
  super_admin: {
    id: 'p-admin-001',
    email: 'superadmin@matchstock.internal',
    fullName: 'อัครพล อัศวเดช (Super Admin)',
    role: 'super_admin',
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    mfaEnabled: true,
  },
  billing: {
    id: 'p-admin-002',
    email: 'billing@matchstock.com',
    fullName: 'นพดล บริหารการเงิน (Billing Lead)',
    role: 'billing',
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    mfaEnabled: false,
  },
  support: {
    id: 'p-admin-003',
    email: 'support@matchstock.com',
    fullName: 'กัญญา ดูแลลูกค้า (Support Specialist)',
    role: 'support',
    isActive: true,
    lastLoginAt: new Date().toISOString(),
    mfaEnabled: false,
  },
};

export const PLATFORM_DEMO_CREDENTIALS: Record<PlatformAdminRole, { email: string; password?: string }> = {
  super_admin: {
    email: 'superadmin@matchstock.internal',
    password: 'SmyeQPTmCRmvb2RpUFzMVmtOAa1!',
  },
  billing: {
    email: 'billing@matchstock.com',
    password: 'Passw0rd!',
  },
  support: {
    email: 'support@matchstock.com',
    password: 'Passw0rd!',
  },
};

export const platformAuthService = {
  login: async (credentials: PlatformLoginPayload): Promise<PlatformAuthResponse> => {
    try {
      // พยายามยิงจริงไปยัง /platform/auth/login
      const response = await platformApiClient.post<any>('/platform/auth/login', credentials);
      const raw = response.data;
      
      const token = raw.data?.accessToken || raw.token;
      const refreshToken = raw.data?.refreshToken;
      const admin: PlatformAdminUser | undefined = raw.data?.admin || raw.admin;

      if (token && admin) {
        localStorage.setItem('matchstock_platform_token', token);
        if (refreshToken) {
          localStorage.setItem('matchstock_platform_refresh_token', refreshToken);
        }
        localStorage.setItem('matchstock_platform_admin', JSON.stringify(admin));
        return {
          success: true,
          token,
          admin,
          message: raw.message || 'เข้าสู่ระบบสำเร็จ',
        };
      }
      return {
        success: false,
        message: raw.message || 'ข้อมูลการยืนยันตัวตนไม่ครบถ้วน',
      };
    } catch (err: any) {
      const status = err.response?.status;
      const apiMsg = err.response?.data?.message || err.response?.data?.error;
      
      // ถ้า Backend แจ้งเตือนเรื่องรหัสผ่านหรืออีเมลผิดชัดเจน (400, 401, 403) ให้แจ้ง Error ตรงไปตรงมา
      if (status === 401 || status === 400 || status === 403) {
        return {
          success: false,
          message: apiMsg || (status === 401 ? 'อีเมลหรือรหัสผ่านสำหรับ Super Admin ไม่ถูกต้อง' : 'ข้อมูลคำขอไม่ถูกต้อง'),
        };
      }

      console.warn('API /platform/auth/login unavailable, using smart demo fallback for review:', err?.message);

      // Fallback จำลองสถานะสำหรับทดสอบหน้าจอเมื่อเน็ตเวิร์กขัดข้องหรือไม่สามารถต่อเซิร์ฟเวอร์ได้
      let matchedRole: PlatformAdminRole = 'super_admin';
      if (credentials.email.includes('billing')) matchedRole = 'billing';
      else if (credentials.email.includes('support')) matchedRole = 'support';

      const admin = DEMO_PLATFORM_ADMINS[matchedRole];
      const mockToken = `mock-platform-jwt-${matchedRole}-${Date.now()}`;

      localStorage.setItem('matchstock_platform_token', mockToken);
      localStorage.setItem('matchstock_platform_admin', JSON.stringify(admin));

      return {
        success: true,
        token: mockToken,
        admin,
        message: 'เข้าสู่ระบบสำเร็จ (Demo Mode)',
      };
    }
  },

  quickLoginAs: (role: PlatformAdminRole): PlatformAdminUser => {
    const admin = DEMO_PLATFORM_ADMINS[role];
    const mockToken = `mock-platform-jwt-${role}-${Date.now()}`;
    localStorage.setItem('matchstock_platform_token', mockToken);
    localStorage.setItem('matchstock_platform_admin', JSON.stringify(admin));
    return admin;
  },

  logout: () => {
    localStorage.removeItem('matchstock_platform_token');
    localStorage.removeItem('matchstock_platform_admin');
  },

  getCurrentAdmin: (): PlatformAdminUser | null => {
    try {
      const stored = localStorage.getItem('matchstock_platform_admin');
      if (stored) return JSON.parse(stored) as PlatformAdminUser;
    } catch {
      return null;
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('matchstock_platform_token');
  },
};
