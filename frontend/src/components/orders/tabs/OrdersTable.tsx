import React from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  Calendar,
  Package,
} from 'lucide-react';
import { ThemeMode, Language, Order, OrderStatus } from '../../../types';

interface OrdersTableProps {
  theme: ThemeMode;
  lang?: Language;
  t: any;
  isSales: boolean;
  filteredOrders: Order[];
  statusFilter: OrderStatus | 'ALL';
  setStatusFilter: (st: OrderStatus | 'ALL') => void;
  onOpenDetail: (order: Order) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  theme,
  lang = 'th',
  isSales,
  filteredOrders,
  statusFilter,
  setStatusFilter,
  onOpenDetail,
}) => {
  const isEn = lang === 'en';

  return (
    <div
      className={`p-6 rounded-2xl border transition-all ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Status Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {(['ALL', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st === 'ALL'
                ? (isEn ? 'All' : 'ทั้งหมด')
                : st === 'CONFIRMED'
                ? (isEn ? 'Confirmed' : 'ยืนยันคำสั่ง')
                : st === 'PROCESSING'
                ? (isEn ? 'Processing' : 'กำลังดำเนินงาน')
                : st === 'COMPLETED'
                ? (isEn ? 'Completed' : 'เสร็จสมบูรณ์')
                : (isEn ? 'Cancelled' : 'ยกเลิก')}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {isEn ? `Found ${filteredOrders.length} records` : `พบ ${filteredOrders.length} รายการ`}
        </span>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead
            className={`sticky top-0 ${
              theme === 'dark' ? 'bg-slate-800/90 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <tr>
              <th className="py-3 px-3.5 font-semibold">{isEn ? 'Order No' : 'เลขที่เอกสาร'}</th>
              <th className="py-3 px-3 font-semibold">
                {isSales
                  ? (isEn ? 'Customer / Company' : 'ชื่อลูกค้า / บริษัท')
                  : (isEn ? 'Supplier / Vendor' : 'ชื่อซัพพลายเออร์')}
              </th>
              <th className="py-3 px-3 font-semibold">{isEn ? 'Order Date' : 'วันที่สั่ง'}</th>
              <th className="py-3 px-3 font-semibold">{isEn ? 'Expected Date' : 'กำหนดส่งมอบ'}</th>
              <th className="py-3 px-3 font-semibold">{isEn ? 'Warehouse' : 'คลังเป้าหมาย'}</th>
              <th className="py-3 px-3 font-semibold text-right">{isEn ? 'Total Items' : 'จำนวนสินค้า'}</th>
              <th className="py-3 px-3 font-semibold text-right">{isEn ? 'Grand Total' : 'ยอดสุทธิ (Grand Total)'}</th>
              <th className="py-3 px-3 font-semibold text-center">{isEn ? 'Status' : 'สถานะ'}</th>
              <th className="py-3 px-3.5 font-semibold text-center">{isEn ? 'Actions' : 'การจัดการ'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                  <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                  {isEn ? 'No orders match selected criteria' : 'ไม่พบรายการใบสั่งซื้อ/ขายตามเงื่อนไขที่เลือก'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => onOpenDetail(order)}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer"
                >
                  <td className="py-3 px-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {order.orderNo}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{order.partyName}</div>
                    <div className="text-[11px] text-slate-500">{order.contactPerson || '-'}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono">{order.orderDate}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono">{order.expectedDate}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">{order.warehouseName}</td>
                  <td className="py-3 px-3 text-right font-medium">
                    {order.items.reduce((acc, curr) => acc + curr.quantity, 0)} {isEn ? 'units' : 'ชิ้น'} ({order.items.length} SKUs)
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-slate-50">
                    ฿{order.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : order.status === 'CONFIRMED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                          : order.status === 'PROCESSING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      {order.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                      {order.status === 'CONFIRMED' && <Clock className="w-3 h-3 text-blue-500" />}
                      {order.status === 'COMPLETED'
                        ? (isEn ? 'Completed' : 'เสร็จสมบูรณ์')
                        : order.status === 'CONFIRMED'
                        ? (isEn ? 'Confirmed' : 'ยืนยันคำสั่ง')
                        : order.status === 'PROCESSING'
                        ? (isEn ? 'Processing' : 'กำลังดำเนินการ')
                        : (isEn ? 'Cancelled' : 'ยกเลิก')}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetail(order);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4 inline-block mr-1" />
                      {isEn ? 'View Details' : 'ดูรายละเอียด'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
