import React, { useState } from 'react';
import {
  Building,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Package,
  Eye,
  Box,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import { ThemeMode, Language, WarehouseBin } from '../../../types';
import { ViewMode3D } from '../../../types/warehouse-3d';
import { Warehouse3DCanvas } from '../warehouse-3d/Warehouse3DCanvas';

interface WarehouseBinTabProps {
  theme: ThemeMode;
  lang?: Language;
  t: any;
  binsList: WarehouseBin[];
  onOpenEditBin: (bin: WarehouseBin, isViewOnly?: boolean) => void;
  onDeleteBin: (bin: WarehouseBin) => void;
  onRelocateStock?: (sourceBinId: string, targetBinId: string, qty: number) => Promise<void>;
}

export const WarehouseBinTab: React.FC<WarehouseBinTabProps> = ({
  theme,
  lang = 'th',
  t,
  binsList = [],
  onOpenEditBin,
  onDeleteBin,
  onRelocateStock,
}) => {
  const isEn = lang === 'en';
  const safeBins = Array.isArray(binsList) ? binsList : [];
  const [viewMode, setViewMode] = useState<ViewMode3D>('3d');

  return (
    <div
      className={`p-6 rounded-2xl border transition-colors ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      {/* Header Toolbar & View Mode Switcher */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3
              className={`font-semibold text-base ${
                theme === 'dark' ? 'text-slate-50' : 'text-slate-900'
              }`}
            >
              {t.warehouseTitle}
            </h3>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              DIGITAL TWIN
            </span>
          </div>
          <p
            className={`text-xs font-normal mt-1 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {isEn
              ? 'Interactive 3D & 2D warehouse layout, bin capacities, and visual stock relocation'
              : 'ผังจำลองคลังสินค้า 3D & 2D เสมือนจริง ตรวจสอบความจุชั้นวาง และโยกย้ายสต็อกสินค้าได้อิสระ'}
          </p>
        </div>

        {/* View Switcher: [ 3D Digital Twin | 2D Blueprint | Cards ] */}
        <div
          className={`p-1 rounded-2xl border shadow-xs flex items-center gap-1 self-start md:self-auto ${
            theme === 'dark'
              ? 'bg-slate-800/80 border-slate-700'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === '3d'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
            title="มุมมอง 3D Perspective หมุนได้ 360°"
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D View</span>
          </button>

          <button
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === '2d'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
            title="มุมมอง 2D Blueprint ผังระนาบบน"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D Blueprint</span>
          </button>

          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
            title="มุมมองตารางการ์ดข้อมูลเดิม"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {/* VIEW 1 & 2: 3D Perspective & 2D Blueprint */}
      {(viewMode === '3d' || viewMode === '2d') && (
        <Warehouse3DCanvas
          theme={theme}
          binsList={safeBins}
          onOpenEditBin={onOpenEditBin}
          onDeleteBin={onDeleteBin}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onRelocateStock={onRelocateStock}
        />
      )}

      {/* VIEW 3: Grouped Warehouse & Bins Cards */}
      {viewMode === 'cards' && (
        <>
          {safeBins.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-medium text-xs">
                {isEn
                  ? 'No warehouses or bin locations found in system'
                  : 'ยังไม่มีข้อมูลคลังสินค้าหรือตำแหน่ง Bin ในระบบ'}
              </p>
            </div>
          ) : (
            (() => {
              // Group bins by warehouse
              const warehouseMap: {
                [whId: string]: {
                  id: string;
                  name: string;
                  bins: WarehouseBin[];
                };
              } = {};

              safeBins.forEach((b) => {
                const whId = b.warehouseId || b.id;
                const whName = b.warehouseName || 'Warehouse';
                if (!warehouseMap[whId]) {
                  warehouseMap[whId] = {
                    id: whId,
                    name: whName,
                    bins: [],
                  };
                }
                warehouseMap[whId].bins.push(b);
              });

              const warehouseGroups = Object.values(warehouseMap);

              return (
                <div className="space-y-8">
                  {warehouseGroups.map((group) => (
                    <div
                      key={group.id}
                      className={`p-6 rounded-2xl border ${
                        theme === 'dark' ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      {/* Warehouse Header Banner */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center border border-blue-600/20">
                            <Building className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4
                                className={`font-bold text-base ${
                                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {group.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                {group.bins.length} {isEn ? 'Bins' : 'ตำแหน่ง Bin'}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-slate-400">UUID: {group.id}</p>
                          </div>
                        </div>
                      </div>

                      {/* Bin Location Cards Grid inside this Warehouse */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {group.bins.map((bin) => {
                          const isInactive = bin.isActive === false || bin.status === 'maintenance';
                          const isFull = !isInactive && String(bin.status || '').toLowerCase() === 'full';
                          const capacity = Number(bin.capacityKg || 500);
                          const currentItems = Number(bin.currentItemsCount || 0);
                          const isWarehouseOnly = bin.id === bin.warehouseId;

                          return (
                            <div
                              key={bin.id}
                              className={`p-4 rounded-xl border space-y-3 transition hover:shadow-md ${
                                theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                    isInactive
                                      ? 'bg-slate-100 text-slate-500 border border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                                      : isFull
                                      ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                  }`}
                                >
                                  {isInactive ? (
                                    <AlertTriangle className="w-3 h-3" />
                                  ) : isFull ? (
                                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                                  ) : (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  )}
                                  <span>{isInactive ? 'INACTIVE' : isFull ? 'FULL' : 'ACTIVE'}</span>
                                </span>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => onOpenEditBin(bin, true)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                    title={isEn ? 'View Bin' : 'ดูรายละเอียด Bin'}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onOpenEditBin(bin, false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                    title={isEn ? 'Edit Bin' : 'แก้ไขข้อมูล Bin'}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onDeleteBin(bin)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                    title={isEn ? 'Delete Bin' : 'ลบตำแหน่ง Bin'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div
                                className={`p-2.5 rounded-lg border font-mono font-bold text-xs flex items-center justify-between ${
                                  theme === 'dark'
                                    ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                                    : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  <span>{bin.binCode || (bin as any).code || 'MAIN'}</span>
                                </div>
                                {isWarehouseOnly && (
                                  <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    Default Bin
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <div className="flex justify-between">
                                  <span>{isEn ? 'Zone / Rack:' : 'โซน / แร็ค:'}</span>
                                  <span className="text-slate-800 dark:text-slate-200">
                                    {isWarehouseOnly ? (isEn ? 'General' : 'โซนหลัก') : `${bin.zone || 'A'} - ${bin.rack || '01'}`}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>{isEn ? 'Max Capacity:' : 'ความจุ:'}</span>
                                  <span className="text-slate-800 dark:text-slate-200">{capacity} kg</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>{isEn ? 'Items Stored:' : 'จัดเก็บอยู๋:'}</span>
                                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    {currentItems} {isEn ? 'units' : 'ชิ้น'}
                                  </span>
                                </div>
                              </div>

                              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isFull ? 'bg-rose-500' : 'bg-blue-600'}`}
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
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </>
      )}
    </div>
  );
};
