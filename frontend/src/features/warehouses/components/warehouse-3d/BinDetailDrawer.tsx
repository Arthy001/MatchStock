import React, { useState } from 'react';
import {
  X,
  Package,
  Layers,
  ArrowRightLeft,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Building,
  Scale,
  Hash,
  MoveRight,
} from 'lucide-react';
import { WarehouseBin, ThemeMode, Language } from '../../../../types';

interface BinDetailDrawerProps {
  bin: WarehouseBin | null;
  onClose: () => void;
  theme: ThemeMode;
  lang?: Language;
  onOpenEditBin: (bin: WarehouseBin, isViewOnly?: boolean) => void;
  onDeleteBin: (bin: WarehouseBin) => void;
  allBins: WarehouseBin[];
  onRelocateStock?: (sourceBinId: string, targetBinId: string, qty: number) => Promise<void>;
}

export const BinDetailDrawer: React.FC<BinDetailDrawerProps> = ({
  bin,
  onClose,
  theme,
  lang = 'th',
  onOpenEditBin,
  onDeleteBin,
  allBins,
  onRelocateStock,
}) => {
  const [isRelocating, setIsRelocating] = useState(false);
  const [targetBinId, setTargetBinId] = useState('');
  const [relocateQty, setRelocateQty] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!bin) return null;

  const isDark = theme === 'dark';
  const isEn = lang === 'en';

  const capacity = Number(bin.capacityKg || 500);
  const currentItems = Number(bin.currentItemsCount || 0);
  const utilPercent = Math.min(100, Math.round((currentItems / (capacity / 2 || 1)) * 100));
  const isInactive = bin.isActive === false || bin.status === 'maintenance';
  const isFull = !isInactive && (bin.status === 'full' || utilPercent >= 90);

  const handleStartRelocate = async () => {
    if (!targetBinId || !onRelocateStock) return;
    setIsSubmitting(true);
    try {
      await onRelocateStock(bin.id, targetBinId, relocateQty);
      setSuccessMessage(isEn ? 'Stock successfully relocated!' : 'โยกย้ายสต็อกสินค้าเรียบร้อยแล้ว!');
      setTimeout(() => {
        setSuccessMessage(null);
        setIsRelocating(false);
      }, 2000);
    } catch (err: any) {
      console.error('Relocation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTargetBins = allBins.filter((b) => b.id !== bin.id && b.isActive !== false && b.status !== 'full');

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 font-mono tracking-tight">
                {bin.binCode || (bin as any).code || 'BIN-01'}
              </h2>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                  isInactive
                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                    : isFull
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {isInactive ? 'INACTIVE' : isFull ? 'FULL' : 'AVAILABLE'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>{bin.warehouseName || 'Warehouse Hub'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Location Coordinates Card */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>พิกัดชั้นวางในโกดัง (Location Blueprint)</span>
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center font-medium">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">โซน (Zone)</span>
              <span className="text-sm font-bold text-slate-200">{bin.zone || 'Zone A'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">แถว (Rack)</span>
              <span className="text-sm font-bold text-slate-200">{bin.rack || '01'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">ชั้น (Shelf)</span>
              <span className="text-sm font-bold text-slate-200">{bin.shelf || 'Level 1'}</span>
            </div>
          </div>
        </div>

        {/* Capacity & Current Stored Items */}
        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>ความจุการจัดเก็บ (Capacity Utilization)</span>
            </span>
            <span className="font-bold text-slate-100">{utilPercent}%</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-700/70 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFull ? 'bg-rose-500' : utilPercent >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${utilPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <span>สินค้าปัจจุบัน: <b className="text-slate-200">{currentItems} ชิ้น</b></span>
            <span>ความจุสูงสุด: <b className="text-slate-200">{capacity} kg</b></span>
          </div>
        </div>

        {/* Quick Relocation / Bin Swap Section */}
        <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-800/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowRightLeft className="w-4 h-4 text-blue-400" />
              <span>โยกย้ายสต็อก / สลับ Bin (Relocate & Swap)</span>
            </h3>
            <button
              onClick={() => setIsRelocating(!isRelocating)}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
            >
              {isRelocating ? 'ยกเลิก' : 'เริ่มโยกย้าย'}
            </button>
          </div>

          {isRelocating && (
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  เลือกตำแหน่ง Bin ปลายทาง:
                </label>
                <select
                  value={targetBinId}
                  onChange={(e) => setTargetBinId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- เลือก Bin ว่างปลายทาง --</option>
                  {availableTargetBins.map((tBin) => (
                    <option key={tBin.id} value={tBin.id}>
                      {tBin.binCode || (tBin as any).code} ({tBin.zone} - {tBin.rack})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  จำนวนที่ต้องการย้าย (Units):
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, currentItems)}
                  value={relocateQty}
                  onChange={(e) => setRelocateQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                disabled={!targetBinId || isSubmitting}
                onClick={handleStartRelocate}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MoveRight className="w-4 h-4" />
                <span>{isSubmitting ? 'กำลังย้าย...' : 'ยืนยันการโยกย้ายสต็อก'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-slate-800 flex items-center gap-3">
        <button
          onClick={() => {
            onOpenEditBin(bin, false);
            onClose();
          }}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>แก้ไขข้อมูล (Edit)</span>
        </button>

        <button
          onClick={() => {
            onDeleteBin(bin);
            onClose();
          }}
          className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition flex items-center justify-center gap-2 border border-rose-500/30 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>ลบ (Delete)</span>
        </button>
      </div>
    </div>
  );
};
