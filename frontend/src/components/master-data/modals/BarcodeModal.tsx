import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer } from 'lucide-react';
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
        className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl relative z-10 space-y-4 animate-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Barcode Label Preview</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print Barcode Label</span>
        </button>
      </div>
    </div>,
    document.body
  );
};
