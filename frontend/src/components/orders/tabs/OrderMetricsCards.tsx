import React from 'react';
import {
  ShoppingCart,
  ShoppingBag,
  Plus,
  DollarSign,
  Clock3,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { ThemeMode, OrderType } from '../../../types';

interface OrderMetricsCardsProps {
  theme: ThemeMode;
  t: any;
  type: OrderType;
  isSales: boolean;
  metrics: {
    totalCount: number;
    confirmedCount: number;
    processingCount: number;
    completedCount: number;
    totalValue: number;
  };
  onOpenCreateModal: () => void;
}

export const OrderMetricsCards: React.FC<OrderMetricsCardsProps> = ({
  theme,
  t,
  isSales,
  metrics,
  onOpenCreateModal,
}) => {
  return (
    <div
      className={`p-6 rounded-2xl border transition ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-2xl shrink-0 ${
              isSales ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isSales ? <ShoppingCart className="w-7 h-7" /> : <ShoppingBag className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isSales ? 'Sales & Distribution' : 'Procurement & Purchasing'}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {isSales ? 'Commercial Operations' : 'Vendor Management'}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">
              {isSales ? 'ใบสั่งขาย (Sales Orders - SO)' : 'ใบสั่งซื้อสินค้า (Purchase Orders - PO)'}
            </h2>
            <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5">
              {isSales
                ? 'จัดการรายการสั่งซื้อจากลูกค้า การจองสต็อก และการเตรียมจัดส่งสินค้า'
                : 'จัดการการสั่งซื้อสินค้าจากคู่ค้า ผู้จัดจำหน่าย และการนัดหมายรับเข้าคลัง'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreateModal}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs md:text-sm font-bold shadow-md transition focus:ring-2 focus:outline-none cursor-pointer ${
              isSales
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30 focus:ring-blue-500'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 focus:ring-emerald-500'
            }`}
          >
            <Plus className="w-4 h-4" />
            {isSales ? 'สร้างใบสั่งขาย (New SO)' : 'สร้างใบสั่งซื้อ (New PO)'}
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">มูลค่ารวมทั้งหมด (Total Value)</p>
            <p className="text-lg md:text-xl font-black text-slate-900 dark:text-slate-50 mt-1 font-mono">
              ฿{metrics.totalValue.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">รอดำเนินการ (Confirmed)</p>
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {metrics.confirmedCount} <span className="text-xs font-normal text-slate-500">orders</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <Clock3 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">กำลังเตรียม/จัดส่ง (Processing)</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {metrics.processingCount} <span className="text-xs font-normal text-slate-500">orders</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">สำเร็จเรียบร้อย (Completed)</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {metrics.completedCount} <span className="text-xs font-normal text-slate-500">orders</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
