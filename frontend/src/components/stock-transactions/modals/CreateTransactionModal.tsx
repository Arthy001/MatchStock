import React from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  SlidersHorizontal,
  Package,
  Boxes,
  Loader2,
} from 'lucide-react';
import {
  ThemeMode,
  TransactionType,
  ProductItem,
  WarehouseBin,
  Supplier,
} from '../../../types';

interface CreateTransactionModalProps {
  theme: ThemeMode;
  t: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  formType: TransactionType;
  setFormType: (type: TransactionType) => void;
  formReferenceNo: string;
  setFormReferenceNo: (val: string) => void;
  formSupplierId: string;
  setFormSupplierId: (val: string) => void;
  formRecipient: string;
  setFormRecipient: (val: string) => void;
  formIssueReason: string;
  setFormIssueReason: (val: string) => void;
  formTransferType: 'INTER_WAREHOUSE' | 'BIN_TO_BIN';
  setFormTransferType: (val: 'INTER_WAREHOUSE' | 'BIN_TO_BIN') => void;
  formAdjReason: string;
  setFormAdjReason: (val: string) => void;
  formAdjDirection: 'INCREASE' | 'DECREASE';
  setFormAdjDirection: (val: 'INCREASE' | 'DECREASE') => void;
  formNotes: string;
  setFormNotes: (val: string) => void;
  selectedProductId: string;
  setSelectedProductId: (val: string) => void;
  formQty: number;
  setFormQty: (val: number) => void;
  formLotNumber: string;
  setFormLotNumber: (val: string) => void;
  formMfgDate: string;
  setFormMfgDate: (val: string) => void;
  formExpDate: string;
  setFormExpDate: (val: string) => void;
  fromBinId: string;
  setFromBinId: (val: string) => void;
  toBinId: string;
  setToBinId: (val: string) => void;
  productsList: ProductItem[];
  warehousesList: WarehouseBin[];
  suppliersList: Supplier[];
}

