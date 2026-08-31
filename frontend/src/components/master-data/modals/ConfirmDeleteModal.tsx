import React from 'react';
import { createPortal } from 'react-dom';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { ThemeMode, Language } from '../../../types';

export interface ConfirmDeleteData {
  title: string;
  itemName: string;
  itemType: string;
  itemCode?: string;
  description?: string;
  onConfirm: () => Promise<void> | void;
}

interface ConfirmDeleteModalProps {
  theme: ThemeMode;
  lang?: Language;
  isOpen: boolean;
  isDeleting: boolean;
  data: ConfirmDeleteData | null;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  theme,
  lang = 'th',
  isOpen,
  isDeleting,
  data,
  onClose,
}) => {
  if (!isOpen || !data) return null;
  const isEn = lang === 'en';

  return createPortal(
    <div className="fixed inset-0 z-[99999] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="fixed inset-0 -z-10" onClick={isDeleting ? undefined : onClose} />

      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 flex items-start justify-between border-b border-slate-200/80 dark:border-slate-800 bg-rose-500/5 dark:bg-rose-500/10">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/25 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">
                  {data.title || (isEn ? 'Confirm Delete' : 'ยืนยันการลบข้อมูล')}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  {data.itemType || (isEn ? 'Permanent' : 'ลบถาวร')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                {isEn ? 'This action cannot be undone.' : 'การดำเนินการนี้ไม่สามารถเรียกคืนได้'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition shrink-0 cursor-pointer disabled:opacity-50"
            title={isEn ? 'Close' : 'ปิดหน้าต่าง (Close)'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-sm">
          {/* Target Item Detail Box */}
          <div
            className={`p-3.5 rounded-xl border ${
              theme === 'dark'
                ? 'bg-slate-800/60 border-slate-700/80'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="text-xs text-slate-400 font-medium mb-1">
              {isEn ? 'Item to be deleted:' : 'รายการที่ต้องการลบ:'}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                {data.itemName}
              </span>
              {data.itemCode && (
                <span className="px-2 py-0.5 rounded-md font-mono text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                  {data.itemCode}
                </span>
              )}
            </div>
            {data.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {data.description}
              </p>
            )}
          </div>

          {/* Warning notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isEn
                ? 'Please verify before proceeding. If this record is referenced by transactions, purchase orders, or inventory items, deletion may cause inconsistencies.'
                : 'กรุณาตรวจสอบให้แน่ใจก่อนทำการลบ หากข้อมูลนี้ถูกใช้งานในระบบ เช่น เอกสารซื้อขาย หรือสต็อกสินค้า อาจทำให้เกิดข้อผิดพลาดได้'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            {isEn ? 'Cancel' : 'ยกเลิก (Cancel)'}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={data.onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isEn ? 'Deleting...' : 'กำลังลบข้อมูล...'}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Confirm Delete' : 'ยืนยันการลบข้อมูล'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
