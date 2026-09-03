import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Plus,
  Trash2,
  Boxes,
  Warehouse,
  Truck,
  FileText,
  Camera,
  Calendar,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowDownLeft,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  ThemeMode,
  Language,
  ProductItem,
  WarehouseBin,
  Supplier,
  CreateGoodsReceiptDto,
  CreateGoodsReceiptLineDto,
} from '../../../types';
import { transactionService } from '../../../services/transaction.service';
import { CustomSelect } from '../../common/CustomSelect';

interface CreateGoodsReceiptModalProps {
  theme: ThemeMode;
  lang: Language;
  t: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (receipt: any) => void;
  productsList: ProductItem[];
  warehousesList: WarehouseBin[];
  suppliersList: Supplier[];
}

interface FormLineItem {
  id: string;
  productId: string;
  quantity: number;
  damagedQuantity: number;
  lotNumber: string;
  productionDate: string;
  expiryDate: string;
  unitCost: number;
  binLocationId: string;
}

export const CreateGoodsReceiptModal: React.FC<CreateGoodsReceiptModalProps> = ({
  theme,
  lang,
  t,
  isOpen,
  onClose,
  onSuccess,
  productsList,
  warehousesList,
  suppliersList,
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const isEn = lang === 'en';

  // State: Putaway Mode (1-Step vs 2-Step)
  const [putawayMode, setPutawayMode] = useState<'1-STEP' | '2-STEP'>('2-STEP');

  // Header State
  const [warehouseId, setWarehouseId] = useState<string>(warehousesList[0]?.warehouseId || warehousesList[0]?.id || '');
  const [supplierId, setSupplierId] = useState<string>('');
  const [poNumber, setPoNumber] = useState<string>('');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState<string>('');
  const [receiptNumber, setReceiptNumber] = useState<string>(`GR-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState<string>('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  // Lines State (Clean initial state - no dummy pre-filled items)
  const [lines, setLines] = useState<FormLineItem[]>([
    {
      id: 'line-1',
      productId: '',
      quantity: 1,
      damagedQuantity: 0,
      lotNumber: '',
      productionDate: '',
      expiryDate: '',
      unitCost: 0,
      binLocationId: '',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter Bins for chosen Warehouse
  const availableBins = warehousesList.filter(
    (b) => (b.warehouseId && b.warehouseId === warehouseId) || b.id === warehouseId
  );

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: '',
        quantity: 1,
        damagedQuantity: 0,
        lotNumber: '',
        productionDate: '',
        expiryDate: '',
        unitCost: 0,
        binLocationId: '',
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof FormLineItem, value: any) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Calculations
  const totalGoodQty = lines.reduce((acc, l) => acc + (Number(l.quantity) || 0), 0);
  const totalDamagedQty = lines.reduce((acc, l) => acc + (Number(l.damagedQuantity) || 0), 0);
  const totalEstimatedCost = lines.reduce(
    (acc, l) => acc + (Number(l.quantity) || 0) * (Number(l.unitCost) || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!warehouseId) {
      setErrorMessage(isEn ? 'Please select a receiving warehouse.' : 'กรุณาเลือกคลังสินค้าที่รับเข้า');
      return;
    }

    if (lines.length === 0) {
      setErrorMessage(isEn ? 'Please add at least one line item.' : 'กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    // Validate line items
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.productId) {
        setErrorMessage(isEn ? `Line #${i + 1}: Please select a product.` : `รายการที่ ${i + 1}: กรุณาเลือกสินค้า`);
        return;
      }
      if (line.quantity <= 0) {
        setErrorMessage(isEn ? `Line #${i + 1}: Good quantity must be greater than 0.` : `รายการที่ ${i + 1}: จำนวนที่รับเข้าต้องมากกว่า 0`);
        return;
      }
      if (putawayMode === '1-STEP' && !line.binLocationId) {
        setErrorMessage(
          isEn
            ? `Line #${i + 1}: Please select a destination bin for 1-Step direct putaway.`
            : `รายการที่ ${i + 1}: โหมด 1-Step ต้องระบุตำแหน่ง Bin ปลายทาง`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: CreateGoodsReceiptDto = {
        receiptNumber: receiptNumber.trim() || `GR-${Date.now()}`,
        warehouseId,
        supplierId: supplierId || undefined,
        poNumber: poNumber.trim() || undefined,
        supplierInvoiceNo: supplierInvoiceNo.trim() || undefined,
        photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
        receivedAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
        lines: lines.map((l) => ({
          productId: l.productId,
          quantity: Number(l.quantity),
          damagedQuantity: Number(l.damagedQuantity) || 0,
          lotNumber: l.lotNumber.trim() || undefined,
          productionDate: l.productionDate ? new Date(l.productionDate).toISOString() : undefined,
          expiryDate: l.expiryDate ? new Date(l.expiryDate).toISOString() : undefined,
          unitCostMinor: l.unitCost ? Math.round(l.unitCost * 100) : undefined,
          // If 1-Step: send selected bin (only if it is a real bin ID, not the warehouse ID fallback); If 2-Step: null/undefined (staged)
          binLocationId: putawayMode === '1-STEP' && l.binLocationId && l.binLocationId !== warehouseId ? l.binLocationId : undefined,
        })),
      };

      const result = await transactionService.receiveStock(payload);
      onSuccess(result);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'บันทึกรายการรับเข้าไม่สำเร็จ';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden relative z-10 transition animate-in zoom-in-95 duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/75 dark:bg-slate-900/90">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs shrink-0">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  {isEn ? 'Goods Receiving & Putaway Inbound (GR)' : 'บันทึกการรับสินค้าเข้าคลัง (Goods Receipt)'}
                </h3>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Multi-Item Support
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isEn
                  ? 'Receive multi-line shipment, track damaged goods, and choose 1-Step or 2-Step Putaway.'
                  : 'บันทึกรับสินค้าหลายรายการ, บันทึกยอดชำรุดเคลม, และเลือกระบบจัดเก็บ 1-Step หรือ 2-Step Staging'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Putaway Workflow Selection (1-Step vs 2-Step) */}
          <div
            className={`p-4 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-blue-50/40 border-blue-200/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>{isEn ? 'Putaway Strategy' : 'รูปแบบการจัดเก็บสินค้าเข้าชั้นวาง (Putaway Strategy)'}</span>
              </label>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                {putawayMode === '1-STEP' ? '✓ Immediate Shelf Placement' : '✓ Staging Dock Queue'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPutawayMode('2-STEP')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  putawayMode === '2-STEP'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    putawayMode === '2-STEP' ? 'border-white bg-white text-blue-600' : 'border-slate-400'
                  }`}
                >
                  {putawayMode === '2-STEP' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold">2-Step (พักจุดรับ Staging ก่อน)</h4>
                  <p
                    className={`text-[11px] mt-0.5 leading-relaxed ${
                      putawayMode === '2-STEP' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    รับของเข้าจุดพัก Dock ก่อน เพื่อให้พนักงานนำรถเข็น/โฟล์คลิฟท์ไปสแกน Bin จัดเก็บจริงภายหลัง
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPutawayMode('1-STEP')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  putawayMode === '1-STEP'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    putawayMode === '1-STEP' ? 'border-white bg-white text-blue-600' : 'border-slate-400'
                  }`}
                >
                  {putawayMode === '1-STEP' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold">1-Step (วางบนชั้นทันที)</h4>
                  <p
                    className={`text-[11px] mt-0.5 leading-relaxed ${
                      putawayMode === '1-STEP' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    ระบุตำแหน่ง Bin ทันทีในขั้นตอนนี้ สินค้าจะเข้าสถานะพร้อมขายบนชั้นวางในคลิกเดียว (คลังขนาดเล็ก)
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Header Fields Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
            {/* Warehouse */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Warehouse className="w-3.5 h-3.5 text-blue-600" />
                <span>{isEn ? 'Receiving Warehouse *' : 'คลังสินค้าที่รับเข้า *'}</span>
              </label>
              <CustomSelect
                theme={theme}
                value={warehouseId}
                onChange={setWarehouseId}
                searchable={true}
                placeholder="-- เลือกคลังสินค้า --"
                searchPlaceholder="ค้นหาชื่อหรือรหัสคลัง..."
                options={warehousesList.map((wh) => ({
                  value: wh.warehouseId || wh.id,
                  label: wh.warehouseName || (wh as any).name || wh.id,
                  sublabel: wh.warehouseId ? `ID: ${wh.warehouseId.slice(0, 8)}` : undefined,
                }))}
              />
            </div>

            {/* Supplier (Optional) */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>{isEn ? 'Supplier (Optional)' : 'ผู้จัดจำหน่าย (ไม่บังคับ)'}</span>
              </label>
              <CustomSelect
                theme={theme}
                value={supplierId}
                onChange={setSupplierId}
                searchable={true}
                placeholder={isEn ? '-- No Supplier --' : '-- ไม่ระบุ (รับคืน/ของแถม) --'}
                searchPlaceholder="ค้นหาชื่อหรือรหัสคู่ค้า..."
                options={[
                  { value: '', label: isEn ? '-- No Supplier (Return / Free Sample) --' : '-- ไม่ระบุ (รับคืน / ของแถม / ผลิตเอง) --' },
                  ...suppliersList.map((sup) => ({
                    value: sup.id,
                    label: sup.name,
                    sublabel: sup.code,
                  })),
                ]}
              />
            </div>

            {/* PO Number */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'PO Number (Optional)' : 'เลขที่ใบสั่งซื้อ PO (ถ้ามี)'}</span>
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="e.g. PO-2026-0088"
                className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                }`}
              />
            </div>

            {/* Supplier Invoice / Delivery Note */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Delivery Note / Inv No.' : 'เลขที่ใบส่งของ / Invoice'}</span>
              </label>
              <input
                type="text"
                value={supplierInvoiceNo}
                onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                placeholder="e.g. INV-88213"
                className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                }`}
              />
            </div>
          </div>

          {/* 3. Multi-Line Items Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-blue-600" />
                  <span>{isEn ? 'Shipment Line Items' : 'รายการสินค้าที่ตรวจรับ (Multi-lines)'}</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  {isEn
                    ? 'Enter sellable qty, damaged units, Lot/Exp, and unit cost for each item.'
                    : 'ระบุยอดดี, ยอดชำรุดตอนเปิดกล่องตรวจรับ, ข้อมูล Lot/วันหมดอายุ'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddLine}
                className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition border border-blue-200 dark:border-blue-800 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isEn ? 'Add Item' : 'เพิ่มรายการสินค้า'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {lines.map((line, idx) => (
                <div
                  key={line.id}
                  className={`p-4 rounded-2xl border transition relative space-y-3 ${
                    isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-lg">
                      #{idx + 1}
                    </span>
                    {lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Product Selection */}
                    <div className="lg:col-span-2">
                      <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        {isEn ? 'Product Item *' : 'เลือกสินค้า *'}
                      </label>
                      <CustomSelect
                        theme={theme}
                        value={line.productId}
                        onChange={(val) => handleLineChange(idx, 'productId', val)}
                        searchable={true}
                        placeholder="-- ค้นหาและเลือกสินค้า --"
                        searchPlaceholder="พิมพ์ชื่อสินค้า, SKU..."
                        options={productsList.map((p) => ({
                          value: p.id,
                          label: `${p.name} ${p.sku ? `[${p.sku}]` : ''}`,
                          sublabel: `฿${p.costPrice || p.price || 0} | คลัง: ${p.stockOnHand || 0} ${p.uom}`,
                        }))}
                      />
                    </div>

                    {/* Quantity Received (Good condition) */}
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        {isEn ? 'Good Qty (Sellable) *' : 'ยอดสภาพดี (พร้อมขาย) *'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                        className={`w-full h-[42px] px-3 py-2 rounded-xl border text-xs font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none ${
                          isDark ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-white border-slate-200'
                        }`}
                      />
                    </div>

                    {/* Damaged Quantity */}
                    <div>
                      <label className="block text-rose-600 dark:text-rose-400 font-semibold mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{isEn ? 'Damaged Qty (Claim)' : 'ยอดชำรุด (เพื่อเคลม)'}</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={line.damagedQuantity}
                        onChange={(e) =>
                          handleLineChange(idx, 'damagedQuantity', parseInt(e.target.value) || 0)
                        }
                        className={`w-full h-[42px] px-3 py-2 rounded-xl border text-xs font-bold text-rose-600 focus:ring-2 focus:ring-rose-500 outline-none ${
                          isDark ? 'bg-slate-800 border-slate-700 text-rose-400' : 'bg-white border-slate-200'
                        }`}
                      />
                    </div>

                    {/* Lot Number */}
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        {isEn ? 'Lot / Batch Number' : 'หมายเลข Lot / Batch'}
                      </label>
                      <input
                        type="text"
                        value={line.lotNumber}
                        onChange={(e) => handleLineChange(idx, 'lotNumber', e.target.value)}
                        placeholder="e.g. LOT-2026-A"
                        className={`w-full h-[42px] px-3 py-2 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none ${
                          isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                        }`}
                      />
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{isEn ? 'Expiry Date' : 'วันหมดอายุ (EXP)'}</span>
                      </label>
                      <input
                        type="date"
                        value={line.expiryDate}
                        onChange={(e) => handleLineChange(idx, 'expiryDate', e.target.value)}
                        className={`w-full h-[42px] px-3 py-2 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none ${
                          isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                        }`}
                      />
                    </div>

                    {/* Unit Cost */}
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                        {isEn ? 'Unit Cost (฿)' : 'ต้นทุนต่อหน่วย (บาท)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unitCost}
                        onChange={(e) => handleLineChange(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                        className={`w-full h-[42px] px-3 py-2 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none ${
                          isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                        }`}
                      />
                    </div>

                    {/* Bin Location (Only if 1-Step) */}
                    {putawayMode === '1-STEP' && (
                      <div>
                        <label className="block text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                          {isEn ? 'Target Shelf (Bin) *' : 'ตำแหน่งชั้นวาง (Bin) *'}
                        </label>
                        <CustomSelect
                          theme={theme}
                          value={line.binLocationId}
                          onChange={(val) => handleLineChange(idx, 'binLocationId', val)}
                          searchable={true}
                          placeholder={isEn ? '-- Select Bin --' : '-- เลือกตำแหน่ง Bin --'}
                          searchPlaceholder="ค้นหารหัส Bin หรือโซน..."
                          options={availableBins.map((bin) => ({
                            value: bin.id,
                            label: bin.binCode || (bin as any).code,
                            sublabel: bin.zone ? `Zone ${bin.zone}` : undefined,
                          }))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Notes & Summary Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {isEn ? 'Notes / Shipment Remarks' : 'หมายเหตุเพิ่มเติม'}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ระบุรายละเอียดสภาพกล่อง, คนขับรถส่งของ, หรือข้อสังเกตหน้างาน..."
                className={`w-full p-2.5 rounded-2xl border text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                }`}
              />
            </div>

            {/* Calculations Summary Card */}
            <div
              className={`p-4 rounded-2xl border flex flex-col justify-between ${
                isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isEn ? 'Total Line Items:' : 'จำนวนรายการสินค้า:'}</span>
                  <strong className="text-slate-900 dark:text-white">{lines.length} รายการ</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isEn ? 'Total Sellable Qty:' : 'ยอดสินค้าดี (รับเข้าสต็อก):'}</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">{totalGoodQty.toLocaleString()} ชิ้น</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isEn ? 'Total Damaged Qty:' : 'ยอดชำรุด (ไม่เข้าสต็อก):'}</span>
                  <strong className="text-rose-600 dark:text-rose-400">{totalDamagedQty.toLocaleString()} ชิ้น</strong>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5 text-sm font-extrabold">
                  <span className="text-slate-800 dark:text-slate-200">{isEn ? 'Estimated Total Value:' : 'มูลค่ารวมโดยประมาณ:'}</span>
                  <span className="text-blue-600 dark:text-blue-400">฿{totalEstimatedCost.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-2">
                {putawayMode === '2-STEP'
                  ? '⚠️ สินค้าจะเข้าพักที่จุด Staging และรอการสแกนจัดเก็บในหน้า Putaway'
                  : '✓ สินค้าจะเข้าชั้นวางที่ระบุทันที พร้อมเปิดบิลหยิบขายได้ทันที'}
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEn ? 'Saving Receipt...' : 'กำลังบันทึกใบรับ...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEn ? 'Confirm Goods Receipt' : 'ยืนยันบันทึกรับสินค้า (GR)'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
