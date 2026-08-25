import React from 'react';
import { createPortal } from 'react-dom';
import { Building2, X, CheckCircle2 } from 'lucide-react';
import { ThemeMode, Supplier } from '../../../types';

interface EditSupplierModalProps {
  theme: ThemeMode;
  t: any;
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
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
  onClose,
  onSave,
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
              แก้ไขข้อมูลผู้จัดจำหน่าย (Edit Supplier)
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
          className="p-5 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                {t.code} *
              </label>
              <input
                type="text"
                required
                value={editSupCode}
                onChange={(e) => setEditSupCode(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                {t.supplierName} *
              </label>
              <input
                type="text"
                required
                value={editSupName}
                onChange={(e) => setEditSupName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-semibold outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                ผู้ติดต่อ (Contact Person)
              </label>
              <input
                type="text"
                value={editSupContactPerson}
                onChange={(e) => setEditSupContactPerson(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                เบอร์โทรศัพท์ (Phone)
              </label>
              <input
                type="text"
                value={editSupPhone}
                onChange={(e) => setEditSupPhone(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                อีเมล (Email)
              </label>
              <input
                type="email"
                value={editSupEmail}
                onChange={(e) => setEditSupEmail(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                เลขผู้เสียภาษี (Tax ID)
              </label>
              <input
                type="text"
                value={editSupTaxId}
                onChange={(e) => setEditSupTaxId(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              ที่อยู่ (Address)
            </label>
            <textarea
              rows={2}
              value={editSupAddress}
              onChange={(e) => setEditSupAddress(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
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
