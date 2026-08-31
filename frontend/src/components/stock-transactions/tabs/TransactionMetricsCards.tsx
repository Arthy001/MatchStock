import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  SlidersHorizontal,
  Plus,
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
        };
      case 'issue':
        return {
          title: t.giTitle,
          subtitle: t.giSubtitle,
        };
      case 'transfer':
        return {
          title: t.transferTitle,
          subtitle: t.transferSubtitle,
        };
      case 'adjustment':
        return {
          title: t.adjTitle,
          subtitle: t.adjSubtitle,
        };
      default:
        return {
          title: t.transTitle,
          subtitle: t.transSubtitle,
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="space-y-6">
      {/* Enterprise Title & Actions Toolbar (Matching Master Data) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {headerInfo.title}
          </h2>
          <p className={`text-[15px] font-normal mt-0.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {headerInfo.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[14px] font-semibold shadow-xs shadow-blue-600/30 transition cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newTransactionBtn}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
          theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}>
          <div>
            <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{t.statTodayReceive}</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              +{totalReceives} <span className="text-xs font-normal text-zinc-500">items</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
          theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}>
          <div>
            <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{t.statTodayIssue}</p>
            <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              -{totalIssues} <span className="text-xs font-normal text-zinc-500">items</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
          theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}>
          <div>
            <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{t.statActiveTransfers}</p>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
              {activeTransfers} <span className="text-xs font-normal text-zinc-500">docs</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-xl border flex items-center justify-between transition ${
          theme === 'dark' ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-zinc-200/80 shadow-xs'
        }`}>
          <div>
            <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{t.statTotalAdjustments}</p>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {totalAdjustments} <span className="text-xs font-normal text-zinc-500">audits</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
