import React from 'react';
import { createPortal } from 'react-dom';
import { Edit2, X, CheckCircle2, Trash2 } from 'lucide-react';
import { ThemeMode, ProductItem } from '../../../types';

interface ProductDrawerProps {
  theme: ThemeMode;
  t: any;
  product: ProductItem | null;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onDelete: (product: ProductItem) => void;
  isSaving: boolean;
  // Controlled form states
  editName: string;
  setEditName: (val: string) => void;
  editCode: string;
  setEditCode: (val: string) => void;
  editSku: string;
  setEditSku: (val: string) => void;
  editBrand: string;
  setEditBrand: (val: string) => void;
  editBarcode: string;
  setEditBarcode: (val: string) => void;
  editPrice: string;
  setEditPrice: (val: string) => void;
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
  editDescription: string;
  setEditDescription: (val: string) => void;
}

export const ProductDrawer: React.FC<ProductDrawerProps> = ({
  theme,
  t,
  product,
  onClose,
  onSave,
  onDelete,
  isSaving,
  editName,
  setEditName,
  editCode,
  setEditCode,
  editSku,
  setEditSku,
  editBrand,
  setEditBrand,
  editBarcode,
  setEditBarcode,
  editPrice,
  setEditPrice,
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
  editDescription,
  setEditDescription,
}) => {
  if (!product) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end">
      {/* Backdrop click to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className={`w-full max-w-[480px] h-full p-6 shadow-xl flex flex-col justify-between overflow-y-auto relative z-10 animate-in slide-in-from-right duration-300 ${
          theme === 'dark'
            ? 'bg-slate-900 text-slate-100 border-l border-slate-800'
            : 'bg-white text-slate-900 border-l border-slate-200'
        }`}
      >
        {/* Drawer Header */}
        <div>
          <div
            className={`flex items-center justify-between pb-4 border-b ${
              theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-600" />
              <h3
                className={`font-semibold text-base ${
                  theme === 'dark' ? 'text-slate-50' : 'text-slate-900'
                }`}
              >
                Edit Product Details
              </h3>
            </div>
            <button
              onClick={onClose}
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
          <div className="mt-6 space-y-4 text-xs">
            <div className="flex items-center gap-4">
              <img
                src={product.imageUrl}
                alt={product.name}
                className={`w-16 h-16 rounded-2xl object-cover border shadow-xs shrink-0 ${
                  theme === 'dark' ? 'border-slate-700' : 'border-slate-200'
                }`}
              />
              <div className="flex-1">
                <label className="block text-slate-400 font-medium mb-1">
                  {t.productName} *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl border font-semibold text-sm outline-hidden ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  {t.code}
                </label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl border font-mono font-medium outline-hidden ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  {t.sku}
                </label>
                <input
                  type="text"
                  value={editSku}
                  onChange={(e) => setEditSku(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl border font-mono font-medium outline-hidden ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  {t.brand}
                </label>
                <input
                  type="text"
                  value={editBrand}
                  onChange={(e) => setEditBrand(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl border font-medium outline-hidden ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  รหัสบาร์โค้ด (Barcode)
                </label>
                <input
                  type="text"
                  value={editBarcode}
                  onChange={(e) => setEditBarcode(e.target.value)}
                  placeholder="8851234567890"
                  className={`w-full px-3 py-1.5 rounded-xl border font-mono font-medium outline-hidden ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  {t.price} ($ / ฿)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl border font-bold text-blue-600 outline-hidden ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editWeightKg}
                  onChange={(e) => setEditWeightKg(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl border font-medium outline-hidden ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  กว้าง (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editWidthCm}
                  onChange={(e) => setEditWidthCm(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl border font-medium outline-hidden ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  ยาว (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editLengthCm}
                  onChange={(e) => setEditLengthCm(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl border font-medium outline-hidden ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  สูง (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editHeightCm}
                  onChange={(e) => setEditHeightCm(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl border font-medium outline-hidden ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Reorder Point (ROP)
                </label>
                <input
                  type="number"
                  value={editReorderLevel}
                  onChange={(e) => setEditReorderLevel(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl border font-medium outline-hidden ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-amber-400'
                      : 'bg-slate-50 border-slate-300 text-amber-700'
                  }`}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Min Reorder Qty
                </label>
                <input
                  type="number"
                  value={editMinReorderQty}
                  onChange={(e) => setEditMinReorderQty(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-xl border font-medium outline-hidden ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <input
                type="checkbox"
                id="editLotControlCheckbox"
                checked={editIsLotControl}
                onChange={(e) => setEditIsLotControl(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="editLotControlCheckbox"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                ควบคุมแบบ Lot / Batch Number
              </label>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                รายละเอียดสินค้า (Description)
              </label>
              <textarea
                rows={2}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="ระบุคุณสมบัติหรือสเปกเพิ่มเติม..."
                className={`w-full px-3 py-1.5 rounded-xl border font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

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
                    (Number(product.widthCm || 0) *
                      Number(product.lengthCm || 0) *
                      Number(product.heightCm || 0)) /
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
          className={`pt-4 border-t space-y-2 ${
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
              <span>{isSaving ? 'กำลังบันทึก...' : t.save}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => onDelete(product)}
            disabled={isSaving}
            className="w-full py-2 rounded-xl text-rose-600 hover:bg-rose-500/10 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>ลบสินค้านี้ออกจากระบบ (Delete)</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
