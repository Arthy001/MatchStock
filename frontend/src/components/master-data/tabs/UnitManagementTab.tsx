import React from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Eye, Scale } from 'lucide-react';
import { ThemeMode, Language } from '../../../types';
import { UnitItem } from '../hooks/useMasterDataLoader';

interface UnitManagementTabProps {
  theme: ThemeMode;
  lang?: Language;
  t: any;
  unitsList: UnitItem[];
  onOpenAddModal: () => void;
  onOpenEditUnit: (unit: UnitItem, isViewOnly?: boolean) => void;
  onDeleteUnit: (unit: UnitItem) => void;
}

export const UnitManagementTab: React.FC<UnitManagementTabProps> = ({
  theme,
  lang = 'th',
  t,
  unitsList = [],
  onOpenAddModal,
  onOpenEditUnit,
  onDeleteUnit,
}) => {
  const isEn = lang === 'en';
  const safeUnits = Array.isArray(unitsList) ? unitsList : [];
  return (
    <div className="space-y-6">
      <div
        className={`p-6 rounded-2xl border transition-colors ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="mb-4">
          <h3
            className={`font-semibold text-base flex items-center gap-2 ${
              theme === 'dark' ? 'text-slate-50' : 'text-slate-900'
            }`}
          >
            <Scale className="w-5 h-5 text-cyan-600" />
            {isEn ? 'Units of Measure (UOM Master)' : `${t.unitsTitle} (UOM Master)`} ({safeUnits.length})
          </h3>
          <p
            className={`text-xs font-normal mt-1 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {isEn
              ? 'Define base packaging units, volume conversions, and measurement standards'
              : t.unitsSubtitle}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                className={`border-b font-semibold ${
                  theme === 'dark'
                    ? 'border-slate-800 text-slate-200 bg-slate-800'
                    : 'border-slate-200 text-slate-700 bg-slate-100'
                }`}
              >
                <th className="p-3">{isEn ? 'UOM Code' : 'รหัสหน่วย (UOM Code)'}</th>
                <th className="p-3">{isEn ? 'Unit Name' : 'ชื่อหน่วยนับ (Unit Name)'}</th>
                <th className="p-3">{isEn ? 'Status' : 'สถานะ (Status)'}</th>
                <th className="p-3 text-right">{isEn ? 'Actions' : t.actions}</th>
              </tr>
            </thead>
            <tbody
              className="divide-y divide-slate-100 dark:divide-slate-800"
            >
              {safeUnits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-400 text-xs font-medium">
                    {isEn ? 'No units of measure found in system' : 'ยังไม่มีข้อมูลหน่วยนับสินค้าในระบบ'}
                  </td>
                </tr>
              ) : (
                safeUnits.map((unit) => (
                <tr
                  key={unit.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                >
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs border ${
                        theme === 'dark'
                          ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60'
                          : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                      }`}
                    >
                      {unit.code}
                    </span>
                  </td>
                  <td
                    className={`p-3 font-semibold ${
                      theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    {unit.name}
                  </td>
                  <td className="p-3">
                    {unit.isActive !== false ? (
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
                      onClick={() => onOpenEditUnit(unit, true)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        theme === 'dark'
                          ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                          : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                      }`}
                      title={isEn ? 'View Unit Details' : 'ดูรายละเอียดหน่วยนับ (View Detail)'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenEditUnit(unit, false)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        theme === 'dark'
                          ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                          : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                      }`}
                      title={isEn ? 'Edit UOM' : 'แก้ไขหน่วยนับ (Edit UOM)'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteUnit(unit)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        theme === 'dark'
                          ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                          : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                      }`}
                      title={isEn ? 'Delete UOM' : 'ลบหน่วยนับ (Delete UOM)'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
