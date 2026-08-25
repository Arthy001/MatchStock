import React from 'react';
import { Printer } from 'lucide-react';
import { ThemeMode } from '../../../types';

interface BarcodeManagementTabProps {
  theme: ThemeMode;
  t: any;
}

export const BarcodeManagementTab: React.FC<BarcodeManagementTabProps> = ({
  theme,
  t,
}) => {
  return (
    <div
      className={`p-6 rounded-2xl border transition-colors ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="mb-6">
        <h3
          className={`font-semibold text-base ${
            theme === 'dark' ? 'text-slate-50' : 'text-slate-900'
          }`}
        >
          {t.barcodeTitle}
        </h3>
        <p
          className={`text-xs font-normal mt-1 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {t.barcodeSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CODE128 Card */}
        <div
          className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-blue-600">CODE128</span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
              1D Barcode
            </span>
          </div>
          <div className="text-center p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <p className="font-semibold text-slate-900 text-xs">
              AeroGlide Running Shoes
            </p>
            <div className="w-full h-12 bg-slate-950 flex items-center justify-between px-2 py-1 rounded my-2">
              <div className="w-1 h-full bg-white" />
              <div className="w-2 h-full bg-white" />
              <div className="w-1 h-full bg-white" />
              <div className="w-3 h-full bg-white" />
              <div className="w-1.5 h-full bg-white" />
              <div className="w-2 h-full bg-white" />
              <div className="w-1 h-full bg-white" />
            </div>
            <p className="font-mono text-xs font-bold text-slate-900">
              8851234567890
            </p>
          </div>
          <button className="w-full py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer">
            <Printer className="w-3.5 h-3.5" />
            <span>{t.printLabel}</span>
          </button>
        </div>

        {/* EAN-13 Card */}
        <div
          className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-blue-600">EAN-13</span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
              Retail Global
            </span>
          </div>
          <div className="text-center p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <p className="font-semibold text-slate-900 text-xs">
              SoundPulse Pro Earbuds
            </p>
            <div className="w-full h-12 bg-slate-950 flex items-center justify-between px-2 py-1 rounded my-2">
              <div className="w-1.5 h-full bg-white" />
              <div className="w-1 h-full bg-white" />
              <div className="w-2.5 h-full bg-white" />
              <div className="w-1 h-full bg-white" />
              <div className="w-2 h-full bg-white" />
            </div>
            <p className="font-mono text-xs font-bold text-slate-900">
              8859876543210
            </p>
          </div>
          <button className="w-full py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer">
            <Printer className="w-3.5 h-3.5" />
            <span>{t.printLabel}</span>
          </button>
        </div>

        {/* QR CODE Card */}
        <div
          className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-emerald-600">QR CODE</span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
              2D Matrix
            </span>
          </div>
          <div className="text-center p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
            <p className="font-semibold text-slate-900 text-xs mb-2">
              Urban Tech Oversized Tee
            </p>
            <div className="w-20 h-20 bg-slate-950 rounded-lg p-2 grid grid-cols-4 gap-1">
              <div className="bg-white" />
              <div className="bg-white" />
              <div className="bg-transparent" />
              <div className="bg-white" />
              <div className="bg-white" />
              <div className="bg-transparent" />
              <div className="bg-white" />
              <div className="bg-white" />
              <div className="bg-transparent" />
              <div className="bg-white" />
              <div className="bg-white" />
              <div className="bg-transparent" />
              <div className="bg-white" />
              <div className="bg-white" />
              <div className="bg-white" />
              <div className="bg-white" />
            </div>
            <p className="font-mono text-xs font-bold text-slate-900 mt-2">
              QR-URBAN-TEE-003
            </p>
          </div>
          <button className="w-full py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer">
            <Printer className="w-3.5 h-3.5" />
            <span>{t.printLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
