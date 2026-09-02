import React from 'react';
import {
  Search,
  FileText,
  MapPin,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { ThemeMode, StockTransaction, TransactionType, TransactionStatus } from '../../../types';

interface TransactionHistoryTableProps {
  theme: ThemeMode;
  t: any;
  activeSubTab: 'all' | 'receive' | 'issue' | 'transfer' | 'adjustment';
  localSearch: string;
  setLocalSearch: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  filteredTransactions: StockTransaction[];
  onOpenDetail: (tx: StockTransaction) => void;
}

export const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  theme,
  t,
  activeSubTab,
  localSearch,
  setLocalSearch,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  filteredTransactions,
  onOpenDetail,
}) => {
  const renderTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'RECEIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            {t.typeReceive}
          </span>
        );
      case 'ISSUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {t.typeIssue}
          </span>
        );
      case 'TRANSFER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            {t.typeTransfer}
          </span>
        );
      case 'ADJUSTMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {t.typeAdjustment}
          </span>
        );
      default:
        return null;
    }
  };

  const renderStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            {t.statusCompleted}
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="w-3 h-3" />
            {t.statusPending}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <XCircle className="w-3 h-3" />
            {t.statusCancelled}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <div
        className={`p-4 rounded-2xl border transition flex flex-col md:flex-row items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs md:text-sm font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Transaction Type Filter (if on all) */}
          {activeSubTab === 'all' && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">ทุกประเภท (All Types)</option>
              <option value="RECEIVE">Goods Receive (GR)</option>
              <option value="ISSUE">Goods Issue (GI)</option>
              <option value="TRANSFER">Stock Transfer (TR)</option>
              <option value="ADJUSTMENT">Stock Adjustment (ADJ)</option>
            </select>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="ALL">ทุกสถานะ (All Status)</option>
            <option value="COMPLETED">{t.statusCompleted}</option>
            <option value="PENDING">{t.statusPending}</option>
            <option value="CANCELLED">{t.statusCancelled}</option>
          </select>
        </div>
      </div>

      {/* Main Transactions Data Table */}
      <div
        className={`rounded-2xl border overflow-hidden transition ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/40 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[160px]">{t.docNo}</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[130px]">{t.transType}</th>
                <th className="py-3.5 px-4 min-w-[180px]">{t.productName}</th>
                <th className="py-3.5 px-4 whitespace-nowrap min-w-[120px]">{t.lotBatch}</th>
                <th className="py-3.5 px-4 min-w-[160px]">
                  {t.sourceLocation} / {t.destLocation}
                </th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[90px]">{t.quantity}</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap min-w-[100px]">{t.totalValue}</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[100px]">{t.status}</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap min-w-[100px]">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    ไม่พบรายการธุรกรรมตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const firstItem = tx.items[0];
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group cursor-pointer"
                      onClick={() => onOpenDetail(tx)}
                    >
                      {/* Document No & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap min-w-[160px]">
                        <div className="font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 whitespace-nowrap">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{tx.documentNo}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap font-mono">
                          {tx.createdAt}
                        </div>
                      </td>

                      {/* Transaction Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">{renderTypeBadge(tx.type)}</td>

                      {/* Product Name & SKU */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate" title={firstItem?.productName}>
                          {firstItem?.productName || '-'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {firstItem?.sku} ({firstItem?.uom})
                        </div>
                      </td>

                      {/* Lot / Batch & Expiry */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {firstItem?.lotNumber ? (
                          <div>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                              {firstItem.lotNumber}
                            </span>
                            {firstItem.expDate && (
                              <div className="text-[10px] text-rose-500 font-medium mt-0.5">
                                EXP: {firstItem.expDate}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Location: From / To */}
                      <td className="py-3.5 px-4 text-[11px]">
                        {tx.type === 'RECEIVE' && (
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              To: {firstItem?.toBinCode} ({firstItem?.toWarehouseName?.split(' ')[0]})
                            </span>
                          </div>
                        )}
                        {tx.type === 'ISSUE' && (
                          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              From: {firstItem?.fromBinCode} ({firstItem?.fromWarehouseName?.split(' ')[0]})
                            </span>
                          </div>
                        )}
                        {tx.type === 'TRANSFER' && (
                          <div className="space-y-0.5">
                            <div className="text-slate-500">
                              From: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{firstItem?.fromBinCode}</span>
                            </div>
                            <div className="text-indigo-600 dark:text-indigo-400 font-semibold">
                              To: <span className="font-mono font-bold">{firstItem?.toBinCode}</span>
                            </div>
                          </div>
                        )}
                        {tx.type === 'ADJUSTMENT' && (
                          <div className="text-purple-600 dark:text-purple-400 font-medium">
                            At: {firstItem?.fromBinCode || firstItem?.toBinCode}
                          </div>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-black text-slate-900 dark:text-slate-50 text-sm">
                          {tx.type === 'RECEIVE' && `+${tx.totalQuantity}`}
                          {tx.type === 'ISSUE' && `-${tx.totalQuantity}`}
                          {tx.type === 'TRANSFER' && `${tx.totalQuantity}`}
                          {tx.type === 'ADJUSTMENT' && (
                            <span className={tx.adjustmentDirection === 'INCREASE' ? 'text-emerald-600' : 'text-rose-600'}>
                              {tx.adjustmentDirection === 'INCREASE' ? `+${tx.totalQuantity}` : `-${tx.totalQuantity}`}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">{firstItem?.uom}</div>
                      </td>

                      {/* Total Value */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        ฿{(tx.totalAmount || 0).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">{renderStatusBadge(tx.status)}</td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDetail(tx);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition cursor-pointer"
                        >
                          {t.viewDetails}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
