import React from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { ThemeMode, OrderItem, ProductItem } from '../../../types';

interface CreateOrderModalProps {
  theme: ThemeMode;
  t: any;
  isSales: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formPartyName: string;
  setFormPartyName: (val: string) => void;
  formContactPerson: string;
  setFormContactPerson: (val: string) => void;
  formOrderDate: string;
  setFormOrderDate: (val: string) => void;
  formExpectedDate: string;
  setFormExpectedDate: (val: string) => void;
  formWarehouseId: string;
  setFormWarehouseId: (val: string) => void;
  formItems: OrderItem[];
  products: ProductItem[];
  warehouses: any[];
  calculatedTotal: number;
  onAddItem: () => void;
  onUpdateItemQty: (id: string, qty: number) => void;
  onUpdateItemPrice: (id: string, price: number) => void;
  onRemoveItem: (id: string) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  theme,
  isSales,
  isOpen,
  onClose,
  onSubmit,
  formPartyName,
  setFormPartyName,
  formContactPerson,
  setFormContactPerson,
  formOrderDate,
  setFormOrderDate,
  formExpectedDate,
  setFormExpectedDate,
  formWarehouseId,
  setFormWarehouseId,
  formItems,
  products,
  warehouses,
  calculatedTotal,
  onAddItem,
  onUpdateItemQty,
  onUpdateItemPrice,
  onRemoveItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl p-6 max-h-[90vh] overflow-y-auto transition relative z-10 animate-in zoom-in-95 duration-200 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-50' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold">
            {isSales ? 'สร้างใบสั่งขายใหม่ (Create Sales Order)' : 'สร้างใบสั่งซื้อใหม่ (Create Purchase Order)'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {isSales ? 'ชื่อลูกค้า / บริษัท:' : 'ชื่อผู้จัดจำหน่าย / ซัพพลายเออร์:'}
              </label>
              <input
                type="text"
                required
                value={formPartyName}
                onChange={(e) => setFormPartyName(e.target.value)}
                placeholder={isSales ? 'เช่น บจก. สยามโรโบติกส์' : 'เช่น บจก. ซูมิโตโม แมชชีนเนอรี่'}
                className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 transition ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-slate-100'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                ผู้ติดต่อ / เบอร์โทร:
              </label>
              <input
                type="text"
                value={formContactPerson}
                onChange={(e) => setFormContactPerson(e.target.value)}
                placeholder="เช่น คุณกิตติศักดิ์ (081-xxx-xxxx)"
                className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 transition ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-slate-100'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">วันที่สั่งซื้อ:</label>
              <input
                type="date"
                required
                value={formOrderDate}
                onChange={(e) => setFormOrderDate(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 transition ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-slate-100'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">กำหนดส่งมอบ:</label>
              <input
                type="date"
                required
                value={formExpectedDate}
                onChange={(e) => setFormExpectedDate(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 transition ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-slate-100'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">คลังเป้าหมาย:</label>
              <select
                value={formWarehouseId}
                onChange={(e) => setFormWarehouseId(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 transition cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-slate-100'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {warehouses.map((w) => (
                  <option key={w.id || w.code} value={w.id || w.code}>
                    {w.name || w.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items in Order */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">รายการสินค้า (Order Items):</span>
              <button
                type="button"
                onClick={onAddItem}
                className="px-2.5 py-1 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มสินค้า
              </button>
            </div>

            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {formItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <div className="sm:col-span-5">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{item.productName}</p>
                    <p className="text-[10px] font-mono text-slate-500">{item.sku}</p>
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => onUpdateItemQty(item.id, parseInt(e.target.value, 10) || 1)}
                      placeholder="จำนวน"
                      className={`w-full text-center px-2 py-1.5 rounded-lg border font-mono font-bold text-xs ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-slate-100'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => onUpdateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                      placeholder="ราคา/หน่วย"
                      className={`w-full text-right px-2 py-1.5 rounded-lg border font-mono font-bold text-xs ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-slate-100'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="sm:col-span-2 text-right font-bold text-blue-600 dark:text-blue-400">
                    ฿{item.totalAmount.toLocaleString()}
                  </div>

                  <div className="sm:col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold">
            <span>ยอดสุทธิรวมภาษี (Grand Total):</span>
            <span className="text-base text-blue-600 dark:text-blue-400 font-extrabold">
              ฿{calculatedTotal.toLocaleString()}
            </span>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
            >
              ยืนยันบันทึกเอกสาร
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
