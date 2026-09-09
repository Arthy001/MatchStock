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

export type MasterDataSubTab =
  | 'products'
  | 'categories'
  | 'brands'
  | 'rbac'
  | 'companies'
  | 'units'
  | 'barcodes'
  | 'warehouses'
  | 'suppliers';

export interface ProductItem {
  id: string;
  code: string;
  sku: string;
  slug?: string;
  name: string;
  category?: string;
  categoryId?: string;
  brand?: string;
  brandId?: string;
  manufacturer?: string;
  manufacturerId?: string;
  supplierId?: string;
  supplierName?: string;
  uom: string;
  unitId?: string;
  weightKg: number;
  weightValue?: number;
  weightUnitId?: string;
  widthCm: number;
  widthValue?: number;
  lengthCm: number;
  lengthValue?: number;
  heightCm: number;
  heightValue?: number;
  dimensionUnitId?: string;
  price: number;
  costPrice?: number;
  costPriceMinor?: number;
  sellingPriceMinor?: number;
  currency?: string;
  stockOnHand: number;
  reorderLevel: number;
  reorderPoint?: number;
  minReorderQty?: number;
  minReorderQuantity?: number;
  isLotControl?: boolean;
  lotControlled?: boolean;
  isReturnable?: boolean;
  isActive?: boolean;
  warrantyPeriodDays?: number;
  barcodeSymbologyId?: string;
  taxTypeId?: string;
  discountType?: 'percentage' | 'fixed' | string;
  discountValue?: number;
  description?: string;
  maxLevel?: number;
  barcodeType?: 'CODE128' | 'EAN13' | 'QR_CODE';
  barcodeValue?: string;
  status?: 'active' | 'inactive' | 'low_stock' | 'out_of_stock';
  imageUrl?: string;
  createdAt?: string;
}

export interface UnitItem {
  id: string;
  code: string;
  name: string;
  type?: string;
  isActive?: boolean;
}

