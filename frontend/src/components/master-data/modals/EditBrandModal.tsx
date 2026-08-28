import React from 'react';
import { createPortal } from 'react-dom';
import { Tag, X, CheckCircle2, Edit2, Eye } from 'lucide-react';
import { ThemeMode, BrandItem } from '../../../types';

interface EditBrandModalProps {
  theme: ThemeMode;
  t: any;
  brand: BrandItem | null;
  isViewOnly?: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onSwitchToEdit?: () => void;
  isSaving: boolean;
  editBrandCode: string;
  setEditBrandCode: (val: string) => void;
  editBrandName: string;
  setEditBrandName: (val: string) => void;
  editBrandDescription: string;
  setEditBrandDescription: (val: string) => void;
}

export const EditBrandModal: React.FC<EditBrandModalProps> = ({
  theme,
  t,
  brand,
  isViewOnly = false,
  onClose,
  onSave,
  onSwitchToEdit,
  isSaving,
  editBrandCode,
  setEditBrandCode,
  editBrandName,
  setEditBrandName,
  editBrandDescription,
  setEditBrandDescription,
}) => {
  if (!brand) return null;

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
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {isViewOnly ? <Eye className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isViewOnly
                  ? 'รายละเอียดแบรนด์สินค้า (Brand Details)'
                  : 'แก้ไขแบรนด์สินค้า (Edit Brand)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isViewOnly ? 'ดูข้อมูลแบรนด์และยี่ห้อสินค้าในระบบ' : 'แก้ไขข้อมูลและคำอธิบายแบรนด์'}
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
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1.5">
              รหัสแบรนด์ (Brand Code) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
            </label>
            <input
              type="text"
              disabled={isViewOnly}
              value={editBrandCode}
              onChange={(e) => setEditBrandCode(e.target.value)}
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
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1.5">
              ชื่อแบรนด์ (Brand Name) <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isViewOnly}
              value={editBrandName}
              onChange={(e) => setEditBrandName(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                isViewOnly
                  ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed'
                  : theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1.5">
              รายละเอียด (Description) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
            </label>
            <textarea
              rows={2}
              disabled={isViewOnly}
              value={editBrandDescription}
              onChange={(e) => setEditBrandDescription(e.target.value)}
              placeholder="ระบุรายละเอียดแบรนด์สินค้า..."
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                isViewOnly
                  ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed'
                  : theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
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
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 cursor-pointer"
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
                  className={`px-4 py-2 rounded-xl border font-semibold text-xs transition cursor-pointer ${
                    theme === 'dark'
                      ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
