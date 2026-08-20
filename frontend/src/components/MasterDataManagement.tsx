import React, { useState } from 'react';
import {
  Plus,
  QrCode,
  Box,
  ShieldCheck,
  Building,
  Truck,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Printer,
  Scale,
  Ruler,
  Maximize2,
  Filter,
  X,
  Info,
} from 'lucide-react';
import {
  Language,
  ThemeMode,
  ProductItem,
  WarehouseBin,
  Supplier,
  UserPermissionItem,
} from '../types';
import { getTranslation } from '../i18n';

interface MasterDataManagementProps {
  lang: Language;
  theme: ThemeMode;
  searchQuery: string;
}

// Initial Mock Master Data
const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-001',
    code: 'PRD-1001',
    sku: 'SKU-9GKSK06L',
    slug: 'nike-air-force',
    name: 'Nike Air Force 1',
    category: 'Footwear',
    brand: 'Nike',
    manufacturer: 'Nike Inc. Vietnam',
    uom: 'PAIR',
    weightKg: 1.2,
    widthCm: 22,
    lengthCm: 34,
    heightCm: 14,
    price: 123.0,
    stockOnHand: 14,
    reorderLevel: 5,
    maxLevel: 50,
    barcodeType: 'CODE128',
    barcodeValue: '8851234567890',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=120&auto=format&fit=crop&q=80',
    createdAt: '2025-02-01',
  },
  {
    id: 'prod-002',
    code: 'PRD-1002',
    sku: 'SKU-9GKSK06M',
    slug: 'adidas-ultraboost',
    name: 'Adidas Ultraboost 22',
    category: 'Footwear',
    brand: 'Adidas',
    manufacturer: 'Adidas AG Germany',
    uom: 'PAIR',
    weightKg: 1.0,
    widthCm: 20,
    lengthCm: 32,
    heightCm: 13,
    price: 134.0,
    stockOnHand: 20,
    reorderLevel: 8,
    maxLevel: 60,
    barcodeType: 'EAN13',
    barcodeValue: '8859876543210',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=120&auto=format&fit=crop&q=80',
    createdAt: '2025-02-01',
  },
  {
    id: 'prod-003',
    code: 'PRD-1003',
    sku: 'SKU-9GKSK06N',
    slug: 'urban-vibes-tee',
    name: 'Urban Vibes Cotton Tee',
    category: 'Apparel',
    brand: 'StreetWearX',
    manufacturer: 'Textile Co. Thailand',
    uom: 'PCS',
    weightKg: 0.3,
    widthCm: 15,
    lengthCm: 20,
    heightCm: 2,
    price: 141.0,
    stockOnHand: 0,
    reorderLevel: 10,
    maxLevel: 100,
    barcodeType: 'QR_CODE',
    barcodeValue: 'QR-URBAN-TEE-003',
    status: 'out_of_stock',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&auto=format&fit=crop&q=80',
    createdAt: '2025-02-01',
  },
  {
    id: 'prod-004',
    code: 'PRD-1004',
    sku: 'SKU-9GKSK06P',
    slug: 'classic-comfort-tee',
    name: 'Classic Comfort Tee',
    category: 'Apparel',
    brand: 'CozyThreads',
    manufacturer: 'Cozy Mfg Thailand',
    uom: 'PCS',
    weightKg: 0.25,
    widthCm: 15,
    lengthCm: 20,
    heightCm: 2,
    price: 132.0,
    stockOnHand: 16,
    reorderLevel: 5,
    maxLevel: 80,
    barcodeType: 'CODE128',
    barcodeValue: '8851122334455',
    status: 'active',
    imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=120&auto=format&fit=crop&q=80',
    createdAt: '2025-02-01',
  },
  {
    id: 'prod-005',
    code: 'PRD-1005',
    sku: 'SKU-9GKSK06Q',
    slug: 'titan-chrono',
    name: 'Titan Chrono Watch',
    category: 'Accessories',
    brand: 'ChronoElite',
    manufacturer: 'Swiss Precision Ltd.',
    uom: 'BOX',
    weightKg: 0.6,
    widthCm: 12,
    lengthCm: 12,
    heightCm: 10,
    price: 120.0,
    stockOnHand: 3,
    reorderLevel: 5,
    maxLevel: 30,
    barcodeType: 'EAN13',
    barcodeValue: '8855566778899',
    status: 'low_stock',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=120&auto=format&fit=crop&q=80',
    createdAt: '2025-02-01',
  },
];

