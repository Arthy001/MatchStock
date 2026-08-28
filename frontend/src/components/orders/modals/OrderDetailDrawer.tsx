import React from 'react';
import {
  FileText,
  X,
  Printer,
  Truck,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { ThemeMode, Order, OrderStatus } from '../../../types';

interface OrderDetailDrawerProps {
  theme: ThemeMode;
  t: any;
  isSales: boolean;
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onNavigateToStockAction?: (actionType: 'RECEIVE' | 'ISSUE', order: Order) => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  theme,
  isSales,
  isOpen,
  order,
  onClose,
  onUpdateStatus,
  onNavigateToStockAction,
}) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className={`w-full max-w-[480px] h-full shadow-2xl flex flex-col justify-between border-l transition-all animate-in slide-in-from-right duration-300 relative z-10 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">{order.orderNo}</h3>
              <p className="text-[11px] text-slate-500">
                {isSales ? 'ใบสั่งขาย (Sales Order)' : 'ใบสั่งซื้อ (Purchase Order)'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Partner / Customer Info */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isSales ? 'ข้อมูลลูกค้า (Customer Info)' : 'ข้อมูลซัพพลายเออร์ (Supplier Info)'}
            </p>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {order.partyName}
            </h4>
            {order.contactPerson && (
              <p className="text-slate-600 dark:text-slate-400">ผู้ติดต่อ: {order.contactPerson}</p>
            )}
            {order.phone && (
              <p className="text-slate-600 dark:text-slate-400">โทรศัพท์: {order.phone}</p>
            )}
            {order.email && (
              <p className="text-slate-600 dark:text-slate-400">อีเมล: {order.email}</p>
            )}
          </div>

          {/* Order Logistics Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <p className="text-[10px] text-slate-500 font-medium">วันที่สั่ง</p>
              <p className="font-mono font-bold mt-0.5">{order.orderDate}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <p className="text-[10px] text-slate-500 font-medium">กำหนดส่งมอบ</p>
              <p className="font-mono font-bold mt-0.5 text-blue-600 dark:text-blue-400">
                {order.expectedDate}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <p className="text-[10px] text-slate-500 font-medium">คลังเป้าหมาย</p>
              <p className="font-semibold mt-0.5 truncate">{order.warehouseName}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <p className="text-[10px] text-slate-500 font-medium">เครดิต / ชำระเงิน</p>
              <p className="font-semibold mt-0.5 truncate">{order.paymentTerms}</p>
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
              รายการสินค้าในคำสั่ง ({order.items.length} รายการ)
            </p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {item.productName}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">
                      SKU: {item.sku} | ฿{item.unitPrice.toLocaleString()} x {item.quantity} {item.uom}
                    </p>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    ฿{item.totalAmount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Calculations */}
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-1.5">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>มูลค่าสินค้ารวม (Subtotal):</span>
              <span>฿{order.subtotal.toLocaleString()}</span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>ส่วนลดรวม (Discount):</span>
                <span>-฿{order.discountTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>ภาษีมูลค่าเพิ่ม 7% (VAT):</span>
              <span>฿{order.taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-extrabold text-base pt-2 border-t border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100">
              <span>ยอดสุทธิ (Grand Total):</span>
              <span>฿{order.grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <select
              value={order.status}
              onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
              className={`w-1/2 py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
              }`}
            >
              <option value="DRAFT">สถานะ: ฉบับร่าง (Draft)</option>
              <option value="CONFIRMED">สถานะ: ยืนยันแล้ว (Confirmed)</option>
              <option value="PROCESSING">สถานะ: กำลังดำเนินงาน (Processing)</option>
              <option value="COMPLETED">สถานะ: เสร็จสมบูรณ์ (Completed)</option>
              <option value="CANCELLED">สถานะ: ยกเลิก (Cancelled)</option>
            </select>

            <button
              onClick={() => window.print()}
              className="w-1/2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสาร (Print)</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onNavigateToStockAction) {
                onNavigateToStockAction(isSales ? 'ISSUE' : 'RECEIVE', order);
              }
            }}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>{isSales ? 'ส่งไปทำรายการเบิกจ่าย (GI)' : 'ส่งไปทำรายการรับเข้า (GR)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
