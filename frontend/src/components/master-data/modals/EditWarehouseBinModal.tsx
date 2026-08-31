import React from 'react';
import { createPortal } from 'react-dom';
import { Warehouse, X, CheckCircle2, Edit2, Eye } from 'lucide-react';
import { ThemeMode, Language, WarehouseBin } from '../../../types';

interface EditWarehouseBinModalProps {
  theme: ThemeMode;
  lang?: Language;
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
  lang = 'th',
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
        className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Enterprise Pro Modal Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs shrink-0">
              {isViewOnly ? <Eye className="w-5 h-5" /> : <Warehouse className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                  {isViewOnly
                    ? (isEn ? 'Warehouse & Bin Details' : 'รายละเอียดคลัง & ตำแหน่ง Bin')
                    : (isEn ? 'Edit Warehouse & Bin Location' : 'แก้ไขข้อมูลคลัง & ตำแหน่ง Bin')}
                </h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs ${
                  isViewOnly
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    : 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                }`}>
                  {isViewOnly ? (isEn ? 'View Only' : 'ดูข้อมูล') : (isEn ? 'Edit' : 'แก้ไขข้อมูล')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 truncate">
                {isViewOnly
                  ? (isEn ? 'Inspect zone, rack positioning, and storage weight limits' : 'ดูข้อมูลโซน แร็คจัดเก็บ และความจุน้ำหนักสูงสุด')
                  : (isEn ? 'Update warehouse name, zone, rack, and capacity limit' : 'แก้ไขข้อมูลคลังสินค้า โซนจัดเก็บ และความจุ')}
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

        <form onSubmit={onSave} className="p-5 space-y-3.5 text-sm">
          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
              {isEn ? 'Warehouse Name' : 'ชื่อคลังสินค้า (Warehouse Name)'} <span className="text-rose-500 font-bold">*</span>
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
                {isEn ? 'Bin Code' : 'รหัสตำแหน่ง (Bin Code)'} <span className="text-rose-500 font-bold">*</span>
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
                {isEn ? 'Zone' : 'โซน (Zone)'} <span className="text-slate-400 font-normal text-xs">({isEn ? 'Optional' : 'ไม่บังคับ'})</span>
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
                {isEn ? 'Rack' : 'แร็คจัดเก็บ (Rack)'} <span className="text-slate-400 font-normal text-xs">({isEn ? 'Optional' : 'ไม่บังคับ'})</span>
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
                {isEn ? 'Max Capacity (kg)' : 'ความจุสูงสุด (Capacity kg)'} <span className="text-slate-400 font-normal text-xs">({isEn ? 'Optional' : 'ไม่บังคับ'})</span>
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
                {isEn ? 'Active Status' : 'สถานะการใช้งาน (Active Status)'}
              </span>
              <span className="text-xs text-slate-500">
                {editBinIsActive
                  ? (isEn ? 'Active - Available for storing inventory' : 'เปิดใช้งาน (Active) - พร้อมใช้งานและเก็บสินค้า')
                  : (isEn ? 'Inactive / Maintenance - Temporarily unavailable' : 'ปิดใช้งาน (Inactive / ซ่อมบำรุง) - งดการจัดเก็บชั่วคราว')}
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
