import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { ThemeMode, Supplier } from '../../../types';

interface SupplierManagementTabProps {
  theme: ThemeMode;
  t: any;
  suppliersList: Supplier[];
  onOpenEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplier: Supplier) => void;
}

export const SupplierManagementTab: React.FC<SupplierManagementTabProps> = ({
  theme,
  t,
  suppliersList = [],
  onOpenEditSupplier,
  onDeleteSupplier,
}) => {
  const safeSuppliers = Array.isArray(suppliersList) ? suppliersList : [];
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
          {t.supplierTitle}
        </h3>
        <p
          className={`text-xs font-normal mt-1 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {t.supplierSubtitle}
        </p>
      </div>

      <div className="space-y-4">
        {safeSuppliers.map((sup) => (
          <div
            key={sup.id}
            className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
              theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                    theme === 'dark'
                      ? 'bg-slate-800 text-slate-200 border-slate-700'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {sup.code}
                </span>
                <h4
                  className={`font-semibold text-sm ${
                    theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  {sup.name}
                </h4>
              </div>
              <p
                className={`text-xs font-normal mt-1 ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Contact: {sup.contactPerson} ({sup.phone}) • Email: {sup.email}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                Address: {sup.address}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs shrink-0">
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
                  }`}
                >
                  {sup.taxType} (7%)
                </p>
                <p className="text-[10px] text-slate-400 font-normal">
                  Tax ID: {sup.taxId}
                </p>
              </div>
              <span
                className={`px-3 py-1.5 rounded-xl border font-semibold ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-slate-200 border-slate-700'
                    : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                Terms: {sup.discountTerms}
              </span>
              <button
                onClick={() => onOpenEditSupplier(sup)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="แก้ไขข้อมูลผู้จัดจำหน่าย (Full Edit)"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteSupplier(sup)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="ลบผู้จัดจำหน่าย"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
