import React from 'react';
import { Camera, Upload, ImageIcon, Link2, CheckCircle2, Trash2 } from 'lucide-react';
import {
  ThemeMode,
  UnitItem,
  BrandItem,
  CategoryItem,
  Supplier,
  BarcodeSymbologyItem,
  TaxTypeItem,
} from '../../../../types';

interface AddProductFormFieldsProps {
  theme: ThemeMode;
  t: Record<string, string>;
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
  t,
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
            title="เลือกรูปภาพสินค้า (Select Image)"
          >
            <Camera className="w-4 h-4 mb-0.5" />
            <span>เลือกรูป</span>
          </button>
        </div>

        <div className="flex-1">
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            {t.productName} <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            type="text"
            required
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="เช่น กล่องกระดาษลูกฟูก 30x30x30 ซม."
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
              {addProductImagePreview ? 'เปลี่ยนรูปภาพที่เลือก' : 'เลือกรูปภาพสินค้า (JPG, PNG, WebP)'}
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
                ลบรูป
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
                พร้อมอัปโหลดเมื่อกดบันทึก (Ready to upload):
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
          {t.code} / รหัสสินค้า <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ - สร้างอัตโนมัติถ้าว่าง)</span>
        </label>
        <input
          type="text"
          value={addCode}
          onChange={(e) => setAddCode(e.target.value)}
          placeholder="PRD-1005 (สร้างอัตโนมัติถ้าว่าง)"
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
            {t.sku} (Stock Keeping Unit) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="text"
            value={addSku}
            onChange={(e) => setAddSku(e.target.value)}
            placeholder="SKU-889911 (สร้างอัตโนมัติถ้าว่าง)"
            className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            {t.brand} (Brand) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          {brandsList.length > 0 ? (
            <select
              value={addBrandId || addBrand}
              onChange={(e) => {
                const sel = brandsList.find((b) => b.id === e.target.value || b.name === e.target.value);
                if (setAddBrandId) setAddBrandId(sel ? sel.id : e.target.value);
                setAddBrand(sel ? sel.name : e.target.value);
              }}
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
              }`}
            >
              <option value="">-- เลือกแบรนด์ --</option>
              {brandsList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={addBrand}
              onChange={(e) => setAddBrand(e.target.value)}
              placeholder="Nike, Adidas, Apple..."
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
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
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            หมวดหมู่ (Category) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <select
            value={addCategoryId}
            onChange={(e) => setAddCategoryId && setAddCategoryId(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          >
            <option value="">-- ไม่ระบุหมวดหมู่ --</option>
            {categoriesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            ผู้จัดจำหน่าย (Supplier) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <select
            value={addSupplierId}
            onChange={(e) => setAddSupplierId && setAddSupplierId(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          >
            <option value="">-- ไม่ระบุผู้จัดจำหน่าย --</option>
            {suppliersList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Barcode & Barcode Symbology */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            รหัสบาร์โค้ด (Barcode Value) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="text"
            value={addBarcode}
            onChange={(e) => setAddBarcode(e.target.value)}
            placeholder="8851234567890 (สร้างอัตโนมัติถ้าว่าง)"
            className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            ประเภทบาร์โค้ด (Symbology) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <select
            value={addBarcodeSymbologyId}
            onChange={(e) => setAddBarcodeSymbologyId && setAddBarcodeSymbologyId(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          >
            <option value="">-- Auto / CODE-128 --</option>
            {barcodeSymbologiesList.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code || b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Price, Cost Price, Tax & UOM */}
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            {t.price} (฿) <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={addPrice}
            onChange={(e) => setAddPrice(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border font-bold text-blue-600 dark:text-blue-400 outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 focus:border-blue-500'
                : 'bg-blue-50/50 border-slate-300 focus:border-blue-500'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            ราคาทุน (Cost) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={addCostPrice}
            onChange={(e) => setAddCostPrice && setAddCostPrice(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            {t.stockOnHand} <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="number"
            value={addStock}
            onChange={(e) => setAddStock(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
            หน่วยนับ (UOM) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <select
            value={addUnitId}
            onChange={(e) => {
              const sel = unitsList.find((u) => u.id === e.target.value || u.code === e.target.value);
              if (setAddUnitId) setAddUnitId(sel ? sel.id : e.target.value);
              setAddUom(sel ? sel.code : (e.target.value || ''));
            }}
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
            }`}
          >
            <option value="">-- ไม่ระบุหน่วยนับ --</option>
            {unitsList.length > 0 ? (
              unitsList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.code} - {u.name}
                </option>
              ))
            ) : (
              <>
                <option value="PCS">PCS (ชิ้น)</option>
                <option value="PAIR">PAIR (คู่)</option>
                <option value="BOX">BOX (กล่อง)</option>
                <option value="PACK">PACK (แพ็ค)</option>
                <option value="SET">SET (ชุด)</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Tax Type */}
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
          ประเภทภาษี (Tax Type) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
        </label>
        <select
          value={addTaxTypeId}
          onChange={(e) => setAddTaxTypeId && setAddTaxTypeId(e.target.value)}
          className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
          }`}
        >
          <option value="">-- ไม่ระบุ / Non-VAT --</option>
          {taxTypesList.map((tax) => (
            <option key={tax.id} value={tax.id}>
              {tax.name} {tax.ratePercent !== undefined ? `(${tax.ratePercent}%)` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Weight & Dimensions */}
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
          มิติขนาด & น้ำหนัก (Dimensions & Weight) <span className="text-slate-400 font-normal text-xs normal-case">(ไม่บังคับ)</span>
        </span>
        <div className="grid grid-cols-4 gap-2.5">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-medium text-[11px] mb-1">
              น้ำหนัก (kg)
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
              กว้าง (cm)
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
              ยาว (cm)
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
              สูง (cm)
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
            จุดสั่งซื้อซ้ำ (ROP) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
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
            Min Reorder Qty <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
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
            รับประกัน (วัน) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
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

      {/* Control Switches */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <input
            type="checkbox"
            id="lotControlCheckboxModal"
            checked={addIsLotControl}
            onChange={(e) => setAddIsLotControl(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label
            htmlFor="lotControlCheckboxModal"
            className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            Lot / Batch Control
          </label>
        </div>
        <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <input
            type="checkbox"
            id="returnableCheckboxModal"
            checked={addIsReturnable}
            onChange={(e) => setAddIsReturnable && setAddIsReturnable(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label
            htmlFor="returnableCheckboxModal"
            className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            รับคืนสินค้าได้ (Returnable)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
          รายละเอียดสินค้า (Description) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
        </label>
        <textarea
          rows={2}
          value={addDescription}
          onChange={(e) => setAddDescription(e.target.value)}
          placeholder="ระบุคุณสมบัติหรือรายละเอียดเพิ่มเติมของสินค้า..."
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
