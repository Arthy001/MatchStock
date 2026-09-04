import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Download, CheckCircle2, AlertCircle, RefreshCw, Command, ArrowLeft, Sparkles, Undo2 } from 'lucide-react';
import { ThemeMode, Language, MasterDataSubTab } from '../types';

// Custom Master Data Hooks
import { useMasterDataLoader } from './master-data/hooks/useMasterDataLoader';
import { useAddMasterDataForm } from './master-data/hooks/useAddMasterDataForm';

// Feature Components (Self-Contained Clean Architecture)
import { ProductCatalogTab } from '../features/products/components/ProductCatalogTab';
import { CategoryManagementTab } from '../features/categories/components/CategoryManagementTab';
import { BrandManagementTab } from '../features/brands/components/BrandManagementTab';
import { CompanyManagementTab } from '../features/companies/components/CompanyManagementTab';
import { WarehouseBinTab } from '../features/warehouses/components/WarehouseBinTab';
import { SupplierManagementTab } from '../features/suppliers/components/SupplierManagementTab';
import { UnitManagementTab } from '../features/units/components/UnitManagementTab';
import { RbacAccessTab } from '../features/rbac/components/RbacAccessTab';
import { BarcodeManagementTab } from './master-data/tabs/BarcodeManagementTab';

// Shared Add Modal
import { AddMasterDataModal } from './master-data/modals/AddMasterDataModal';

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
      // Intercept Ctrl+K or ⌘+K
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

  // Master Data Options for Add Form & Shared Data
  const {
    isLoading,
    loadTabData,
    categoriesList,
    brandsList,
    unitsList,
    companiesList,
    suppliersList,
    binsList,
    barcodeSymbologiesList,
    taxTypesList,
    setProductsList,
    setCompaniesList,
    setSuppliersList,
    setUnitsList,
    setBinsList,
    setCategoriesList,
    setBrandsList,
  } = useMasterDataLoader();

  useEffect(() => {
    loadTabData(activeSubTab);
  }, [activeSubTab, loadTabData]);

  // Unified Add Modal Form Hook
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
    showToast,
  });

  // Safe Warp State for Returning to Add Form
  const [warpState, setWarpState] = useState<{
    savedFormData: any;
    originTab: MasterDataSubTab;
    draftTitle?: string;
  } | null>(null);

  const handleWarpToSubTab = (targetTab: MasterDataSubTab) => {
    const draftSnapshot = {
      name: addForm.addName,
      code: addForm.addCode,
      sku: addForm.addSku,
      brand: addForm.addBrand,
      brandId: addForm.addBrandId,
      categoryId: addForm.addCategoryId,
      unitId: addForm.addUnitId,
      supplierId: addForm.addSupplierId,
      price: addForm.addPrice,
      costPrice: addForm.addCostPrice,
      stock: addForm.addStock,
      description: addForm.addDescription,
    };

    setWarpState({
      savedFormData: draftSnapshot,
      originTab: activeSubTab,
      draftTitle: addForm.addName ? `"${addForm.addName}"` : 'สินค้าใหม่',
    });

    addForm.setIsAddModalOpen(false);
    if (onSubTabChange) {
      onSubTabChange(targetTab);
    }
    showToast(
      lang === 'en'
        ? `Draft preserved. Switched to ${targetTab} management.`
        : `บันทึกแบบร่างแล้ว สลับไปยังหน้าจัดการ "${targetTab}" เรียบร้อย`
    );
  };

  const handleReturnFromWarp = () => {
    if (!warpState) return;
    if (onSubTabChange) {
      onSubTabChange(warpState.originTab);
    }
    const d = warpState.savedFormData;
    if (d) {
      addForm.setAddName(d.name || '');
      addForm.setAddCode(d.code || '');
      addForm.setAddSku(d.sku || '');
      addForm.setAddBrand(d.brand || '');
      addForm.setAddBrandId(d.brandId || '');
      addForm.setAddCategoryId(d.categoryId || '');
      addForm.setAddUnitId(d.unitId || '');
      addForm.setAddSupplierId(d.supplierId || '');
      addForm.setAddPrice(d.price || '0');
      addForm.setAddCostPrice(d.costPrice || '0');
      addForm.setAddStock(d.stock || '0');
      addForm.setAddDescription(d.description || '');
    }
    addForm.setIsAddModalOpen(true);
    setWarpState(null);
  };

  const handleDiscardWarp = () => {
    setWarpState(null);
    showToast(lang === 'en' ? 'Draft discarded.' : 'ยกเลิกแบบร่างแล้ว');
  };

  const isEn = lang === 'en';

  const getHeaderInfo = () => {
    switch (activeSubTab) {
      case 'products':
        return {
          title: isEn ? 'Product Catalog' : 'รายการสินค้าและสต็อก (Product Catalog)',
          subtitle: isEn
            ? 'Manage SKUs, master pricing, categories, and inventory parameters'
            : 'จัดการรายการสินค้า SKU ราคาขาย หมวดหมู่ และพารามิเตอร์สต็อก',
        };
      case 'warehouses':
        return {
          title: isEn ? 'Warehouses & Bins' : 'คลังสินค้าและตำแหน่งจัดเก็บ (Warehouses & Bins)',
          subtitle: isEn
            ? 'Warehouse layouts, 3D digital twins, rack levels, and capacity management'
            : 'จัดการคลังสินค้า ผัง 3D ดิจิทัลทวิน และความจุของตำแหน่งจัดเก็บ',
        };
      case 'categories':
        return {
          title: isEn ? 'Product Categories' : 'หมวดหมู่สินค้า (Product Categories)',
          subtitle: isEn
            ? 'Organize product hierarchies, taxonomies, and inventory groupings'
            : 'จัดการโครงสร้างหมวดหมู่สินค้า และการจัดกลุ่มสต็อก',
        };
      case 'brands':
        return {
          title: isEn ? 'Brands & Manufacturers' : 'แบรนด์และผู้ผลิต (Brands & Manufacturers)',
          subtitle: isEn
            ? 'Manage brand identities, trademarks, and manufacturer details'
            : 'จัดการรายชื่อแบรนด์ ผู้ผลิต และตราสินค้า',
        };
      case 'units':
        return {
          title: isEn ? 'Units of Measure' : 'หน่วยนับสินค้า (Units of Measure)',
          subtitle: isEn
            ? 'Configure base units, packaging types, and conversion units'
            : 'กำหนดหน่วยนับพื้นฐาน และหน่วยบรรจุภัณฑ์',
        };
      case 'companies':
        return {
          title: isEn ? 'Subsidiaries & Branches' : 'บริษัทในเครือและสาขา (Subsidiaries & Branches)',
          subtitle: isEn
            ? 'Manage legal entities, subsidiaries, branch locations, and tax IDs'
            : 'จัดการบริษัทในเครือ สาขา และเลขประจำตัวผู้เสียภาษี',
        };
      case 'suppliers':
        return {
          title: isEn ? 'Suppliers & Vendors' : 'ผู้จัดจำหน่าย (Suppliers & Vendors)',
          subtitle: isEn
            ? 'Maintain supplier profiles, purchase contacts, and vendor terms'
            : 'จัดการรายชื่อผู้จัดจำหน่าย และคู่ค้า',
        };
      case 'rbac':
        return {
          title: isEn ? 'Role-Based Access Control' : 'กำหนดสิทธิ์ผู้ใช้งาน (RBAC Permissions)',
          subtitle: isEn
            ? 'Assign granular access roles and system permissions'
            : 'กำหนดสิทธิ์การเข้าถึงและบทบาทของผู้ใช้งานในระบบ',
        };
      case 'barcodes':
        return {
          title: isEn ? 'Barcode Management' : 'จัดการบาร์โค้ด (Barcode Formats)',
          subtitle: isEn
            ? 'Barcode standard symbologies, QR code generators, and label printing'
            : 'มาตรฐานบาร์โค้ด และการพิมพ์ฉลากสินค้า',
        };
      default:
        return { title: 'Master Data', subtitle: 'Master entity configuration' };
    }
  };

  const getAddButtonLabel = () => {
    switch (activeSubTab) {
      case 'products':
        return isEn ? 'New Product' : 'เพิ่มสินค้าใหม่';
      case 'categories':
        return isEn ? 'New Category' : 'เพิ่มหมวดหมู่';
      case 'brands':
        return isEn ? 'New Brand' : 'เพิ่มแบรนด์';
      case 'units':
        return isEn ? 'New Unit' : 'เพิ่มหน่วยนับ';
      case 'companies':
        return isEn ? 'New Company' : 'เพิ่มบริษัทในเครือ';
      case 'suppliers':
        return isEn ? 'New Supplier' : 'เพิ่มผู้จัดจำหน่าย';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold backdrop-blur-xs border border-white/10 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Warp Banner */}
      {warpState && (
        <div className="p-3.5 rounded-xl border border-blue-500/40 bg-gradient-to-r from-blue-950/80 via-slate-900/80 to-indigo-950/80 text-white flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg shadow-blue-500/10 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-300">
                  {lang === 'en' ? 'Quick Add Mode Active' : 'โหมดบันทึกข้อมูลด่วน'}
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

      {/* Title & Actions Toolbar */}
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
        </div>
      </div>

      {/* Global Fast Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          ref={fastSearchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            isEn
              ? `Filter ${activeSubTab}... (Press ${isMac ? '⌘' : 'Ctrl'}+K to search)`
              : `ค้นหาใน ${activeSubTab}... (กด ${isMac ? '⌘' : 'Ctrl'}+K เพื่อค้นหาด่วน)`
          }
          className={`w-full pl-9 pr-14 py-2 rounded-lg border text-xs sm:text-sm transition-all outline-hidden ${
            theme === 'dark'
              ? 'bg-zinc-900 border-zinc-700/80 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              : 'bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 shadow-xs'
          }`}
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-0.5">
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md">
            {isMac ? '⌘' : 'Ctrl'}
          </kbd>
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md">
            K
          </kbd>
        </div>
      </div>

      {/* Self-Contained Feature Tab Router */}
      <div className="pt-2">
        {activeSubTab === 'products' && (
          <ProductCatalogTab
            theme={theme}
            lang={lang}
            searchQuery={searchQuery}
            categoriesList={categoriesList}
            brandsList={brandsList}
            unitsList={unitsList}
            suppliersList={suppliersList}
            barcodeSymbologiesList={barcodeSymbologiesList}
            taxTypesList={taxTypesList}
            showToast={showToast}
          />
        )}

        {activeSubTab === 'warehouses' && (
          <WarehouseBinTab
            theme={theme}
            lang={lang}
            searchQuery={searchQuery}
            showToast={showToast}
          />
        )}

        {activeSubTab === 'categories' && (
          <CategoryManagementTab
            theme={theme}
            lang={lang}
            searchQuery={searchQuery}
            showToast={showToast}
          />
        )}

        {activeSubTab === 'brands' && (
          <BrandManagementTab
            theme={theme}
            lang={lang}
            searchQuery={searchQuery}
            showToast={showToast}
          />
        )}

        {activeSubTab === 'units' && (
          <UnitManagementTab
            theme={theme}
            lang={lang}
            searchQuery={searchQuery}
            showToast={showToast}
          />
        )}

        {activeSubTab === 'companies' && (
          <CompanyManagementTab
            theme={theme}
            lang={lang}
            searchQuery={searchQuery}
            showToast={showToast}
          />
        )}

        {activeSubTab === 'suppliers' && (
          <SupplierManagementTab
            theme={theme}
            lang={lang}
            searchQuery={searchQuery}
            showToast={showToast}
          />
        )}

        {activeSubTab === 'rbac' && (
          <RbacAccessTab
            theme={theme}
            lang={lang}
            t={{
              rbacTitle: isEn ? 'User Roles & Access Control' : 'กำหนดสิทธิ์และบทบาทผู้ใช้งาน',
              rbacSubtitle: isEn ? 'Manage user roles and system privileges' : 'จัดการสิทธิ์และหน้าที่ของผู้ใช้ในระบบ',
            }}
            usersList={[]}
            onChangeUserRole={() => {}}
            onDeleteUser={() => {}}
          />
        )}

        {activeSubTab === 'barcodes' && (
          <BarcodeManagementTab
            theme={theme}
            t={{
              barcodeTitle: isEn ? 'Barcode Standard Specifications' : 'มาตรฐานบาร์โค้ดและฉลาก',
              barcodeSubtitle: isEn ? 'Manage barcode symbologies and formats' : 'จัดการประเภทบาร์โค้ดและรูปแบบฉลาก',
            }}
          />
        )}
      </div>

      {/* Shared Add Item Modal */}
      <AddMasterDataModal
        theme={theme}
        lang={lang}
        t={{}}
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
            acc.push({
              id: item.warehouseId,
              name: item.warehouseName,
              code: (item as any).warehouseCode || (item as any).code,
            });
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
    </div>
  );
};
export default MasterDataManagement;
