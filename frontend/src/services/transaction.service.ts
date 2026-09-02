import { apiClient } from './api.client';

export interface ReceiveStockInput {
  warehouseId: string;
  supplierId?: string;
  referenceNo?: string;
  notes?: string;
  items: {
    productId: string;
    binLocationId?: string;
    quantity: number;
    unitPrice?: number;
    lotNumber?: string;
    manufacturedDate?: string;
    expirationDate?: string;
  }[];
}

export interface IssueStockInput {
  warehouseId: string;
  recipient?: string;
  reason?: string;
  referenceNo?: string;
  notes?: string;
  items: {
    productId: string;
    binLocationId?: string;
    lotId?: string;
    quantity: number;
    unitPrice?: number;
  }[];
}

export interface TransferStockInput {
  fromWarehouseId: string;
  toWarehouseId: string;
  referenceNo?: string;
  notes?: string;
  items: {
    productId: string;
    fromBinLocationId?: string;
    toBinLocationId?: string;
    lotId?: string;
    quantity: number;
  }[];
}

export interface AdjustStockInput {
  warehouseId: string;
  direction: 'INCREASE' | 'DECREASE';
  reason: string;
  referenceNo?: string;
  notes?: string;
  items: {
    productId: string;
    binLocationId?: string;
    lotId?: string;
    quantity: number;
    unitPrice?: number;
  }[];
}

import {
  CreateGoodsReceiptDto,
  StagedGoodsReceiptItem,
  SuggestedBin,
  ConfirmPutawayDto,
  ConfirmPutawayResult,
  StockBalanceItem,
  StockLookupResponse,
} from '../types';

