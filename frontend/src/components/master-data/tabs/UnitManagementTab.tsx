import React from 'react';
import { Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { ThemeMode } from '../../../types';

interface UnitItem {
  id: string;
  code: string;
  name: string;
}

interface UnitManagementTabProps {
  theme: ThemeMode;
  t: any;
  unitsList: UnitItem[];
  onOpenAddModal: () => void;
  onOpenEditUnit: (unit: UnitItem) => void;
  onDeleteUnit: (unit: UnitItem) => void;
}

export const UnitManagementTab: React.FC<UnitManagementTabProps> = ({
  theme,
  t,
  unitsList = [],
  onOpenAddModal,
  onOpenEditUnit,
  onDeleteUnit,
}) => {
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              className={`font-semibold text-base ${
                theme === 'dark' ? 'text-slate-50' : 'text-slate-900'
              }`}
            >
              {t.unitsTitle} (UOM Master)
            </h3>
            <p
              className={`text-xs font-normal mt-1 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {t.unitsSubtitle}
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ เพิ่มหน่วยนับ (Add UOM)</span>
          </button>
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
                <th className="p-3">รหัสหน่วย (UOM Code)</th>
                <th className="p-3">ชื่อหน่วยนับ (Unit Name)</th>
                <th className="p-3">สถานะ (Status)</th>
                <th className="p-3 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody
              className="divide-y divide-slate-100 dark:divide-slate-800"
            >
              {safeUnits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-zinc-400 text-xs font-medium">
                    ยังไม่มีข้อมูลหน่วยนับสินค้าในระบบ
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
                          ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
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
                    <span
                      className={`font-medium inline-flex items-center gap-1 ${
                        theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      onClick={() => onOpenEditUnit(unit)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        theme === 'dark'
                          ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                          : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                      }`}
                      title="แก้ไขหน่วยนับ (Edit UOM)"
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
                      title="ลบหน่วยนับ (Delete UOM)"
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
