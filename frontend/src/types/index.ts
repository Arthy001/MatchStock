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
