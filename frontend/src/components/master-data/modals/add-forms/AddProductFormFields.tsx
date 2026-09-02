import React from 'react';
import { Camera, Upload, ImageIcon, Link2, CheckCircle2, Trash2, RotateCcw, Layers, ExternalLink } from 'lucide-react';
import {
  ThemeMode,
  Language,
  MasterDataSubTab,
  UnitItem,
  BrandItem,
  CategoryItem,
  Supplier,
  BarcodeSymbologyItem,
  TaxTypeItem,
} from '../../../../types';
import { CustomSelect } from '../../../common/CustomSelect';

interface AddProductFormFieldsProps {
  theme: ThemeMode;
  lang?: Language;
  t: Record<string, string>;
  onWarpToTab?: (tab: MasterDataSubTab, label: string) => void;
  // Image
  addProductImagePreview?: string;
  setAddProductImagePreview?: (val: string) => void;
  setAddProductImageFile?: (file: File | null) => void;
  imageInputRef: React.RefObject<HTMLInputElement>;
  // Basic info
  addName: string;
  setAddName: (val: string) => void;
  addCode: string;
  setAddCode: (val: string) => void;
  addSku: string;
  setAddSku: (val: string) => void;
  // Brands
  addBrand: string;
  setAddBrand: (val: string) => void;
  addBrandId?: string;
  setAddBrandId?: (val: string) => void;
  brandsList: BrandItem[];
  // Categories
  addCategoryId?: string;
  setAddCategoryId?: (val: string) => void;
  categoriesList: CategoryItem[];
  // Suppliers
  addSupplierId?: string;
  setAddSupplierId?: (val: string) => void;
  suppliersList: Supplier[];
  // Barcode
  addBarcode: string;
  setAddBarcode: (val: string) => void;
  addBarcodeSymbologyId?: string;
  setAddBarcodeSymbologyId?: (val: string) => void;
  barcodeSymbologiesList: BarcodeSymbologyItem[];
  // Pricing & Stock & UOM
  addPrice: string;
  setAddPrice: (val: string) => void;
  addCostPrice?: string;
  setAddCostPrice?: (val: string) => void;
  addStock: string;
  setAddStock: (val: string) => void;
  addUnitId?: string;
  setAddUnitId?: (val: string) => void;
  setAddUom: (val: string) => void;
  unitsList: UnitItem[];
  // Tax
  addTaxTypeId?: string;
  setAddTaxTypeId?: (val: string) => void;
  taxTypesList: TaxTypeItem[];
  // Dimensions & Weight
  addWeightKg: string;
  setAddWeightKg: (val: string) => void;
  addWidthCm: string;
  setAddWidthCm: (val: string) => void;
  addLengthCm: string;
  setAddLengthCm: (val: string) => void;
  addHeightCm: string;
  setAddHeightCm: (val: string) => void;
  // Reorder Rules
  addReorderPoint: string;
  setAddReorderPoint: (val: string) => void;
  addMinReorderQty: string;
  setAddMinReorderQty: (val: string) => void;
  addWarrantyDays?: string;
  setAddWarrantyDays?: (val: string) => void;
  // Switches
  addIsLotControl: boolean;
  setAddIsLotControl: (val: boolean) => void;
  addIsReturnable?: boolean;
  setAddIsReturnable?: (val: boolean) => void;
  // Description
  addDescription: string;
  setAddDescription: (val: string) => void;
}

