import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Download, CheckCircle2, RefreshCw, Command } from 'lucide-react';
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

  // 2. Product Edit Drawer Hook
  const productDrawer = useProductDrawer({
    productsList,
    setProductsList,
    categoriesList,
    brandsList,
    unitsList,
    suppliersList,
    showToast,
  });

  // 3. Modals & Operation Handlers Hook (Company, Supplier, Unit, Warehouse, Category, Brand, RBAC)
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

  // 4. Unified Add Modal Form Hook
  const addForm = useAddMasterDataForm({
    activeSubTab,
    categoriesList,
    brandsList,
    unitsList,
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

  const filteredProducts = productsList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2.5 border border-zinc-700 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="font-medium text-xs">{toastMessage}</span>
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

        <div className="flex items-center gap-2">
          {getAddButtonLabel() && (
            <button
              onClick={() => addForm.setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[14px] font-semibold shadow-xs shadow-blue-600/30 transition cursor-pointer active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>{getAddButtonLabel()}</span>
            </button>
          )}

          {/* Quick Refresh Active Tab Button */}
          <button
            onClick={() => loadTabData(activeSubTab, true)}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-md border text-[14px] font-medium flex items-center gap-1.5 transition cursor-pointer ${theme === 'dark'
                ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-50'
                : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 shadow-xs disabled:opacity-50'
              }`}
            title={lang === 'en' ? 'Refresh current tab data from server' : 'รีเฟรชข้อมูลแท็บนี้จากเซิร์ฟเวอร์'}
          >
            <RefreshCw className={`w-4 h-4 text-zinc-500 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            <span className="hidden sm:inline">{lang === 'en' ? 'Refresh' : 'รีเฟรช'}</span>
          </button>

          <button
            className={`px-3 py-1.5 rounded-md border text-[14px] font-medium flex items-center gap-1.5 transition ${theme === 'dark'
                ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 shadow-xs'
              }`}
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-zinc-500" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>


      {/* Enterprise Fast Search Toolbar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          ref={fastSearchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
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

      {/* TAB CONTENT ROUTING */}
      {activeSubTab === 'products' && (
        <ProductCatalogTab
          theme={theme}
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
          t={t}
          categoriesList={categoriesList}
          onOpenAddModal={() => addForm.setIsAddModalOpen(true)}
          onOpenEditCategory={modals.openEditCategory}
          onDeleteCategory={modals.handleDeleteCategory}
        />
      )}

      {activeSubTab === 'brands' && (
        <BrandManagementTab
          theme={theme}
          t={t}
          brandsList={brandsList}
          onOpenAddModal={() => addForm.setIsAddModalOpen(true)}
          onOpenEditBrand={modals.openEditBrand}
          onDeleteBrand={modals.handleDeleteBrand}
        />
      )}

      {activeSubTab === 'companies' && (
        <CompanyManagementTab
          theme={theme}
          searchQuery={searchQuery}
          companies={companiesList}
          onOpenEdit={modals.openEditCompany}
          onDelete={modals.handleDeleteCompany}
        />
      )}

      {activeSubTab === 'rbac' && (
        <RbacAccessTab
          theme={theme}
          t={t}
          usersList={usersList}
          onChangeUserRole={modals.handleChangeUserRole}
          onDeleteUser={modals.handleDeleteUser}
        />
      )}

      {activeSubTab === 'units' && (
        <UnitManagementTab
          theme={theme}
          t={t}
          unitsList={unitsList}
          onOpenAddModal={() => addForm.setIsAddModalOpen(true)}
          onOpenEditUnit={modals.openEditUnit}
          onDeleteUnit={modals.handleDeleteUnit}
        />
      )}

      {activeSubTab === 'barcodes' && <BarcodeManagementTab theme={theme} t={t} />}

      {activeSubTab === 'warehouses' && (
        <WarehouseBinTab
          theme={theme}
          t={t}
          binsList={binsList}
          onOpenEditBin={modals.openEditBin}
          onDeleteBin={modals.handleDeleteBin}
        />
      )}

      {activeSubTab === 'suppliers' && (
        <SupplierManagementTab
          theme={theme}
          t={t}
          suppliersList={suppliersList}
          onOpenEditSupplier={modals.openEditSupplier}
          onDeleteSupplier={modals.handleDeleteSupplier}
        />
      )}

      {/* MODALS & DRAWERS */}
      <ProductDrawer
        theme={theme}
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
        editCompIsActive={modals.editCompIsActive}
        setEditCompIsActive={modals.setEditCompIsActive}
      />

      <EditSupplierModal
        theme={theme}
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
        editBinCapacity={modals.editBinCapacity}
        setEditBinCapacity={modals.setEditBinCapacity}
        editBinIsActive={modals.editBinIsActive}
        setEditBinIsActive={modals.setEditBinIsActive}
      />

      <EditUnitModal
        theme={theme}
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
        product={modals.selectedProductForBarcode}
        onClose={() => modals.setSelectedProductForBarcode(null)}
      />

      <AddMasterDataModal
        theme={theme}
        t={t}
        isOpen={addForm.isAddModalOpen}
        onClose={() => addForm.setIsAddModalOpen(false)}
        activeSubTab={activeSubTab}
        onSubmit={addForm.handleCreateNewItem}
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
        addBinCode={addForm.addBinCode}
        setAddBinCode={addForm.setAddBinCode}
        addZone={addForm.addZone}
        setAddZone={addForm.setAddZone}
        addRack={addForm.addRack}
        setAddRack={addForm.setAddRack}
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
    </div>
  );
};
export default MasterDataManagement;
