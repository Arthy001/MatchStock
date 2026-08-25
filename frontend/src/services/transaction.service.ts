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
  // ดึงรายการประวัติ Transactions
  getTransactions: async (params?: { type?: string; search?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/inventory/transactions', { params });
    return response.data;
  },

  // ดึงยอดคงเหลือ Real-time Balances
  getBalances: async (params?: { productId?: string; warehouseId?: string }) => {
    const response = await apiClient.get('/inventory/balances', { params });
    return response.data;
  },

  // บันทึก Goods Receive (GR)
  receiveStock: async (data: ReceiveStockInput) => {
    const response = await apiClient.post('/inventory/transactions/receive', data);
    return response.data;
  },

  // บันทึก Goods Issue (GI)
  issueStock: async (data: IssueStockInput) => {
    const response = await apiClient.post('/inventory/transactions/issue', data);
    return response.data;
  },

  // บันทึก Stock Transfer
  transferStock: async (data: TransferStockInput) => {
    const response = await apiClient.post('/inventory/transactions/transfer', data);
    return response.data;
  },

  // บันทึก Stock Adjustment
  adjustStock: async (data: AdjustStockInput) => {
    const response = await apiClient.post('/inventory/transactions/adjust', data);
    return response.data;
  },
};
