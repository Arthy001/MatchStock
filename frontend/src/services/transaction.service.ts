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
  getGoodsReceipts: async (params?: { page?: number; limit?: number; warehouseId?: string; status?: string }) => {
    const response = await apiClient.get('/goods-receipts', { params });
    return response.data?.data || response.data || [];
  },

  // ดึง Goods Receipt ตาม ID
  getGoodsReceiptById: async (id: string) => {
    const response = await apiClient.get(`/goods-receipts/${id}`);
    return response.data?.data || response.data;
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

  // ดึงยอดคงเหลือ Real-time Balances
  getBalances: async (params?: { productId?: string; warehouseId?: string }) => {
    try {
      const response = await apiClient.get('/reports/stock-valuation', { params });
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  // บันทึก Goods Receive (GR) -> POST /goods-receipts
  receiveStock: async (data: ReceiveStockInput) => {
    const payload = {
      receiptNumber: data.referenceNo || `GR-${Date.now()}`,
      warehouseId: data.warehouseId,
      supplierId: data.supplierId,
      binLocationId: data.items?.[0]?.binLocationId,
      notes: data.notes,
      items: data.items,
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
