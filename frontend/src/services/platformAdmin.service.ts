import { platformApiClient } from './platformApi.client';
import {
  PlatformTenant,
  PlatformSubscriptionPlan,
  PlatformSubscription,
  PlatformDashboardMetrics,
  TenantStatus,
} from '../types/platform';

// Mock Initial Data เพื่อให้เปิดทดสอบ UI ได้ทันที
let MOCK_TENANTS: PlatformTenant[] = [
  {
    id: 't-001',
    name: 'Siam Foods Distribution Co., Ltd.',
    slug: 'siam-foods',
    contactEmail: 'admin@siamfoods.co.th',
    contactPhone: '02-888-1111',
    status: 'active',
    planCode: 'PRO_MONTHLY',
    userCount: 8,
    warehouseCount: 2,
    productCount: 4200,
    createdAt: '2026-06-15T08:30:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 't-002',
    name: 'Thai Electronics Supply Group',
    slug: 'thai-electronics',
    contactEmail: 'contact@thaielectro.com',
    contactPhone: '02-555-4321',
    status: 'active',
    planCode: 'ULTRA_MONTHLY',
    userCount: 35,
    warehouseCount: 6,
    productCount: 28500,
    createdAt: '2026-07-01T09:00:00.000Z',
    updatedAt: '2026-09-05T14:20:00.000Z',
  },
  {
    id: 't-003',
    name: 'Green Farm Logistics & Agro',
    slug: 'green-farm',
    contactEmail: 'ops@greenfarm.co.th',
    contactPhone: '053-123-789',
    status: 'active',
    planCode: 'FREE',
    userCount: 2,
    warehouseCount: 1,
    productCount: 340,
    createdAt: '2026-08-10T11:15:00.000Z',
    updatedAt: '2026-08-25T16:40:00.000Z',
  },
  {
    id: 't-004',
    name: 'Bangkok Modern Retail Corp.',
    slug: 'bkk-retail',
    contactEmail: 'it@bkkretail.com',
    contactPhone: '02-777-9999',
    status: 'suspended',
    planCode: 'PRO_MONTHLY',
    userCount: 10,
    warehouseCount: 3,
    productCount: 8900,
    createdAt: '2026-05-20T10:00:00.000Z',
    updatedAt: '2026-08-30T09:10:00.000Z',
  },
];

let MOCK_PLANS: PlatformSubscriptionPlan[] = [
  {
    id: 'plan-001',
    code: 'FREE',
    name: 'MatchStock Free',
    type: 'web',
    billingCycle: 'monthly',
    priceMinor: 0,
    currency: 'THB',
    trialDays: 0,
    description: 'เหมาะสำหรับร้านค้าปลีก/SME เริ่มต้น จัดการสต็อกพื้นฐาน 1 คลัง',
    features: ['products.basic', 'stock.gr_gi', 'barcode.scan', 'reports.stock_card'],
    maxUsers: 2,
    maxWarehouses: 1,
    maxProducts: 500,
    maxCompanies: 1,
    maxDevices: 0,
    maxTags: 0,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'plan-002',
    code: 'PRO_MONTHLY',
    name: 'MatchStock Pro',
    type: 'web',
    billingCycle: 'monthly',
    priceMinor: 199000, // 1,990.00 THB
    currency: 'THB',
    trialDays: 14,
    description: 'เหมาะสำหรับธุรกิจที่ต้องการคุม Lot/FEFO, โอนย้ายข้ามคลัง, และนับสต็อกแบบละเอียด',
    features: [
      'products.basic',
      'stock.gr_gi',
      'barcode.scan',
      'reports.stock_card',
      'warehouse.bins',
      'stock.lot_expiry',
      'stock.fefo',
      'stock.transfer',
      'stock.adjustment',
      'cycle_count.barcode',
      'sales_orders.manage',
      'reports.valuation',
      'reports.moving_analysis',
      'company.multi_branch',
    ],
    maxUsers: 10,
    maxWarehouses: 3,
    maxProducts: 10000,
    maxCompanies: 3,
    maxDevices: 0,
    maxTags: 0,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'plan-003',
    code: 'ULTRA_MONTHLY',
    name: 'MatchStock Ultra (Enterprise RFID)',
    type: 'web',
    billingCycle: 'monthly',
    priceMinor: 699000, // 6,990.00 THB
    currency: 'THB',
    trialDays: 14,
    description: 'ระบบอัจฉริยะแบบเต็มรูปแบบสำหรับคลังใหญ่ รองรับ RFID Tags, Telemetry, Custom RBAC และ API Webhook',
    features: [
      'products.basic',
      'stock.gr_gi',
      'barcode.scan',
      'reports.stock_card',
      'warehouse.bins',
      'stock.lot_expiry',
      'stock.fefo',
      'stock.transfer',
      'stock.adjustment',
      'cycle_count.barcode',
      'sales_orders.manage',
      'reports.valuation',
      'reports.moving_analysis',
      'company.multi_branch',
      'rfid.tags',
      'rfid.telemetry',
      'cycle_count.rfid_hybrid',
      'hardware.mqtt_devices',
      'rbac.custom_roles',
      'integrations.webhooks',
      'integrations.api_access',
    ],
    maxUsers: 9999,
    maxWarehouses: 9999,
    maxProducts: 999999,
    maxCompanies: 9999,
    maxDevices: 10,
    maxTags: 100000,
    isActive: true,
    sortOrder: 3,
  },
];

