import React from 'react';
import { createPortal } from 'react-dom';
import { Scale, X, CheckCircle2, Edit2, Eye } from 'lucide-react';
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
  isViewOnly?: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onSwitchToEdit?: () => void;
  isSaving: boolean;
  editUnitCode: string;
  setEditUnitCode: (val: string) => void;
  editUnitName: string;
  setEditUnitName: (val: string) => void;
  editUnitIsActive: boolean;
  setEditUnitIsActive: (val: boolean) => void;
}

export const EditUnitModal: React.FC<EditUnitModalProps> = ({
  theme,
  t,
  unit,
  isViewOnly = false,
  onClose,
  onSave,
  onSwitchToEdit,
  isSaving,
  editUnitCode,
  setEditUnitCode,
  editUnitName,
  setEditUnitName,
  editUnitIsActive,
  setEditUnitIsActive,
}) => {
  if (!unit) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {isViewOnly ? <Eye className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isViewOnly
                  ? 'รายละเอียดหน่วยนับ (Unit Details)'
                  : 'แก้ไขข้อมูลหน่วยนับ (Edit UOM)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isViewOnly ? 'ดูข้อมูลหน่วยนับสินค้าในระบบ' : 'แก้ไขรหัสย่อและชื่อหน่วยนับ'}
              </p>
            </div>
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
              รหัสหน่วยนับ (UOM Code) <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isViewOnly}
              value={editUnitCode}
              onChange={(e) => setEditUnitCode(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-mono font-bold outline-hidden ${
                isViewOnly
                  ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed'
                  : theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
              ชื่อหน่วยนับ (Unit Name) <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isViewOnly}
              value={editUnitName}
              onChange={(e) => setEditUnitName(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                isViewOnly
                  ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed'
                  : theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          {/* Active Status Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div>
              <span className="block font-semibold text-[13px] text-slate-800 dark:text-slate-200">
                สถานะการใช้งาน (Active Status)
              </span>
              <span className="text-xs text-slate-500">
                {editUnitIsActive ? 'เปิดใช้งาน (Active) - แสดงในตัวเลือกหน่วยนับ' : 'ปิดใช้งาน (Inactive) - ซ่อนจากรายการเลือก'}
              </span>
            </div>
            <button
              type="button"
              disabled={isViewOnly}
              onClick={() => setEditUnitIsActive(!editUnitIsActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                editUnitIsActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              } ${isViewOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  editUnitIsActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            {isViewOnly ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-xs transition cursor-pointer"
                >
                  {t.close}
                </button>
                {onSwitchToEdit && (
                  <button
                    type="button"
                    onClick={onSwitchToEdit}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>แก้ไขข้อมูล</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer text-xs"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSaving ? 'กำลังบันทึก...' : t.save}</span>
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