const MOCK_USERS: UserPermissionItem[] = [
  {
    id: 'usr-1',
    name: 'Kittisak Prasertkul',
    email: 'admin@matchstock.com',
    role: 'admin',
    department: 'Executive IT',
    lastActive: 'Just now',
    status: 'active',
  },
  {
    id: 'usr-2',
    name: 'Pairot Buabmee',
    email: 'pairot.buabmee@gmail.com',
    role: 'manager',
    department: 'Warehouse Operations',
    lastActive: '5 mins ago',
    status: 'active',
  },
  {
    id: 'usr-3',
    name: 'Somchai Jaidee',
    email: 'somchai@matchstock.com',
    role: 'warehouse_staff',
    department: 'Inventory Inbound',
    lastActive: '1 hour ago',
    status: 'active',
  },
  {
    id: 'usr-4',
    name: 'Somsri Purchasing',
    email: 'somsri@matchstock.com',
    role: 'purchasing_staff',
    department: 'Procurement',
    lastActive: '3 hours ago',
    status: 'active',
  },
];

const MOCK_BINS: WarehouseBin[] = [
  {
    id: 'bin-101',
    warehouseId: 'wh-bkk',
    warehouseName: 'WH-Bangkok Main Center',
    zone: 'Zone A (Fast Moving)',
    rack: 'RACK-01',
    shelf: 'SHELF-02',
    binCode: 'BIN-A-01-02',
    capacityKg: 500,
    currentItemsCount: 340,
    status: 'available',
  },
  {
    id: 'bin-102',
    warehouseId: 'wh-bkk',
    warehouseName: 'WH-Bangkok Main Center',
    zone: 'Zone B (Bulk Storage)',
    rack: 'RACK-04',
    shelf: 'SHELF-01',
    binCode: 'BIN-B-04-01',
    capacityKg: 1000,
    currentItemsCount: 1000,
    status: 'full',
  },
  {
    id: 'bin-103',
    warehouseId: 'wh-cnx',
    warehouseName: 'WH-Chiangmai Branch',
    zone: 'Zone C (Accessories)',
    rack: 'RACK-02',
    shelf: 'SHELF-03',
    binCode: 'BIN-C-02-03',
    capacityKg: 300,
    currentItemsCount: 45,
    status: 'available',
  },
];

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    code: 'SUP-001',
    name: 'Global Footwear Distribution Co., Ltd.',
    contactPerson: 'Mr. David Miller',
    phone: '+66 2 123 4567',
    email: 'contact@globalfootwear.com',
    taxId: '0105562012345',
    taxType: 'VAT7',
    discountTerms: '2/10 Net 30',
    address: '88 Bangna-Trad Rd, Bangkok 10260',
    status: 'active',
  },
  {
    id: 'sup-2',
    code: 'SUP-002',
    name: 'Siam Apparel & Textile Factory',
    contactPerson: 'Khun Patchara',
    phone: '+66 2 987 6543',
    email: 'sales@siamapparel.co.th',
    taxId: '0105561098765',
    taxType: 'VAT7',
    discountTerms: 'Net 45',
    address: '144 Industrial Estate, Samut Prakan',
    status: 'active',
  },
];

interface MasterDataManagementProps {
  lang: Language;
  theme: ThemeMode;
  searchQuery: string;
  activeSubTab?: 'rbac' | 'products' | 'units' | 'barcodes' | 'warehouses' | 'suppliers';
  onSubTabChange?: (subTab: 'rbac' | 'products' | 'units' | 'barcodes' | 'warehouses' | 'suppliers') => void;
}