export const AddProductFormFields: React.FC<AddProductFormFieldsProps> = ({
  theme,
  lang = 'th',
  t,
  onWarpToTab,
  addProductImagePreview,
  setAddProductImagePreview,
  setAddProductImageFile,
  imageInputRef,
  addName,
  setAddName,
  addCode,
  setAddCode,
  addSku,
  setAddSku,
  addBrand,
  setAddBrand,
  addBrandId,
  setAddBrandId,
  brandsList,
  addCategoryId,
  setAddCategoryId,
  categoriesList,
  addSupplierId,
  setAddSupplierId,
  suppliersList,
  addBarcode,
  setAddBarcode,
  addBarcodeSymbologyId,
  setAddBarcodeSymbologyId,
  barcodeSymbologiesList,
  addPrice,
  setAddPrice,
  addCostPrice,
  setAddCostPrice,
  addStock,
  setAddStock,
  addUnitId,
  setAddUnitId,
  setAddUom,
  unitsList,
  addTaxTypeId,
  setAddTaxTypeId,
  taxTypesList,
  addWeightKg,
  setAddWeightKg,
  addWidthCm,
  setAddWidthCm,
  addLengthCm,
  setAddLengthCm,
  addHeightCm,
  setAddHeightCm,
  addReorderPoint,
  setAddReorderPoint,
  addMinReorderQty,
  setAddMinReorderQty,
  addWarrantyDays,
  setAddWarrantyDays,
  addIsLotControl,
  setAddIsLotControl,
  addIsReturnable,
  setAddIsReturnable,
  addDescription,
  setAddDescription,
}) => {
  const isEn = lang === 'en';

  return (
    <>
      {/* Product Image & Basic Info */}
      <div className="flex items-start gap-3.5">
        <div className="relative group shrink-0">
          {addProductImagePreview ? (
            <img
              src={addProductImagePreview}
              alt="Product Preview"
              className={`w-16 h-16 rounded-2xl object-cover border shadow-xs ${
                theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'
              }`}
            />
          ) : (
            <div
              className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center shadow-xs ${
                theme === 'dark'
                  ? 'border-slate-700 bg-slate-800 text-slate-400'
                  : 'border-slate-200 bg-slate-100 text-slate-400'
              }`}
            >
              <ImageIcon className="w-6 h-6 opacity-60" />
            </div>
          )}
          <input
            type="file"
            ref={imageInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const previewUrl = URL.createObjectURL(file);
                if (setAddProductImagePreview) setAddProductImagePreview(previewUrl);
                if (setAddProductImageFile) setAddProductImageFile(file);
              }
            }}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="absolute inset-0 rounded-2xl bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer text-[10px] font-semibold"
            title={isEn ? 'Select Product Image' : 'เลือกรูปภาพสินค้า (Select Image)'}
          >
            <Camera className="w-4 h-4 mb-0.5" />
            <span>{isEn ? 'Select' : 'เลือกรูป'}</span>
          </button>
        </div>

        <div className="flex-1">
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            {isEn ? 'Product Name' : t.productName} <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            type="text"
            required
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder={isEn ? 'e.g. Corrugated Box 30x30x30 cm.' : 'เช่น กล่องกระดาษลูกฟูก 30x30x30 ซม.'}
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          />
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <Upload className="w-3 h-3" />
              {addProductImagePreview
                ? isEn ? 'Change Selected Image' : 'เปลี่ยนรูปภาพที่เลือก'
                : isEn ? 'Upload Image (JPG, PNG, WebP)' : 'เลือกรูปภาพสินค้า (JPG, PNG, WebP)'}
            </button>
            {addProductImagePreview && (
              <button
                type="button"
                onClick={() => {
                  if (setAddProductImagePreview) setAddProductImagePreview('');
                  if (setAddProductImageFile) setAddProductImageFile(null);
                  if (imageInputRef.current) imageInputRef.current.value = '';
                }}
                className="text-[11px] text-rose-500 hover:underline flex items-center gap-0.5 font-medium cursor-pointer ml-1"
              >
                <Trash2 className="w-3 h-3" />
                {isEn ? 'Remove' : 'ลบรูป'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview URL Box */}
      {addProductImagePreview && (
        <div
          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
            theme === 'dark'
              ? 'bg-slate-800/60 border-slate-700 text-slate-300'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <div className="min-w-0 flex-1">
              <span className="font-semibold block text-[11px] text-slate-500 dark:text-slate-400">
                {isEn ? 'Ready to upload on save:' : 'พร้อมอัปโหลดเมื่อกดบันทึก (Ready to upload):'}
              </span>
              <span className="font-mono text-[10px] truncate block text-emerald-600 dark:text-emerald-400">
                {addProductImagePreview}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Product Code */}
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
          {isEn ? 'Product Code' : `${t.code} / รหัสสินค้า`}{' '}
          <span className="text-slate-400 font-normal text-xs">
            {isEn ? '(Optional - Auto if blank)' : '(ไม่บังคับ - สร้างอัตโนมัติถ้าว่าง)'}
          </span>
        </label>
        <input
          type="text"
          value={addCode}
          onChange={(e) => setAddCode(e.target.value)}
          placeholder={isEn ? 'PRD-1005 (Auto generated if blank)' : 'PRD-1005 (สร้างอัตโนมัติถ้าว่าง)'}
          className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden transition ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
          }`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            {isEn ? 'SKU (Stock Keeping Unit)' : `${t.sku} (Stock Keeping Unit)`}{' '}
            <span className="text-slate-400 font-normal text-xs">
              {isEn ? '(Optional)' : '(ไม่บังคับ)'}
            </span>
          </label>
          <input
            type="text"
            value={addSku}
            onChange={(e) => setAddSku(e.target.value)}
            placeholder={isEn ? 'SKU-889911 (Auto if blank)' : 'SKU-889911 (สร้างอัตโนมัติถ้าว่าง)'}
            className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px]">
              {isEn ? 'Brand' : `${t.brand} (Brand)`}{' '}
              <span className="text-slate-400 font-normal text-xs">
                {isEn ? '(Optional)' : '(ไม่บังคับ)'}
              </span>
            </label>
            {onWarpToTab && (
              <button
                type="button"
                onClick={() => onWarpToTab('brands', isEn ? 'Brands' : 'แบรนด์สินค้า')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline cursor-pointer flex items-center gap-0.5"
                title={isEn ? 'Warp to Brands tab to manage' : 'วาปไปจัดการแบรนด์สินค้า'}
              >
                <span>{isEn ? 'Manage ↗' : 'จัดการ ↗'}</span>
              </button>
            )}
          </div>
          {brandsList.length > 0 ? (
            <CustomSelect
              theme={theme}
              value={addBrandId || addBrand}
              onChange={(val) => {
                if (val === '__WARP_BRANDS__') {
                  onWarpToTab && onWarpToTab('brands', isEn ? 'Brands' : 'แบรนด์สินค้า');
                  return;
                }
                const sel = brandsList.find((b) => b.id === val || b.name === val);
                if (setAddBrandId) setAddBrandId(sel ? sel.id : val);
                setAddBrand(sel ? sel.name : val);
              }}
              placeholder={isEn ? '-- Select Brand --' : '-- เลือกแบรนด์ --'}
              options={[
                { value: '', label: isEn ? '-- Select Brand --' : '-- เลือกแบรนด์ --' },
                ...brandsList.map((b) => ({ value: b.id, label: b.name })),
                ...(onWarpToTab
                  ? [
                      {
                        value: '__WARP_BRANDS__',
                        label: isEn ? '⚡ + Manage / Create New Brand...' : '⚡ + จัดการ / เพิ่มแบรนด์ใหม่...',
                        isAction: true,
                      },
                    ]
                  : []),
              ]}
            />
          ) : (
            <input
              type="text"
              value={addBrand}
              onChange={(e) => setAddBrand(e.target.value)}
              placeholder={isEn ? 'Nike, Adidas, Apple...' : 'Nike, Adidas, Apple...'}
              className={`w-full h-[42px] px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
              }`}
            />
          )}
        </div>
      </div>

      {/* Master Data Dropdowns: Category & Supplier */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px]">
              {isEn ? 'Category' : 'หมวดหมู่ (Category)'}{' '}
              <span className="text-slate-400 font-normal text-xs">
                {isEn ? '(Optional)' : '(ไม่บังคับ)'}
              </span>
            </label>
            {onWarpToTab && (
              <button
                type="button"
                onClick={() => onWarpToTab('categories', isEn ? 'Categories' : 'หมวดหมู่สินค้า')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline cursor-pointer flex items-center gap-0.5"
                title={isEn ? 'Warp to Categories tab to manage' : 'วาปไปจัดการหมวดหมู่สินค้า'}
              >
                <span>{isEn ? 'Manage ↗' : 'จัดการ ↗'}</span>
              </button>
            )}
          </div>
          <CustomSelect
            theme={theme}
            value={addCategoryId || ''}
            onChange={(val) => {
              if (val === '__WARP_CATEGORIES__') {
                onWarpToTab && onWarpToTab('categories', isEn ? 'Categories' : 'หมวดหมู่สินค้า');
                return;
              }
              setAddCategoryId && setAddCategoryId(val);
            }}
            placeholder={isEn ? '-- Uncategorized --' : '-- ไม่ระบุหมวดหมู่ --'}
            options={[
              { value: '', label: isEn ? '-- Uncategorized --' : '-- ไม่ระบุหมวดหมู่ --' },
              ...categoriesList.map((c) => ({ value: c.id, label: c.name })),
              ...(onWarpToTab
                ? [
                    {
                      value: '__WARP_CATEGORIES__',
                      label: isEn ? '⚡ + Manage / Create New Category...' : '⚡ + จัดการ / เพิ่มหมวดหมู่ใหม่...',
                      isAction: true,
                    },
                  ]
                : []),
            ]}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px]">
              {isEn ? 'Supplier / Vendor' : 'ผู้จัดจำหน่าย (Supplier)'}{' '}
              <span className="text-slate-400 font-normal text-xs">
                {isEn ? '(Optional)' : '(ไม่บังคับ)'}
              </span>
            </label>
            {onWarpToTab && (
              <button
                type="button"
                onClick={() => onWarpToTab('suppliers', isEn ? 'Suppliers' : 'ผู้จัดจำหน่าย')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline cursor-pointer flex items-center gap-0.5"
                title={isEn ? 'Warp to Suppliers tab to manage' : 'วาปไปจัดการผู้จัดจำหน่าย'}
              >
                <span>{isEn ? 'Manage ↗' : 'จัดการ ↗'}</span>
              </button>
            )}
          </div>
          <CustomSelect
            theme={theme}
            value={addSupplierId || ''}
            onChange={(val) => {
              if (val === '__WARP_SUPPLIERS__') {
                onWarpToTab && onWarpToTab('suppliers', isEn ? 'Suppliers' : 'ผู้จัดจำหน่าย');
                return;
              }
              setAddSupplierId && setAddSupplierId(val);
            }}
            placeholder={isEn ? '-- No Supplier --' : '-- ไม่ระบุผู้จัดจำหน่าย --'}
            options={[
              { value: '', label: isEn ? '-- No Supplier --' : '-- ไม่ระบุผู้จัดจำหน่าย --' },
              ...suppliersList.map((s) => ({ value: s.id, label: s.name })),
              ...(onWarpToTab
                ? [
                    {
                      value: '__WARP_SUPPLIERS__',
                      label: isEn ? '⚡ + Manage / Create New Supplier...' : '⚡ + จัดการ / เพิ่มผู้จัดจำหน่ายใหม่...',
                      isAction: true,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </div>

      {/* Barcode & Barcode Symbology */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            {isEn ? 'Barcode Value' : 'รหัสบาร์โค้ด (Barcode Value)'}{' '}
            <span className="text-slate-400 font-normal text-xs">
              {isEn ? '(Optional)' : '(ไม่บังคับ)'}
            </span>
          </label>
          <input
            type="text"
            value={addBarcode}
            onChange={(e) => setAddBarcode(e.target.value)}
            placeholder={isEn ? '8851234567890 (Auto if blank)' : '8851234567890 (สร้างอัตโนมัติถ้าว่าง)'}
            className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            {isEn ? 'Barcode Symbology' : 'ประเภทบาร์โค้ด (Symbology)'}{' '}
            <span className="text-slate-400 font-normal text-xs">
              {isEn ? '(Optional)' : '(ไม่บังคับ)'}
            </span>
          </label>
          <CustomSelect
            theme={theme}
            value={addBarcodeSymbologyId || ''}
            onChange={(val) => setAddBarcodeSymbologyId && setAddBarcodeSymbologyId(val)}
            placeholder={isEn ? '-- Auto / CODE-128 --' : '-- Auto / CODE-128 --'}
            options={[
              { value: '', label: isEn ? '-- Auto / CODE-128 --' : '-- Auto / CODE-128 --' },
              ...barcodeSymbologiesList.map((b) => ({
                value: b.id,
                label: b.code || b.name,
              })),
            ]}
          />
        </div>
      </div>

      {/* Price, Cost Price, Stock & UOM (4-Column Balanced Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <div className="h-6 flex items-center justify-between mb-1.5">
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] truncate">
              {isEn ? 'Selling Price' : t.price} (฿) <span className="text-rose-500 font-bold">*</span>
            </label>
          </div>
          <input
            type="number"
            step="0.01"
            value={addPrice}
            onChange={(e) => setAddPrice(e.target.value)}
            className={`w-full h-[42px] px-3 py-2 rounded-xl border font-bold text-blue-600 dark:text-blue-400 outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 focus:border-blue-500'
                : 'bg-blue-50/50 border-slate-300 focus:border-blue-500'
            }`}
          />
        </div>
        <div>
          <div className="h-6 flex items-center justify-between mb-1.5">
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] truncate">
              {isEn ? 'Cost Price (฿)' : 'ราคาทุน (Cost)'}{' '}
              <span className="text-slate-400 font-normal text-xs">
                {isEn ? '(Optional)' : '(ไม่บังคับ)'}
              </span>
            </label>
          </div>
          <input
            type="number"
            step="0.01"
            value={addCostPrice}
            onChange={(e) => setAddCostPrice && setAddCostPrice(e.target.value)}
            className={`w-full h-[42px] px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          />
        </div>
        <div>
          <div className="h-6 flex items-center justify-between mb-1.5">
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] truncate">
              {isEn ? 'Initial Stock' : t.stockOnHand}{' '}
              <span className="text-slate-400 font-normal text-xs">
                {isEn ? '(Optional)' : '(ไม่บังคับ)'}
              </span>
            </label>
          </div>
          <input
            type="number"
            value={addStock}
            onChange={(e) => setAddStock(e.target.value)}
            className={`w-full h-[42px] px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          />
        </div>
        <div>
          <div className="h-6 flex items-center justify-between mb-1.5">
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] truncate">
              {isEn ? 'Unit (UOM)' : 'หน่วยนับ (UOM)'}{' '}
              <span className="text-slate-400 font-normal text-xs">
                {isEn ? '(Opt)' : '(ไม่บังคับ)'}
              </span>
            </label>
            {onWarpToTab && (
              <button
                type="button"
                onClick={() => onWarpToTab('units', isEn ? 'Units of Measure' : 'หน่วยนับ')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 hover:underline cursor-pointer flex items-center gap-0.5 whitespace-nowrap shrink-0 ml-1"
                title={isEn ? 'Warp to Units tab to manage' : 'วาปไปจัดการหน่วยนับ'}
              >
                <span>{isEn ? 'Manage ↗' : 'จัดการ ↗'}</span>
              </button>
            )}
          </div>
          <CustomSelect
            theme={theme}
            value={addUnitId || ''}
            onChange={(val) => {
              if (val === '__WARP_UNITS__') {
                onWarpToTab && onWarpToTab('units', isEn ? 'Units of Measure' : 'หน่วยนับ');
                return;
              }
              const sel = unitsList.find((u) => u.id === val || u.code === val);
              if (setAddUnitId) setAddUnitId(sel ? sel.id : val);
              setAddUom(sel ? sel.code : val);
            }}
            placeholder={isEn ? '-- Select Unit --' : '-- ไม่ระบุหน่วยนับ --'}
            options={[
              { value: '', label: isEn ? '-- Select Unit --' : '-- ไม่ระบุหน่วยนับ --' },
              ...(unitsList.length > 0
                ? unitsList.map((u) => ({ value: u.id, label: `${u.code} - ${u.name}` }))
                : [
                    { value: 'PCS', label: isEn ? 'PCS (Piece)' : 'PCS (ชิ้น)' },
                    { value: 'PAIR', label: isEn ? 'PAIR (Pair)' : 'PAIR (คู่)' },
                    { value: 'BOX', label: isEn ? 'BOX (Box)' : 'BOX (กล่อง)' },
                    { value: 'PACK', label: isEn ? 'PACK (Pack)' : 'PACK (แพ็ค)' },
                    { value: 'SET', label: isEn ? 'SET (Set)' : 'SET (ชุด)' },
                  ]),
              ...(onWarpToTab
                ? [
                    {
                      value: '__WARP_UNITS__',
                      label: isEn ? '⚡ + Manage / Create New Unit...' : '⚡ + จัดการ / เพิ่มหน่วยนับใหม่...',
                      isAction: true,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      </div>

      {/* Tax Type */}
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
          {isEn ? 'Tax Type' : 'ประเภทภาษี (Tax Type)'}{' '}
          <span className="text-slate-400 font-normal text-xs">
            {isEn ? '(Optional)' : '(ไม่บังคับ)'}
          </span>
        </label>
        <CustomSelect
          theme={theme}
          value={addTaxTypeId || ''}
          onChange={(val) => setAddTaxTypeId && setAddTaxTypeId(val)}
          placeholder={isEn ? '-- Non-VAT / Default --' : '-- ไม่ระบุ / Non-VAT --'}
          options={[
            { value: '', label: isEn ? '-- Non-VAT / Default --' : '-- ไม่ระบุ / Non-VAT --' },
            ...taxTypesList.map((tax) => ({
              value: tax.id,
              label: `${tax.name} ${tax.ratePercent !== undefined ? `(${tax.ratePercent}%)` : ''}`,
            })),
          ]}
        />
      </div>

      {/* Weight & Dimensions */}
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
          {isEn ? 'Dimensions & Weight' : 'มิติขนาด & น้ำหนัก (Dimensions & Weight)'}{' '}
          <span className="text-slate-400 font-normal text-xs normal-case">
            {isEn ? '(Optional)' : '(ไม่บังคับ)'}
          </span>
        </span>
        <div className="grid grid-cols-4 gap-2.5">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-medium text-[11px] mb-1">
              {isEn ? 'Weight (kg)' : 'น้ำหนัก (kg)'}
            </label>
            <input
              type="number"
              step="0.01"
              value={addWeightKg}
              onChange={(e) => setAddWeightKg(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-lg border font-medium text-xs outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-medium text-[11px] mb-1">
              {isEn ? 'Width (cm)' : 'กว้าง (cm)'}
            </label>
            <input
              type="number"
              step="0.1"
              value={addWidthCm}
              onChange={(e) => setAddWidthCm(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-lg border font-medium text-xs outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-medium text-[11px] mb-1">
              {isEn ? 'Length (cm)' : 'ยาว (cm)'}
            </label>
            <input
              type="number"
              step="0.1"
              value={addLengthCm}
              onChange={(e) => setAddLengthCm(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-lg border font-medium text-xs outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-medium text-[11px] mb-1">
              {isEn ? 'Height (cm)' : 'สูง (cm)'}
            </label>
            <input
              type="number"
              step="0.1"
              value={addHeightCm}
              onChange={(e) => setAddHeightCm(e.target.value)}
              className={`w-full px-2.5 py-1.5 rounded-lg border font-medium text-xs outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Inventory & Reorder Rules */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            {isEn ? 'Reorder Point (ROP)' : 'จุดสั่งซื้อซ้ำ (ROP)'}{' '}
            <span className="text-slate-400 font-normal text-xs">
              {isEn ? '(Optional)' : '(ไม่บังคับ)'}
            </span>
          </label>
          <input
            type="number"
            value={addReorderPoint}
            onChange={(e) => setAddReorderPoint(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border font-bold outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-amber-400 focus:border-amber-500'
                : 'bg-amber-50/50 border-slate-300 text-amber-700 focus:border-amber-500'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            {isEn ? 'Min Reorder Qty' : 'ยอดสั่งซื้อขั้นต่ำ (Min Qty)'}{' '}
            <span className="text-slate-400 font-normal text-xs">
              {isEn ? '(Optional)' : '(ไม่บังคับ)'}
            </span>
          </label>
          <input
            type="number"
            value={addMinReorderQty}
            onChange={(e) => setAddMinReorderQty(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            {isEn ? 'Warranty (Days)' : 'รับประกัน (วัน)'}{' '}
            <span className="text-slate-400 font-normal text-xs">
              {isEn ? '(Optional)' : '(ไม่บังคับ)'}
            </span>
          </label>
          <input
            type="number"
            value={addWarrantyDays}
            onChange={(e) => setAddWarrantyDays && setAddWarrantyDays(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          />
        </div>
      </div>

      {/* Control Switches (Enterprise Interactive Toggle Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Lot / Batch Control Card */}
        <div
          onClick={() => setAddIsLotControl(!addIsLotControl)}
          className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-3 ${
            addIsLotControl
              ? theme === 'dark'
                ? 'bg-blue-950/40 border-blue-500/60 shadow-xs shadow-blue-500/10'
                : 'bg-blue-50/80 border-blue-400 shadow-xs shadow-blue-500/10'
              : theme === 'dark'
              ? 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70 hover:border-slate-600'
              : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                addIsLotControl
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                  : theme === 'dark'
                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span
                className={`block text-xs font-bold leading-tight ${
                  addIsLotControl
                    ? theme === 'dark' ? 'text-blue-300' : 'text-blue-900'
                    : theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                {isEn ? 'Lot & Batch Control' : 'คุมล็อต & วันหมดอายุ'}
              </span>
              <span className="block text-[11px] text-slate-400 mt-0.5 truncate">
                {isEn ? 'Track lot batch & expiry' : 'ติดตามล็อตและวันหมดอายุ'}
              </span>
            </div>
          </div>

          {/* Smooth Toggle Switch Knob */}
          <div
            className={`w-11 h-6 rounded-full transition-colors duration-200 p-0.5 shrink-0 flex items-center ${
              addIsLotControl ? 'bg-blue-600' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                addIsLotControl ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Returnable Item Card */}
        <div
          onClick={() => setAddIsReturnable && setAddIsReturnable(!addIsReturnable)}
          className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-3 ${
            addIsReturnable
              ? theme === 'dark'
                ? 'bg-blue-950/40 border-blue-500/60 shadow-xs shadow-blue-500/10'
                : 'bg-blue-50/80 border-blue-400 shadow-xs shadow-blue-500/10'
              : theme === 'dark'
              ? 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70 hover:border-slate-600'
              : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                addIsReturnable
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                  : theme === 'dark'
                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span
                className={`block text-xs font-bold leading-tight ${
                  addIsReturnable
                    ? theme === 'dark' ? 'text-blue-300' : 'text-blue-900'
                    : theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                {isEn ? 'Returnable Product' : 'รับคืนสินค้าได้'}
              </span>
              <span className="block text-[11px] text-slate-400 mt-0.5 truncate">
                {isEn ? 'Allow returns & restock' : 'อนุญาตให้รับคืนเข้าสต็อก'}
              </span>
            </div>
          </div>

          {/* Smooth Toggle Switch Knob */}
          <div
            className={`w-11 h-6 rounded-full transition-colors duration-200 p-0.5 shrink-0 flex items-center ${
              addIsReturnable ? 'bg-blue-600' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                addIsReturnable ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
          {isEn ? 'Product Description' : 'รายละเอียดสินค้า (Description)'}{' '}
          <span className="text-slate-400 font-normal text-xs">
            {isEn ? '(Optional)' : '(ไม่บังคับ)'}
          </span>
        </label>
        <textarea
          rows={2}
          value={addDescription}
          onChange={(e) => setAddDescription(e.target.value)}
          placeholder={
            isEn
              ? 'Enter product specifications or additional details...'
              : 'ระบุคุณสมบัติหรือรายละเอียดเพิ่มเติมของสินค้า...'
          }
          className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
          }`}
        />
      </div>
    </>
  );
};
