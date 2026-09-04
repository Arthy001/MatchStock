import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Download, CheckCircle2, AlertCircle, RefreshCw, Command, ArrowLeft, Sparkles, Undo2 } from 'lucide-react';
import { ThemeMode, Language, MasterDataSubTab } from '../types';

// Custom Master Data Hooks (Clean Architecture)
import { useMasterDataLoader } from './master-data/hooks/useMasterDataLoader';
import { useProductDrawer } from './master-data/hooks/useProductDrawer';
import { useMasterDataModals } from './master-data/hooks/useMasterDataModals';
import { useAddMasterDataForm } from './master-data/hooks/useAddMasterDataForm';

// Modular Tabs
import { ProductCatalogTab } from './master-data/tabs/ProductCatalogTab';
import { CategoryManagementTab } from './master-data/tabs/CategoryManagementTab';
import { BrandManagementTab } from './master-data/tabs/BrandManagementTab';
import { CompanyManagementTab } from './master-data/tabs/CompanyManagementTab';
import { WarehouseBinTab } from './master-data/tabs/WarehouseBinTab';
import { SupplierManagementTab } from './master-data/tabs/SupplierManagementTab';
import { UnitManagementTab } from './master-data/tabs/UnitManagementTab';
import { RbacAccessTab } from './master-data/tabs/RbacAccessTab';
import { BarcodeManagementTab } from './master-data/tabs/BarcodeManagementTab';

// Modular Modals
import { ProductDrawer } from './master-data/modals/ProductDrawer';
import { EditCategoryModal } from './master-data/modals/EditCategoryModal';
import { EditBrandModal } from './master-data/modals/EditBrandModal';
import { EditCompanyModal } from './master-data/modals/EditCompanyModal';
import { EditSupplierModal } from './master-data/modals/EditSupplierModal';
import { EditWarehouseBinModal } from './master-data/modals/EditWarehouseBinModal';
import { EditUnitModal } from './master-data/modals/EditUnitModal';
import { AddMasterDataModal } from './master-data/modals/AddMasterDataModal';
import { BarcodeModal } from './master-data/modals/BarcodeModal';
import { ConfirmDeleteModal } from './master-data/modals/ConfirmDeleteModal';

interface MasterDataProps {
  theme: ThemeMode;
  lang: Language;
  searchQuery?: string;
  activeSubTab?: MasterDataSubTab;
  onSubTabChange?: (tab: MasterDataSubTab) => void;
}

