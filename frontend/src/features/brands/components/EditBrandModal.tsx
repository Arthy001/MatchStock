import React from 'react';
import { createPortal } from 'react-dom';
import { Tag, X, CheckCircle2, Edit2, Eye } from 'lucide-react';
import { ThemeMode, Language, BrandItem } from '../../../types';

interface EditBrandModalProps {
  theme: ThemeMode;
  lang?: Language;
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
  editBrandIsActive: boolean;
  setEditBrandIsActive: (val: boolean) => void;
}

export const EditBrandModal: React.FC<EditBrandModalProps> = ({
  theme,
  lang = 'th',
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
  editBrandIsActive,
  setEditBrandIsActive,
}) => {
  if (!brand) return null;
  const isEn = lang === 'en';

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
        {/* Enterprise Pro Modal Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs shrink-0">
              {isViewOnly ? <Eye className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                  {isViewOnly
                    ? (isEn ? 'Brand Details' : 'รายละเอียดแบรนด์สินค้า')
                    : (isEn ? 'Edit Product Brand' : 'แก้ไขแบรนด์สินค้า')}
                </h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs ${
                  isViewOnly
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}>
                  {isViewOnly ? (isEn ? 'View Only' : 'ดูข้อมูล') : (isEn ? 'Edit' : 'แก้ไขข้อมูล')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 truncate">
                {isViewOnly
                  ? (isEn ? 'Inspect brand registration and trademarks' : 'ดูข้อมูลแบรนด์และยี่ห้อสินค้าในระบบ')
                  : (isEn ? 'Update brand name, code, and description' : 'แก้ไขชื่อแบรนด์ รหัส และคำอธิบาย')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition shrink-0 cursor-pointer"
            title={isEn ? 'Close' : 'ปิดหน้าต่าง (Close)'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="p-5 space-y-4 text-sm">
          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1.5">
              {isEn ? 'Brand Code' : 'รหัสแบรนด์ (Brand Code)'}
              <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                {isEn ? '(Cannot be changed after creation)' : '(ไม่สามารถแก้ไขได้หลังสร้าง)'}
              </span>
            </label>
            <input
              type="text"
              disabled
              value={editBrandCode}
              className="w-full px-3 py-2 rounded-xl border font-mono font-bold outline-hidden bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1.5">
              {isEn ? 'Brand Name' : 'ชื่อแบรนด์ (Brand Name)'} <span className="text-rose-500 font-bold">*</span>
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
              {isEn ? 'Description' : 'รายละเอียด (Description)'} <span className="text-slate-400 font-normal text-xs">({isEn ? 'Optional' : 'ไม่บังคับ'})</span>
            </label>
            <textarea
              rows={2}
              disabled={isViewOnly}
              value={editBrandDescription}
              onChange={(e) => setEditBrandDescription(e.target.value)}
              placeholder={isEn ? 'Enter brand description...' : 'ระบุรายละเอียดแบรนด์สินค้า...'}
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
                {isEn ? 'Active Status' : 'สถานะการใช้งาน (Active Status)'}
              </span>
              <span className="text-xs text-slate-500">
                {editBrandIsActive
                  ? (isEn ? 'Active - Visible in product catalog' : 'เปิดใช้งาน (Active) - แสดงในตัวเลือกสินค้า')
                  : (isEn ? 'Inactive - Hidden from selection' : 'ปิดใช้งาน (Inactive) - ซ่อนจากรายการเลือก')}
              </span>
            </div>
            <button
              type="button"
              disabled={isViewOnly}
              onClick={() => setEditBrandIsActive(!editBrandIsActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                editBrandIsActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              } ${isViewOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  editBrandIsActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
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
                    <span>{isEn ? 'Edit Details' : 'แก้ไขข้อมูล'}</span>
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
                  <span>{isSaving ? (isEn ? 'Saving...' : 'กำลังบันทึก...') : t.save}</span>
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
