import React from 'react';
import { createPortal } from 'react-dom';
import { Building2, X, CheckCircle2 } from 'lucide-react';
import { ThemeMode, Company } from '../../../types';

interface EditCompanyModalProps {
  theme: ThemeMode;
  t: any;
  company: Company | null;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
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
  t,
  company,
  onClose,
  onSave,
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
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base">
              แก้ไขข้อมูลบริษัทในเครือ (Edit Company)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
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
                รหัสบริษัท (Company Code)
              </label>
              <input
                type="text"
                value={editCompCode}
                onChange={(e) => setEditCompCode(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                ชื่อบริษัท / นิติบุคคล *
              </label>
              <input
                type="text"
                required
                value={editCompName}
                onChange={(e) => setEditCompName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-semibold outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                เลขประจำตัวผู้เสียภาษี (Tax ID)
              </label>
              <input
                type="text"
                value={editCompTaxId}
                onChange={(e) => setEditCompTaxId(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                รหัสสาขา (Branch Code) *
              </label>
              <input
                type="text"
                required
                value={editCompBranchCode}
                onChange={(e) => setEditCompBranchCode(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                ชื่อสาขา (Branch Name)
              </label>
              <input
                type="text"
                value={editCompBranchName}
                onChange={(e) => setEditCompBranchName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                เบอร์โทรศัพท์ (Phone)
              </label>
              <input
                type="text"
                value={editCompPhone}
                onChange={(e) => setEditCompPhone(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
              อีเมลติดต่อ (Email)
            </label>
            <input
              type="email"
              value={editCompEmail}
              onChange={(e) => setEditCompEmail(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
              ที่อยู่สถานประกอบการ (Legal Address)
            </label>
            <textarea
              rows={2}
              value={editCompAddress}
              onChange={(e) => setEditCompAddress(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <input
              type="checkbox"
              id="editCompIsHqCheckboxModal"
              checked={editCompIsHq}
              onChange={(e) => setEditCompIsHq(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="editCompIsHqCheckboxModal"
              className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              กำหนดเป็นสำนักงานใหญ่ (Headquarters Entity)
            </label>
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
