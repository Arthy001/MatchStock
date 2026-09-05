import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Package,
  X,
  CheckCircle2,
  Hash,
  Barcode,
  Layers,
  Tag,
  Scale,
  Truck,
  DollarSign,
  Boxes,
  ShieldAlert,
  UploadCloud,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ThemeMode,
  Language,
  CategoryItem,
  BrandItem,
  Supplier,
  BarcodeSymbologyItem,
  TaxTypeItem,
} from '../../../types';
import { UnitItem } from '../../../components/master-data/hooks/useMasterDataLoader';
import { productService } from '../../../services/product.service';
import { masterDataCache } from '../../common/cache/useMasterDataCache';

interface CreateProductModalProps {
  theme: ThemeMode;
  lang?: Language;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newProd: any) => void;
  categoriesList?: CategoryItem[];
  brandsList?: BrandItem[];
  unitsList?: UnitItem[];
  suppliersList?: Supplier[];
  barcodeSymbologiesList?: BarcodeSymbologyItem[];
  taxTypesList?: TaxTypeItem[];
  showToast?: (msg: string) => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  theme,
  lang = 'th',
  isOpen,
  onClose,
  onSuccess,
  categoriesList = [],
  brandsList = [],
  unitsList = [],
  suppliersList = [],
  barcodeSymbologiesList = [],
  taxTypesList = [],
  showToast,
}) => {
  if (!isOpen) return null;
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'dimensions' | 'inventory'>('basic');

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [barcodeSymbologyId, setBarcodeSymbologyId] = useState('');
  const [taxTypeId, setTaxTypeId] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('0');
  const [costPrice, setCostPrice] = useState('0');
  const [weightKg, setWeightKg] = useState('0');
  const [widthCm, setWidthCm] = useState('0');
  const [lengthCm, setLengthCm] = useState('0');
  const [heightCm, setHeightCm] = useState('0');
  const [reorderLevel, setReorderLevel] = useState('10');
  const [minReorderQty, setMinReorderQty] = useState('5');
  const [isLotControl, setIsLotControl] = useState(false);
  const [isReturnable, setIsReturnable] = useState(false);
  const [warrantyDays, setWarrantyDays] = useState('0');
  const [description, setDescription] = useState('');

  // Image Upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isEn ? 'Please enter product name' : 'กรุณากรอกชื่อสินค้า');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const itemCode = code.trim() || sku.trim() || `PRD-${Date.now().toString().slice(-4)}`;
      const itemSku = sku.trim() || itemCode;

      const created = await productService.createProduct({
        name: name.trim(),
        code: itemCode,
        sku: itemSku,
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        unitId: unitId || undefined,
        supplierId: supplierId || undefined,
        barcodeSymbologyId: barcodeSymbologyId || undefined,
        taxTypeId: taxTypeId || undefined,
        barcode: barcode.trim() || undefined,
        price: parseFloat(price) || 0,
        costPrice: parseFloat(costPrice) || 0,
        reorderLevel: parseInt(reorderLevel) || 10,
        minReorderQty: parseInt(minReorderQty) || 5,
        weightKg: parseFloat(weightKg) || 0,
        widthCm: parseFloat(widthCm) || 0,
        lengthCm: parseFloat(lengthCm) || 0,
        heightCm: parseFloat(heightCm) || 0,
        isLotControl,
        isReturnable,
        warrantyPeriodDays: parseInt(warrantyDays) || 0,
        description: description.trim() || undefined,
      });

      // Strict backend validation: Ensure valid persisted ID exists
      if (!created || !created.id) {
        throw new Error(isEn ? 'Failed to obtain persisted product ID from server.' : 'เซิร์ฟเวอร์ไม่ได้ส่ง ID ของสินค้ากลับมา');
      }

      // Upload image if selected
      if (imageFile && created.id) {
        try {
          const formData = new FormData();
          formData.append('images', imageFile);
          await productService.uploadImages(created.id, formData);
        } catch (imgErr) {
          console.warn('Image upload failed:', imgErr);
        }
      }

      masterDataCache.invalidate('products_list');
      showToast?.(isEn ? `Product "${name}" created successfully` : `สร้างสินค้า "${name}" (${itemSku}) สำเร็จ`);
      onSuccess(created);
      onClose();

      // Reset
      setName('');
      setCode('');
      setSku('');
      setCategoryId('');
      setBrandId('');
      setUnitId('');
      setSupplierId('');
      setBarcodeSymbologyId('');
      setTaxTypeId('');
      setBarcode('');
      setPrice('0');
      setCostPrice('0');
      setWeightKg('0');
      setWidthCm('0');
      setLengthCm('0');
      setHeightCm('0');
      setReorderLevel('10');
      setMinReorderQty('5');
      setIsLotControl(false);
      setIsReturnable(false);
      setWarrantyDays('0');
      setDescription('');
      setImageFile(null);
      setImagePreview('');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการสร้างสินค้า';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {isEn ? 'Create New Product' : 'สร้างสินค้าใหม่ (Product Master)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? 'Add SKU, price, dimensions, and inventory parameters' : 'กำหนด SKU ราคาขาย หมวดหมู่ มิติขนาด และพารามิเตอร์สต็อก'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigators */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/40 px-5 gap-4 shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-2.5 border-b-2 transition cursor-pointer ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isEn ? '1. General Info' : '1. ข้อมูลทั่วไป & SKU'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`py-2.5 border-b-2 transition cursor-pointer ${
              activeTab === 'pricing'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isEn ? '2. Pricing & Taxes' : '2. ราคา & ภาษี'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dimensions')}
            className={`py-2.5 border-b-2 transition cursor-pointer ${
              activeTab === 'dimensions'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isEn ? '3. Dimensions & Weight' : '3. มิติขนาด & น้ำหนัก'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`py-2.5 border-b-2 transition cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {isEn ? '4. Inventory & Lot' : '4. สต็อก & ล็อต'}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* TAB 1: General Info */}
          {activeTab === 'basic' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isEn ? 'Product Name *' : 'ชื่อสินค้า *'}</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isEn ? 'e.g. Wireless Barcode Scanner' : 'เช่น เครื่องสแกนบาร์โค้ดไร้สาย'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isEn ? 'SKU Code *' : 'รหัส SKU *'}</span>
                      </label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value.toUpperCase())}
                        placeholder={isEn ? 'e.g. SKU-1001' : 'เช่น SKU-1001'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <Barcode className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isEn ? 'Barcode' : 'รหัสบาร์โค้ด'}</span>
                      </label>
                      <input
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="8850000000000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isEn ? 'Product Image' : 'รูปภาพสินค้า'}</span>
                  </label>
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition h-[116px] overflow-hidden relative">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-[11px] text-slate-500">{isEn ? 'Upload Image' : 'เลือกรูปภาพ'}</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isEn ? 'Category' : 'หมวดหมู่สินค้า'}</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition cursor-pointer"
                  >
                    <option value="">{isEn ? '-- Select Category --' : '-- เลือกหมวดหมู่ --'}</option>
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isEn ? 'Brand / Manufacturer' : 'แบรนด์ / ผู้ผลิต'}</span>
                  </label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition cursor-pointer"
                  >
                    <option value="">{isEn ? '-- Select Brand --' : '-- เลือกแบรนด์ --'}</option>
                    {brandsList.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isEn ? 'Unit of Measure' : 'หน่วยนับสินค้า'}</span>
                  </label>
                  <select
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition cursor-pointer"
                  >
                    <option value="">{isEn ? '-- Select Unit --' : '-- เลือกหน่วยนับ --'}</option>
                    {unitsList.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isEn ? 'Primary Supplier' : 'ผู้จัดจำหน่ายหลัก'}</span>
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition cursor-pointer"
                  >
                    <option value="">{isEn ? '-- Select Supplier --' : '-- เลือกผู้จัดจำหน่าย --'}</option>
                    {suppliersList.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Pricing & Taxes */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isEn ? 'Selling Price (THB)' : 'ราคาขาย (บาท)'}</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isEn ? 'Cost Price (THB)' : 'ราคาทุน (บาท)'}</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isEn ? 'Barcode Symbology' : 'รูปแบบบาร์โค้ด'}
                  </label>
                  <select
                    value={barcodeSymbologyId}
                    onChange={(e) => setBarcodeSymbologyId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition cursor-pointer"
                  >
                    <option value="">{isEn ? 'CODE128 (Default)' : 'CODE128 (ค่าเริ่มต้น)'}</option>
                    {barcodeSymbologiesList.map((sym) => (
                      <option key={sym.id} value={sym.id}>{sym.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isEn ? 'Tax Category' : 'ประเภทภาษี'}
                  </label>
                  <select
                    value={taxTypeId}
                    onChange={(e) => setTaxTypeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition cursor-pointer"
                  >
                    <option value="">{isEn ? 'Standard VAT 7%' : 'ภาษีมูลค่าเพิ่ม 7%'}</option>
                    {taxTypesList.map((tax) => (
                      <option key={tax.id} value={tax.id}>
                        {tax.name} {tax.ratePercent != null ? `(${tax.ratePercent}%)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Dimensions & Weight */}
          {activeTab === 'dimensions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isEn ? 'Weight (Kg)' : 'น้ำหนัก (กก.)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isEn ? 'Width (cm)' : 'กว้าง (ซม.)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={widthCm}
                    onChange={(e) => setWidthCm(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isEn ? 'Length (cm)' : 'ยาว (ซม.)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={lengthCm}
                    onChange={(e) => setLengthCm(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isEn ? 'Height (cm)' : 'สูง (ซม.)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isEn ? 'Warranty Period (Days)' : 'ระยะเวลารับประกัน (วัน)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={warrantyDays}
                  onChange={(e) => setWarrantyDays(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Inventory & Lot Control */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isEn ? 'Reorder Point (Min)' : 'จุดสั่งซื้อซ้ำ (Min Stock)'}</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    placeholder="10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isEn ? 'Min Reorder Qty' : 'จำนวนสั่งซื้อขั้นต่ำ'}</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={minReorderQty}
                    onChange={(e) => setMinReorderQty(e.target.value)}
                    placeholder="5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
                  />
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isLotControl}
                    onChange={(e) => setIsLotControl(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                      {isEn ? 'Lot & Expiry Tracking (FEFO)' : 'เปิดใช้ระบบคุมล็อตและวันหมดอายุ (Lot & Expiry)'}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {isEn ? 'Enforces lot number and expiry dates during receiving and dispatch.' : 'บังคับระบุเลขล็อตและวันหมดอายุขณะรับเข้าและเบิกจ่าย'}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isReturnable}
                    onChange={(e) => setIsReturnable(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                      {isEn ? 'Returnable Product' : 'สินค้ารองรับการรับคืน / เคลม (Returnable)'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isEn ? 'Cancel' : 'ยกเลิก'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs shadow-blue-600/30"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? (isEn ? 'Creating...' : 'กำลังสร้าง...') : (isEn ? 'Create Product' : 'บันทึกสร้างสินค้า')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
