import React from 'react';
import { createPortal } from 'react-dom';
import { Truck, X, CheckCircle2, Edit2, Eye } from 'lucide-react';
import { ThemeMode, Language, Supplier } from '../../../types';

interface EditSupplierModalProps {
  theme: ThemeMode;
  lang?: Language;
  t: any;
  supplier: Supplier | null;
  isViewOnly?: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onSwitchToEdit?: () => void;
  isSaving: boolean;
  editSupCode: string;
  setEditSupCode: (val: string) => void;
  editSupName: string;
  setEditSupName: (val: string) => void;
  editSupContactPerson: string;
  setEditSupContactPerson: (val: string) => void;
  editSupPhone: string;
  setEditSupPhone: (val: string) => void;
  editSupEmail: string;
  setEditSupEmail: (val: string) => void;
  editSupTaxId: string;
  setEditSupTaxId: (val: string) => void;
  editSupAddress: string;
  setEditSupAddress: (val: string) => void;
  editSupIsActive: boolean;
  setEditSupIsActive: (val: boolean) => void;
}

export const EditSupplierModal: React.FC<EditSupplierModalProps> = ({
  theme,
  lang = 'th',
  t,
  supplier,
  isViewOnly = false,
  onClose,
  onSave,
  onSwitchToEdit,
  isSaving,
  editSupCode,
  setEditSupCode,
  editSupName,
  setEditSupName,
  editSupContactPerson,
  setEditSupContactPerson,
  editSupPhone,
  setEditSupPhone,
  editSupEmail,
  setEditSupEmail,
  editSupTaxId,
  setEditSupTaxId,
  editSupAddress,
  setEditSupAddress,
  editSupIsActive,
  setEditSupIsActive,
}) => {
  if (!supplier) return null;
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
            <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-xs shrink-0">
              {isViewOnly ? <Eye className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                  {isViewOnly
                    ? (isEn ? 'Supplier Details' : 'รายละเอียดผู้จัดจำหน่าย')
                    : (isEn ? 'Edit Supplier Profile' : 'แก้ไขข้อมูลผู้จัดจำหน่าย')}
                </h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs ${
                  isViewOnly
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    : 'bg-orange-50 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800'
                }`}>
                  {isViewOnly ? (isEn ? 'View Only' : 'ดูข้อมูล') : (isEn ? 'Edit' : 'แก้ไขข้อมูล')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 truncate">
                {isViewOnly
                  ? (isEn ? 'Inspect vendor credentials, contacts, and tax info' : 'ดูข้อมูลคู่ค้า ผู้ติดต่อ และเลขประจำตัวผู้เสียภาษี')
                  : (isEn ? 'Update vendor profile, payment terms, and contact info' : 'แก้ไขข้อมูลคู่ค้า เงื่อนไขการค้า และข้อมูลการติดต่อ')}
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

        <form
          onSubmit={onSave}
          className="p-5 space-y-3.5 text-sm max-h-[80vh] overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                {t.code} <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isViewOnly}
                value={editSupCode}
                onChange={(e) => setEditSupCode(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden ${disabledCls}`}
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                {t.supplierName} <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isViewOnly}
                value={editSupName}
                onChange={(e) => setEditSupName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-semibold outline-hidden ${disabledCls}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                {isEn ? 'Contact Person' : 'ผู้ติดต่อ (Contact Person)'} <span className="text-slate-400 font-normal text-xs">({isEn ? 'Optional' : 'ไม่บังคับ'})</span>
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={editSupContactPerson}
                onChange={(e) => setEditSupContactPerson(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${disabledCls}`}
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                {isEn ? 'Phone' : 'เบอร์โทรศัพท์ (Phone)'} <span className="text-slate-400 font-normal text-xs">({isEn ? 'Optional' : 'ไม่บังคับ'})</span>
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={editSupPhone}
                onChange={(e) => setEditSupPhone(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${disabledCls}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                {isEn ? 'Email' : 'อีเมล (Email)'} <span className="text-slate-400 font-normal text-xs">({isEn ? 'Optional' : 'ไม่บังคับ'})</span>
              </label>
              <input
                type="email"
                disabled={isViewOnly}
                value={editSupEmail}
                onChange={(e) => setEditSupEmail(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${disabledCls}`}
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                {isEn ? 'Tax ID' : 'เลขผู้เสียภาษี (Tax ID)'} <span className="text-slate-400 font-normal text-xs">({isEn ? 'Optional' : 'ไม่บังคับ'})</span>
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={editSupTaxId}
                onChange={(e) => setEditSupTaxId(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden ${disabledCls}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
              {isEn ? 'Address' : 'ที่อยู่ (Address)'} <span className="text-slate-400 font-normal text-xs">({isEn ? 'Optional' : 'ไม่บังคับ'})</span>
            </label>
            <textarea
              rows={2}
              disabled={isViewOnly}
              value={editSupAddress}
              onChange={(e) => setEditSupAddress(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${disabledCls}`}
            />
          </div>

          {/* Active Status Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div>
              <span className="block font-semibold text-[13px] text-slate-800 dark:text-slate-200">
                {isEn ? 'Active Status' : 'สถานะการใช้งาน (Active Status)'}
              </span>
              <span className="text-xs text-slate-500">
                {editSupIsActive
                  ? (isEn ? 'Active - Visible in supplier directory' : 'เปิดใช้งาน (Active) - แสดงในตัวเลือกผู้จัดจำหน่าย')
                  : (isEn ? 'Inactive - Hidden from directory' : 'ปิดใช้งาน (Inactive) - ซ่อนจากรายการเลือก')}
              </span>
            </div>
            <button
              type="button"
              disabled={isViewOnly}
              onClick={() => setEditSupIsActive(!editSupIsActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                editSupIsActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              } ${isViewOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  editSupIsActive ? 'translate-x-5' : 'translate-x-0'
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
                    <span>{isEn ? 'Edit Details' : 'แก้ไขข้อมูล'}</span>
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
