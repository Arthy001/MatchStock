import { apiClient } from './api.client';

export interface StockValuationResponse {
  totalValueMinor?: number;
  totalItemsCount?: number;
  costedCount?: number;
  uncostedCount?: number;
  categories?: Array<{
    name: string;
    value: number;
    count: number;
  }>;
  items?: Array<{
    productId: string;
    sku: string;
    name: string;
    inStockCount: number;
    unitCostMinor?: number;
    totalCostMinor?: number;
  }>;
  [key: string]: any;
}

export interface MovingAnalysisItem {
  productId: string;
  sku: string;
  name: string;
  inStockCount: number;
  movementCount: number;
  lastMovementAt?: string | null;
  daysSinceLastMovement?: number;
}

export interface StockCardEvent {
  eventId: string;
  occurredAt: string;
  eventType: 'received' | 'exited' | 'transferred' | 'adjusted' | string;
  direction: 'in' | 'out';
  tagId?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  quantity?: number;
  runningBalance: number;
  note?: string;
}

export const reportService = {
  // ดึงข้อมูลสรุปมูลค่าสต็อกคงคลัง (GET /reports/stock-valuation)
  getStockValuation: async () => {
    try {
      const response = await apiClient.get('/reports/stock-valuation');
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('reportService.getStockValuation fallback:', err);
      return null;
    }
  },

  // ดึงข้อมูลวิเคราะห์สินค้าเคลื่อนไหวช้า-เร็ว (GET /reports/moving-analysis)
  getMovingAnalysis: async (days = 30, page = 1, limit = 50) => {
    try {
      const response = await apiClient.get('/reports/moving-analysis', {
        params: { days, page, limit },
      });
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('reportService.getMovingAnalysis fallback:', err);
      return [];
    }
  },

  // ดึงประวัติบัตรคลังสินค้าของสินค้ารายตัว (GET /reports/stock-card/{productId})
  getStockCard: async (productId: string, page = 1, limit = 50) => {
    try {
      const response = await apiClient.get(`/reports/stock-card/${productId}`, {
        params: { page, limit },
      });
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('reportService.getStockCard fallback:', err);
      return [];
    }
  },
};
