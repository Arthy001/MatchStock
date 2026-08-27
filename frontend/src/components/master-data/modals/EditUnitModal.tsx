import React from 'react';
import { createPortal } from 'react-dom';
import { Scale, X, CheckCircle2 } from 'lucide-react';
import { ThemeMode } from '../../../types';

interface UnitItem {
  id: string;
  code: string;
  name: string;
}

interface EditUnitModalProps {
  theme: ThemeMode;
  t: any;
  unit: UnitItem | null;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  isSaving: boolean;
  editUnitCode: string;
  setEditUnitCode: (val: string) => void;
  editUnitName: string;
  setEditUnitName: (val: string) => void;
}

export const EditUnitModal: React.FC<EditUnitModalProps> = ({
  theme,
  t,
  unit,
  onClose,
  onSave,
  isSaving,
  editUnitCode,
  setEditUnitCode,
  editUnitName,
  setEditUnitName,
}) => {
  if (!unit) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base">
              แก้ไขข้อมูลหน่วยนับ (Edit UOM)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="p-5 space-y-4 text-sm">
          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
              รหัสหน่วยนับ (UOM Code) *
            </label>
            <input
              type="text"
              required
              value={editUnitCode}
              onChange={(e) => setEditUnitCode(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-mono font-bold outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
              ชื่อหน่วยนับ (Unit Name) *
            </label>
            <input
              type="text"
              required
              value={editUnitName}
              onChange={(e) => setEditUnitName(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'กำลังบันทึก...' : t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
