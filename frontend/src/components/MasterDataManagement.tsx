import React, { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ThemeMode, Language, MasterDataSubTab } from '../types';

// Custom Master Data Loader Hook
import { useMasterDataLoader } from './master-data/hooks/useMasterDataLoader';

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

  // Master Data Options for Shared Features
  const {
    isLoading,
    loadTabData,
    categoriesList,
    brandsList,
    unitsList,
    companiesList,
    suppliersList,
    barcodeSymbologiesList,
    taxTypesList,
  } = useMasterDataLoader();

  useEffect(() => {
    loadTabData(activeSubTab);
  }, [activeSubTab, loadTabData]);

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
    </div>
  );
};

export default MasterDataManagement;