export interface CategoryItem {
  id: string;
  code?: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface BrandItem {
  id: string;
  code?: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface BarcodeSymbologyItem {
  id: string;
  code?: string;
  name: string;
  description?: string;
}

export interface TaxTypeItem {
  id: string;
  name: string;
  ratePercent?: number;
  isActive?: boolean;
}

export interface BlueprintWall {
  id: string;
  startX: number;
  startZ: number;
  endX: number;
  endZ: number;
  heightMeters?: number;
  thicknessMeters?: number;
}

export interface BlueprintDoor {
  id: string;
  x: number;
  z: number;
  widthMeters?: number;
  heightMeters?: number;
  type?: 'dock' | 'entrance' | 'emergency_exit';
}

export interface WarehouseItem {
  id: string;
  code: string;
  name: string;
  address?: string;
  maxCapacity?: number;
  isActive?: boolean;
  blueprintUrl?: string;
  blueprintCfg?: {
    opacity?: number;
    dimensions?: {
      widthMeters?: number;
      depthMeters?: number;
    };
    zonesConfig?: Record<string, {
      name?: string;
      color?: string;
      racksCount?: number;
      [key: string]: any;
    }>;
    walls?: BlueprintWall[];
    doors?: BlueprintDoor[];
    [key: string]: any;
  };
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
  isActive?: boolean;
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
  isActive?: boolean;
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
  isActive?: boolean;
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

export type OutboundWorkflowMode =
  | 'ONE_STEP_DIRECT'
  | 'TWO_STEP_PICK_SHIP'
  | 'TWO_STEP_PICK'
  | 'THREE_STEP_PACK'
  | 'FOUR_STEP_ENTERPRISE'
  | 'FOUR_STEP_STAGE';

export type GoodsIssueStatus =
  | 'draft'
  | 'reserved'
  | 'picking'
  | 'picked'
  | 'packing'
  | 'packed'
  | 'staged_for_loading'
  | 'completed'
  | 'cancelled';

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
  soNumber?: string;
  salesOrderId?: string;
  workflowMode?: OutboundWorkflowMode;
  goodsIssueStatus?: GoodsIssueStatus;
  packageTrackingNo?: string;
  shippingCarrier?: string;
  cartonBarcode?: string;
  stagingDockBarcode?: string;
  totalWeightKg?: number;
  boxCount?: number;
  pickedAt?: string;
  packedAt?: string;
  stagedAt?: string;
  dispatchedAt?: string;

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

export interface OutboundStationToggles {
  enablePickStation: boolean;
  enablePackStation: boolean;
  enableStagingDock: boolean;
  enableGateDispatch: boolean;
}

// --- Section 6: Settings & Organization Profile Types ---
export interface TenantSettings {
  companyName: string;
  taxId: string;
  phone: string;
  email: string;
  address: string;
  currency: 'THB' | 'USD' | 'EUR' | 'JPY';
  defaultVatRate: number; // e.g. 7
  defaultStockMethod: 'FIFO' | 'LIFO' | 'FEFO' | 'MANUAL';
  defaultUom: string;
  defaultBarcodeSymbology: 'CODE128' | 'EAN13' | 'QR_CODE';
  alertExpiryDays: number; // e.g. 60
  enableRopAlerts: boolean;
  enableSoundFeedback: boolean;
  autoPrintBarcodeOnReceive: boolean;
  apiWebhookUrl?: string;
  outboundStations?: OutboundStationToggles;
  defaultOutboundWorkflow?: OutboundWorkflowMode;
}

// --- Section 7: Phase 4 — Subscription, Billing & Quota Types ---
export interface SubscriptionPlanItem {
  id: string;
  code: string;
  name: string;
  type?: string;
  billingCycle: 'monthly' | 'yearly';
  priceMinor: number;
  currency: string;
  maxUsers: number;
  maxWarehouses: number;
  maxProducts: number;
  maxDevices: number;
  features: string[];
}

export interface CurrentSubscriptionData {
  id: string;
  planCode: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  billingCycle: 'monthly' | 'yearly';
  startsAt?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  quotas: {
    users: { used: number; max: number };
    warehouses: { used: number; max: number };
    products: { used: number; max: number };
    devices: { used: number; max: number };
  };
  features: string[];
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  status: 'paid' | 'pending' | 'failed';
  totalMinor: number;
  amountPaidMinor: number;
  currency: string;
  issuedAt: string;
  paidAt?: string;
}

export interface FeatureNotIncludedErrorPayload {
  success: false;
  error: 'FEATURE_NOT_INCLUDED';
  feature: string;
  message: string;
}

export interface QuotaExceededErrorPayload {
  success: false;
  error: 'QUOTA_EXCEEDED';
  resource: string;
  currentUsage: number;
  maxAllowed: number;
  message: string;
}

// --- Section 8: Phase 5 — Goods Receiving Lines & Flexible Putaway Types ---
export interface CreateGoodsReceiptLineDto {
  productId: string;
  quantity: number;
  damagedQuantity?: number;
  lotNumber?: string;
  productionDate?: string;
  expiryDate?: string;
  unitCostMinor?: number;
  binLocationId?: string;
}

export interface CreateGoodsReceiptDto {
  receiptNumber?: string;
  warehouseId: string;
  binLocationId?: string;
  supplierId?: string;
  poNumber?: string;
  supplierInvoiceNo?: string;
  photoUrls?: string[];
  receivedAt?: string;
  notes?: string;
  lines?: CreateGoodsReceiptLineDto[];
}

export interface StagedGoodsReceiptItem {
  goodsReceiptLineId: string;
  goodsReceiptId: string;
  receiptNumber: string;
  productId: string;
  sku: string;
  productName: string;
  remainingQuantity: number;
  lotNumber?: string;
  expiryDate?: string;
  suggestedBinLocationId?: string;
  warehouseId?: string;
  warehouseName?: string;
  receivedAt?: string;
}

export interface SuggestedBin {
  id: string;
  code: string;
  maxCapacity?: number;
  remainingCapacity?: number;
}

export interface ConfirmPutawayDto {
  goodsReceiptLineId: string;
  binLocationId: string;
  quantity: number;
}

export interface ConfirmPutawayResult {
  placed: {
    id: string;
    goodsReceiptId: string;
    productId: string;
    quantity: number;
    damagedQuantity: number;
    putawayQuantity: number;
    binLocationId: string;
  };
  remaining: {
    id: string;
    goodsReceiptId: string;
    productId: string;
    quantity: number;
    damagedQuantity: number;
    putawayQuantity: number;
    binLocationId: string | null;
  } | null;
}

// --- Section 9: Phase 5 — Real-time Stock Balances & Universal Lookup Types ---
export interface StockBalanceItem {
  id: string;
  warehouseId: string;
  warehouseName: string;
  binLocationId: string | null;
  binCode: string | null;
  productId: string;
  productName: string;
  sku: string;
  lotNumber: string | null;
  expiryDate: string | null;
  quantityOnHand: number;
  quantityReserved: number;
  availableQuantity: number;
}

export interface StockLookupLocation {
  warehouseId: string;
  warehouseName: string;
  binLocationId: string | null;
  binCode: string | null;
  lotNumber: string | null;
  expiryDate: string | null;
  quantity: number;
}

export interface StockLookupResponse {
  productId: string;
  sku: string;
  name: string;
  barcodeValue?: string;
  totalOnHand: number;
  totalAvailable: number;
  totalReserved: number;
  locations: StockLookupLocation[];
}


