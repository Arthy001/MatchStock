import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Edit2,
  X,
  CheckCircle2,
  Trash2,
  Camera,
  Upload,
  Loader2,
  Package,
  Image as ImageIcon,
  ExternalLink,
  Copy,
  Check,
  Link2,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { ThemeMode, Language, ProductItem, CategoryItem, BrandItem, BarcodeSymbologyItem, TaxTypeItem, Supplier } from '../../../types';
import { productService, resolveImageUrl } from '../../../services/product.service';
import { CustomSelect } from '../../common/CustomSelect';

interface UnitItem {
  id: string;
  code: string;
  name: string;
  type?: string;
}

interface ProductDrawerProps {
  theme: ThemeMode;
  lang?: Language;
  t: any;
  product: ProductItem | null;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onDelete: (product: ProductItem) => void;
  isSaving: boolean;

  // Master Data Dropdown options
  categoriesList?: CategoryItem[];
  brandsList?: BrandItem[];
  unitsList?: UnitItem[];
  suppliersList?: Supplier[];
  barcodeSymbologiesList?: BarcodeSymbologyItem[];
  taxTypesList?: TaxTypeItem[];

  // Controlled form states
  editName: string;
  setEditName: (val: string) => void;
  editCode: string;
  setEditCode: (val: string) => void;
  editSku: string;
  setEditSku: (val: string) => void;
  editBrand: string;
  setEditBrand: (val: string) => void;
  editBrandId?: string;
  setEditBrandId?: (val: string) => void;
  editCategoryId?: string;
  setEditCategoryId?: (val: string) => void;
  editUnitId?: string;
  setEditUnitId?: (val: string) => void;
  editSupplierId?: string;
  setEditSupplierId?: (val: string) => void;
  editBarcodeSymbologyId?: string;
  setEditBarcodeSymbologyId?: (val: string) => void;
  editTaxTypeId?: string;
  setEditTaxTypeId?: (val: string) => void;
  editBarcode: string;
  setEditBarcode: (val: string) => void;
  editPrice: string;
  setEditPrice: (val: string) => void;
  editCostPrice?: string;
  setEditCostPrice?: (val: string) => void;
  editWeightKg: string;
  setEditWeightKg: (val: string) => void;
  editWidthCm: string;
  setEditWidthCm: (val: string) => void;
  editLengthCm: string;
  setEditLengthCm: (val: string) => void;
  editHeightCm: string;
  setEditHeightCm: (val: string) => void;
  editReorderLevel: string;
  setEditReorderLevel: (val: string) => void;
  editMinReorderQty: string;
  setEditMinReorderQty: (val: string) => void;
  editIsLotControl: boolean;
  setEditIsLotControl: (val: boolean) => void;
  editIsReturnable?: boolean;
  setEditIsReturnable?: (val: boolean) => void;
  editIsActive?: boolean;
  setEditIsActive?: (val: boolean) => void;
  editWarrantyDays?: string;
  setEditWarrantyDays?: (val: string) => void;
  editDescription: string;
  setEditDescription: (val: string) => void;
}

