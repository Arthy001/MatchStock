import React from 'react';
import { createPortal } from 'react-dom';
import { Building2, X, CheckCircle2, Edit2, Eye } from 'lucide-react';
import { ThemeMode, Supplier } from '../../../types';

interface EditSupplierModalProps {
  theme: ThemeMode;
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
}

export const EditSupplierModal: React.FC<EditSupplierModalProps> = ({
  theme,
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
}) => {
  if (!supplier) return null;

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
        <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {isViewOnly ? <Eye className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isViewOnly
                  ? 'รายละเอียดผู้จัดจำหน่าย (Supplier Details)'
                  : 'แก้ไขข้อมูลผู้จัดจำหน่าย (Edit Supplier)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isViewOnly ? 'ดูข้อมูลคู่ค้า ผู้ติดต่อ และเลขประจำตัวผู้เสียภาษี' : 'แก้ไขข้อมูลและเงื่อนไขผู้จัดจำหน่าย'}
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
                ผู้ติดต่อ (Contact Person) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
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
                เบอร์โทรศัพท์ (Phone) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
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
                อีเมล (Email) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
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
                เลขผู้เสียภาษี (Tax ID) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
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
              ที่อยู่ (Address) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
            </label>
            <textarea
              rows={2}
              disabled={isViewOnly}
              value={editSupAddress}
              onChange={(e) => setEditSupAddress(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${disabledCls}`}
            />
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
