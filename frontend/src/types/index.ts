export type Language = 'th' | 'en';
export type ThemeMode = 'light' | 'dark';

export type UserRole = 'admin' | 'manager' | 'warehouse_staff' | 'purchasing_staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  tenantId: string;
  tenantName: string;
}

export interface SubscriptionFeatures {
  masterData: boolean;
  inventory: boolean;
  sales: boolean;
  purchases: boolean;
  reports: boolean;
  settings: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  code: string;
  plan: string;
  features: SubscriptionFeatures;
}

export interface ProductItem {
  id: string;
  code: string;
  sku: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  manufacturer: string;
  uom: string;
  weightKg: number;
  widthCm: number;
  lengthCm: number;
  heightCm: number;
  price: number;
  stockOnHand: number;
  reorderLevel: number;
  maxLevel: number;
  barcodeType: 'CODE128' | 'EAN13' | 'QR_CODE';
  barcodeValue: string;
  status: 'active' | 'inactive' | 'low_stock' | 'out_of_stock';
  imageUrl: string;
  createdAt: string;
}

export interface WarehouseBin {
  id: string;
  warehouseId: string;
  warehouseName: string;
  zone: string;
  rack: string;
  shelf: string;
  binCode: string;
  capacityKg: number;
  currentItemsCount: number;
  status: 'available' | 'full' | 'maintenance';
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  taxId: string;
  taxType: 'VAT7' | 'EXEMPT' | 'ZERO';
  discountTerms: string;
  address: string;
  status: 'active' | 'inactive';
}

export interface UserPermissionItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

export type TransactionType = 'RECEIVE' | 'ISSUE' | 'TRANSFER' | 'ADJUSTMENT';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'CANCELLED';

export interface StockTransaction {
  id: string;
  documentNo: string;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: string;
  createdBy: string;
  referenceNo?: string;
  notes?: string;

  // GR Specific
  supplierId?: string;
  supplierName?: string;

  // GI Specific
  issueReason?: string;
  recipientName?: string;

  // Transfer Specific
  transferType?: 'INTER_WAREHOUSE' | 'BIN_TO_BIN';

  // Adjustment Specific
  adjustmentReason?: string;
  adjustmentDirection?: 'INCREASE' | 'DECREASE';

  // Items
  items: StockTransactionItem[];
  totalQuantity: number;
  totalAmount?: number;
}

export interface StockTransactionItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  sku: string;
  uom: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;

  // Lot / Batch & Expiry
  lotNumber?: string;
  mfgDate?: string;
  expDate?: string;

  // Location details
  fromWarehouseId?: string;
  fromWarehouseName?: string;
  fromBinId?: string;
  fromBinCode?: string;

  toWarehouseId?: string;
  toWarehouseName?: string;
  toBinId?: string;
  toBinCode?: string;

  // Adjustment variance
  currentStock?: number;
  adjustedStock?: number;
  variance?: number;
}

