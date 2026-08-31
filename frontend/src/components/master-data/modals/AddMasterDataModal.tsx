import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Plus,
  Building2,
  Package,
  Layers,
  Tag,
  Scale,
  Warehouse,
  Truck,
  ShieldCheck,
  Barcode,
} from 'lucide-react';
import {
  ThemeMode,
  MasterDataSubTab,
  UserRole,
  CategoryItem,
  BrandItem,
  BarcodeSymbologyItem,
  TaxTypeItem,
  Supplier,
  UnitItem,
} from '../../../types';
import {
  AddCompanyFormFields,
  AddUnitFormFields,
  AddCategoryFormFields,
  AddBrandFormFields,
  AddProductFormFields,
  AddRbacFormFields,
  AddWarehouseFormFields,
  AddSupplierFormFields,
} from './add-forms';

interface AddMasterDataModalProps {
  theme: ThemeMode;
  t: Record<string, string>;
  isOpen: boolean;
  onClose: () => void;
  activeSubTab: MasterDataSubTab;
  onSubmit: (e: React.FormEvent) => void;

  // Master Data Dropdown options
  categoriesList?: CategoryItem[];
  brandsList?: BrandItem[];
  unitsList?: UnitItem[];
  suppliersList?: Supplier[];
  barcodeSymbologiesList?: BarcodeSymbologyItem[];
  taxTypesList?: TaxTypeItem[];

  // Generic / Product states
  addName: string;
  setAddName: (val: string) => void;
  addCode: string;
  setAddCode: (val: string) => void;
  addSku: string;
  setAddSku: (val: string) => void;
  addBrand: string;
  setAddBrand: (val: string) => void;
  addBrandId?: string;
  setAddBrandId?: (val: string) => void;
  addCategoryId?: string;
  setAddCategoryId?: (val: string) => void;
  addUnitId?: string;
  setAddUnitId?: (val: string) => void;
  addSupplierId?: string;
  setAddSupplierId?: (val: string) => void;
  addBarcodeSymbologyId?: string;
  setAddBarcodeSymbologyId?: (val: string) => void;
  addTaxTypeId?: string;
  setAddTaxTypeId?: (val: string) => void;
  addBarcode: string;
  setAddBarcode: (val: string) => void;
  addPrice: string;
  setAddPrice: (val: string) => void;
  addCostPrice?: string;
  setAddCostPrice?: (val: string) => void;
  addStock: string;
  setAddStock: (val: string) => void;
  addUom: string;
  setAddUom: (val: string) => void;
  addWeightKg: string;
  setAddWeightKg: (val: string) => void;
  addWidthCm: string;
  setAddWidthCm: (val: string) => void;
  addLengthCm: string;
  setAddLengthCm: (val: string) => void;
  addHeightCm: string;
  setAddHeightCm: (val: string) => void;
  addReorderPoint: string;
  setAddReorderPoint: (val: string) => void;
  addMinReorderQty: string;
  setAddMinReorderQty: (val: string) => void;
  addIsLotControl: boolean;
  setAddIsLotControl: (val: boolean) => void;
  addIsReturnable?: boolean;
  setAddIsReturnable?: (val: boolean) => void;
  addWarrantyDays?: string;
  setAddWarrantyDays?: (val: string) => void;
  addDescription: string;
  setAddDescription: (val: string) => void;
  addProductImageFile?: File | null;
  setAddProductImageFile?: (val: File | null) => void;
  addProductImagePreview?: string | null;
  setAddProductImagePreview?: (val: string | null) => void;

  // Company states
  addCompanyCode: string;
  setAddCompanyCode: (val: string) => void;
  addCompanyName: string;
  setAddCompanyName: (val: string) => void;
  addCompanyTaxId: string;
  setAddCompanyTaxId: (val: string) => void;
  addCompanyBranchCode: string;
  setAddCompanyBranchCode: (val: string) => void;
  addCompanyBranchName: string;
  setAddCompanyBranchName: (val: string) => void;
  addCompanyPhone: string;
  setAddCompanyPhone: (val: string) => void;
  addCompanyEmail: string;
  setAddCompanyEmail: (val: string) => void;
  addCompanyAddress: string;
  setAddCompanyAddress: (val: string) => void;
  addCompanyIsHq: boolean;
  setAddCompanyIsHq: (val: boolean) => void;

  // RBAC states
  addEmail: string;
  setAddEmail: (val: string) => void;
  addRole: UserRole;
  setAddRole: (val: UserRole) => void;

  // Warehouse states
  addWarehouseName: string;
  setAddWarehouseName: (val: string) => void;
  addBinCode: string;
  setAddBinCode: (val: string) => void;
  addZone: string;
  setAddZone: (val: string) => void;
  addRack: string;
  setAddRack: (val: string) => void;
  addCapacityKg: string;
  setAddCapacityKg: (val: string) => void;

