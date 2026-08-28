import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  SlidersHorizontal,
  Plus,
  ChevronRight,
  Package,
} from 'lucide-react';
import { ThemeMode } from '../../../types';

interface TransactionMetricsCardsProps {
  theme: ThemeMode;
  t: any;
  activeSubTab: 'all' | 'receive' | 'issue' | 'transfer' | 'adjustment';
  totalReceives: number;
  totalIssues: number;
  activeTransfers: number;
  totalAdjustments: number;
  onOpenCreateModal: () => void;
}

export const TransactionMetricsCards: React.FC<TransactionMetricsCardsProps> = ({
  theme,
  t,
  activeSubTab,
  totalReceives,
  totalIssues,
  activeTransfers,
  totalAdjustments,
  onOpenCreateModal,
}) => {
  const getHeaderInfo = () => {
    switch (activeSubTab) {
      case 'receive':
        return {
          title: t.grTitle,
          subtitle: t.grSubtitle,
          icon: ArrowDownLeft,
          color: 'text-emerald-600 dark:text-emerald-400',
          bg: 'bg-emerald-500/10',
        };
      case 'issue':
        return {
          title: t.giTitle,
          subtitle: t.giSubtitle,
          icon: ArrowUpRight,
          color: 'text-amber-600 dark:text-amber-400',
          bg: 'bg-amber-500/10',
        };
      case 'transfer':
        return {
          title: t.transferTitle,
          subtitle: t.transferSubtitle,
          icon: ArrowRightLeft,
          color: 'text-indigo-600 dark:text-indigo-400',
          bg: 'bg-indigo-500/10',
        };
      case 'adjustment':
        return {
          title: t.adjTitle,
          subtitle: t.adjSubtitle,
          icon: SlidersHorizontal,
          color: 'text-purple-600 dark:text-purple-400',
          bg: 'bg-purple-500/10',
        };
      default:
        return {
          title: t.transTitle,
          subtitle: t.transSubtitle,
          icon: Package,
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-500/10',
        };
    }
  };

  const headerInfo = getHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  return (
    <div
      className={`p-6 rounded-2xl border transition ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl ${headerInfo.bg} ${headerInfo.color} shrink-0`}>
            <HeaderIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                {t.inventory}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {activeSubTab === 'all'
                  ? t.tabAllTransactions
                  : activeSubTab === 'receive'
                  ? t.tabGoodsReceive
                  : activeSubTab === 'issue'
                  ? t.tabGoodsIssue
                  : activeSubTab === 'transfer'
                  ? t.tabStockTransfer
                  : t.tabStockAdjustment}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">
              {headerInfo.title}
            </h2>
            <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
              {headerInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs md:text-sm font-bold shadow-md shadow-blue-600/30 transition focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.newTransactionBtn}
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.statTodayReceive}</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              +{totalReceives} <span className="text-xs font-normal text-slate-500">items</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.statTodayIssue}</p>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
              -{totalIssues} <span className="text-xs font-normal text-slate-500">items</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.statActiveTransfers}</p>
            <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {activeTransfers} <span className="text-xs font-normal text-slate-500">docs</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.statTotalAdjustments}</p>
            <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
              {totalAdjustments} <span className="text-xs font-normal text-slate-500">audits</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
