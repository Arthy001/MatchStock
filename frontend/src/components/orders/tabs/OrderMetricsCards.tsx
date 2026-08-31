import React from 'react';
import {
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
  isSales,
  metrics,
  onOpenCreateModal,
}) => {
  const title = isSales ? 'ใบสั่งขาย (Sales Orders - SO)' : 'ใบสั่งซื้อสินค้า (Purchase Orders - PO)';
  const subtitle = isSales
    ? 'จัดการรายการสั่งซื้อจากลูกค้า การจองสต็อก และการเตรียมจัดส่งสินค้า'
    : 'จัดการการสั่งซื้อสินค้าจากคู่ค้า ผู้จัดจำหน่าย และการนัดหมายรับเข้าคลัง';
  const actionBtnLabel = isSales ? 'สร้างใบสั่งขาย (New SO)' : 'สร้างใบสั่งซื้อ (New PO)';

  return (
    <div className="space-y-6">
      {/* Enterprise Title & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {title}
          </h2>
          <p className={`text-[15px] font-normal mt-0.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateModal}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-white text-[14px] font-semibold transition cursor-pointer active:scale-[0.99] ${
              isSales
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-xs shadow-blue-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-xs shadow-emerald-600/30'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{actionBtnLabel}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
          theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}>
          <div>
            <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>มูลค่ารวมทั้งหมด (Total Value)</p>
            <p className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 font-mono">
              ฿{metrics.totalValue.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
          theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}>
          <div>
            <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>รอดำเนินการ (Confirmed)</p>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {metrics.confirmedCount} <span className="text-xs font-normal text-zinc-500">orders</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock3 className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
          theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}>
          <div>
            <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>กำลังเตรียม/จัดส่ง (Processing)</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {metrics.processingCount} <span className="text-xs font-normal text-zinc-500">orders</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
          theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}>
          <div>
            <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>สำเร็จเรียบร้อย (Completed)</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {metrics.completedCount} <span className="text-xs font-normal text-zinc-500">orders</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
