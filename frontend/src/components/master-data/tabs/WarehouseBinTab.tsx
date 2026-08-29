import React from 'react';
import {
  Building,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Package,
  Eye,
} from 'lucide-react';
import { ThemeMode, WarehouseBin } from '../../../types';

interface WarehouseBinTabProps {
  theme: ThemeMode;
  t: any;
  binsList: WarehouseBin[];
  onOpenEditBin: (bin: WarehouseBin, isViewOnly?: boolean) => void;
  onDeleteBin: (bin: WarehouseBin) => void;
}

export const WarehouseBinTab: React.FC<WarehouseBinTabProps> = ({
  theme,
  t,
  binsList = [],
  onOpenEditBin,
  onDeleteBin,
}) => {
  const safeBins = Array.isArray(binsList) ? binsList : [];

  return (
    <div
      className={`p-6 rounded-2xl border transition-colors ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div className="mb-6">
        <h3
          className={`font-semibold text-base ${
            theme === 'dark' ? 'text-slate-50' : 'text-slate-900'
          }`}
        >
          {t.warehouseTitle}
        </h3>
        <p
          className={`text-xs font-normal mt-1 ${
            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {t.warehouseSubtitle}
        </p>
      </div>

      {safeBins.length === 0 ? (
        <div className="py-12 text-center text-zinc-400">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="font-medium text-xs">ยังไม่มีข้อมูลคลังสินค้าหรือตำแหน่ง Bin ในระบบ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {safeBins.map((bin) => {
            const isInactive = bin.isActive === false || bin.status === 'maintenance';
            const isFull = !isInactive && String(bin.status || '').toLowerCase() === 'full';
            const capacity = Number(bin.capacityKg || 500);
            const currentItems = Number(bin.currentItemsCount || 0);

            return (
              <div
                key={bin.id}
                className={`p-5 rounded-2xl border space-y-4 shadow-sm ${
                  theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600 shrink-0" />
                    <h4
                      className={`font-semibold text-xs truncate ${
                        theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                      } ${isInactive ? 'line-through opacity-60' : ''}`}
                    >
                      {bin.warehouseName || 'Warehouse'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                        isInactive
                          ? theme === 'dark'
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                          : isFull
                          ? theme === 'dark'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                          : theme === 'dark'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {isInactive ? (
                        <AlertTriangle className="w-3 h-3 text-slate-400" />
                      ) : isFull ? (
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      )}
                      <span>{isInactive ? 'INACTIVE' : isFull ? 'FULL' : 'ACTIVE'}</span>
                    </span>
                    <button
                      onClick={() => onOpenEditBin(bin, true)}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="ดูรายละเอียดคลัง / Bin (View Detail)"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenEditBin(bin, false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="แก้ไขข้อมูลคลัง / Bin (Edit Warehouse/Bin)"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteBin(bin)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      title="ลบตำแหน่ง Bin"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border font-mono font-medium text-sm text-center ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-slate-100'
                      : 'bg-slate-100 border-slate-200 text-slate-900'
                  }`}
                >
                  Bin Code: {bin.binCode || (bin as any).code || '-'}
                </div>

                <div
                  className={`space-y-2 text-xs font-medium ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{t.zone} / {t.rack}:</span>
                    <span
                      className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}
                    >
                      {bin.zone || '-'} - {bin.rack || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.capacity}:</span>
                    <span
                      className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}
                    >
                      {capacity} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Items Stored:</span>
                    <span className="font-semibold text-blue-600">
                      {currentItems} units
                    </span>
                  </div>
                </div>

                <div
                  className={`w-full h-2 rounded-full overflow-hidden ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'
                  }`}
                >
                  <div
                    className={`h-full rounded-full ${
                      isFull ? 'bg-rose-500' : 'bg-blue-600'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        capacity > 0 ? (currentItems / (capacity / 2)) * 100 : 0
                      )}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
