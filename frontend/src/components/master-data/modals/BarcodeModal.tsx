import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Barcode } from 'lucide-react';
import { ThemeMode, ProductItem } from '../../../types';

interface BarcodeModalProps {
  theme: ThemeMode;
  product: ProductItem | null;
  onClose: () => void;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({
  theme,
  product,
  onClose,
}) => {
  if (!product) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Backdrop click to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className={`w-full max-w-sm rounded-2xl border shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Enterprise Pro Modal Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs shrink-0">
              <Barcode className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight">
                  ป้ายบาร์โค้ดสินค้า
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full border shadow-2xs bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800">
                  Label
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal truncate">
                ตัวอย่างก่อนพิมพ์ป้ายบาร์โค้ด
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition shrink-0 cursor-pointer"
            title="ปิดหน้าต่าง (Close)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-center p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
            <p className="text-xs text-blue-700 font-mono font-medium mb-3">
              {product.sku}
            </p>

            <div className="w-full h-16 bg-slate-950 flex items-center justify-between px-3 py-1 rounded my-2">
              <div className="w-1 h-full bg-white" />
              <div className="w-2.5 h-full bg-white" />
              <div className="w-1 h-full bg-white" />
              <div className="w-2 h-full bg-white" />
              <div className="w-3 h-full bg-white" />
              <div className="w-1 h-full bg-white" />
              <div className="w-2.5 h-full bg-white" />
              <div className="w-1 h-full bg-white" />
            </div>
            <p className="font-mono text-xs font-bold text-slate-900">
              {product.barcodeValue}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Barcode Label</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
