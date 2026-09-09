export type PlatformAdminRole = 'super_admin' | 'billing' | 'support';

export interface PlatformAdminUser {
  id: string;
  email: string;
  fullName: string;
  role: PlatformAdminRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  mfaEnabled?: boolean;
}

export type TenantStatus = 'active' | 'suspended';

export interface PlatformTenant {
  id: string;
  name: string;
  slug: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status: TenantStatus;
  planCode: string;
  userCount: number;
  warehouseCount: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSubscriptionPlan {
  id: string;
  code: string;
  name: string;
  type: 'web' | 'hardware';
  billingCycle: 'monthly' | 'yearly';
  priceMinor: number;
  currency: string;
  trialDays: number;
  description?: string | null;
  features?: string[];
  maxUsers?: number | null;
  maxWarehouses?: number | null;
  maxProducts?: number | null;
  maxCompanies?: number | null;
  maxDevices?: number | null;
  maxTags?: number | null;
  isActive: boolean;
  sortOrder: number;
}

export interface PlatformSubscription {
  id: string;
  tenantId: string;
  tenantName: string;
  planCode: string;
  status: string;
  billingCycle: 'monthly' | 'yearly';
  unitPriceMinor: number;
  currency: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

export interface PlatformDashboardMetrics {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  totalUsers: number;
  totalWarehouses: number;
  totalProducts: number;
  mrrMinor: number;
  currency: string;
  recentTenants: PlatformTenant[];
}

export type PlatformTabKey = 'dashboard' | 'tenants' | 'plans' | 'billing' | 'admins';

export const PlatformPermissions = {
  canManageAdmins: (role: PlatformAdminRole): boolean => role === 'super_admin',
  canSuspendTenants: (role: PlatformAdminRole): boolean => role === 'super_admin',
  canManagePlans: (role: PlatformAdminRole): boolean => role === 'super_admin' || role === 'billing',
  canViewBilling: (role: PlatformAdminRole): boolean => role === 'super_admin' || role === 'billing',
  canViewTenants: (role: PlatformAdminRole): boolean => role === 'super_admin' || role === 'support',
  canViewFinancialMetrics: (role: PlatformAdminRole): boolean => role === 'super_admin' || role === 'billing',
};