export const transactionService = {
  // ดึงรายการประวัติ Transactions / Goods Receipts
  getTransactions: async (params?: { type?: string; search?: string; page?: number; limit?: number }) => {
    try {
      const response = await apiClient.get('/goods-receipts', { params });
      return response.data?.data || response.data || [];
    } catch {
      try {
        const response = await apiClient.get('/inventory/transactions', { params });
        return response.data?.data || response.data || [];
      } catch {
        return [];
      }
    }
  },

  // ดึงรายการ Goods Receipts
  getGoodsReceipts: async (params?: { page?: number; limit?: number; warehouseId?: string; status?: string; putawayStatus?: 'staged' | 'complete' }) => {
    const response = await apiClient.get('/goods-receipts', { params });
    return response.data?.data || response.data || [];
  },

  // ดึง Goods Receipt ตาม ID
  getGoodsReceiptById: async (id: string) => {
    const response = await apiClient.get(`/goods-receipts/${id}`);
    return response.data?.data || response.data;
  },

  // --- Phase 5: Putaway Endpoints ---
  // ดึงคิวรายการสินค้าที่รอจัดเก็บ (GET /goods-receipts/staged-items)
  getStagedItems: async (params?: { warehouseId?: string; page?: number; limit?: number }): Promise<{ data: StagedGoodsReceiptItem[]; meta?: any }> => {
    try {
      const response = await apiClient.get('/goods-receipts/staged-items', { params });
      const items = response.data?.data || [];
      const meta = response.data?.meta || { page: 1, limit: 20, totalCount: items.length };
      return { data: items, meta };
    } catch (err) {
      console.warn('Failed to load staged items from API, fallback to empty:', err);
      return { data: [], meta: { page: 1, limit: 20, totalCount: 0 } };
    }
  },

  // แนะนำช่องจัดเก็บว่างที่เหมาะสม (GET /putaway/suggest-bin)
  getSuggestedBin: async (warehouseId: string, quantity?: number): Promise<SuggestedBin | null> => {
    try {
      const response = await apiClient.get('/putaway/suggest-bin', {
        params: { warehouseId, quantity: quantity || 1 },
      });
      return response.data?.data || null;
    } catch (err) {
      console.warn('Failed to get suggested bin from API:', err);
      return null;
    }
  },

  // สแกนยืนยันการจัดเก็บขึ้นชั้นวาง (POST /putaway/confirm)
  confirmPutaway: async (data: ConfirmPutawayDto): Promise<ConfirmPutawayResult> => {
    const response = await apiClient.post('/putaway/confirm', data);
    return response.data?.data || response.data;
  },

  // --- Phase 5: Stock Balances & Lookup Endpoints ---
  // ดึงยอดคงเหลือจริงแบบ Real-time ตาม Warehouse, Bin, Product (GET /stock/balances)
  getStockBalances: async (params?: { warehouseId?: string; binLocationId?: string; productId?: string; page?: number; limit?: number }): Promise<{ data: StockBalanceItem[]; meta?: any }> => {
    try {
      const response = await apiClient.get('/stock/balances', { params });
      const items = response.data?.data || [];
      const meta = response.data?.meta || { page: 1, limit: 50, totalCount: items.length };
      return { data: items, meta };
    } catch {
      // Fallback
      return { data: [], meta: { page: 1, limit: 50, totalCount: 0 } };
    }
  },

  // Universal Lookup สแกน Barcode / SKU / RFID เพื่อค้นหาพิกัดชั้นวาง (GET /stock/lookup)
  lookupStock: async (code: string): Promise<StockLookupResponse | null> => {
    try {
      const response = await apiClient.get('/stock/lookup', { params: { code } });
      return response.data?.data || response.data || null;
    } catch (err) {
      console.warn('Stock lookup failed:', err);
      return null;
    }
  },

  // ดึงรายการ Goods Issues
  getGoodsIssues: async (params?: { page?: number; limit?: number; warehouseId?: string; status?: string }) => {
    const response = await apiClient.get('/goods-issues', { params });
    return response.data?.data || response.data || [];
  },

  // ดึงรายการ Stock Transfers
  getStockTransfers: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await apiClient.get('/stock-transfers', { params });
    return response.data?.data || response.data || [];
  },

  // ดึงรายการ Stock Adjustments
  getStockAdjustments: async (params?: { page?: number; limit?: number; warehouseId?: string }) => {
    const response = await apiClient.get('/stock-adjustments', { params });
    return response.data?.data || response.data || [];
  },

  // ดึงรายการ Cycle Counts
  getCycleCounts: async (params?: { page?: number; limit?: number; warehouseId?: string; status?: string }) => {
    const response = await apiClient.get('/cycle-counts', { params });
    return response.data?.data || response.data || [];
  },

  // ดึงยอดคงเหลือ Real-time Balances (Legacy fallback)
  getBalances: async (params?: { productId?: string; warehouseId?: string }) => {
    try {
      const response = await apiClient.get('/reports/stock-valuation', { params });
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  // บันทึก Goods Receive (GR) -> POST /goods-receipts (รองรับทั้ง CreateGoodsReceiptDto ใหม่ และ ReceiveStockInput เดิม)
  receiveStock: async (data: ReceiveStockInput | CreateGoodsReceiptDto) => {
    // โค้ดใหม่: มี lines[] สำหรับ Multi-line Inbound & Flexible Putaway
    if ('lines' in data && Array.isArray(data.lines) && data.lines.length > 0) {
      const payload = {
        receiptNumber: data.receiptNumber || `GR-${Date.now()}`,
        warehouseId: data.warehouseId,
        binLocationId: data.binLocationId || null,
        supplierId: data.supplierId || null,
        poNumber: data.poNumber || null,
        supplierInvoiceNo: data.supplierInvoiceNo || null,
        photoUrls: data.photoUrls || [],
        receivedAt: data.receivedAt || new Date().toISOString(),
        notes: data.notes || '',
        lines: data.lines,
      };
      const response = await apiClient.post('/goods-receipts', payload);
      return response.data?.data || response.data;
    }

    // โค้ดเดิม (Backward Compatible): ReceiveStockInput เดี่ยว
    const legacy = data as ReceiveStockInput;
    const payload = {
      receiptNumber: legacy.referenceNo || `GR-${Date.now()}`,
      warehouseId: legacy.warehouseId,
      supplierId: legacy.supplierId,
      binLocationId: legacy.items?.[0]?.binLocationId || null,
      notes: legacy.notes,
      items: legacy.items,
      lines: legacy.items?.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        damagedQuantity: 0,
        lotNumber: it.lotNumber,
        productionDate: it.manufacturedDate,
        expiryDate: it.expirationDate,
        unitCostMinor: it.unitPrice ? Math.round(it.unitPrice * 100) : undefined,
        binLocationId: it.binLocationId || null,
      })),
    };
    try {
      const response = await apiClient.post('/goods-receipts', payload);
      return response.data?.data || response.data;
    } catch {
      const response = await apiClient.post('/inventory/transactions/receive', data);
      return response.data?.data || response.data;
    }
  },

  // บันทึก Goods Issue (GI) -> POST /goods-issues
  issueStock: async (data: IssueStockInput) => {
    const payload = {
      issueNumber: data.referenceNo || `GI-${Date.now()}`,
      warehouseId: data.warehouseId,
      binLocationId: data.items?.[0]?.binLocationId,
      reference: data.referenceNo || data.recipient,
      notes: data.notes || data.reason,
      items: data.items,
    };
    try {
      const response = await apiClient.post('/goods-issues', payload);
      return response.data?.data || response.data;
    } catch {
      const response = await apiClient.post('/inventory/transactions/issue', data);
      return response.data?.data || response.data;
    }
  },

  // บันทึก Stock Transfer -> POST /stock-transfers
  transferStock: async (data: TransferStockInput) => {
    const payload = {
      transferNumber: data.referenceNo || `TR-${Date.now()}`,
      fromWarehouseId: data.fromWarehouseId,
      toWarehouseId: data.toWarehouseId,
      notes: data.notes,
      tagIds: data.items?.map((i) => i.productId) || [],
      items: data.items,
    };
    try {
      const response = await apiClient.post('/stock-transfers', payload);
      return response.data?.data || response.data;
    } catch {
      const response = await apiClient.post('/inventory/transactions/transfer', data);
      return response.data?.data || response.data;
    }
  },

  // บันทึก Stock Adjustment -> POST /stock-adjustments
  adjustStock: async (data: AdjustStockInput) => {
    const payload = {
      adjustmentNumber: data.referenceNo || `ADJ-${Date.now()}`,
      warehouseId: data.warehouseId,
      reason: data.direction === 'DECREASE' ? 'damaged' : 'found',
      notes: data.notes || data.reason,
      lines: data.items?.map((i) => ({
        tagId: i.productId,
        newStatus: data.direction === 'DECREASE' ? 'exited' : 'in_stock',
      })) || [],
    };
    try {
      const response = await apiClient.post('/stock-adjustments', payload);
      return response.data?.data || response.data;
    } catch {
      const response = await apiClient.post('/inventory/transactions/adjust', data);
      return response.data?.data || response.data;
    }
  },

  // Stock Card Report
  getStockCardReport: async (productId: string) => {
    const response = await apiClient.get(`/reports/stock-card/${productId}`);
    return response.data?.data || response.data;
  },

  // Stock Valuation Report
  getStockValuationReport: async () => {
    const response = await apiClient.get('/reports/stock-valuation');
    return response.data?.data || response.data;
  },

  // Moving Analysis Report
  getMovingAnalysisReport: async () => {
    const response = await apiClient.get('/reports/moving-analysis');
    return response.data?.data || response.data;
  },
};
