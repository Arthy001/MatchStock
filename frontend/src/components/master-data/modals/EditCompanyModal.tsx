import React from 'react';
import { createPortal } from 'react-dom';
import { Building2, X, CheckCircle2, Edit2, Eye } from 'lucide-react';
import { ThemeMode, Language, Company } from '../../../types';

interface EditCompanyModalProps {
  theme: ThemeMode;
  lang?: Language;
  t: any;
  company: Company | null;
  isViewOnly?: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onSwitchToEdit?: () => void;
  isSaving: boolean;
  editCompCode: string;
  setEditCompCode: (val: string) => void;
  editCompName: string;
  setEditCompName: (val: string) => void;
  editCompTaxId: string;
  setEditCompTaxId: (val: string) => void;
  editCompBranchCode: string;
  setEditCompBranchCode: (val: string) => void;
  editCompBranchName: string;
  setEditCompBranchName: (val: string) => void;
  editCompPhone: string;
  setEditCompPhone: (val: string) => void;
  editCompEmail: string;
  setEditCompEmail: (val: string) => void;
  editCompAddress: string;
  setEditCompAddress: (val: string) => void;
  editCompIsHq: boolean;
  setEditCompIsHq: (val: boolean) => void;
}

export const EditCompanyModal: React.FC<EditCompanyModalProps> = ({
  theme,
  lang = 'th',
  t,
  company,
  isViewOnly = false,
  onClose,
  onSave,
  onSwitchToEdit,
  isSaving,
  editCompCode,
  setEditCompCode,
  editCompName,
  setEditCompName,
  editCompTaxId,
  setEditCompTaxId,
  editCompBranchCode,
  setEditCompBranchCode,
  editCompBranchName,
  setEditCompBranchName,
  editCompPhone,
  setEditCompPhone,
  editCompEmail,
  setEditCompEmail,
  editCompAddress,
  setEditCompAddress,
  editCompIsHq,
  setEditCompIsHq,
}) => {
  if (!company) return null;
  const isEn = lang === 'en';

  const disabledCls = isViewOnly
    ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed'
    : theme === 'dark'
    ? 'bg-slate-800 border-slate-700 text-white'
    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400';

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Enterprise Pro Modal Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs shrink-0">
              {isViewOnly ? <Eye className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                  {isViewOnly
                    ? (isEn ? 'Subsidiary Company Details' : 'รายละเอียดบริษัทในเครือ')
                    : (isEn ? 'Edit Subsidiary Company' : 'แก้ไขข้อมูลบริษัทในเครือ')}
                </h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs ${
                  isViewOnly
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                }`}>
                  {isViewOnly ? (isEn ? 'View Info' : 'ดูข้อมูล') : (isEn ? 'Edit Info' : 'แก้ไขข้อมูล')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 truncate">
                {isViewOnly
                  ? (isEn ? 'View corporate entity, branch, and registered address' : 'ดูข้อมูลนิติบุคคล สาขา และที่อยู่สถานประกอบการ')
                  : (isEn ? 'Update corporate entity, branch, and tax identifier' : 'แก้ไขข้อมูลนิติบุคคล สาขา และเลขประจำตัวผู้เสียภาษี')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition shrink-0 cursor-pointer"
            title={isEn ? 'Close Window' : 'ปิดหน้าต่าง (Close)'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={onSave}
          className="p-5 space-y-3.5 text-sm max-h-[80vh] overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                {isEn ? 'Company Code' : 'รหัสบริษัท (Company Code)'} <span className="text-slate-400 font-normal text-xs">{isEn ? '(Optional)' : '(ไม่บังคับ)'}</span>
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={editCompCode}
                onChange={(e) => setEditCompCode(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden ${disabledCls}`}
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                {isEn ? 'Company / Entity Name' : 'ชื่อบริษัท / นิติบุคคล'} <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isViewOnly}
                value={editCompName}
                onChange={(e) => setEditCompName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-semibold outline-hidden ${disabledCls}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                {isEn ? 'Tax ID' : 'เลขประจำตัวผู้เสียภาษี (Tax ID)'} <span className="text-slate-400 font-normal text-xs">{isEn ? '(Optional)' : '(ไม่บังคับ)'}</span>
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={editCompTaxId}
                onChange={(e) => setEditCompTaxId(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden ${disabledCls}`}
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                {isEn ? 'Branch Code' : 'รหัสสาขา (Branch Code)'} <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isViewOnly}
                value={editCompBranchCode}
                onChange={(e) => setEditCompBranchCode(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${disabledCls}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                {isEn ? 'Branch Name' : 'ชื่อสาขา (Branch Name)'} <span className="text-slate-400 font-normal text-xs">{isEn ? '(Optional)' : '(ไม่บังคับ)'}</span>
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={editCompBranchName}
                onChange={(e) => setEditCompBranchName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${disabledCls}`}
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                {isEn ? 'Phone Number' : 'เบอร์โทรศัพท์ (Phone)'} <span className="text-slate-400 font-normal text-xs">{isEn ? '(Optional)' : '(ไม่บังคับ)'}</span>
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={editCompPhone}
                onChange={(e) => setEditCompPhone(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${disabledCls}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
              {isEn ? 'Email Address' : 'อีเมลติดต่อ (Email)'} <span className="text-slate-400 font-normal text-xs">{isEn ? '(Optional)' : '(ไม่บังคับ)'}</span>
            </label>
            <input
              type="email"
              disabled={isViewOnly}
              value={editCompEmail}
              onChange={(e) => setEditCompEmail(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${disabledCls}`}
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
              {isEn ? 'Legal Address' : 'ที่อยู่สถานประกอบการ (Legal Address)'} <span className="text-slate-400 font-normal text-xs">{isEn ? '(Optional)' : '(ไม่บังคับ)'}</span>
            </label>
            <textarea
              rows={2}
              disabled={isViewOnly}
              value={editCompAddress}
              onChange={(e) => setEditCompAddress(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${disabledCls}`}
            />
          </div>

          {/* Headquarters Toggle Card */}
          <div
            onClick={() => !isViewOnly && setEditCompIsHq(!editCompIsHq)}
            className={`p-3.5 rounded-2xl border transition-all duration-200 select-none flex items-center justify-between gap-3 ${
              isViewOnly ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
            } ${
              editCompIsHq
                ? theme === 'dark'
                  ? 'bg-blue-950/40 border-blue-500/60 shadow-xs shadow-blue-500/10'
                  : 'bg-blue-50/80 border-blue-400 shadow-xs shadow-blue-500/10'
                : theme === 'dark'
                ? 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70 hover:border-slate-600'
                : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
                  editCompIsHq
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                    : theme === 'dark'
                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span
                  className={`block text-xs font-bold leading-tight ${
                    editCompIsHq
                      ? theme === 'dark' ? 'text-blue-300' : 'text-blue-900'
                      : theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                  }`}
                >
                  {isEn ? 'Headquarters Entity (HQ)' : 'กำหนดเป็นสำนักงานใหญ่ (Headquarters Entity)'}
                </span>
                <span className="block text-[11px] text-slate-400 mt-0.5 truncate">
                  {isEn
                    ? 'Primary corporate parent entity for consolidated reports'
                    : 'กำหนดให้เป็นนิติบุคคลหลักของกลุ่มบริษัทสำหรับงบการเงินรวม'}
                </span>
              </div>
            </div>

            {/* Smooth Toggle Switch Knob */}
            <div
              className={`w-11 h-6 rounded-full transition-colors duration-200 p-0.5 shrink-0 flex items-center ${
                editCompIsHq ? 'bg-blue-600' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  editCompIsHq ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
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
                    <span>{isEn ? 'Edit Info' : 'แก้ไขข้อมูล'}</span>
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