let MOCK_SUBSCRIPTIONS: PlatformSubscription[] = [
  {
    id: 'sub-001',
    tenantId: 't-001',
    tenantName: 'Siam Foods Distribution Co., Ltd.',
    planCode: 'PRO_MONTHLY',
    status: 'active',
    billingCycle: 'monthly',
    unitPriceMinor: 199000,
    currency: 'THB',
    currentPeriodStart: '2026-09-01T00:00:00.000Z',
    currentPeriodEnd: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'sub-002',
    tenantId: 't-002',
    tenantName: 'Thai Electronics Supply Group',
    planCode: 'ULTRA_MONTHLY',
    status: 'active',
    billingCycle: 'monthly',
    unitPriceMinor: 699000,
    currency: 'THB',
    currentPeriodStart: '2026-09-01T00:00:00.000Z',
    currentPeriodEnd: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'sub-003',
    tenantId: 't-003',
    tenantName: 'Green Farm Logistics & Agro',
    planCode: 'FREE',
    status: 'active',
    billingCycle: 'monthly',
    unitPriceMinor: 0,
    currency: 'THB',
    currentPeriodStart: '2026-08-10T00:00:00.000Z',
    currentPeriodEnd: '2027-08-10T00:00:00.000Z',
  },
  {
    id: 'sub-004',
    tenantId: 't-004',
    tenantName: 'Bangkok Modern Retail Corp.',
    planCode: 'PRO_MONTHLY',
    status: 'suspended',
    billingCycle: 'monthly',
    unitPriceMinor: 199000,
    currency: 'THB',
    currentPeriodStart: '2026-08-01T00:00:00.000Z',
    currentPeriodEnd: '2026-09-01T00:00:00.000Z',
  },
];

export const platformAdminService = {
  // 1. ภาพรวมตัวเลขตัวชี้วัด (Dashboard Overview)
  getDashboardMetrics: async (): Promise<PlatformDashboardMetrics> => {
    try {
      const res = await platformApiClient.get('/platform/dashboard/metrics');
      if (res.data?.data) return res.data.data;
    } catch {
      // Fallback
    }

    const totalTenants = MOCK_TENANTS.length;
    const activeTenants = MOCK_TENANTS.filter((t) => t.status === 'active').length;
    const suspendedTenants = MOCK_TENANTS.filter((t) => t.status === 'suspended').length;
    const totalUsers = MOCK_TENANTS.reduce((sum, t) => sum + t.userCount, 0);
    const totalWarehouses = MOCK_TENANTS.reduce((sum, t) => sum + t.warehouseCount, 0);
    const totalProducts = MOCK_TENANTS.reduce((sum, t) => sum + t.productCount, 0);
    const mrrMinor = MOCK_SUBSCRIPTIONS.filter((s) => s.status === 'active').reduce(
      (sum, s) => sum + s.unitPriceMinor,
      0
    );

    return {
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalUsers,
      totalWarehouses,
      totalProducts,
      mrrMinor,
      currency: 'THB',
      recentTenants: MOCK_TENANTS.slice(0, 5),
    };
  },

  // 2. จัดการผู้เช่า (Tenants)
  getTenants: async (params?: { search?: string; status?: string; planCode?: string }): Promise<PlatformTenant[]> => {
    try {
      const res = await platformApiClient.get('/platform/tenants', { params });
      if (Array.isArray(res.data?.data)) return res.data.data;
    } catch {
      // Fallback
    }

    let list = [...MOCK_TENANTS];
    if (params?.search) {
      const s = params.search.toLowerCase();
      list = list.filter(
        (t) => t.name.toLowerCase().includes(s) || t.slug.toLowerCase().includes(s) || t.contactEmail?.toLowerCase().includes(s)
      );
    }
    if (params?.status && params.status !== 'all') {
      list = list.filter((t) => t.status === params.status);
    }
    if (params?.planCode && params.planCode !== 'all') {
      list = list.filter((t) => t.planCode === params.planCode);
    }
    return list;
  },

  updateTenantStatus: async (tenantId: string, status: TenantStatus): Promise<boolean> => {
    try {
      await platformApiClient.patch(`/platform/tenants/${tenantId}/status`, { status });
    } catch {
      // Fallback
    }
    MOCK_TENANTS = MOCK_TENANTS.map((t) => (t.id === tenantId ? { ...t, status } : t));
    return true;
  },

  // 3. จัดการแผนบริการ (Subscription Plans)
  getSubscriptionPlans: async (): Promise<PlatformSubscriptionPlan[]> => {
    try {
      const res = await platformApiClient.get('/platform/subscription-plans');
      if (Array.isArray(res.data?.data)) return res.data.data;
    } catch {
      // Fallback
    }
    return [...MOCK_PLANS];
  },

  updateSubscriptionPlan: async (
    planId: string,
    data: Partial<PlatformSubscriptionPlan>
  ): Promise<PlatformSubscriptionPlan> => {
    try {
      const res = await platformApiClient.patch(`/platform/subscription-plans/${planId}`, data);
      if (res.data?.data) return res.data.data;
    } catch {
      // Fallback
    }
    MOCK_PLANS = MOCK_PLANS.map((p) => (p.id === planId ? { ...p, ...data } : p));
    return MOCK_PLANS.find((p) => p.id === planId)!;
  },

  // 4. บิลและการสมัครสมาชิกข้ามระบบ (Cross-tenant Subscriptions)
  getSubscriptions: async (): Promise<PlatformSubscription[]> => {
    try {
      const res = await platformApiClient.get('/platform/billing/subscriptions');
      if (Array.isArray(res.data?.data)) return res.data.data;
    } catch {
      // Fallback
    }
    return [...MOCK_SUBSCRIPTIONS];
  },
};
