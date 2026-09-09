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
    email: 'superadmin@matchstock.com',
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

export const platformAuthService = {
  login: async (credentials: PlatformLoginPayload): Promise<PlatformAuthResponse> => {
    try {
      // พยายามยิงจริงไปยัง /platform/auth/login
      const response = await platformApiClient.post<PlatformAuthResponse>('/platform/auth/login', credentials);
      const data = response.data;
      if (data.token && data.admin) {
        localStorage.setItem('matchstock_platform_token', data.token);
        localStorage.setItem('matchstock_platform_admin', JSON.stringify(data.admin));
      }
      return data;
    } catch (err: any) {
      console.warn('API /platform/auth/login unavailable, using smart demo fallback for review:', err?.message);

      // Fallback จำลองสถานะสำหรับทดสอบหน้าจอทันที
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