export const ProductDrawer: React.FC<ProductDrawerProps> = ({
  theme,
  lang = 'th',
  t,
  product,
  onClose,
  onSave,
  onDelete,
  isSaving,
  categoriesList = [],
  brandsList = [],
  unitsList = [],
  suppliersList = [],
  barcodeSymbologiesList = [],
  taxTypesList = [],
  editName,
  setEditName,
  editCode,
  setEditCode,
  editSku,
  setEditSku,
  editBrand,
  setEditBrand,
  editBrandId = '',
  setEditBrandId,
  editCategoryId = '',
  setEditCategoryId,
  editUnitId = '',
  setEditUnitId,
  editSupplierId = '',
  setEditSupplierId,
  editBarcodeSymbologyId = '',
  setEditBarcodeSymbologyId,
  editTaxTypeId = '',
  setEditTaxTypeId,
  editBarcode,
  setEditBarcode,
  editPrice,
  setEditPrice,
  editCostPrice = '0',
  setEditCostPrice,
  editWeightKg,
  setEditWeightKg,
  editWidthCm,
  setEditWidthCm,
  editLengthCm,
  setEditLengthCm,
  editHeightCm,
  setEditHeightCm,
  editReorderLevel,
  setEditReorderLevel,
  editMinReorderQty,
  setEditMinReorderQty,
  editIsLotControl,
  setEditIsLotControl,
  editIsReturnable = false,
  setEditIsReturnable,
  editIsActive = true,
  setEditIsActive,
  editWarrantyDays = '0',
  setEditWarrantyDays,
  editDescription,
  setEditDescription,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setPreviewImageUrl(product.imageUrl || null);
      setImageLoadError(false);
    }
  }, [product]);

  if (!product) return null;
  const isEn = lang === 'en';

  const rawImageUrl = previewImageUrl || product.imageUrl;
  const currentImageUrl = rawImageUrl
    ? rawImageUrl.startsWith('http://') ||
      rawImageUrl.startsWith('https://') ||
      rawImageUrl.startsWith('blob:') ||
      rawImageUrl.startsWith('data:')
      ? rawImageUrl
      : `https://match-stock.ddns.net${rawImageUrl.startsWith('/') ? rawImageUrl : `/${rawImageUrl}`}`
    : '';

  const handleCopyUrl = () => {
    if (!currentImageUrl) return;
    navigator.clipboard.writeText(currentImageUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewImageUrl(localUrl);
    setImageLoadError(false);

    const formData = new FormData();
    formData.append('images', file);

    setIsUploading(true);
    try {
      const res = await productService.uploadImages(product.id, formData);
      if (res && res.data && res.data.length > 0) {
        const uploadedUrl = res.data[0].url;
        setPreviewImageUrl(uploadedUrl);
        product.imageUrl = uploadedUrl;
      }
    } catch (err) {
      console.warn('Image upload API completed or cached locally:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-label="Close drawer"
      />
      <div
        className={`relative z-10 w-full max-w-xl shadow-2xl h-full flex flex-col justify-between border-l transition-all transform duration-300 ease-in-out p-6 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex-1 flex flex-col overflow-y-auto pr-1">
          {/* Drawer Header */}
          <div
            className={`pb-4 border-b flex items-center justify-between sticky top-0 z-20 shrink-0 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className={`font-bold text-base ${
                    theme === 'dark' ? 'text-slate-50' : 'text-slate-900'
                  }`}
                >
                  {lang === 'en' ? 'Product Details & Edit' : 'แก้ไขข้อมูลสินค้า (Edit Product)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {product.sku || product.code}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                theme === 'dark'
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Content Body */}
          <div className="mt-5 space-y-4 text-sm pb-6 px-4 flex-1 overflow-y-auto">
            {/* Section 1: Image Upload & Product Name */}
            <div className="flex items-start gap-3.5">
              <div className="relative group shrink-0">
                {currentImageUrl && !imageLoadError ? (
                  <img
                    src={resolveImageUrl(currentImageUrl)}
                    alt={product.name}
                    onError={() => setImageLoadError(true)}
                    className={`w-20 h-20 rounded-2xl object-cover border shadow-xs ${
                      theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'
                    }`}
                  />
                ) : (
                  <div
                    className={`w-20 h-20 rounded-2xl border flex flex-col items-center justify-center shadow-xs ${
                      theme === 'dark'
                        ? 'border-slate-700 bg-slate-800 text-slate-400'
                        : 'border-slate-200 bg-slate-100 text-slate-400'
                    }`}
                  >
                    <ImageIcon className="w-8 h-8 opacity-60" />
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer text-[10px] font-semibold"
                  title="เปลี่ยนรูปภาพสินค้า (Upload Image)"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span>เปลี่ยนรูป</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex-1">
                <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
                  {t.productName} <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border font-semibold text-sm outline-hidden transition ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    อัปโหลดรูปภาพสินค้า (JPG, PNG, WebP)
                  </button>
                </div>
              </div>
            </div>

            {/* Image URL & Status Banner */}
            {currentImageUrl ? (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2.5 ${
                  theme === 'dark'
                    ? 'bg-slate-800/60 border-slate-700/80 text-slate-300'
                    : 'bg-blue-50/70 border-blue-200/80 text-blue-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Link2 className="w-4 h-4 shrink-0 text-blue-500" />
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold block text-[11px] text-slate-500 dark:text-slate-400">
                      รูปภาพสินค้า (Image URL):
                    </span>
                    <span className="font-mono text-[11px] truncate block text-blue-600 dark:text-blue-400 select-all" title={currentImageUrl}>
                      {currentImageUrl}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer text-slate-600 dark:text-slate-300"
                    title="คัดลอก Image URL"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={currentImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer text-slate-600 dark:text-slate-300"
                    title="เปิดรูปภาพในแท็บใหม่ (Open Image)"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div
                className={`px-3 py-2 rounded-xl border text-[11px] text-slate-400 dark:text-slate-500 italic ${
                  theme === 'dark' ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                ยังไม่มีรูปภาพสินค้า — คลิก "อัปโหลดรูปภาพสินค้า" หรือแตะไอคอนกล้องเพื่อเพิ่มรูป
              </div>
            )}

            {/* Section 2: Code & SKU */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
                  {t.code} <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
                </label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden transition ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
                  {t.sku} <span className="text-slate-400 font-normal text-xs">(รหัสถาวร)</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={editSku}
                  className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden transition cursor-not-allowed ${
                    theme === 'dark'
                      ? 'bg-slate-800/60 border-slate-700 text-slate-400'
                      : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}
                />
              </div>
            </div>

            {/* Section 3: Master Data Dropdowns (Category & Brand) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
                  หมวดหมู่ (Category) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
                </label>
                <CustomSelect
                  theme={theme}
                  value={editCategoryId || ''}
                  onChange={(val) => setEditCategoryId && setEditCategoryId(val)}
                  placeholder="-- ไม่ระบุหมวดหมู่ --"
                  options={[
                    { value: '', label: '-- ไม่ระบุหมวดหมู่ --' },
                    ...categoriesList.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
                  {t.brand} (Brand) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
                </label>
                {brandsList.length > 0 ? (
                  <CustomSelect
                    theme={theme}
                    value={editBrandId || editBrand}
                    onChange={(val) => {
                      const selected = brandsList.find((b) => b.id === val || b.name === val);
                      if (setEditBrandId) setEditBrandId(selected ? selected.id : val);
                      setEditBrand(selected ? selected.name : val);
                    }}
                    placeholder="-- เลือกแบรนด์ --"
                    options={[
                      { value: '', label: '-- เลือกแบรนด์ --' },
                      ...brandsList.map((b) => ({ value: b.id, label: b.name })),
                    ]}
                  />
                ) : (
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    placeholder="เช่น Nike, Apple..."
                    className={`w-full h-[42px] px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                    }`}
                  />
                )}
              </div>
            </div>

            {/* Section 4: Unit (UOM) & Supplier Dropdowns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
                  หน่วยนับ (UOM) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
                </label>
                <CustomSelect
                  theme={theme}
                  value={editUnitId || ''}
                  onChange={(val) => setEditUnitId && setEditUnitId(val)}
                  placeholder="-- ไม่ระบุหน่วยนับ --"
                  options={[
                    { value: '', label: '-- ไม่ระบุหน่วยนับ --' },
                    ...unitsList.map((u) => ({ value: u.id, label: `${u.code} - ${u.name}` })),
                  ]}
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
                  ผู้จัดจำหน่าย (Supplier) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
                </label>
                <CustomSelect
                  theme={theme}
                  value={editSupplierId || ''}
                  onChange={(val) => setEditSupplierId && setEditSupplierId(val)}
                  placeholder="-- ไม่ระบุผู้จัดจำหน่าย --"
                  options={[
                    { value: '', label: '-- ไม่ระบุผู้จัดจำหน่าย --' },
                    ...suppliersList.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                />
              </div>
            </div>

            {/* Section 5: Barcode & Barcode Symbology Dropdown */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
                  รหัสบาร์โค้ด (Barcode) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
                </label>
                <input
                  type="text"
                  value={editBarcode}
                  onChange={(e) => setEditBarcode(e.target.value)}
                  placeholder="8851234567890"
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
                <CustomSelect
                  theme={theme}
                  value={editBarcodeSymbologyId || ''}
                  onChange={(val) => setEditBarcodeSymbologyId && setEditBarcodeSymbologyId(val)}
                  placeholder="-- Auto / CODE-128 --"
                  options={[
                    { value: '', label: '-- Auto / CODE-128 --' },
                    ...barcodeSymbologiesList.map((b) => ({
                      value: b.id,
                      label: b.code || b.name,
                    })),
                  ]}
                />
              </div>
            </div>

            {/* Section 6: Pricing & Tax */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
                  {t.price} (฿) <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className={`w-full h-[42px] px-3 py-2 rounded-xl border font-bold text-blue-600 dark:text-blue-400 outline-hidden transition ${
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
                  value={editCostPrice}
                  onChange={(e) => setEditCostPrice && setEditCostPrice(e.target.value)}
                  className={`w-full h-[42px] px-3 py-2 rounded-xl border font-semibold outline-hidden transition ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-800 focus:border-blue-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
                  ภาษี (Tax) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
                </label>
                <CustomSelect
                  theme={theme}
                  value={editTaxTypeId || ''}
                  onChange={(val) => setEditTaxTypeId && setEditTaxTypeId(val)}
                  placeholder="-- ไม่ระบุ / Non-VAT --"
                  options={[
                    { value: '', label: '-- ไม่ระบุ / Non-VAT --' },
                    ...taxTypesList.map((tax) => ({
                      value: tax.id,
                      label: `${tax.name} ${tax.ratePercent !== undefined ? `(${tax.ratePercent}%)` : ''}`,
                    })),
                  ]}
                />
              </div>
            </div>

            {/* Section 7: Weight & Dimensions */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
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
                    value={editWeightKg}
                    onChange={(e) => setEditWeightKg(e.target.value)}
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
                    value={editWidthCm}
                    onChange={(e) => setEditWidthCm(e.target.value)}
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
                    value={editLengthCm}
                    onChange={(e) => setEditLengthCm(e.target.value)}
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
                    value={editHeightCm}
                    onChange={(e) => setEditHeightCm(e.target.value)}
                    className={`w-full px-2.5 py-1.5 rounded-lg border font-medium text-xs outline-hidden ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Section 8: Inventory & Reorder Rules */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
                  จุดสั่งซื้อซ้ำ (ROP) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
                </label>
                <input
                  type="number"
                  value={editReorderLevel}
                  onChange={(e) => setEditReorderLevel(e.target.value)}
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
                  value={editMinReorderQty}
                  onChange={(e) => setEditMinReorderQty(e.target.value)}
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
                  value={editWarrantyDays}
                  onChange={(e) => setEditWarrantyDays && setEditWarrantyDays(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Section 9: Control Switches */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    สถานะการใช้งานสินค้า (Active Status)
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      editIsActive !== false
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {editIsActive !== false ? 'เปิดใช้งาน (Active)' : 'ปิดใช้งาน (Inactive)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive && setEditIsActive(!editIsActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    editIsActive !== false ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      editIsActive !== false ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Control Switches (Enterprise Interactive Toggle Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Lot / Batch Control Card */}
                <div
                  onClick={() => setEditIsLotControl(!editIsLotControl)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-3 ${
                    editIsLotControl
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
                        editIsLotControl
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
                          editIsLotControl
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
                      editIsLotControl ? 'bg-blue-600' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                        editIsLotControl ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>

                {/* Returnable Item Card */}
                <div
                  onClick={() => setEditIsReturnable && setEditIsReturnable(!editIsReturnable)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-3 ${
                    editIsReturnable
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
                        editIsReturnable
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
                          editIsReturnable
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
                      editIsReturnable ? 'bg-blue-600' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                        editIsReturnable ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 10: Description */}
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1">
                รายละเอียดสินค้า (Description) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
              </label>
              <textarea
                rows={2}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="ระบุคุณสมบัติหรือสเปกเพิ่มเติม..."
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500'
                    : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Section 11: Live Status Summary */}
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-800/40'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <h5
                className={`font-semibold text-xs ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}
              >
                Current Live Status
              </h5>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Stock On Hand:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {product.stockOnHand || 0} {product.uom || 'PCS'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Calculated Volume:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {(
                    (Number(editWidthCm || product.widthCm || 0) *
                      Number(editLengthCm || product.lengthCm || 0) *
                      Number(editHeightCm || product.heightCm || 0)) /
                    1000000
                  ).toFixed(4)}{' '}
                  CBM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div
          className={`pt-4 border-t space-y-2.5 ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`w-1/2 py-2.5 rounded-xl border font-semibold text-xs transition cursor-pointer ${
                theme === 'dark'
                  ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.close}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? (lang === 'en' ? 'Saving...' : 'กำลังบันทึก...') : t.save}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => onDelete(product)}
            disabled={isSaving}
            className="w-full py-2 rounded-xl text-rose-600 hover:bg-rose-500/10 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Delete Product from System' : 'ลบสินค้านี้ออกจากระบบ (Delete)'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
