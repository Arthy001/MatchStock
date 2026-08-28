import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus } from 'lucide-react';
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
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
              +
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-50">
                {t.modalAddTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                {activeSubTab === 'products' && 'เพิ่มรายการสินค้าใหม่ลงในแคตตาล็อก'}
                {activeSubTab === 'companies' &&
                  'เพิ่มบริษัทในเครือ, กำหนดสาขา และเลขประจำตัวผู้เสียภาษี'}
                {activeSubTab === 'rbac' && 'เพิ่มบัญชีผู้ใช้และกำหนดบทบาทสิทธิ์ (RBAC)'}
                {activeSubTab === 'units' && 'เพิ่มหน่วยนับสินค้าและมิติกายภาพ'}
                {activeSubTab === 'barcodes' && 'ผูกบาร์โค้ดสากลและป้ายติดสินค้า'}
                {activeSubTab === 'warehouses' &&
                  'เพิ่มคลังสินค้าและตำแหน่งจัดเก็บย่อย (Bin)'}
                {activeSubTab === 'suppliers' &&
                  'เพิ่มข้อมูลผู้จัดจำหน่ายและข้อมูลภาษี'}
                {activeSubTab === 'categories' && 'เพิ่มหมวดหมู่สินค้าใหม่สำหรับจัดกลุ่ม'}
                {activeSubTab === 'brands' && 'เพิ่มแบรนด์สินค้าใหม่ในระบบ'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition shrink-0"
            title="ปิดหน้าต่าง (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