export const CreateTransactionModal: React.FC<CreateTransactionModalProps> = ({
  theme,
  t,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  formType,
  setFormType,
  formReferenceNo,
  setFormReferenceNo,
  formSupplierId,
  setFormSupplierId,
  formRecipient,
  setFormRecipient,
  formIssueReason,
  setFormIssueReason,
  formTransferType,
  setFormTransferType,
  formAdjReason,
  setFormAdjReason,
  formAdjDirection,
  setFormAdjDirection,
  formNotes,
  setFormNotes,
  selectedProductId,
  setSelectedProductId,
  formQty,
  setFormQty,
  formLotNumber,
  setFormLotNumber,
  formMfgDate,
  setFormMfgDate,
  formExpDate,
  setFormExpDate,
  fromBinId,
  setFromBinId,
  toBinId,
  setToBinId,
  productsList,
  warehousesList,
  suppliersList,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden relative z-10 transition animate-in zoom-in-95 duration-200 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Enterprise Pro Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/75 dark:bg-slate-900/90 z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                  {t.modalNewTransaction}
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                  {formType === 'RECEIVE' ? 'รับเข้า GR' : formType === 'ISSUE' ? 'เบิกจ่าย GI' : formType === 'TRANSFER' ? 'โอนย้าย TR' : 'ปรับปรุง ADJ'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 truncate">
                บันทึกรายการเคลื่อนไหวและธุรกรรมสินค้าคงคลัง (Stock Movement)
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

        {/* Modal Form with Scrollable Content & Pinned Footer */}
        <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Type Switcher Pills */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {t.transType} *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { type: 'RECEIVE' as TransactionType, label: '1. Receive (GR)', icon: ArrowDownLeft, color: 'text-emerald-500' },
                  { type: 'ISSUE' as TransactionType, label: '2. Issue (GI)', icon: ArrowUpRight, color: 'text-amber-500' },
                  { type: 'TRANSFER' as TransactionType, label: '3. Transfer (TR)', icon: ArrowRightLeft, color: 'text-indigo-500' },
                  { type: 'ADJUSTMENT' as TransactionType, label: '4. Adjust (ADJ)', icon: SlidersHorizontal, color: 'text-purple-500' },
                ].map((btn) => (
                  <button
                    type="button"
                    key={btn.type}
                    onClick={() => setFormType(btn.type)}
                    className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      formType === btn.type
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <btn.icon className={`w-3.5 h-3.5 ${formType === btn.type ? 'text-white' : btn.color}`} />
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Form Fields based on Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reference Doc */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.referenceDoc}
                </label>
                <input
                  type="text"
                  value={formReferenceNo}
                  onChange={(e) => setFormReferenceNo(e.target.value)}
                  placeholder="เช่น PO-2026-001, SO-2026-088"
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* GR: Supplier */}
              {formType === 'RECEIVE' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.supplier} *
                  </label>
                  <select
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    {suppliersList.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} ({sup.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* GI: Purpose & Recipient */}
              {formType === 'ISSUE' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.reason} *
                    </label>
                    <select
                      value={formIssueReason}
                      onChange={(e) => setFormIssueReason(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Sales Order Dispatch">Sales Order Dispatch (ส่งมอบลูกค้าตามใบสั่งขาย)</option>
                      <option value="Internal Department Requisition">Internal Requisition (เบิกใช้งานภายในองค์กร)</option>
                      <option value="Sample / Marketing">Sample / Marketing (เบิกเป็นสินค้าตัวอย่าง)</option>
                      <option value="Scrap / Defective">Scrap / Defective (ตัดจ่ายสินค้าชำรุดรอทิ้ง)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.recipient}
                    </label>
                    <input
                      type="text"
                      value={formRecipient}
                      onChange={(e) => setFormRecipient(e.target.value)}
                      placeholder="ชื่อลูกค้า หรือ แผนกที่เบิก"
                      className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Transfer: Mode */}
              {formType === 'TRANSFER' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.transferMode} *
                  </label>
                  <select
                    value={formTransferType}
                    onChange={(e) => setFormTransferType(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="INTER_WAREHOUSE">{t.interWarehouse}</option>
                    <option value="BIN_TO_BIN">{t.binToBin}</option>
                  </select>
                </div>
              )}

              {/* Adjustment: Reason & Direction */}
              {formType === 'ADJUSTMENT' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      รูปแบบการปรับยอด *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormAdjDirection('INCREASE')}
                        className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          formAdjDirection === 'INCREASE'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        + ปรับเพิ่ม (Surplus)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormAdjDirection('DECREASE')}
                        className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          formAdjDirection === 'DECREASE'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        - ปรับลด (Deficit)
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.reason} *
                    </label>
                    <select
                      value={formAdjReason}
                      onChange={(e) => setFormAdjReason(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      <option value="Cycle Count Variance">ผลต่างจากการตรวจนับรอบ (Cycle Count Variance)</option>
                      <option value="Damaged during handling">สินค้าชำรุดแตกหักระหว่างจัดเก็บ/ขนย้าย</option>
                      <option value="Expired / Deteriorated">สินค้าหมดอายุ / เสื่อมสภาพ</option>
                      <option value="Found Unrecorded Goods">พบสินค้าเกินในคลัง (Found Surplus)</option>
                      <option value="Loss / Missing Goods">สินค้าสูญหาย (Lost Deficit)</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            {/* Product & Quantity Section */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                เลือกสินค้าและจำนวน
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t.productName} *
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    {productsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku}) — คงเหลือ: {p.stockOnHand} {p.uom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t.quantity} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formQty}
                    onChange={(e) => setFormQty(Math.max(1, Number(e.target.value)))}
                    required
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Lot & Expiry for GR / GI / Transfer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t.lotBatch} *
                  </label>
                  <input
                    type="text"
                    value={formLotNumber}
                    onChange={(e) => setFormLotNumber(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t.mfgDate}
                  </label>
                  <input
                    type="date"
                    value={formMfgDate}
                    onChange={(e) => setFormMfgDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t.expDate}
                  </label>
                  <input
                    type="date"
                    value={formExpDate}
                    onChange={(e) => setFormExpDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bin Locations Route */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                {formType !== 'RECEIVE' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {t.sourceLocation} (From Bin) *
                    </label>
                    <select
                      value={fromBinId}
                      onChange={(e) => setFromBinId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      {warehousesList.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.binCode} — {b.warehouseName.split(' ')[0]} ({b.zone.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formType !== 'ISSUE' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {t.destLocation} (To Bin) *
                    </label>
                    <select
                      value={toBinId}
                      onChange={(e) => setToBinId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                    >
                      {warehousesList.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.binCode} — {b.warehouseName.split(' ')[0]} ({b.zone.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t.remarks}
              </label>
              <textarea
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="ระบุหมายเหตุ เช่น สภาพสินค้า, เอกสารแนบ หรือเหตุผลเพิ่มเติม..."
                className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Pinned Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <span>{t.submitTransaction}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
