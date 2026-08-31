import React from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Tag, Eye } from 'lucide-react';
import { ThemeMode, BrandItem } from '../../../types';

interface BrandManagementTabProps {
  theme: ThemeMode;
  t: any;
  brandsList: BrandItem[];
  onOpenAddModal: () => void;
  onOpenEditBrand: (brand: BrandItem, isViewOnly?: boolean) => void;
  onDeleteBrand: (brand: BrandItem) => void;
}

export const BrandManagementTab: React.FC<BrandManagementTabProps> = ({
  theme,
  t,
  brandsList = [],
  onOpenAddModal,
  onOpenEditBrand,
  onDeleteBrand,
}) => {
  const safeBrands = Array.isArray(brandsList) ? brandsList : [];

  return (
    <div className="space-y-6">
      {/* Table Section Header */}
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Tag className="w-5 h-5 text-indigo-600" />
          แบรนด์สินค้าทั้งหมด ({safeBrands.length})
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          จัดการรายชื่อแบรนด์และยี่ห้อสินค้าทั้งหมดในระบบ MatchStock
        </p>
      </div>

      {/* Brands Table */}
      <div
        className={`rounded-2xl border overflow-hidden transition ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 shadow-sm'
            : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                className={`border-b font-bold uppercase tracking-wider ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-950/60 text-slate-400'
                    : 'border-slate-200 bg-slate-50/80 text-slate-600'
                }`}
              >
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">รหัสแบรนด์ (Code)</th>
                <th className="p-3">ชื่อแบรนด์ (Brand Name)</th>
                <th className="p-3">คำอธิบาย (Description)</th>
                <th className="p-3">สถานะ (Status)</th>
                <th className="p-3 text-right">จัดการ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {safeBrands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    ไม่พบข้อมูลแบรนด์สินค้า
                  </td>
                </tr>
              ) : (
                safeBrands.map((brand, idx) => (
                  <tr
                    key={brand.id || idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs border ${
                          theme === 'dark'
                            ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        {brand.code || '-'}
                      </span>
                    </td>
                    <td
                      className={`p-3 font-semibold ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      {brand.name}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {brand.description || '-'}
                    </td>
                    <td className="p-3">
                      {brand.isActive !== false ? (
                        <span
                          className={`font-medium inline-flex items-center gap-1 text-xs ${
                            theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span
                          className={`font-medium inline-flex items-center gap-1 text-xs ${
                            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5 text-slate-400" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => onOpenEditBrand(brand, true)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                        }`}
                        title="ดูรายละเอียดแบรนด์ (View Detail)"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenEditBrand(brand, false)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                        }`}
                        title="แก้ไขแบรนด์ (Edit Brand)"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteBrand(brand)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                        }`}
                        title="ลบแบรนด์ (Delete Brand)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