  // Supplier states
  addSupplierName: string;
  setAddSupplierName: (val: string) => void;
  addContactPerson: string;
  setAddContactPerson: (val: string) => void;
  addPhone: string;
  setAddPhone: (val: string) => void;
  addTaxId: string;
  setAddTaxId: (val: string) => void;

  // Category states
  addCatCode?: string;
  setAddCatCode?: (val: string) => void;
  addCatName?: string;
  setAddCatName?: (val: string) => void;
  addCatDescription?: string;
  setAddCatDescription?: (val: string) => void;

  // Brand states
  addBrdCode?: string;
  setAddBrdCode?: (val: string) => void;
  addBrdName?: string;
  setAddBrdName?: (val: string) => void;
  addBrdDescription?: string;
  setAddBrdDescription?: (val: string) => void;
}

export const AddMasterDataModal: React.FC<AddMasterDataModalProps> = ({
  theme,
  t,
  isOpen,
  onClose,
  activeSubTab,
  onSubmit,
  categoriesList = [],
  brandsList = [],
  unitsList = [],
  suppliersList = [],
  barcodeSymbologiesList = [],
  taxTypesList = [],
  addName,
  setAddName,
  addCode,
  setAddCode,
  addSku,
  setAddSku,
  addBrand,
  setAddBrand,
  addBrandId = '',
  setAddBrandId,
  addCategoryId = '',
  setAddCategoryId,
  addUnitId = '',
  setAddUnitId,
  addSupplierId = '',
  setAddSupplierId,
  addBarcodeSymbologyId = '',
  setAddBarcodeSymbologyId,
  addTaxTypeId = '',
  setAddTaxTypeId,
  addBarcode,
  setAddBarcode,
  addPrice,
  setAddPrice,
  addCostPrice = '0',
  setAddCostPrice,
  addStock,
  setAddStock,
  setAddUom,
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
  addIsLotControl,
  setAddIsLotControl,
  addIsReturnable = false,
  setAddIsReturnable,
  addWarrantyDays = '0',
  setAddWarrantyDays,
  addDescription,
  setAddDescription,
  addCompanyCode,
  setAddCompanyCode,
  addCompanyName,
  setAddCompanyName,
  addCompanyTaxId,
  setAddCompanyTaxId,
  addCompanyBranchCode,
  setAddCompanyBranchCode,
  addCompanyBranchName,
  setAddCompanyBranchName,
  addCompanyPhone,
  setAddCompanyPhone,
  addCompanyEmail,
  setAddCompanyEmail,
  addCompanyAddress,
  setAddCompanyAddress,
  addCompanyIsHq,
  setAddCompanyIsHq,
  addEmail,
  setAddEmail,
  addRole,
  setAddRole,
  addWarehouseName,
  setAddWarehouseName,
  addBinCode,
  setAddBinCode,
  addZone,
  setAddZone,
  addRack,
  setAddRack,
  addCapacityKg,
  setAddCapacityKg,
  addSupplierName,
  setAddSupplierName,
  addContactPerson,
  setAddContactPerson,
  addPhone,
  setAddPhone,
  addTaxId,
  setAddTaxId,
  addCatCode = '',
  setAddCatCode,
  addCatName = '',
  setAddCatName,
  addCatDescription = '',
  setAddCatDescription,
  addBrdCode = '',
  setAddBrdCode,
  addBrdName = '',
  setAddBrdName,
  addBrdDescription = '',
  setAddBrdDescription,
  setAddProductImageFile,
  addProductImagePreview = null,
  setAddProductImagePreview,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className={`w-full max-w-2xl lg:max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Enterprise Pro Modal Header */}
        {(() => {
          const getHeaderDetails = () => {
            switch (activeSubTab) {
              case 'companies':
                return {
                  icon: Building2,
                  title: 'เพิ่มบริษัทในเครือ',
                  subtitle: 'กำหนดข้อมูลนิติบุคคล สาขา และเลขประจำตัวผู้เสียภาษี',
                  badge: 'บริษัทใหม่',
                  iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
                  badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                };
              case 'products':
                return {
                  icon: Package,
                  title: 'เพิ่มสินค้าใหม่',
                  subtitle: 'บันทึกข้อมูลสินค้า SKU ขนาดมิติ และพารามิเตอร์คลัง',
                  badge: 'สินค้าใหม่',
                  iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                  badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
                };
              case 'categories':
                return {
                  icon: Layers,
                  title: 'เพิ่มหมวดหมู่สินค้า',
                  subtitle: 'สร้างหมวดหมู่สินค้าสำหรับจัดกลุ่มและคัดกรอง',
                  badge: 'หมวดหมู่ใหม่',
                  iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                  badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                };
              case 'brands':
                return {
                  icon: Tag,
                  title: 'เพิ่มแบรนด์สินค้า',
                  subtitle: 'ลงทะเบียนยี่ห้อและเครื่องหมายการค้า',
                  badge: 'แบรนด์ใหม่',
                  iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
                  badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                };
              case 'units':
                return {
                  icon: Scale,
                  title: 'เพิ่มหน่วยนับสินค้า',
                  subtitle: 'กำหนดหน่วยนับหลัก หน่วยแปลง และขนาดมิติ CBM',
                  badge: 'หน่วยนับใหม่',
                  iconColor: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                  badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
                };
              case 'warehouses':
                return {
                  icon: Warehouse,
                  title: 'เพิ่มคลังสินค้าและตำแหน่ง Bin',
                  subtitle: 'กำหนดโครงสร้างคลัง โซนจัดเก็บ และขีดจำกัดความจุ',
                  badge: 'คลัง/Bin ใหม่',
                  iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
                  badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                };
              case 'suppliers':
                return {
                  icon: Truck,
                  title: 'เพิ่มผู้จัดจำหน่าย',
                  subtitle: 'บันทึกข้อมูลคู่ค้า เงื่อนไขการค้า และข้อมูลการติดต่อ',
                  badge: 'คู่ค้าใหม่',
                  iconColor: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20',
                  badgeColor: 'bg-orange-50 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800',
                };
              case 'rbac':
                return {
                  icon: ShieldCheck,
                  title: 'เพิ่มผู้ใช้งานและสิทธิ์ (RBAC)',
                  subtitle: 'สร้างบัญชีพนักงานและกำหนดสิทธิ์การเข้าถึงระบบ',
                  badge: 'ผู้ใช้ใหม่',
                  iconColor: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
                  badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                };
              case 'barcodes':
              default:
                return {
                  icon: Barcode,
                  title: 'ผูกบาร์โค้ดสินค้า',
                  subtitle: 'กำหนดรูปแบบมาตรฐาน Code128, EAN-13 หรือ QR Code',
                  badge: 'บาร์โค้ดใหม่',
                  iconColor: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20',
                  badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800',
                };
            }
          };

          const header = getHeaderDetails();
          const HeaderIcon = header.icon;

          return (
            <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 shrink-0 bg-slate-50/75 dark:bg-slate-900/90 z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 ${header.iconColor}`}>
                  <HeaderIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                      {header.title}
                    </h3>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs ${header.badgeColor}`}>
                      {header.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 truncate">
                    {header.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition shrink-0 cursor-pointer"
                title="ปิดหน้าต่าง (Close)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          );
        })()}

        <form
          onSubmit={onSubmit}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-sm">
            {/* Company Form Fields */}
            {activeSubTab === 'companies' && (
              <AddCompanyFormFields
                theme={theme}
                addCompanyCode={addCompanyCode}
                setAddCompanyCode={setAddCompanyCode}
                addCompanyName={addCompanyName}
                setAddCompanyName={setAddCompanyName}
                addCompanyTaxId={addCompanyTaxId}
                setAddCompanyTaxId={setAddCompanyTaxId}
                addCompanyBranchCode={addCompanyBranchCode}
                setAddCompanyBranchCode={setAddCompanyBranchCode}
                addCompanyBranchName={addCompanyBranchName}
                setAddCompanyBranchName={setAddCompanyBranchName}
                addCompanyPhone={addCompanyPhone}
                setAddCompanyPhone={setAddCompanyPhone}
                addCompanyEmail={addCompanyEmail}
                setAddCompanyEmail={setAddCompanyEmail}
                addCompanyAddress={addCompanyAddress}
                setAddCompanyAddress={setAddCompanyAddress}
                addCompanyIsHq={addCompanyIsHq}
                setAddCompanyIsHq={setAddCompanyIsHq}
              />
            )}

            {/* Unit Form Fields */}
            {activeSubTab === 'units' && (
              <AddUnitFormFields
                theme={theme}
                addCode={addCode}
                setAddCode={setAddCode}
                addName={addName}
                setAddName={setAddName}
              />
            )}

            {/* Category Form Fields */}
            {activeSubTab === 'categories' && (
              <AddCategoryFormFields
                theme={theme}
                addCatCode={addCatCode}
                setAddCatCode={setAddCatCode}
                addCatName={addCatName}
                setAddCatName={setAddCatName}
                addCatDescription={addCatDescription}
                setAddCatDescription={setAddCatDescription}
              />
            )}

            {/* Brand Form Fields */}
            {activeSubTab === 'brands' && (
              <AddBrandFormFields
                theme={theme}
                addBrdCode={addBrdCode}
                setAddBrdCode={setAddBrdCode}
                addBrdName={addBrdName}
                setAddBrdName={setAddBrdName}
                addBrdDescription={addBrdDescription}
                setAddBrdDescription={setAddBrdDescription}
              />
            )}

            {/* Product & Barcode Form Fields */}
            {(activeSubTab === 'products' || activeSubTab === 'barcodes') && (
              <AddProductFormFields
                theme={theme}
                t={t}
                addProductImagePreview={addProductImagePreview || undefined}
                setAddProductImagePreview={setAddProductImagePreview}
                setAddProductImageFile={setAddProductImageFile}
                imageInputRef={imageInputRef}
                addName={addName}
                setAddName={setAddName}
                addCode={addCode}
                setAddCode={setAddCode}
                addSku={addSku}
                setAddSku={setAddSku}
                addBrand={addBrand}
                setAddBrand={setAddBrand}
                addBrandId={addBrandId}
                setAddBrandId={setAddBrandId}
                brandsList={brandsList}
                addCategoryId={addCategoryId}
                setAddCategoryId={setAddCategoryId}
                categoriesList={categoriesList}
                addSupplierId={addSupplierId}
                setAddSupplierId={setAddSupplierId}
                suppliersList={suppliersList}
                addBarcode={addBarcode}
                setAddBarcode={setAddBarcode}
                addBarcodeSymbologyId={addBarcodeSymbologyId}
                setAddBarcodeSymbologyId={setAddBarcodeSymbologyId}
                barcodeSymbologiesList={barcodeSymbologiesList}
                addPrice={addPrice}
                setAddPrice={setAddPrice}
                addCostPrice={addCostPrice}
                setAddCostPrice={setAddCostPrice}
                addStock={addStock}
                setAddStock={setAddStock}
                addUnitId={addUnitId}
                setAddUnitId={setAddUnitId}
                setAddUom={setAddUom}
                unitsList={unitsList}
                addTaxTypeId={addTaxTypeId}
                setAddTaxTypeId={setAddTaxTypeId}
                taxTypesList={taxTypesList}
                addWeightKg={addWeightKg}
                setAddWeightKg={setAddWeightKg}
                addWidthCm={addWidthCm}
                setAddWidthCm={setAddWidthCm}
                addLengthCm={addLengthCm}
                setAddLengthCm={setAddLengthCm}
                addHeightCm={addHeightCm}
                setAddHeightCm={setAddHeightCm}
                addReorderPoint={addReorderPoint}
                setAddReorderPoint={setAddReorderPoint}
                addMinReorderQty={addMinReorderQty}
                setAddMinReorderQty={setAddMinReorderQty}
                addWarrantyDays={addWarrantyDays}
                setAddWarrantyDays={setAddWarrantyDays}
                addIsLotControl={addIsLotControl}
                setAddIsLotControl={setAddIsLotControl}
                addIsReturnable={addIsReturnable}
                setAddIsReturnable={setAddIsReturnable}
                addDescription={addDescription}
                setAddDescription={setAddDescription}
              />
            )}

            {/* RBAC Form Fields */}
            {activeSubTab === 'rbac' && (
              <AddRbacFormFields
                theme={theme}
                addName={addName}
                setAddName={setAddName}
                addEmail={addEmail}
                setAddEmail={setAddEmail}
                addRole={addRole}
                setAddRole={setAddRole}
              />
            )}

            {/* Warehouse & Bins Form Fields */}
            {activeSubTab === 'warehouses' && (
              <AddWarehouseFormFields
                theme={theme}
                t={t}
                addWarehouseName={addWarehouseName}
                setAddWarehouseName={setAddWarehouseName}
                addZone={addZone}
                setAddZone={setAddZone}
                addRack={addRack}
                setAddRack={setAddRack}
                addBinCode={addBinCode}
                setAddBinCode={setAddBinCode}
                addCapacityKg={addCapacityKg}
                setAddCapacityKg={setAddCapacityKg}
              />
            )}

            {/* Suppliers Form Fields */}
            {activeSubTab === 'suppliers' && (
              <AddSupplierFormFields
                theme={theme}
                t={t}
                addSupplierName={addSupplierName}
                setAddSupplierName={setAddSupplierName}
                addContactPerson={addContactPerson}
                setAddContactPerson={setAddContactPerson}
                addPhone={addPhone}
                setAddPhone={setAddPhone}
                addEmail={addEmail}
                setAddEmail={setAddEmail}
                addTaxId={addTaxId}
                setAddTaxId={setAddTaxId}
              />
            )}
          </div>

          {/* Pinned Modal Actions */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
