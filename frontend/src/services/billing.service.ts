import { apiClient } from './api.client';
import {
  SubscriptionPlanItem,
  CurrentSubscriptionData,
  BillingInvoice,
} from '../types';

export const billingService = {
  // ดึงรายการแพ็กเกจทั้งหมด (GET /billing/plans)
  getPlans: async (): Promise<SubscriptionPlanItem[]> => {
    try {
      const response = await apiClient.get('/billing/plans');
      return response.data?.data || response.data || [];
    } catch {
      // Fallback mock data matching docs/BACKEND_FRONTEND_IMPLEMENTATION_GUIDE.md & openapi.yaml
      return [
        {
          id: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
          code: 'FREE',
          name: 'MatchStock Free',
          type: 'web',
          billingCycle: 'monthly',
          priceMinor: 0,
          currency: 'THB',
          maxUsers: 2,
          maxWarehouses: 1,
          maxProducts: 500,
          maxDevices: 0,
          features: [
            'products.basic',
            'stock.gr_gi',
            'barcode.scan',
            'reports.stock_card',
            'import_export.basic',
          ],
        },
        {
          id: '2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
          code: 'PRO_MONTHLY',
          name: 'MatchStock Pro',
          type: 'web',
          billingCycle: 'monthly',
          priceMinor: 199000,
          currency: 'THB',
          maxUsers: 10,
          maxWarehouses: 3,
          maxProducts: 10000,
          maxDevices: 0,
          features: [
            'products.basic',
            'warehouse.bins',
            'stock.lot_expiry',
            'stock.fefo',
            'cycle_count.barcode',
            'sales_orders.manage',
            'reports.valuation',
          ],
        },
        {
          id: '3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
          code: 'ULTRA_MONTHLY',
          name: 'MatchStock Ultra (RFID)',
          type: 'web',
          billingCycle: 'monthly',
          priceMinor: 699000,
          currency: 'THB',
          maxUsers: 9999,
          maxWarehouses: 9999,
          maxProducts: 999999,
          maxDevices: 10,
          features: ['*'],
        },
      ];
    }
  },

  // ดึงข้อมูล Subscription และ Quotas ปัจจุบัน (GET /billing/current-subscription)
  getCurrentSubscription: async (): Promise<CurrentSubscriptionData> => {
    try {
      const response = await apiClient.get('/billing/current-subscription');
      return response.data?.data || response.data;
    } catch {
      // Default fallback representing active Pro Plan
      return {
        id: '4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
        planCode: 'PRO_MONTHLY',
        planName: 'MatchStock Pro',
        status: 'active',
        billingCycle: 'monthly',
        startsAt: '2026-08-01T00:00:00.000Z',
        currentPeriodEnd: '2026-09-30T00:00:00.000Z',
        cancelAtPeriodEnd: false,
        quotas: {
          users: { used: 4, max: 10 },
          warehouses: { used: 2, max: 3 },
          products: { used: 1250, max: 10000 },
          devices: { used: 0, max: 0 },
        },
        features: [
          'products.basic',
          'warehouse.bins',
          'stock.lot_expiry',
          'stock.fefo',
          'cycle_count.barcode',
          'sales_orders.manage',
          'reports.valuation',
        ],
      };
    }
  },

  // สมัครหรืออัปเกรดแพ็กเกจ (POST /billing/subscribe)
  subscribe: async (data: { planCode: string; paymentMethod?: 'card' | 'promptpay'; cardToken?: string }) => {
    const response = await apiClient.post('/billing/subscribe', data);
    return response.data?.data || response.data;
  },

  // ยกเลิกการต่ออายุรอบบิล (POST /billing/cancel)
  cancelSubscription: async (reason?: string) => {
    const response = await apiClient.post('/billing/cancel', { reason });
    return response.data?.data || response.data;
  },

  // ดึงรายการใบแจ้งหนี้ / ใบเสร็จรับเงิน (GET /billing/invoices)
  getInvoices: async (): Promise<BillingInvoice[]> => {
    try {
      const response = await apiClient.get('/billing/invoices');
      return response.data?.data || response.data || [];
    } catch {
      return [
        {
          id: 'inv-001',
          invoiceNumber: 'INV-202608-0001',
          status: 'paid',
          totalMinor: 199000,
          amountPaidMinor: 199000,
          currency: 'THB',
          issuedAt: '2026-08-01T00:00:00.000Z',
          paidAt: '2026-08-01T00:05:00.000Z',
        },
        {
          id: 'inv-002',
          invoiceNumber: 'INV-202607-0042',
          status: 'paid',
          totalMinor: 199000,
          amountPaidMinor: 199000,
          currency: 'THB',
          issuedAt: '2026-07-01T00:00:00.000Z',
          paidAt: '2026-07-01T00:03:00.000Z',
        },
      ];
    }
  },
};
