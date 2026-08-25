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

export type MasterDataSubTab = 'products' | 'rbac' | 'companies' | 'units' | 'barcodes' | 'warehouses' | 'suppliers';

export interface ProductItem {
  id: string;
  code: string;
  sku: string;
  slug?: string;
  name: string;
  category?: string;
  brand?: string;
  manufacturer?: string;
  uom: string;
  weightKg: number;
  widthCm: number;
  lengthCm: number;
  heightCm: number;
  price: number;
  stockOnHand: number;
  reorderLevel: number;
  minReorderQty?: number;
  isLotControl?: boolean;
  description?: string;
  maxLevel?: number;
  barcodeType?: 'CODE128' | 'EAN13' | 'QR_CODE';
  barcodeValue?: string;
  status?: 'active' | 'inactive' | 'low_stock' | 'out_of_stock';
  imageUrl?: string;
  createdAt?: string;
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

export interface Company {
  id: string;
  tenantId?: string;
  code: string;
  name: string;
  taxId?: string;
  branchCode: string;
  branchName?: string;
  phone?: string;
  email?: string;
  address?: string;
  isHeadquarter: boolean;
  createdAt?: string;
  updatedAt?: string;
  warehouses?: any[];
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

// --- Section 3: Mobile Barcode Scanner Types ---
export interface ScanHistoryItem {
  id: string;
  barcode: string;
  timestamp: string;
  product?: ProductItem;
  bin?: WarehouseBin;
  scanType: 'BARCODE' | 'QR_CODE' | 'MANUAL';
  status: 'FOUND' | 'NOT_FOUND';
}

// --- Section 4: Cycle Count & Stock Variance Reconciliation Types ---
export type CycleCountStatus = 'DRAFT' | 'IN_PROGRESS' | 'COUNTED' | 'RECONCILED' | 'CANCELLED';

export interface CycleCountItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  sku: string;
  barcode: string;
  uom: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  binCode: string;
  unitPrice: number;
  systemQty: number;
  countedQty: number | null;
  variance: number; // countedQty - systemQty
  varianceValue: number; // variance * unitPrice
  notes?: string;
  status: 'MATCH' | 'SHORTAGE' | 'SURPLUS' | 'UNCOUNTED';
}

export interface CycleCountPlan {
  id: string;
  planNo: string;
  title: string;
  warehouseId: string;
  warehouseName: string;
  zone?: string;
  categoryFilter?: string;
  cutoffDate: string;
  assignedTo: string;
  assignedStaffName: string;
  status: CycleCountStatus;
  createdAt: string;
  reconciledAt?: string;
  reconciledBy?: string;
  totalSkus: number;
  countedSkus: number;
  accuracyRate: number; // percentage
  totalVarianceQty: number;
  totalVarianceValue: number;
  items: CycleCountItem[];
}

// --- Section 5: Sales Order & Purchase Order Types ---
export type OrderType = 'SALES' | 'PURCHASE';
export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  sku: string;
  uom: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage or fixed amount
  totalAmount: number;
}

export interface Order {
  id: string;
  orderNo: string;
  type: OrderType;
  status: OrderStatus;
  partyName: string; // Customer Name (SO) or Supplier Name (PO)
  contactPerson?: string;
  phone?: string;
  email?: string;
  orderDate: string;
  expectedDate: string;
  warehouseId: string;
  warehouseName: string;
  paymentTerms: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  discountTotal: number;
  grandTotal: number;
  createdBy: string;
  createdAt: string;
}

