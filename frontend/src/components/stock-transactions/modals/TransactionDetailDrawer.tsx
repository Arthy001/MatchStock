import React from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  X,
  Printer,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
} from 'lucide-react';
import { ThemeMode, StockTransaction, TransactionType, TransactionStatus } from '../../../types';

interface TransactionDetailDrawerProps {
  theme: ThemeMode;
  t: any;
  isOpen: boolean;
  transaction: StockTransaction | null;
  onClose: () => void;
}

export const TransactionDetailDrawer: React.FC<TransactionDetailDrawerProps> = ({
  theme,
  t,
  isOpen,
  transaction,
  onClose,
}) => {
  if (!isOpen || !transaction) return null;

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

  return createPortal(
    <div className="fixed inset-0 z-[9998] overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className={`w-full max-w-[480px] h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l relative z-10 transition ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Drawer Header */}
        <div>
          <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-50">
                  {transaction.documentNo}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t.drawerTransactionDetail}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition shrink-0 cursor-pointer"
              title="ปิดหน้าต่าง (Close)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="p-5 sm:p-6 space-y-6">
            {/* Status & Type Bar */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">{t.transType}</span>
                {renderTypeBadge(transaction.type)}
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">{t.status}</span>
                {renderStatusBadge(transaction.status)}
              </div>
            </div>

            {/* Audit Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                ข้อมูลการบันทึก & ผู้ทำรายการ (Audit Info)
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-500 block text-[10px]">{t.transDate}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{transaction.createdAt}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-500 block text-[10px]">{t.performer}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{transaction.createdBy}</span>
                </div>
              </div>

              {transaction.referenceNo && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 block text-[10px]">{t.referenceDoc}</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{transaction.referenceNo}</span>
                </div>
              )}

              {transaction.supplierName && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 block text-[10px]">{t.supplier}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{transaction.supplierName}</span>
                </div>
              )}

              {transaction.recipientName && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs">
                  <span className="text-slate-500 block text-[10px]">{t.recipient}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{transaction.recipientName}</span>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                รายการสินค้าที่ทำธุรกรรม (Items - {transaction.items.length})
              </h4>
              {transaction.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.productName}</p>
                      <p className="text-xs font-mono text-slate-500">{item.sku} | Code: {item.productCode}</p>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-blue-600/10 text-blue-600 font-bold text-xs">
                      {item.quantity} {item.uom}
                    </span>
                  </div>

                  {/* Lot & Expiry Details */}
                  {item.lotNumber && (
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[9px]">{t.lotBatch}</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{item.lotNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">{t.mfgDate}</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{item.mfgDate || '-'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">{t.expDate}</span>
                        <span className="font-medium text-rose-500">{item.expDate || '-'}</span>
                      </div>
                    </div>
                  )}

                  {/* Warehouse & Bin Route */}
                  <div className="text-xs space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                    {item.fromWarehouseName && (
                      <div className="flex items-center justify-between text-slate-500">
                        <span>{t.sourceLocation}:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.fromWarehouseName.split(' ')[0]} / Bin: <strong className="text-blue-500 font-mono">{item.fromBinCode}</strong>
                        </span>
                      </div>
                    )}
                    {item.toWarehouseName && (
                      <div className="flex items-center justify-between text-slate-500">
                        <span>{t.destLocation}:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.toWarehouseName.split(' ')[0]} / Bin: <strong className="font-mono">{item.toBinCode}</strong>
                        </span>
                      </div>
                    )}
                    {item.variance !== undefined && (
                      <div className="flex items-center justify-between text-slate-500">
                        <span>{t.varianceQty}:</span>
                        <span className={`font-bold ${item.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {item.variance > 0 ? `+${item.variance}` : item.variance} {item.uom}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            {transaction.notes && (
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 text-xs">
                <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">{t.remarks}</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{transaction.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-inherit flex items-center justify-between gap-3">
          <button
            onClick={() => alert(`Printing Document Receipt: ${transaction.documentNo}`)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            {t.printLabel}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
