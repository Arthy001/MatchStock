import React from 'react';
import { createPortal } from 'react-dom';
import { Warehouse as WarehouseIcon, X, CheckCircle2, Edit2, Eye, Building2, MapPin, Hash, ShieldCheck } from 'lucide-react';
import { ThemeMode, Language } from '../../../types';

export interface WarehouseItem {
  id: string;
  name: string;
  code?: string;
  address?: string | null;
  isActive?: boolean;
  maxCapacity?: number | null;
  companyId?: string | null;
}

interface EditWarehouseModalProps {
  theme: ThemeMode;
  lang?: Language;
  t?: any;
  warehouse: WarehouseItem | null;
  isViewOnly?: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onSwitchToEdit?: () => void;
  isSaving: boolean;
  editWhName: string;
  setEditWhName: (val: string) => void;
  editWhCode: string;
  setEditWhCode: (val: string) => void;
  editWhAddress: string;
  setEditWhAddress: (val: string) => void;
  editWhIsActive: boolean;
  setEditWhIsActive: (val: boolean) => void;
  editWhMaxCapacity: string;
  setEditWhMaxCapacity: (val: string) => void;
}

export const EditWarehouseModal: React.FC<EditWarehouseModalProps> = ({
  theme,
  lang = 'th',
  warehouse,
  isViewOnly = false,
  onClose,
  onSave,
  onSwitchToEdit,
  isSaving,
  editWhName,
  setEditWhName,
  editWhCode,
  setEditWhCode,
  editWhAddress,
  setEditWhAddress,
  editWhIsActive,
  setEditWhIsActive,
  editWhMaxCapacity,
  setEditWhMaxCapacity,
}) => {
  if (!warehouse) return null;
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
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs shrink-0">
              {isViewOnly ? <Eye className="w-5 h-5" /> : <WarehouseIcon className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                  {isViewOnly
                    ? (isEn ? 'Warehouse Details' : 'รายละเอียดคลังสินค้า')
                    : (isEn ? 'Edit Warehouse' : 'แก้ไขข้อมูลคลังสินค้า')}
                </h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs ${
                  isViewOnly
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                }`}>
                  {isViewOnly ? (isEn ? 'View Only' : 'ดูข้อมูล') : (isEn ? 'Edit' : 'แก้ไขข้อมูล')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 truncate">
                {isViewOnly
                  ? (isEn ? 'Inspect warehouse properties, address, and status' : 'ตรวจสอบข้อมูลทั่วไป ที่อยู่ และสถานะการเปิดใช้งาน')
                  : (isEn ? 'Update warehouse name, code, address, and status' : 'แก้ไขชื่อคลังสินค้า รหัส ที่อยู่ และสถานะการเปิดใช้งาน')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={onSave} className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-130px)] overflow-y-auto">
          {/* UUID Badge */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" /> Warehouse UUID
            </span>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-300 font-bold select-all">
              {warehouse.id}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Warehouse Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Warehouse Name *' : 'ชื่อคลังสินค้า *'}</span>
              </label>
              <input
                type="text"
                required
                disabled={isViewOnly}
                value={editWhName}
                onChange={(e) => setEditWhName(e.target.value)}
                placeholder={isEn ? 'e.g. Main Warehouse' : 'เช่น คลังสินค้าหลัก (อาคาร A)'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition ${disabledCls}`}
              />
            </div>

            {/* Warehouse Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Warehouse Code' : 'รหัสคลังสินค้า'}</span>
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={editWhCode}
                onChange={(e) => setEditWhCode(e.target.value)}
                placeholder={isEn ? 'e.g. WH-01' : 'เช่น WH-01'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition ${disabledCls}`}
              />
            </div>

            {/* Max Capacity (Count) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Max Capacity (Items)' : 'ความจุสินค้าสูงสุด (ชิ้น)'}</span>
              </label>
              <input
                type="number"
                min="0"
                disabled={isViewOnly}
                value={editWhMaxCapacity}
                onChange={(e) => setEditWhMaxCapacity(e.target.value)}
                placeholder="0"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition ${disabledCls}`}
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Warehouse Location / Address' : 'ที่ตั้ง / ที่อยู่คลังสินค้า'}</span>
              </label>
              <textarea
                rows={2}
                disabled={isViewOnly}
                value={editWhAddress}
                onChange={(e) => setEditWhAddress(e.target.value)}
                placeholder={isEn ? 'e.g. 123 Industrial Estate, Floor 1' : 'เช่น เลขที่ 123 นิคมอุตสาหกรรม ชั้น 1'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition resize-none ${disabledCls}`}
              />
            </div>

            {/* Active Status */}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={isViewOnly}
                  checked={editWhIsActive}
                  onChange={(e) => setEditWhIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? 'Active & Available for Operations' : 'เปิดใช้งานคลังสินค้านี้ (พร้อมรับและจัดเก็บสินค้า)'}
                </span>
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isEn ? 'Close' : 'ปิดหน้าต่าง'}
            </button>
            {isViewOnly ? (
              <button
                type="button"
                onClick={onSwitchToEdit}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs shadow-indigo-600/30"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Edit Warehouse' : 'แก้ไขข้อมูลคลังสินค้า'}</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs shadow-indigo-600/30"
              >
                {isSaving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{isSaving ? (isEn ? 'Saving...' : 'กำลังบันทึก...') : (isEn ? 'Save Changes' : 'บันทึกการแก้ไข')}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
