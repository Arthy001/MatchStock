import React from 'react';
import { createPortal } from 'react-dom';
import { Boxes, X, CheckCircle2, Edit2, Eye, Layers, Grid, ListOrdered, ShieldCheck, MapPin } from 'lucide-react';
import { ThemeMode, Language, WarehouseBin } from '../../../types';

interface EditBinLocationModalProps {
  theme: ThemeMode;
  lang?: Language;
  t?: any;
  bin: WarehouseBin | null;
  isViewOnly?: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  onSwitchToEdit?: () => void;
  isSaving: boolean;
  editWhName: string;
  setEditWhName?: (val: string) => void;
  editBinCode: string;
  setEditBinCode: (val: string) => void;
  editBinZone: string;
  setEditBinZone: (val: string) => void;
  editBinRack: string;
  setEditBinRack: (val: string) => void;
  editBinShelf: string;
  setEditBinShelf: (val: string) => void;
  editBinCapacity: string;
  setEditBinCapacity: (val: string) => void;
  editBinIsActive: boolean;
  setEditBinIsActive: (val: boolean) => void;
}

export const EditBinLocationModal: React.FC<EditBinLocationModalProps> = ({
  theme,
  lang = 'th',
  bin,
  isViewOnly = false,
  onClose,
  onSave,
  onSwitchToEdit,
  isSaving,
  editWhName,
  editBinCode,
  setEditBinCode,
  editBinZone,
  setEditBinZone,
  editBinRack,
  setEditBinRack,
  editBinShelf,
  setEditBinShelf,
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
        {/* Modal Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs shrink-0">
              {isViewOnly ? <Eye className="w-5 h-5" /> : <Boxes className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 tracking-tight">
                  {isViewOnly
                    ? (isEn ? 'Bin Location Details' : 'รายละเอียดตำแหน่ง Bin')
                    : (isEn ? 'Edit Bin Location' : 'แก้ไขข้อมูลตำแหน่ง Bin')}
                </h3>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs ${
                  isViewOnly
                    ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                }`}>
                  {isViewOnly ? (isEn ? 'View Only' : 'ดูข้อมูล') : (isEn ? 'Edit' : 'แก้ไขข้อมูล')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 truncate">
                {isViewOnly
                  ? (isEn ? 'Inspect zone, rack, shelf, and max capacity' : 'ดูข้อมูลโซน แร็ค ชั้นวาง และความจุสูงสุด')
                  : (isEn ? 'Update bin code, zone, rack, shelf, and max capacity (items)' : 'แก้ไขรหัสตำแหน่ง โซน แร็ค ชั้นวาง และความจุสูงสุด (ชิ้น)')}
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

        {/* Modal Body */}
        <form onSubmit={onSave} className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-130px)] overflow-y-auto">
          {/* Warehouse Context Banner */}
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> {isEn ? 'Parent Warehouse:' : 'คลังสินค้าหลัก:'}
            </span>
            <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
              {editWhName || bin.warehouseName || '-'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bin Code */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Bin Code / Location Code *' : 'รหัสตำแหน่งจัดเก็บ (Bin Code) *'}</span>
              </label>
              <input
                type="text"
                required
                disabled={isViewOnly}
                value={editBinCode}
                onChange={(e) => setEditBinCode(e.target.value)}
                placeholder={isEn ? 'e.g. WH-A-01-01' : 'เช่น WH-A-01-01'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition ${disabledCls}`}
              />
            </div>

            {/* Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Zone' : 'โซน (Zone)'}</span>
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={editBinZone}
                onChange={(e) => setEditBinZone(e.target.value)}
                placeholder={isEn ? 'e.g. A or North' : 'เช่น A หรือ Zone-1'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition ${disabledCls}`}
              />
            </div>

            {/* Rack */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Rack' : 'แร็ค / แถว (Rack)'}</span>
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={editBinRack}
                onChange={(e) => setEditBinRack(e.target.value)}
                placeholder={isEn ? 'e.g. 01' : 'เช่น 01'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition ${disabledCls}`}
              />
            </div>

            {/* Shelf */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Shelf / Level' : 'ชั้นวาง (Shelf / Level)'}</span>
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={editBinShelf}
                onChange={(e) => setEditBinShelf(e.target.value)}
                placeholder={isEn ? 'e.g. 01' : 'เช่น 01'}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition ${disabledCls}`}
              />
            </div>

            {/* Max Capacity (Count) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Max Capacity (Items) *' : 'ความจุสูงสุด (ชิ้น / maxCapacity) *'}</span>
              </label>
              <input
                type="number"
                min="0"
                required
                disabled={isViewOnly}
                value={editBinCapacity}
                onChange={(e) => setEditBinCapacity(e.target.value)}
                placeholder="0"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition ${disabledCls}`}
              />
            </div>

            {/* Active Status */}
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={isViewOnly}
                  checked={editBinIsActive}
                  onChange={(e) => setEditBinIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {isEn ? 'Active & Ready for Stock Putaway' : 'เปิดใช้งานตำแหน่งจัดเก็บนี้ (พร้อมรับฝากสินค้า)'}
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
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs shadow-blue-600/30"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Edit Bin' : 'แก้ไขตำแหน่ง Bin'}</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs shadow-blue-600/30"
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
