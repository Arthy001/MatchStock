import React from 'react';
import { createPortal } from 'react-dom';
import { Building, X, CheckCircle2 } from 'lucide-react';
import { ThemeMode, WarehouseBin } from '../../../types';

interface EditWarehouseBinModalProps {
  theme: ThemeMode;
  t: any;
  bin: WarehouseBin | null;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  isSaving: boolean;
  editWhName: string;
  setEditWhName: (val: string) => void;
  editBinCode: string;
  setEditBinCode: (val: string) => void;
  editBinZone: string;
  setEditBinZone: (val: string) => void;
  editBinRack: string;
  setEditBinRack: (val: string) => void;
  editBinCapacity: string;
  setEditBinCapacity: (val: string) => void;
}

export const EditWarehouseBinModal: React.FC<EditWarehouseBinModalProps> = ({
  theme,
  t,
  bin,
  onClose,
  onSave,
  isSaving,
  editWhName,
  setEditWhName,
  editBinCode,
  setEditBinCode,
  editBinZone,
  setEditBinZone,
  editBinRack,
  setEditBinRack,
  editBinCapacity,
  setEditBinCapacity,
}) => {
  if (!bin) return null;

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
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base">
              แก้ไขข้อมูลคลัง & ตำแหน่ง Bin (Edit Warehouse / Bin)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="p-5 space-y-3.5 text-sm">
          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
              ชื่อคลังสินค้า (Warehouse Name) *
            </label>
            <input
              type="text"
              required
              value={editWhName}
              onChange={(e) => setEditWhName(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-semibold outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                รหัสตำแหน่ง (Bin Code) *
              </label>
              <input
                type="text"
                required
                value={editBinCode}
                onChange={(e) => setEditBinCode(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                โซน (Zone)
              </label>
              <input
                type="text"
                value={editBinZone}
                onChange={(e) => setEditBinZone(e.target.value)}
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
                แร็คจัดเก็บ (Rack)
              </label>
              <input
                type="text"
                value={editBinRack}
                onChange={(e) => setEditBinRack(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                ความจุสูงสุด (Capacity kg)
              </label>
              <input
                type="number"
                value={editBinCapacity}
                onChange={(e) => setEditBinCapacity(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>
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
