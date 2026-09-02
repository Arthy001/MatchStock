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

      {/* VIEW 3: Classic Cards Grid */}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {safeBins.map((bin) => {
                const isInactive = bin.isActive === false || bin.status === 'maintenance';
                const isFull = !isInactive && String(bin.status || '').toLowerCase() === 'full';
                const capacity = Number(bin.capacityKg || 500);
                const currentItems = Number(bin.currentItemsCount || 0);
                const isWarehouseOnly = bin.id === bin.warehouseId;

                return (
                  <div
                    key={bin.id}
                    className={`p-5 rounded-2xl border space-y-4 shadow-sm transition hover:border-slate-700 ${
                      theme === 'dark' ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
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
                          title={isEn ? 'View Warehouse / Bin Details' : 'ดูรายละเอียดคลัง / Bin (View Detail)'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenEditBin(bin, false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title={isEn ? 'Edit Warehouse / Bin' : 'แก้ไขข้อมูลคลัง / Bin (Edit Warehouse/Bin)'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteBin(bin)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title={isEn ? 'Delete Bin Location' : 'ลบตำแหน่ง Bin (Delete Bin)'}
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
                      {isWarehouseOnly ? (
                        <span className="text-xs text-amber-400 font-sans font-medium">
                          {isEn ? 'Warehouse Unit (No Bins Configured)' : 'คลังสินค้าหลัก (ยังไม่มีชั้นวาง Bin)'}
                        </span>
                      ) : (
                        <span>Bin Code: {bin.binCode || (bin as any).code || '-'}</span>
                      )}
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
                        <span>{isEn ? 'Items Stored:' : 'จำนวนสินค้าจัดเก็บ:'}</span>
                        <span className="font-semibold text-blue-600">
                          {currentItems} {isEn ? 'units' : 'ชิ้น'}
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
        </>
      )}
    </div>
  );
};