export const MasterDataManagement: React.FC<MasterDataManagementProps> = ({
  lang,
  theme,
  searchQuery,
  activeSubTab: externalSubTab,
  onSubTabChange,
}) => {
  const t = getTranslation(lang);
  const [internalSubTab, setInternalSubTab] = useState<'rbac' | 'products' | 'units' | 'barcodes' | 'warehouses' | 'suppliers'>('products');
  const activeSubTab = externalSubTab || internalSubTab;

  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<ProductItem | null>(null);
  
  // 480px Slide-Over Drawer State
  const [drawerProduct, setDrawerProduct] = useState<ProductItem | null>(null);

  const [productsList, setProductsList] = useState<ProductItem[]>(MOCK_PRODUCTS);
  const [usersList, setUsersList] = useState<UserPermissionItem[]>(MOCK_USERS);
  const [binsList, setBinsList] = useState<WarehouseBin[]>(MOCK_BINS);
  const [suppliersList, setSuppliersList] = useState<Supplier[]>(MOCK_SUPPLIERS);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addCode, setAddCode] = useState('');
  const [addSku, setAddSku] = useState('');
  const [addCategory, setAddCategory] = useState('Footwear');
  const [addBrand, setAddBrand] = useState('');
  const [addPrice, setAddPrice] = useState('120.00');
  const [addStock, setAddStock] = useState('10');
  const [addUom, setAddUom] = useState('PCS');

  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<'admin' | 'manager' | 'warehouse_staff' | 'purchasing_staff'>('warehouse_staff');

  const [addWarehouseName, setAddWarehouseName] = useState('WH-Bangkok Main Center');
  const [addZone, setAddZone] = useState('Zone A');
  const [addBinCode, setAddBinCode] = useState('');
  const [addCapacityKg, setAddCapacityKg] = useState('500');

  const [addSupplierName, setAddSupplierName] = useState('');
  const [addContactPerson, setAddContactPerson] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addTaxId, setAddTaxId] = useState('');

  // Filter products by search query
  const filteredProducts = productsList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSubTab === 'products') {
      const newProd: ProductItem = {
        id: `prod-${Date.now()}`,
        code: addCode || `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
        sku: addSku || `SKU-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        slug: (addName || 'new-product').toLowerCase().replace(/\s+/g, '-'),
        name: addName || 'New Inventory Item',
        category: addCategory || 'General',
        brand: addBrand || 'MatchStock',
        manufacturer: 'MatchStock Partner',
        uom: addUom || 'PCS',
        weightKg: 1.0,
        widthCm: 10,
        lengthCm: 20,
        heightCm: 10,
        price: parseFloat(addPrice) || 99.0,
        stockOnHand: parseInt(addStock) || 10,
        reorderLevel: 5,
        maxLevel: 50,
        barcodeType: 'CODE128',
        barcodeValue: `885${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        status: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setProductsList([newProd, ...productsList]);
    } else if (activeSubTab === 'rbac') {
      const newUser: UserPermissionItem = {
        id: `usr-${Date.now()}`,
        name: addName || 'New Staff User',
        email: addEmail || 'user@matchstock.com',
        role: addRole,
        department: 'Warehouse Operations',
        lastActive: 'Just now',
        status: 'active',
      };
      setUsersList([newUser, ...usersList]);
    } else if (activeSubTab === 'warehouses') {
      const newBin: WarehouseBin = {
        id: `bin-${Date.now()}`,
        warehouseId: 'wh-bkk',
        warehouseName: addWarehouseName || 'WH-Bangkok Main Center',
        zone: addZone || 'Zone A',
        rack: 'RACK-05',
        shelf: 'SHELF-01',
        binCode: addBinCode || `BIN-A-${Math.floor(10 + Math.random() * 90)}-01`,
        capacityKg: parseInt(addCapacityKg) || 500,
        currentItemsCount: 0,
        status: 'available',
      };
      setBinsList([newBin, ...binsList]);
    } else if (activeSubTab === 'suppliers') {
      const newSup: Supplier = {
        id: `sup-${Date.now()}`,
        code: `SUP-${Math.floor(100 + Math.random() * 900)}`,
        name: addSupplierName || 'New Global Supplier Co., Ltd.',
        contactPerson: addContactPerson || 'Sales Admin',
        phone: addPhone || '+66 2 000 0000',
        email: addEmail || 'supplier@matchstock.com',
        taxId: addTaxId || '0105560001122',
        taxType: 'VAT7',
        discountTerms: 'Net 30',
        address: 'Bangkok Industrial Park, Thailand',
        status: 'active',
      };
      setSuppliersList([newSup, ...suppliersList]);
    }

    setIsAddModalOpen(false);
    setAddName('');
    setAddCode('');
    setAddSku('');
    setAddBrand('');
    setAddPrice('120.00');
    setAddStock('10');
    setAddEmail('');
    setAddWarehouseName('WH-Bangkok Main Center');
    setAddBinCode('');
    setAddSupplierName('');
    setAddContactPerson('');
    setAddPhone('');
    setAddTaxId('');
  };

  // Dynamic Title & Subtitle helper based on active sub-tab
  const getHeaderInfo = () => {
    switch (activeSubTab) {
      case 'rbac':
        return { title: t.rbacTitle, subtitle: t.rbacSubtitle };
      case 'units':
        return { title: t.unitsTitle, subtitle: t.unitsSubtitle };
      case 'barcodes':
        return { title: t.barcodeTitle, subtitle: t.barcodeSubtitle };
      case 'warehouses':
        return { title: t.warehouseTitle, subtitle: t.warehouseSubtitle };
      case 'suppliers':
        return { title: t.supplierTitle, subtitle: t.supplierSubtitle };
      case 'products':
      default:
        return { title: t.productTitle, subtitle: t.productSubtitle };
    }
  };

  const getAddButtonLabel = () => {
    switch (activeSubTab) {
      case 'products':
        return t.addNewBtn;
      case 'rbac':
        return '+ เพิ่มผู้ใช้งานใหม่';
      case 'warehouses':
        return '+ เพิ่มคลัง/ตำแหน่ง Bin';
      case 'suppliers':
        return '+ เพิ่มผู้จัดจำหน่าย';
      case 'units':
      case 'barcodes':
      default:
        return null;
    }
  };

  const headerInfo = getHeaderInfo();
  const addButtonLabel = getAddButtonLabel();

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header: Harmonious Typography (text-lg font-bold) */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b ${
        theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg">
              {t.masterData}
            </span>
            <span className="text-slate-400 dark:text-slate-600 text-xs font-semibold">/</span>
            <h2 className={`text-lg font-bold tracking-tight ${
              theme === 'dark' ? 'text-slate-50' : 'text-slate-900'
            }`}>
              {headerInfo.title}
            </h2>
          </div>
          <p className={`text-xs font-normal mt-1.5 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}>
            {headerInfo.subtitle}
          </p>
        </div>

        {addButtonLabel && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{addButtonLabel}</span>
          </button>
        )}
      </div>



      {/* SUB-TAB 1: PRODUCT CATALOG & SKU */}
      {activeSubTab === 'products' && (
        <div
          className={`rounded-2xl border shadow-sm transition-colors overflow-hidden ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* Table Control Bar */}
          <div className={`p-3.5 border-b flex items-center justify-between ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                Active Items Catalog
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                theme === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}>
                {filteredProducts.length} items
              </span>
            </div>

            <button
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 ${
                theme === 'dark' ? 'border-slate-700 text-slate-300 bg-slate-800' : 'border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Filter</span>
            </button>
          </div>

          {/* Unified Harmonious Table Typography */}
          <div className="overflow-x-auto max-h-[650px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr
                  className={`text-xs font-semibold uppercase tracking-wider border-b ${
                    theme === 'dark'
                      ? 'bg-slate-800 text-slate-300 border-slate-700'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <th className="p-3.5 w-10">
                    <input type="checkbox" className="rounded text-blue-600" />
                  </th>
                  <th className="p-3.5">{t.productName}</th>
                  <th className="p-3.5">{t.sku}</th>
                  <th className="p-3.5">{t.brand}</th>
                  <th className="p-3.5">{t.stockOnHand}</th>
                  <th className="p-3.5">{t.reorderLevel}</th>
                  <th className="p-3.5">{t.price}</th>
                  <th className="p-3.5 text-right">{t.actions}</th>
                </tr>
              </thead>

              <tbody className={`divide-y text-xs ${
                theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'
              }`}>
                {filteredProducts.map((prod) => (
                  <tr
                    key={prod.id}
                    className={`transition cursor-pointer ${
                      theme === 'dark' ? 'hover:bg-slate-800/60' : 'hover:bg-blue-50/40'
                    }`}
                    onClick={() => setDrawerProduct(prod)}
                  >
                    <td className="p-3.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded text-blue-600" />
                    </td>

                    {/* Product Name (Primary Column: font-semibold text-sm) */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className={`w-9 h-9 rounded-xl object-cover border shrink-0 ${
                            theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
                          }`}
                        />
                        <div>
                          <p className={`font-semibold text-sm ${
                            theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                          }`}>
                            {prod.name}
                          </p>
                          <p className={`text-xs font-normal mt-0.5 ${
                            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            Code: {prod.code} • {prod.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* SKU Badge (Clean Harmonious Tag: font-medium) */}
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                        theme === 'dark'
                          ? 'bg-slate-800 text-slate-300 border-slate-700'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}>
                        {prod.sku}
                      </span>
                    </td>

                    {/* Brand Column (Clean font-medium) */}
                    <td className={`p-3.5 font-medium ${
                      theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                    }`}>
                      {prod.brand}
                    </td>

                    {/* Status Badge (Clean font-medium) */}
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                          prod.stockOnHand === 0
                            ? theme === 'dark' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-rose-100 text-rose-800 border border-rose-300'
                            : prod.stockOnHand <= prod.reorderLevel
                            ? theme === 'dark' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-amber-100 text-amber-800 border border-amber-300'
                            : theme === 'dark' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {prod.stockOnHand === 0 ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : prod.stockOnHand <= prod.reorderLevel ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>{prod.stockOnHand} {prod.uom}</span>
                      </span>
                    </td>

                    {/* Reorder Level Gauge (Clean font-medium) */}
                    <td className="p-3.5">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                      }`}>
                        <span>
                          {prod.stockOnHand}/{prod.reorderLevel}
                        </span>
                        <div className={`w-12 h-1.5 rounded-full overflow-hidden ${
                          theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                        }`}>
                          <div
                            className={`h-full rounded-full ${
                              prod.stockOnHand <= prod.reorderLevel ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{
                              width: `${Math.min(100, (prod.stockOnHand / (prod.reorderLevel * 3)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Price Column (Primary Column: font-semibold text-sm) */}
                    <td className={`p-3.5 font-semibold text-sm ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                    }`}>
                      ${prod.price.toFixed(2)}
                    </td>

                    {/* Action Icons */}
                    <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedProductForBarcode(prod)}
                          className={`p-1.5 rounded-lg transition ${
                            theme === 'dark'
                              ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                              : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                          }`}
                          title={t.previewBarcode}
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDrawerProduct(prod)}
                          className={`p-1.5 rounded-lg transition ${
                            theme === 'dark'
                              ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                              : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                          }`}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className={`p-1.5 rounded-lg transition ${
                            theme === 'dark'
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                              : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                          }`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TENANT & RBAC ACCESS CONTROL */}
      {activeSubTab === 'rbac' && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-2xl border transition-colors ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`font-semibold text-base ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>{t.rbacTitle}</h3>
                <p className={`text-xs font-normal mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t.rbacSubtitle}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                theme === 'dark' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}>
                Multi-Tenant Context
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{t.roleAdmin}</p>
                <p className={`text-lg font-bold mt-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>Full Access</p>
                <p className={`text-xs font-normal mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>จัดการทุกระบบ & สิทธิ์การใช้</p>
              </div>

              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{t.roleManager}</p>
                <p className={`text-lg font-bold mt-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>Approval & Reports</p>
                <p className={`text-xs font-normal mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>อนุมัติเอกสารและดูรายงาน</p>
              </div>

              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{t.roleWarehouse}</p>
                <p className={`text-lg font-bold mt-1 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>Stock Ops & Scan</p>
                <p className={`text-xs font-normal mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>รับ/จ่าย สแกนบาร์โค้ด</p>
              </div>

              <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{t.rolePurchasing}</p>
                <p className={`text-lg font-bold mt-1 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>PO & Suppliers</p>
                <p className={`text-xs font-normal mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>ออกใบสั่งซื้อและจัดการผู้จัดจำหน่าย</p>
              </div>
            </div>

            {/* Users List Table */}
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-semibold ${theme === 'dark' ? 'border-slate-800 text-slate-200 bg-slate-800' : 'border-slate-200 text-slate-700 bg-slate-100'}`}>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">{t.role}</th>
                  <th className="p-3">{t.status}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'}`}>
                {usersList.map((usr) => (
                  <tr key={usr.id}>
                    <td className={`p-3 font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{usr.name}</td>
                    <td className={`p-3 font-normal ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{usr.email}</td>
                    <td className="p-3 font-medium">{usr.department}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${theme === 'dark' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                        {usr.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium inline-flex items-center gap-1 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: UNITS & DIMENSIONS */}
      {activeSubTab === 'units' && (
        <div
          className={`p-6 rounded-2xl border transition-colors ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="mb-6">
            <h3 className={`font-semibold text-base ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>{t.unitsTitle}</h3>
            <p className={`text-xs font-normal mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t.unitsSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_PRODUCTS.slice(0, 3).map((prod) => {
              const cbm = (prod.widthCm * prod.lengthCm * prod.heightCm) / 1000000;
              return (
                <div
                  key={prod.id}
                  className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
                    theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{prod.name}</h4>
                      <p className="text-xs text-blue-700 font-mono font-medium">{prod.sku}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${theme === 'dark' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                      UOM: {prod.uom}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`flex items-center gap-1.5 mb-1 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        <Scale className="w-3.5 h-3.5 text-blue-600" />
                        <span>Weight</span>
                      </div>
                      <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{prod.weightKg} kg</p>
                    </div>

                    <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`flex items-center gap-1.5 mb-1 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        <Ruler className="w-3.5 h-3.5 text-blue-600" />
                        <span>Dimensions</span>
                      </div>
                      <p className={`font-medium text-xs ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        {prod.widthCm}x{prod.lengthCm}x{prod.heightCm} cm
                      </p>
                    </div>

                    <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`flex items-center gap-1.5 mb-1 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                        <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Volume</span>
                      </div>
                      <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>{cbm.toFixed(4)} CBM</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BARCODE SUPPORT */}
      {activeSubTab === 'barcodes' && (
        <div
          className={`p-6 rounded-2xl border transition-colors ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="mb-6">
            <h3 className={`font-semibold text-base ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>{t.barcodeTitle}</h3>
            <p className={`text-xs font-normal mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t.barcodeSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CODE128 Preview */}
            <div className={`p-5 rounded-2xl border text-center shadow-sm ${
              theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50/50'
            }`}>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                CODE128
              </span>
              <p className={`font-semibold text-xs mt-3 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Linear Standard Barcode</p>
              <div className="my-4 p-4 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center shadow-xs">
                <div className="w-48 h-12 bg-slate-950 flex items-center justify-between px-2 py-1">
                  <div className="w-1 h-full bg-white" />
                  <div className="w-2 h-full bg-white" />
                  <div className="w-0.5 h-full bg-white" />
                  <div className="w-1.5 h-full bg-white" />
                  <div className="w-1 h-full bg-white" />
                  <div className="w-3 h-full bg-white" />
                  <div className="w-0.5 h-full bg-white" />
                  <div className="w-2 h-full bg-white" />
                  <div className="w-1 h-full bg-white" />
                </div>
                <p className="font-mono text-xs font-bold text-slate-900 mt-2">8851234567890</p>
              </div>
              <button className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs">
                <Printer className="w-3.5 h-3.5" />
                <span>{t.printLabel}</span>
              </button>
            </div>

            {/* EAN13 Preview */}
            <div className={`p-5 rounded-2xl border text-center shadow-sm ${
              theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50/50'
            }`}>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                EAN13
              </span>
              <p className={`font-semibold text-xs mt-3 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Retail Standard Barcode</p>
              <div className="my-4 p-4 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center shadow-xs">
                <div className="w-48 h-12 bg-slate-950 flex items-center justify-between px-2 py-1">
                  <div className="w-1.5 h-full bg-white" />
                  <div className="w-0.5 h-full bg-white" />
                  <div className="w-2 h-full bg-white" />
                  <div className="w-1 h-full bg-white" />
                  <div className="w-2.5 h-full bg-white" />
                  <div className="w-0.5 h-full bg-white" />
                  <div className="w-1 h-full bg-white" />
                </div>
                <p className="font-mono text-xs font-bold text-slate-900 mt-2">8859876543210</p>
              </div>
              <button className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs">
                <Printer className="w-3.5 h-3.5" />
                <span>{t.printLabel}</span>
              </button>
            </div>

            {/* QR_CODE Preview */}
            <div className={`p-5 rounded-2xl border text-center shadow-sm ${
              theme === 'dark' ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50/50'
            }`}>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                QR_CODE
              </span>
              <p className={`font-semibold text-xs mt-3 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>2D Matrix Code</p>
              <div className="my-4 p-4 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center shadow-xs">
                <div className="w-20 h-20 bg-slate-950 p-2 grid grid-cols-5 gap-1 rounded">
                  <div className="bg-white" />
                  <div className="bg-white" />
                  <div className="bg-slate-950" />
                  <div className="bg-white" />
                  <div className="bg-white" />
                  <div className="bg-white" />
                  <div className="bg-slate-950" />
                  <div className="bg-white" />
                  <div className="bg-slate-950" />
                  <div className="bg-white" />
                  <div className="bg-slate-950" />
                  <div className="bg-white" />
                  <div className="bg-white" />
                  <div className="bg-slate-950" />
                  <div className="bg-slate-950" />
                  <div className="bg-white" />
                  <div className="bg-white" />
                  <div className="bg-slate-950" />
                  <div className="bg-white" />
                  <div className="bg-white" />
                </div>
                <p className="font-mono text-xs font-bold text-slate-900 mt-2">QR-URBAN-TEE-003</p>
              </div>
              <button className="w-full py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs">
                <Printer className="w-3.5 h-3.5" />
                <span>{t.printLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: MULTI-WAREHOUSE & BINS */}
      {activeSubTab === 'warehouses' && (
        <div
          className={`p-6 rounded-2xl border transition-colors ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="mb-6">
            <h3 className={`font-semibold text-base ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>{t.warehouseTitle}</h3>
            <p className={`text-xs font-normal mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t.warehouseSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {MOCK_BINS.map((bin) => (
              <div
                key={bin.id}
                className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
                  theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <h4 className={`font-semibold text-xs ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{bin.warehouseName}</h4>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-medium ${
                      bin.status === 'full'
                        ? theme === 'dark' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-rose-100 text-rose-800 border border-rose-300'
                        : theme === 'dark' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {bin.status === 'full' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    <span>{bin.status.toUpperCase()}</span>
                  </span>
                </div>

                <div className={`p-3 rounded-xl border font-mono font-medium text-sm text-center ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-100 border-slate-200 text-slate-900'
                }`}>
                  Bin Code: {bin.binCode}
                </div>

                <div className={`space-y-2 text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  <div className="flex justify-between">
                    <span>Zone / Rack / Shelf:</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                      {bin.zone} • {bin.rack}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                      {bin.currentItemsCount} / {bin.capacityKg} kg
                    </span>
                  </div>

                  <div className={`w-full h-2 rounded-full overflow-hidden ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                  }`}>
                    <div
                      className={`h-full rounded-full ${
                        bin.status === 'full' ? 'bg-rose-500' : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${Math.min(100, (bin.currentItemsCount / bin.capacityKg) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: SUPPLIERS & TAX MASTERS */}
      {activeSubTab === 'suppliers' && (
        <div
          className={`p-6 rounded-2xl border transition-colors ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="mb-6">
            <h3 className={`font-semibold text-base ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>{t.supplierTitle}</h3>
            <p className={`text-xs font-normal mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{t.supplierSubtitle}</p>
          </div>

          <div className="space-y-4">
            {suppliersList.map((sup) => (
              <div
                key={sup.id}
                className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
                  theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                      theme === 'dark' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {sup.code}
                    </span>
                    <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{sup.name}</h4>
                  </div>
                  <p className={`text-xs font-normal mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Contact: {sup.contactPerson} ({sup.phone}) • Email: {sup.email}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-normal">Address: {sup.address}</p>
                </div>

                <div className="flex items-center gap-4 text-xs shrink-0">
                  <div className="text-right">
                    <p className={`font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>{sup.taxType} (7%)</p>
                    <p className="text-[10px] text-slate-400 font-normal">Tax ID: {sup.taxId}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl border font-semibold ${
                    theme === 'dark' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    Terms: {sup.discountTerms}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 480px SLIDE-OVER DRAWER */}
      {drawerProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div
            className={`w-full max-w-[480px] h-full p-6 shadow-xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 ${
              theme === 'dark' ? 'bg-slate-900 text-slate-100 border-l border-slate-800' : 'bg-white text-slate-900 border-l border-slate-200'
            }`}
          >
            {/* Drawer Header */}
            <div>
              <div className={`flex items-center justify-between pb-4 border-b ${
                theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  <h3 className={`font-semibold text-base ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>Product Quick Spec</h3>
                </div>
                <button
                  onClick={() => setDrawerProduct(null)}
                  className={`p-1.5 rounded-lg ${
                    theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className="mt-6 space-y-6 text-xs">
                <div className="flex items-center gap-4">
                  <img
                    src={drawerProduct.imageUrl}
                    alt={drawerProduct.name}
                    className={`w-20 h-20 rounded-2xl object-cover border shadow-sm ${
                      theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
                    }`}
                  />
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                      theme === 'dark' ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}>
                      {drawerProduct.sku}
                    </span>
                    <h4 className={`font-semibold text-lg mt-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{drawerProduct.name}</h4>
                    <p className={`font-normal ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Brand: {drawerProduct.brand} • UOM: {drawerProduct.uom}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <p className="text-slate-400 text-[10px] font-normal">Product Code</p>
                    <p className={`font-semibold text-sm mt-0.5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{drawerProduct.code}</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <p className="text-slate-400 text-[10px] font-normal">Price</p>
                    <p className={`font-bold text-sm mt-0.5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>${drawerProduct.price.toFixed(2)}</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <p className="text-slate-400 text-[10px] font-normal">Stock On Hand</p>
                    <p className={`font-bold text-sm mt-0.5 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>{drawerProduct.stockOnHand} {drawerProduct.uom}</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <p className="text-slate-400 text-[10px] font-normal">Reorder Point (ROP)</p>
                    <p className={`font-bold text-sm mt-0.5 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>{drawerProduct.reorderLevel} {drawerProduct.uom}</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border space-y-2 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                  <h5 className={`font-semibold text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Physical Specs & Weight</h5>
                  <p className={`font-normal ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Weight: <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{drawerProduct.weightKg} kg</span></p>
                  <p className={`font-normal ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Dimensions: <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{drawerProduct.widthCm} x {drawerProduct.lengthCm} x {drawerProduct.heightCm} cm</span></p>
                  <p className={`font-normal ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Calculated Volume: <span className={`font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>{((drawerProduct.widthCm * drawerProduct.lengthCm * drawerProduct.heightCm) / 1000000).toFixed(4)} CBM</span></p>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className={`pt-4 border-t flex items-center gap-3 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={() => setDrawerProduct(null)}
                className={`w-1/2 py-2.5 rounded-xl border font-semibold text-xs transition ${
                  theme === 'dark' ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t.close}
              </button>
              <button
                onClick={() => setDrawerProduct(null)}
                className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARCODE PREVIEW MODAL */}
      {selectedProductForBarcode && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm p-6 rounded-2xl border shadow-xl space-y-4 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Barcode Label Preview</h3>
              <button
                onClick={() => setSelectedProductForBarcode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <p className="font-semibold text-slate-900 text-sm">{selectedProductForBarcode.name}</p>
              <p className="text-xs text-blue-700 font-mono font-medium mb-3">{selectedProductForBarcode.sku}</p>

              <div className="w-full h-16 bg-slate-950 flex items-center justify-between px-3 py-1 rounded my-2">
                <div className="w-1 h-full bg-white" />
                <div className="w-2.5 h-full bg-white" />
                <div className="w-1 h-full bg-white" />
                <div className="w-2 h-full bg-white" />
                <div className="w-3 h-full bg-white" />
                <div className="w-1 h-full bg-white" />
                <div className="w-2.5 h-full bg-white" />
                <div className="w-1 h-full bg-white" />
              </div>
              <p className="font-mono text-xs font-bold text-slate-900">
                {selectedProductForBarcode.barcodeValue}
              </p>
            </div>

            <button
              onClick={() => setSelectedProductForBarcode(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Barcode Label</span>
            </button>
          </div>
        </div>
      )}

      {/* ADD MASTER DATA MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg p-6 rounded-2xl border shadow-xl space-y-5 animate-in zoom-in-95 duration-200 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm">
                  +
                </div>
                <div>
                  <h3 className="font-bold text-base">{t.modalAddTitle}</h3>
                  <p className="text-xs text-slate-400 font-normal">
                    {activeSubTab === 'products' && 'เพิ่มรายการสินค้าใหม่ลงในแคตตาล็อก'}
                    {activeSubTab === 'rbac' && 'เพิ่มบัญชีผู้ใช้และกำหนดบทบาทสิทธิ์ (RBAC)'}
                    {activeSubTab === 'units' && 'เพิ่มหน่วยนับสินค้าและมิติกายภาพ'}
                    {activeSubTab === 'barcodes' && 'ผูกบาร์โค้ดสากลและป้ายติดสินค้า'}
                    {activeSubTab === 'warehouses' && 'เพิ่มคลังสินค้าและตำแหน่งจัดเก็บย่อย (Bin)'}
                    {activeSubTab === 'suppliers' && 'เพิ่มข้อมูลผู้จัดจำหน่ายและข้อมูลภาษี'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="space-y-4 text-xs">
              {/* Product Form Fields */}
              {(activeSubTab === 'products' || activeSubTab === 'units' || activeSubTab === 'barcodes') && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">{t.productName} *</label>
                      <input
                        type="text"
                        required
                        value={addName}
                        onChange={(e) => setAddName(e.target.value)}
                        placeholder="เช่น Nike Air Max 2026"
                        className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">{t.brand}</label>
                      <input
                        type="text"
                        value={addBrand}
                        onChange={(e) => setAddBrand(e.target.value)}
                        placeholder="เช่น Nike"
                        className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">{t.code}</label>
                      <input
                        type="text"
                        value={addCode}
                        onChange={(e) => setAddCode(e.target.value)}
                        placeholder="PRD-1005 (สร้างอัตโนมัติถ้าว่าง)"
                        className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">{t.sku}</label>
                      <input
                        type="text"
                        value={addSku}
                        onChange={(e) => setAddSku(e.target.value)}
                        placeholder="SKU-889911 (สร้างอัตโนมัติถ้าว่าง)"
                        className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">{t.price} ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={addPrice}
                        onChange={(e) => setAddPrice(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">{t.stockOnHand}</label>
                      <input
                        type="number"
                        value={addStock}
                        onChange={(e) => setAddStock(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">หน่วยนับ (UOM)</label>
                      <select
                        value={addUom}
                        onChange={(e) => setAddUom(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      >
                        <option value="PCS">PCS</option>
                        <option value="PAIR">PAIR</option>
                        <option value="BOX">BOX</option>
                        <option value="PACK">PACK</option>
                        <option value="SET">SET</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* RBAC Form Fields */}
              {activeSubTab === 'rbac' && (
                <>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">ชื่อ-นามสกุล ผู้ใช้ *</label>
                    <input
                      type="text"
                      required
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      placeholder="เช่น สมชาย ใจดี"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">อีเมลผู้ใช้งาน *</label>
                    <input
                      type="email"
                      required
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      placeholder="user@matchstock.com"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">บทบาทสิทธิ์ใช้งาน (Role)</label>
                    <select
                      value={addRole}
                      onChange={(e) => setAddRole(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="admin">{t.roleAdmin} (Admin)</option>
                      <option value="manager">{t.roleManager} (Manager)</option>
                      <option value="warehouse_staff">{t.roleWarehouse} (Warehouse Staff)</option>
                      <option value="purchasing_staff">{t.rolePurchasing} (Purchasing Staff)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Warehouse & Bins Form Fields */}
              {activeSubTab === 'warehouses' && (
                <>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">ชื่อคลังสินค้า *</label>
                    <input
                      type="text"
                      required
                      value={addWarehouseName}
                      onChange={(e) => setAddWarehouseName(e.target.value)}
                      placeholder="WH-Bangkok Main Center"
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">โซนจัดเก็บ (Zone)</label>
                      <input
                        type="text"
                        value={addZone}
                        onChange={(e) => setAddZone(e.target.value)}
                        placeholder="Zone A (Fast Moving)"
                        className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">รหัสตำแหน่ง Bin</label>
                      <input
                        type="text"
                        value={addBinCode}
                        onChange={(e) => setAddBinCode(e.target.value)}
                        placeholder="BIN-A-01-05"
                        className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Suppliers Form Fields */}
              {activeSubTab === 'suppliers' && (
                <>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">ชื่อผู้จัดจำหน่าย (Supplier) *</label>
                    <input
                      type="text"
                      required
                      value={addSupplierName}
                      onChange={(e) => setAddSupplierName(e.target.value)}
                      placeholder="เช่น Siam Logistics & Goods Co., Ltd."
                      className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                        theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">ชื่อผู้ติดต่อ</label>
                      <input
                        type="text"
                        value={addContactPerson}
                        onChange={(e) => setAddContactPerson(e.target.value)}
                        placeholder="คุณวิชัย"
                        className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">เบอร์โทรศัพท์</label>
                      <input
                        type="text"
                        value={addPhone}
                        onChange={(e) => setAddPhone(e.target.value)}
                        placeholder="+66 2 123 4567"
                        className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">อีเมลติดต่อ</label>
                      <input
                        type="email"
                        value={addEmail}
                        onChange={(e) => setAddEmail(e.target.value)}
                        placeholder="contact@supplier.co.th"
                        className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">เลขประจำตัวผู้เสียภาษี</label>
                      <input
                        type="text"
                        value={addTaxId}
                        onChange={(e) => setAddTaxId(e.target.value)}
                        placeholder="0105562099887"
                        className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2 rounded-xl border font-semibold text-xs transition ${
                    theme === 'dark' ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.save}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
