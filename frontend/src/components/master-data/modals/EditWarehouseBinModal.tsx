import React from 'react';
import { createPortal } from 'react-dom';
import { Building, X, CheckCircle2, Edit2, Eye } from 'lucide-react';
import { ThemeMode, WarehouseBin } from '../../../types';

interface EditWarehouseBinModalProps {
  theme: ThemeMode;
  t: any;
  bin: WarehouseBin | null;
  isViewOnly?: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onSwitchToEdit?: () => void;
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
  editBinIsActive: boolean;
  setEditBinIsActive: (val: boolean) => void;
}

export const EditWarehouseBinModal: React.FC<EditWarehouseBinModalProps> = ({
  theme,
  t,
  bin,
  isViewOnly = false,
  onClose,
  onSave,
  onSwitchToEdit,
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
  editBinIsActive,
  setEditBinIsActive,
}) => {
  if (!bin) return null;

  const disabledCls = isViewOnly
    ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed'
    : theme === 'dark'
    ? 'bg-slate-800 border-slate-700 text-white'
    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400';

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <div
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {isViewOnly ? <Eye className="w-5 h-5" /> : <Building className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isViewOnly
                  ? 'รายละเอียดคลัง & ตำแหน่ง Bin (Bin Details)'
                  : 'แก้ไขข้อมูลคลัง & ตำแหน่ง Bin (Edit Warehouse / Bin)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isViewOnly ? 'ดูข้อมูลโซน แร็คจัดเก็บ และความจุน้ำหนักสูงสุด' : 'แก้ไขข้อมูลคลังสินค้าและตำแหน่ง Bin'}
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

        <form onSubmit={onSave} className="p-5 space-y-3.5 text-sm">
          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
              ชื่อคลังสินค้า (Warehouse Name) <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isViewOnly}
              value={editWhName}
              onChange={(e) => setEditWhName(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-semibold outline-hidden ${disabledCls}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                รหัสตำแหน่ง (Bin Code) <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isViewOnly}
                value={editBinCode}
                onChange={(e) => setEditBinCode(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden ${disabledCls}`}
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                โซน (Zone) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={editBinZone}
                onChange={(e) => setEditBinZone(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${disabledCls}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                แร็คจัดเก็บ (Rack) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={editBinRack}
                onChange={(e) => setEditBinRack(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${disabledCls}`}
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                ความจุสูงสุด (Capacity kg) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
              </label>
              <input
                type="number"
                disabled={isViewOnly}
                value={editBinCapacity}
                onChange={(e) => setEditBinCapacity(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${disabledCls}`}
              />
            </div>
          </div>

          {/* Active Status Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <div>
              <span className="block font-semibold text-[13px] text-slate-800 dark:text-slate-200">
                สถานะการใช้งาน (Active Status)
              </span>
              <span className="text-xs text-slate-500">
                {editBinIsActive ? 'เปิดใช้งาน (Active) - พร้อมใช้งานและเก็บสินค้า' : 'ปิดใช้งาน (Inactive / ซ่อมบำรุง) - งดการจัดเก็บชั่วคราว'}
              </span>
            </div>
            <button
              type="button"
              disabled={isViewOnly}
              onClick={() => setEditBinIsActive(!editBinIsActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                editBinIsActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              } ${isViewOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  editBinIsActive ? 'translate-x-5' : 'translate-x-0'
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