export const MasterDataManagement: React.FC<MasterDataProps> = ({
  theme,
  lang,
  activeSubTab = 'products',
  onSubTabChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fastSearchInputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform));
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept Ctrl+K or ⌘+K (รองรับทั้งแป้นพิมพ์ภาษาอังกฤษ และภาษาไทย 'า'/'ำ')
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.code === 'KeyK' || e.key?.toLowerCase() === 'k' || e.key === 'า' || e.key === 'ำ')
      ) {
        e.preventDefault();
        fastSearchInputRef.current?.focus();
        fastSearchInputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Master Data Loader & In-Memory State Hook
  const {
    isLoading,
    loadedTabs,
    loadTabData,
    productsList,
    setProductsList,
    companiesList,
    setCompaniesList,
    suppliersList,
    setSuppliersList,
    unitsList,
    setUnitsList,
    binsList,
    setBinsList,
    usersList,
    setUsersList,
    categoriesList,
    setCategoriesList,
    brandsList,
    setBrandsList,
    barcodeSymbologiesList,
    taxTypesList,
  } = useMasterDataLoader();

  // Load only active tab on mount or tab change (On-Demand Dispatcher)
  useEffect(() => {
    loadTabData(activeSubTab);
  }, [activeSubTab, loadTabData]);

  // 2. Modals & Operation Handlers Hook (Company, Supplier, Unit, Warehouse, Category, Brand, RBAC)
  const modals = useMasterDataModals({
    companiesList,
    setCompaniesList,
    suppliersList,
    setSuppliersList,
    unitsList,
    setUnitsList,
    binsList,
    setBinsList,
    categoriesList,
    setCategoriesList,
    brandsList,
    setBrandsList,
    usersList,
    setUsersList,
    showToast,
  });

  // 3. Product Edit Drawer Hook
  const productDrawer = useProductDrawer({
    productsList,
    setProductsList,
    categoriesList,
    brandsList,
    unitsList,
    suppliersList,
    showToast,
    onOpenConfirmDelete: (data) => modals.setDeleteConfirmData(data),
  });

  // 4. Unified Add Modal Form Hook
  const addForm = useAddMasterDataForm({
    activeSubTab,
    categoriesList,
    brandsList,
    unitsList,
    companiesList,
    setProductsList,
    setCompaniesList,
    setSuppliersList,
    setUnitsList,
    setBinsList,
    setCategoriesList,
    setBrandsList,
    setUsersList,
    showToast,
  });

  // 5. Warp & Return State (Warp from form to Category/Brand/Unit setup and return with draft intact)
  interface WarpState {
    isWarped: boolean;
    returnTab: MasterDataSubTab;
    targetName: string;
    draftTitle: string;
  }
  const [warpState, setWarpState] = useState<WarpState | null>(null);

  const handleWarpToSubTab = (targetTab: MasterDataSubTab, targetLabel: string) => {
    setWarpState({
      isWarped: true,
      returnTab: activeSubTab,
      targetName: targetLabel,
      draftTitle: addForm.addName.trim() || addForm.addSku.trim() || (lang === 'en' ? 'New Product Draft' : 'แบบร่างสินค้าใหม่'),
    });
    // Temporarily hide modal; React state in addForm retains 100% of the input values!
    addForm.setIsAddModalOpen(false);
    // Switch to target subtab (e.g. categories, brands, suppliers, units)
    onSubTabChange?.(targetTab);
    // Load the target tab's data
    loadTabData(targetTab, true);
    showToast(
      lang === 'en'
        ? `Warped to ${targetLabel}. Your product draft is saved. Click return banner when finished.`
        : `วาปไปหน้าจัดการ ${targetLabel} เรียบร้อย ข้อมูลสินค้าถูกพักไว้ เมื่อเสร็จแล้วกดปุ่มกลับที่แถบด้านบนได้ทันที`
    );
  };

  const handleReturnFromWarp = async () => {
    if (!warpState) return;
    const returnTo = warpState.returnTab;
    setWarpState(null);
    // Switch back to product catalog tab
    onSubTabChange?.(returnTo);
    // Refresh all master data dropdowns so newly created items appear immediately
    await Promise.all([
      loadTabData('categories', true),
      loadTabData('brands', true),
      loadTabData('suppliers', true),
      loadTabData('units', true),
    ]);
    // Reopen modal with all draft data intact
    addForm.setIsAddModalOpen(true);
    showToast(
      lang === 'en'
        ? 'Welcome back! Your product draft is restored with updated dropdowns.'
        : 'ยินดีต้อนรับกลับ! ข้อมูลสินค้าเดิมกลับมาครบ พร้อมอัปเดตรายการตัวเลือกล่าสุดแล้ว'
    );
  };

  const handleDiscardWarp = () => {
    setWarpState(null);
    showToast(lang === 'en' ? 'Product draft discarded' : 'ยกเลิกการพักข้อมูลสินค้าแล้ว');
  };

  // UI Localized Titles
  const t = {
    title: lang === 'en' ? 'Master Data Management' : 'การจัดการข้อมูลหลัก (Master Data)',
    productTitle: lang === 'en' ? 'Product Catalog & SKUs' : 'แคตตาล็อกสินค้า & รหัสสินค้า (SKU)',
    productSubtitle: lang === 'en' ? 'Manage product definitions, barcodes, weight & dimensions, and inventory parameters' : 'จัดการข้อมูลสินค้า รหัสบาร์โค้ด ขนาดมิติกายภาพ และค่าควบคุมคลัง',
    rbacTitle: lang === 'en' ? 'Tenant & Role-Based Access Control (RBAC)' : 'การจัดการผู้ใช้และสิทธิ์การเข้าถึง (RBAC)',
    rbacSubtitle: lang === 'en' ? 'Configure role permissions, staff assignments, and multi-tenant access boundaries' : 'กำหนดสิทธิ์การใช้งานของพนักงาน ขอบเขตการเข้าถึง และการจัดการผู้ใช้',
    unitsTitle: lang === 'en' ? 'Units of Measure & Dimensions' : 'หน่วยนับและมิติขนาด (Units & Dimensions)',
    unitsSubtitle: lang === 'en' ? 'Configure conversion units, physical package dimensions (CBM), and net weight' : 'กำหนดหน่วยนับสินค้า หน่วยแปลง ปริมาตรลูกบาศก์เมตร (CBM) และน้ำหนักสุทธิ',
    barcodeTitle: lang === 'en' ? 'Barcode & Label Symbologies' : 'รูปแบบบาร์โค้ดและป้ายสินค้า (Barcode Symbologies)',
    barcodeSubtitle: lang === 'en' ? 'Configure Code128, EAN-13, QR Code formats and print templates' : 'ตั้งค่ามาตรฐานบาร์โค้ด Code128, EAN-13, QR Code และแบบฟอร์มพิมพ์ป้าย',
    warehouseTitle: lang === 'en' ? 'Warehouses, Zones & Bins' : 'คลังสินค้า, โซน และตำแหน่งจัดเก็บ (Bins)',
    warehouseSubtitle: lang === 'en' ? 'Configure multi-level storage hierarchy, max capacities, and picking zones' : 'กำหนดโครงสร้างคลังสินค้า โซนจัดเก็บ ล็อคเกอร์/เชลฟ์ และความจุน้ำหนักสูงสุด',
    supplierTitle: lang === 'en' ? 'Suppliers & Vendors' : 'ผู้จัดจำหน่ายและคู่ค้า (Suppliers)',
    supplierSubtitle: lang === 'en' ? 'Maintain procurement vendors, payment terms, and supplier catalog mapping' : 'จัดการรายชื่อผู้จัดจำหน่าย ข้อมูลการติดต่อ เงื่อนไขการชำระเงิน และประวัติการสั่งซื้อ',
    searchPlaceholder: lang === 'en' ? 'Quick search master records (SKU, Code, Name, Tax ID, Bin)...' : 'ค้นหาข้อมูลด่วน (SKU, รหัสสินค้า, ชื่อสินค้า, เลขผู้เสียภาษี, ตำแหน่ง Bin)...',
    addNewBtn: lang === 'en' ? 'Add New Product' : 'เพิ่มสินค้าใหม่',
    actions: lang === 'en' ? 'Actions' : 'จัดการ',
    save: lang === 'en' ? 'Save Changes' : 'บันทึกข้อมูล',
    cancel: lang === 'en' ? 'Cancel' : 'ยกเลิก',
    close: lang === 'en' ? 'Close' : 'ปิด',
    code: lang === 'en' ? 'Code' : 'รหัส',
    sku: 'SKU',
    productName: lang === 'en' ? 'Product Name' : 'ชื่อสินค้า',
    brand: lang === 'en' ? 'Brand' : 'แบรนด์',
    price: lang === 'en' ? 'Price' : 'ราคาขาย',
    stockOnHand: lang === 'en' ? 'Stock On Hand' : 'คงเหลือ',
  };

  const getHeaderInfo = () => {
    switch (activeSubTab) {
      case 'rbac':
        return { title: t.rbacTitle, subtitle: t.rbacSubtitle };
      case 'categories':
        return {
          title: lang === 'en' ? 'Product Categories' : 'หมวดหมู่สินค้า (Categories Master)',
          subtitle: lang === 'en' ? 'Manage product categories, hierarchies, and classifications' : 'จัดการโครงสร้างหมวดหมู่และการจัดกลุ่มสินค้าในระบบ MatchStock',
        };
      case 'brands':
        return {
          title: lang === 'en' ? 'Product Brands' : 'แบรนด์สินค้า (Brands Master)',
          subtitle: lang === 'en' ? 'Manage brand registrations, trademarks, and manufacturer info' : 'จัดการรายชื่อแบรนด์และยี่ห้อสินค้าทั้งหมดในระบบ MatchStock',
        };
      case 'companies':
        return {
          title: lang === 'en' ? 'Subsidiary Companies' : 'บริษัทในเครือ',
          subtitle: lang === 'en' ? 'Manage multi-company entities, Tax IDs, branches, and legal addresses' : 'จัดการรายชื่อบริษัทในเครือ, สาขา, เลขประจำตัวผู้เสียภาษี และที่อยู่สถานประกอบการ',
        };
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
      case 'categories':
        return lang === 'en' ? 'Add Category' : 'เพิ่มหมวดหมู่สินค้า';
      case 'brands':
        return lang === 'en' ? 'Add Brand' : 'เพิ่มแบรนด์สินค้า';
      case 'companies':
        return lang === 'en' ? 'Add Subsidiary Company' : 'เพิ่มบริษัทในเครือ';
      case 'units':
        return lang === 'en' ? 'Add Unit of Measure' : 'เพิ่มหน่วยนับสินค้า';
      case 'warehouses':
        return lang === 'en' ? 'Add Warehouse / Bin' : 'เพิ่มคลัง / ตำแหน่ง Bin';
      case 'suppliers':
        return lang === 'en' ? 'Add Supplier' : 'เพิ่มผู้จัดจำหน่าย';
      case 'rbac':
        return lang === 'en' ? 'Add New User' : 'เพิ่มผู้ใช้งานใหม่';
      case 'barcodes':
        return lang === 'en' ? 'Link Barcode' : 'ผูกบาร์โค้ดสินค้า';
      default:
        return null;
    }
  };

  const shouldShowSearchBar = ['products', 'categories', 'brands', 'companies', 'units', 'suppliers'].includes(activeSubTab);

  const getSearchPlaceholder = () => {
    switch (activeSubTab) {
      case 'products':
        return lang === 'en' ? 'Search products by name, SKU, barcode, brand...' : 'ค้นหาชื่อสินค้า, รหัส SKU, บาร์โค้ด, แบรนด์...';
      case 'categories':
        return lang === 'en' ? 'Search categories by name or code...' : 'ค้นหาชื่อหมวดหมู่สินค้า หรือรหัสหมวดหมู่...';
      case 'brands':
        return lang === 'en' ? 'Search brands by name or code...' : 'ค้นหาชื่อแบรนด์, ยี่ห้อ หรือรหัสแบรนด์...';
      case 'companies':
        return lang === 'en' ? 'Search companies by name, Tax ID, branch...' : 'ค้นหาชื่อบริษัทในเครือ, เลขผู้เสียภาษี, สาขา...';
      case 'units':
        return lang === 'en' ? 'Search units of measure (e.g. Piece, Box, Kg)...' : 'ค้นหาชื่อหน่วยนับ (เช่น ชิ้น, ลัง, กิโลกรัม)...';
      case 'suppliers':
        return lang === 'en' ? 'Search suppliers by vendor name, tax ID, phone...' : 'ค้นหาชื่อผู้จัดจำหน่าย, เลขผู้เสียภาษี, เบอร์โทร...';
      default:
        return t.searchPlaceholder;
    }
  };

  const filteredProducts = productsList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categoriesList.filter((c) => {
    const q = searchQuery.toLowerCase();
    return !q || (c.name && c.name.toLowerCase().includes(q)) || (c.code && c.code.toLowerCase().includes(q));
  });

  const filteredBrands = brandsList.filter((b) => {
    const q = searchQuery.toLowerCase();
    return !q || (b.name && b.name.toLowerCase().includes(q)) || (b.code && b.code.toLowerCase().includes(q));
  });

  const filteredSuppliers = suppliersList.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.taxId && s.taxId.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q)) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(q))
    );
  });

  const filteredUnits = unitsList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return !q || (u.name && u.name.toLowerCase().includes(q)) || (u.code && u.code.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification (Floating above all modals) */}
      {toastMessage && (() => {
        const isError =
          toastMessage.includes('ข้อผิดพลาด') ||
          toastMessage.includes('ไม่สำเร็จ') ||
          toastMessage.includes('ไม่สามารถ') ||
          toastMessage.includes('ล้มเหลว') ||
          toastMessage.toLowerCase().includes('error') ||
          toastMessage.toLowerCase().includes('failed');

        return (
          <div
            className={`fixed top-6 right-6 z-[99999] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border backdrop-blur-md animate-in slide-in-from-top duration-200 max-w-md ${
              isError
                ? 'bg-rose-950/95 dark:bg-rose-900/95 text-rose-100 border-rose-600/80 shadow-rose-950/40'
                : 'bg-slate-900/95 dark:bg-slate-800/95 text-white border-slate-700/80 shadow-slate-950/40'
            }`}
          >
            {isError ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="font-semibold text-xs md:text-sm leading-snug">{toastMessage}</span>
          </div>
        );
      })()}

      {/* Warp & Return Floating Banner (Preserved Product Draft) */}
      {warpState && (
        <div className="p-4 rounded-2xl border border-blue-500/50 bg-gradient-to-r from-blue-950/95 via-slate-900/95 to-blue-950/95 text-white shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top duration-300 ring-2 ring-blue-500/20">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-blue-600/25 border border-blue-400/40 text-blue-400 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {lang === 'en' ? 'Warp Setup Mode' : 'โหมดวาปจัดการข้อมูลหลักชั่วคราว'}
                </span>
                <span className="text-[11px] bg-blue-500/25 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full font-semibold">
                  {warpState.targetName}
                </span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">•</span>
                <span className="text-[11px] text-slate-300 font-mono truncate max-w-[200px]">
                  {warpState.draftTitle}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {lang === 'en'
                  ? 'Your draft inputs are safely preserved in memory. Add or edit items here, then click return to continue.'
                  : 'ข้อมูลสินค้าที่กรอกไว้ถูกพักไว้อย่างปลอดภัย จัดการข้อมูลในหน้านี้เสร็จแล้ว กดปุ่มกลับไปกรอกต่อได้ทันที'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            <button
              type="button"
              onClick={handleDiscardWarp}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
            >
              {lang === 'en' ? 'Discard Draft' : 'ยกเลิกแบบร่าง'}
            </button>
            <button
              type="button"
              onClick={handleReturnFromWarp}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/40 flex items-center gap-2 transition transform hover:scale-[1.02] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'en' ? 'Return to Add Product ↵' : 'กลับไปกรอกสินค้าต่อ ↵'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Enterprise Title & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {getHeaderInfo().title}
          </h2>
          <p className={`text-[15px] font-normal mt-0.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {getHeaderInfo().subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {getAddButtonLabel() && (
            <button
              onClick={() => addForm.setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-blue-600/30 transition cursor-pointer active:scale-[0.99] whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{getAddButtonLabel()}</span>
            </button>
          )}

          {/* Quick Refresh Active Tab Button */}
          <button
            onClick={() => loadTabData(activeSubTab, true)}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
              theme === 'dark'
                ? 'border-zinc-700 bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700 disabled:opacity-50'
                : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 shadow-xs disabled:opacity-50'
            }`}
            title={lang === 'en' ? 'Refresh current tab data from server' : 'รีเฟรชข้อมูลแท็บนี้จากเซิร์ฟเวอร์'}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            <span className="hidden sm:inline">{lang === 'en' ? 'Refresh' : 'รีเฟรช'}</span>
          </button>

          <button
            className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0 ${
              theme === 'dark'
                ? 'border-zinc-700 bg-zinc-800/90 text-zinc-200 hover:bg-zinc-700'
                : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 shadow-xs'
            }`}
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>


      {/* Enterprise Fast Search Toolbar (Only displayed on relevant Master Data tabs) */}
      {shouldShowSearchBar && (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            ref={fastSearchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getSearchPlaceholder()}
            className={`w-full pl-10 pr-16 py-2.5 rounded-md border text-[15px] font-normal transition outline-hidden ${theme === 'dark'
                ? 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500'
                : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-xs'
              }`}
          />
          <div
            onClick={() => {
              fastSearchInputRef.current?.focus();
              fastSearchInputRef.current?.select();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded cursor-pointer select-none flex items-center gap-0.5 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
            title={isMac ? 'Command + K' : 'Ctrl + K'}
          >
            {isMac ? <Command className="w-3 h-3 inline" /> : <span>Ctrl</span>}
            <span>K</span>
          </div>
        </div>
      )}

      {/* TAB CONTENT ROUTING */}
      {activeSubTab === 'products' && (
        <ProductCatalogTab
          theme={theme}
          lang={lang}
          t={t}
          products={filteredProducts}
          onOpenDrawer={productDrawer.openDrawerForProduct}
          onSelectBarcode={modals.setSelectedProductForBarcode}
          onDeleteProduct={productDrawer.handleDeleteProduct}
        />
      )}

      {activeSubTab === 'categories' && (
        <CategoryManagementTab
          theme={theme}
          lang={lang}
          t={t}
          categoriesList={filteredCategories}
          onOpenAddModal={() => addForm.setIsAddModalOpen(true)}
          onOpenEditCategory={modals.openEditCategory}
          onDeleteCategory={modals.handleDeleteCategory}
        />
      )}

      {activeSubTab === 'brands' && (
        <BrandManagementTab
          theme={theme}
          lang={lang}
          t={t}
          brandsList={filteredBrands}
          onOpenAddModal={() => addForm.setIsAddModalOpen(true)}
          onOpenEditBrand={modals.openEditBrand}
          onDeleteBrand={modals.handleDeleteBrand}
        />
      )}

      {activeSubTab === 'companies' && (
        <CompanyManagementTab
          theme={theme}
          lang={lang}
          searchQuery={searchQuery}
          companies={companiesList}
          onOpenEdit={modals.openEditCompany}
          onDelete={modals.handleDeleteCompany}
        />
      )}

      {activeSubTab === 'rbac' && (
        <RbacAccessTab
          theme={theme}
          lang={lang}
          t={t}
          usersList={usersList}
          onChangeUserRole={modals.handleChangeUserRole}
          onDeleteUser={modals.handleDeleteUser}
        />
      )}

      {activeSubTab === 'units' && (
        <UnitManagementTab
          theme={theme}
          lang={lang}
          t={t}
          unitsList={filteredUnits}
          onOpenAddModal={() => addForm.setIsAddModalOpen(true)}
          onOpenEditUnit={modals.openEditUnit}
          onDeleteUnit={modals.handleDeleteUnit}
        />
      )}

      {activeSubTab === 'barcodes' && <BarcodeManagementTab theme={theme} t={t} />}

      {activeSubTab === 'warehouses' && (
        <WarehouseBinTab
          theme={theme}
          lang={lang}
          t={t}
          binsList={binsList}
          onOpenEditBin={modals.openEditBin}
          onDeleteBin={modals.handleDeleteBin}
        />
      )}

      {activeSubTab === 'suppliers' && (
        <SupplierManagementTab
          theme={theme}
          lang={lang}
          t={t}
          suppliersList={filteredSuppliers}
          onOpenEditSupplier={modals.openEditSupplier}
          onDeleteSupplier={modals.handleDeleteSupplier}
        />
      )}

      {/* MODALS & DRAWERS */}
      <ProductDrawer
        theme={theme}
        lang={lang}
        t={t}
        product={productDrawer.drawerProduct}
        categoriesList={categoriesList}
        brandsList={brandsList}
        unitsList={unitsList}
        suppliersList={suppliersList}
        barcodeSymbologiesList={barcodeSymbologiesList}
        taxTypesList={taxTypesList}
        onClose={() => productDrawer.setDrawerProduct(null)}
        onSave={productDrawer.handleSaveEditProduct}
        onDelete={productDrawer.handleDeleteProduct}
        isSaving={productDrawer.isSaving}
        editName={productDrawer.editName}
        setEditName={productDrawer.setEditName}
        editCode={productDrawer.editCode}
        setEditCode={productDrawer.setEditCode}
        editSku={productDrawer.editSku}
        setEditSku={productDrawer.setEditSku}
        editBrand={productDrawer.editBrand}
        setEditBrand={productDrawer.setEditBrand}
        editBrandId={productDrawer.editBrandId}
        setEditBrandId={productDrawer.setEditBrandId}
        editCategoryId={productDrawer.editCategoryId}
        setEditCategoryId={productDrawer.setEditCategoryId}
        editUnitId={productDrawer.editUnitId}
        setEditUnitId={productDrawer.setEditUnitId}
        editSupplierId={productDrawer.editSupplierId}
        setEditSupplierId={productDrawer.setEditSupplierId}
        editBarcodeSymbologyId={productDrawer.editBarcodeSymbologyId}
        setEditBarcodeSymbologyId={productDrawer.setEditBarcodeSymbologyId}
        editTaxTypeId={productDrawer.editTaxTypeId}
        setEditTaxTypeId={productDrawer.setEditTaxTypeId}
        editBarcode={productDrawer.editBarcode}
        setEditBarcode={productDrawer.setEditBarcode}
        editPrice={productDrawer.editPrice}
        setEditPrice={productDrawer.setEditPrice}
        editCostPrice={productDrawer.editCostPrice}
        setEditCostPrice={productDrawer.setEditCostPrice}
        editWeightKg={productDrawer.editWeightKg}
        setEditWeightKg={productDrawer.setEditWeightKg}
        editWidthCm={productDrawer.editWidthCm}
        setEditWidthCm={productDrawer.setEditWidthCm}
        editLengthCm={productDrawer.editLengthCm}
        setEditLengthCm={productDrawer.setEditLengthCm}
        editHeightCm={productDrawer.editHeightCm}
        setEditHeightCm={productDrawer.setEditHeightCm}
        editReorderLevel={productDrawer.editReorderLevel}
        setEditReorderLevel={productDrawer.setEditReorderLevel}
        editMinReorderQty={productDrawer.editMinReorderQty}
        setEditMinReorderQty={productDrawer.setEditMinReorderQty}
        editIsLotControl={productDrawer.editIsLotControl}
        setEditIsLotControl={productDrawer.setEditIsLotControl}
        editIsReturnable={productDrawer.editIsReturnable}
        setEditIsReturnable={productDrawer.setEditIsReturnable}
        editIsActive={productDrawer.editIsActive}
        setEditIsActive={productDrawer.setEditIsActive}
        editWarrantyDays={productDrawer.editWarrantyDays}
        setEditWarrantyDays={productDrawer.setEditWarrantyDays}
        editDescription={productDrawer.editDescription}
        setEditDescription={productDrawer.setEditDescription}
      />

      <EditCompanyModal
        theme={theme}
        lang={lang}
        t={t}
        company={modals.editingCompany}
        isViewOnly={modals.isViewOnly}
        onSwitchToEdit={() => modals.setIsViewOnly(false)}
        onClose={() => modals.setEditingCompany(null)}
        onSave={modals.handleSaveEditCompany}
        isSaving={modals.isSaving}
        editCompCode={modals.editCompCode}
        setEditCompCode={modals.setEditCompCode}
        editCompName={modals.editCompName}
        setEditCompName={modals.setEditCompName}
        editCompTaxId={modals.editCompTaxId}
        setEditCompTaxId={modals.setEditCompTaxId}
        editCompBranchCode={modals.editCompBranchCode}
        setEditCompBranchCode={modals.setEditCompBranchCode}
        editCompBranchName={modals.editCompBranchName}
        setEditCompBranchName={modals.setEditCompBranchName}
        editCompPhone={modals.editCompPhone}
        setEditCompPhone={modals.setEditCompPhone}
        editCompEmail={modals.editCompEmail}
        setEditCompEmail={modals.setEditCompEmail}
        editCompAddress={modals.editCompAddress}
        setEditCompAddress={modals.setEditCompAddress}
        editCompIsHq={modals.editCompIsHq}
        setEditCompIsHq={modals.setEditCompIsHq}
      />

      <EditSupplierModal
        theme={theme}
        lang={lang}
        t={t}
        supplier={modals.editingSupplier}
        isViewOnly={modals.isViewOnly}
        onSwitchToEdit={() => modals.setIsViewOnly(false)}
        onClose={() => modals.setEditingSupplier(null)}
        onSave={modals.handleSaveEditSupplier}
        isSaving={modals.isSaving}
        editSupCode={modals.editSupCode}
        setEditSupCode={modals.setEditSupCode}
        editSupName={modals.editSupName}
        setEditSupName={modals.setEditSupName}
        editSupContactPerson={modals.editSupContactPerson}
        setEditSupContactPerson={modals.setEditSupContactPerson}
        editSupPhone={modals.editSupPhone}
        setEditSupPhone={modals.setEditSupPhone}
        editSupEmail={modals.editSupEmail}
        setEditSupEmail={modals.setEditSupEmail}
        editSupTaxId={modals.editSupTaxId}
        setEditSupTaxId={modals.setEditSupTaxId}
        editSupAddress={modals.editSupAddress}
        setEditSupAddress={modals.setEditSupAddress}
        editSupIsActive={modals.editSupIsActive}
        setEditSupIsActive={modals.setEditSupIsActive}
      />

      <EditWarehouseBinModal
        theme={theme}
        lang={lang}
        t={t}
        bin={modals.editingBin}
        isViewOnly={modals.isViewOnly}
        onSwitchToEdit={() => modals.setIsViewOnly(false)}
        onClose={() => modals.setEditingBin(null)}
        onSave={modals.handleSaveEditBin}
        isSaving={modals.isSaving}
        editWhName={modals.editWhName}
        setEditWhName={modals.setEditWhName}
        editBinCode={modals.editBinCode}
        setEditBinCode={modals.setEditBinCode}
        editBinZone={modals.editBinZone}
        setEditBinZone={modals.setEditBinZone}
        editBinRack={modals.editBinRack}
        setEditBinRack={modals.setEditBinRack}
        editBinShelf={modals.editBinShelf}
        setEditBinShelf={modals.setEditBinShelf}
        editBinCapacity={modals.editBinCapacity}
        setEditBinCapacity={modals.setEditBinCapacity}
        editBinIsActive={modals.editBinIsActive}
        setEditBinIsActive={modals.setEditBinIsActive}
      />

      <EditUnitModal
        theme={theme}
        lang={lang}
        t={t}
        unit={modals.editingUnit}
        isViewOnly={modals.isViewOnly}
        onSwitchToEdit={() => modals.setIsViewOnly(false)}
        onClose={() => modals.setEditingUnit(null)}
        onSave={modals.handleSaveEditUnit}
        isSaving={modals.isSaving}
        editUnitCode={modals.editUnitCode}
        setEditUnitCode={modals.setEditUnitCode}
        editUnitName={modals.editUnitName}
        setEditUnitName={modals.setEditUnitName}
        editUnitIsActive={modals.editUnitIsActive}
        setEditUnitIsActive={modals.setEditUnitIsActive}
      />

      <EditCategoryModal
        theme={theme}
        lang={lang}
        t={t}
        category={modals.editingCategory}
        isViewOnly={modals.isViewOnly}
        onSwitchToEdit={() => modals.setIsViewOnly(false)}
        onClose={() => modals.setEditingCategory(null)}
        onSave={modals.handleSaveEditCategory}
        isSaving={modals.isSaving}
        editCatCode={modals.editCatCode}
        setEditCatCode={modals.setEditCatCode}
        editCatName={modals.editCatName}
        setEditCatName={modals.setEditCatName}
        editCatDescription={modals.editCatDescription}
        setEditCatDescription={modals.setEditCatDescription}
        editCatIsActive={modals.editCatIsActive}
        setEditCatIsActive={modals.setEditCatIsActive}
      />

      <EditBrandModal
        theme={theme}
        lang={lang}
        t={t}
        brand={modals.editingBrand}
        isViewOnly={modals.isViewOnly}
        onSwitchToEdit={() => modals.setIsViewOnly(false)}
        onClose={() => modals.setEditingBrand(null)}
        onSave={modals.handleSaveEditBrand}
        isSaving={modals.isSaving}
        editBrandCode={modals.editBrandCode}
        setEditBrandCode={modals.setEditBrandCode}
        editBrandName={modals.editBrandName}
        setEditBrandName={modals.setEditBrandName}
        editBrandDescription={modals.editBrandDescription}
        setEditBrandDescription={modals.setEditBrandDescription}
        editBrandIsActive={modals.editBrandIsActive}
        setEditBrandIsActive={modals.setEditBrandIsActive}
      />

      <BarcodeModal
        theme={theme}
        lang={lang}
        product={modals.selectedProductForBarcode}
        onClose={() => modals.setSelectedProductForBarcode(null)}
      />

      <AddMasterDataModal
        theme={theme}
        lang={lang}
        t={t}
        isOpen={addForm.isAddModalOpen}
        onClose={() => addForm.setIsAddModalOpen(false)}
        activeSubTab={activeSubTab}
        onSubmit={addForm.handleCreateNewItem}
        onWarpToTab={handleWarpToSubTab}
        errors={addForm.formErrors}
        clearError={addForm.clearError}
        categoriesList={categoriesList}
        brandsList={brandsList}
        unitsList={unitsList}
        suppliersList={suppliersList}
        barcodeSymbologiesList={barcodeSymbologiesList}
        taxTypesList={taxTypesList}
        addName={addForm.addName}
        setAddName={addForm.setAddName}
        addCode={addForm.addCode}
        setAddCode={addForm.setAddCode}
        addSku={addForm.addSku}
        setAddSku={addForm.setAddSku}
        addBrand={addForm.addBrand}
        setAddBrand={addForm.setAddBrand}
        addBrandId={addForm.addBrandId}
        setAddBrandId={addForm.setAddBrandId}
        addCategoryId={addForm.addCategoryId}
        setAddCategoryId={addForm.setAddCategoryId}
        addUnitId={addForm.addUnitId}
        setAddUnitId={addForm.setAddUnitId}
        addSupplierId={addForm.addSupplierId}
        setAddSupplierId={addForm.setAddSupplierId}
        addBarcodeSymbologyId={addForm.addBarcodeSymbologyId}
        setAddBarcodeSymbologyId={addForm.setAddBarcodeSymbologyId}
        addTaxTypeId={addForm.addTaxTypeId}
        setAddTaxTypeId={addForm.setAddTaxTypeId}
        addBarcode={addForm.addBarcode}
        setAddBarcode={addForm.setAddBarcode}
        addPrice={addForm.addPrice}
        setAddPrice={addForm.setAddPrice}
        addCostPrice={addForm.addCostPrice}
        setAddCostPrice={addForm.setAddCostPrice}
        addStock={addForm.addStock}
        setAddStock={addForm.setAddStock}
        addUom={addForm.addUom}
        setAddUom={addForm.setAddUom}
        addWeightKg={addForm.addWeightKg}
        setAddWeightKg={addForm.setAddWeightKg}
        addWidthCm={addForm.addWidthCm}
        setAddWidthCm={addForm.setAddWidthCm}
        addLengthCm={addForm.addLengthCm}
        setAddLengthCm={addForm.setAddLengthCm}
        addHeightCm={addForm.addHeightCm}
        setAddHeightCm={addForm.setAddHeightCm}
        addReorderPoint={addForm.addReorderPoint}
        setAddReorderPoint={addForm.setAddReorderPoint}
        addMinReorderQty={addForm.addMinReorderQty}
        setAddMinReorderQty={addForm.setAddMinReorderQty}
        addIsLotControl={addForm.addIsLotControl}
        setAddIsLotControl={addForm.setAddIsLotControl}
        addIsReturnable={addForm.addIsReturnable}
        setAddIsReturnable={addForm.setAddIsReturnable}
        addWarrantyDays={addForm.addWarrantyDays}
        setAddWarrantyDays={addForm.setAddWarrantyDays}
        addDescription={addForm.addDescription}
        setAddDescription={addForm.setAddDescription}
        addProductImageFile={addForm.addProductImageFile}
        setAddProductImageFile={addForm.setAddProductImageFile}
        addProductImagePreview={addForm.addProductImagePreview}
        setAddProductImagePreview={addForm.setAddProductImagePreview}
        addCompanyCode={addForm.addCompanyCode}
        setAddCompanyCode={addForm.setAddCompanyCode}
        addCompanyName={addForm.addCompanyName}
        setAddCompanyName={addForm.setAddCompanyName}
        addCompanyTaxId={addForm.addCompanyTaxId}
        setAddCompanyTaxId={addForm.setAddCompanyTaxId}
        addCompanyBranchCode={addForm.addCompanyBranchCode}
        setAddCompanyBranchCode={addForm.setAddCompanyBranchCode}
        addCompanyBranchName={addForm.addCompanyBranchName}
        setAddCompanyBranchName={addForm.setAddCompanyBranchName}
        addCompanyPhone={addForm.addCompanyPhone}
        setAddCompanyPhone={addForm.setAddCompanyPhone}
        addCompanyEmail={addForm.addCompanyEmail}
        setAddCompanyEmail={addForm.setAddCompanyEmail}
        addCompanyAddress={addForm.addCompanyAddress}
        setAddCompanyAddress={addForm.setAddCompanyAddress}
        addCompanyIsHq={addForm.addCompanyIsHq}
        setAddCompanyIsHq={addForm.setAddCompanyIsHq}
        addEmail={addForm.addEmail}
        setAddEmail={addForm.setAddEmail}
        addRole={addForm.addRole}
        setAddRole={addForm.setAddRole}
        addWarehouseName={addForm.addWarehouseName}
        setAddWarehouseName={addForm.setAddWarehouseName}
        addWarehouseCode={addForm.addWarehouseCode}
        setAddWarehouseCode={addForm.setAddWarehouseCode}
        creationMode={addForm.creationMode}
        setCreationMode={addForm.setCreationMode}
        selectedWarehouseId={addForm.selectedWarehouseId}
        setSelectedWarehouseId={addForm.setSelectedWarehouseId}
        warehousesList={binsList.reduce((acc: Array<{ id: string; name: string; code?: string }>, item) => {
          if (!acc.some((w) => w.id === item.warehouseId)) {
            acc.push({ id: item.warehouseId, name: item.warehouseName });
          }
          return acc;
        }, [])}
        addBinCode={addForm.addBinCode}
        setAddBinCode={addForm.setAddBinCode}
        addZone={addForm.addZone}
        setAddZone={addForm.setAddZone}
        addRack={addForm.addRack}
        setAddRack={addForm.setAddRack}
        addShelf={addForm.addShelf}
        setAddShelf={addForm.setAddShelf}
        addCapacityKg={addForm.addCapacityKg}
        setAddCapacityKg={addForm.setAddCapacityKg}
        addSupplierName={addForm.addSupplierName}
        setAddSupplierName={addForm.setAddSupplierName}
        addContactPerson={addForm.addContactPerson}
        setAddContactPerson={addForm.setAddContactPerson}
        addPhone={addForm.addPhone}
        setAddPhone={addForm.setAddPhone}
        addTaxId={addForm.addTaxId}
        setAddTaxId={addForm.setAddTaxId}
        addCatCode={addForm.addCatCode}
        setAddCatCode={addForm.setAddCatCode}
        addCatName={addForm.addCatName}
        setAddCatName={addForm.setAddCatName}
        addCatDescription={addForm.addCatDescription}
        setAddCatDescription={addForm.setAddCatDescription}
        addBrdCode={addForm.addBrdCode}
        setAddBrdCode={addForm.setAddBrdCode}
        addBrdName={addForm.addBrdName}
        setAddBrdName={addForm.setAddBrdName}
        addBrdDescription={addForm.addBrdDescription}
        setAddBrdDescription={addForm.setAddBrdDescription}
      />

      <ConfirmDeleteModal
        theme={theme}
        lang={lang}
        isOpen={Boolean(modals.deleteConfirmData)}
        isDeleting={modals.isDeleting}
        data={modals.deleteConfirmData}
        onClose={() => modals.setDeleteConfirmData(null)}
      />
    </div>
  );
};
export default MasterDataManagement;
