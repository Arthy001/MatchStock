import React from 'react';
import {
  Box,
  Layers,
  LayoutGrid,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Eye,
  ArrowRightLeft,
} from 'lucide-react';
import { ViewMode3D, FilterMode3D } from '../../../types/warehouse-3d';
import { ThemeMode } from '../../../types';

interface WarehouseControlsHUDProps {
  theme: ThemeMode;
  viewMode: ViewMode3D;
  onViewModeChange: (mode: ViewMode3D) => void;
  filterMode: FilterMode3D;
  onFilterModeChange: (filter: FilterMode3D) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetCamera: () => void;
  isMoveMode?: boolean;
  onToggleMoveMode?: () => void;
  stats: {
    total: number;
    available: number;
    full: number;
    maintenance: number;
  };
  warehouseName: string;
}

export const WarehouseControlsHUD: React.FC<WarehouseControlsHUDProps> = ({
  theme,
  viewMode,
  onViewModeChange,
  filterMode,
  onFilterModeChange,
  searchQuery,
  onSearchChange,
  onResetCamera,
  isMoveMode,
  onToggleMoveMode,
  stats,
  warehouseName,
}) => {
  const isDark = theme === 'dark';

  return (
    <div className="absolute inset-x-4 top-4 z-20 flex flex-col gap-3 pointer-events-none">
      {/* Top Bar: Warehouse Title & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Warehouse Title & Stats Badge */}
        <div
          className={`pointer-events-auto px-4 py-2.5 rounded-2xl backdrop-blur-md border shadow-lg flex items-center gap-3 transition-colors ${
            isDark
              ? 'bg-slate-900/80 border-slate-800 text-slate-100'
              : 'bg-white/90 border-slate-200 text-slate-900'
          }`}
        >
          <div className="w-8 h-8 rounded-xl bg-blue-600/15 text-blue-500 flex items-center justify-center font-bold">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm leading-none">{warehouseName}</h3>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30">
                DIGITAL TWIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {stats.total} ช่องเก็บ (Bins) • พร้อมใช้งาน {stats.available} ช่อง
            </p>
          </div>
        </div>

        {/* Controls on Top-Right: Move Mode & Help */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {onToggleMoveMode && (
            <button
              onClick={onToggleMoveMode}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md ${
                isMoveMode
                  ? 'bg-amber-500 text-slate-950 font-black shadow-amber-500/30 animate-pulse'
                  : isDark
                  ? 'bg-slate-800/90 text-amber-400 border border-slate-700 hover:bg-slate-750'
                  : 'bg-white/90 text-amber-600 border border-slate-200 hover:bg-slate-50'
              }`}
              title="คลิกเพื่อเปิด/ปิดโหมดสลับตำแหน่งหรือย้ายสต็อกข้ามช่อง"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{isMoveMode ? 'กำลังอยู่ในโหมดสลับ/ย้าย (คลิกกล่องเป้าหมาย)' : 'สลับ/โยกย้าย (Swap Mode)'}</span>
            </button>
          )}

          <button
            onClick={onResetCamera}
            className={`p-2 rounded-xl backdrop-blur-md border shadow-sm transition flex items-center gap-1.5 cursor-pointer text-xs font-semibold ${
              isDark
                ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="จัดกึ่งกลางมุมมองชั้นวางสินค้า"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">จัดกึ่งกลาง</span>
          </button>
        </div>
      </div>

      {/* Sub-bar: Search, Filter Badges & Camera Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input for Pinpoint */}
        <div
          className={`pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-sm ${
            isDark
              ? 'bg-slate-900/80 border-slate-800 text-slate-100'
              : 'bg-white/90 border-slate-200 text-slate-800'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="ค้นหาช่องเก็บ เช่น A-01-01..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-44 placeholder-slate-500 font-medium"
          />
        </div>

        {/* Filter Pills & Reset Camera */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Status Filters */}
          <div
            className={`p-1 rounded-xl backdrop-blur-md border shadow-sm flex items-center gap-1 ${
              isDark
                ? 'bg-slate-900/80 border-slate-800'
                : 'bg-white/90 border-slate-200'
            }`}
          >
            <button
              onClick={() => onFilterModeChange('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-slate-800 text-white dark:bg-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ทั้งหมด ({stats.total})
            </button>

            <button
              onClick={() => onFilterModeChange('available')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                filterMode === 'available'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ว่าง ({stats.available})
            </button>

            <button
              onClick={() => onFilterModeChange('full')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                filterMode === 'full'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              เต็ม ({stats.full})
            </button>

            <button
              onClick={() => onFilterModeChange('maintenance')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                filterMode === 'maintenance'
                  ? 'bg-slate-700/40 text-slate-300 border border-slate-600'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              ปิดปรับปรุง ({stats.maintenance})
            </button>
          </div>

          {/* Reset Camera Button */}
          <button
            onClick={onResetCamera}
            title="รีเซ็ตมุมกล้อง (Reset Camera)"
            className={`p-2 rounded-xl backdrop-blur-md border shadow-sm text-slate-400 hover:text-white transition cursor-pointer ${
              isDark
                ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-800'
                : 'bg-white/90 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Legend Badge at Bottom-Left (Inside Canvas Container) */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-auto hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl backdrop-blur-md border shadow-md text-[11px] font-semibold bg-slate-900/85 border-slate-800 text-slate-300">
        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mr-1">ความจุ:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-xs shadow-emerald-500/50" />
          <span>ว่าง (&lt;50%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 shadow-xs shadow-amber-500/50" />
          <span>ปานกลาง (50-89%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-xs shadow-rose-500/50" />
          <span>เต็ม (&ge;90%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-500" />
          <span>ระงับการใช้</span>
        </div>
      </div>
    </div>
  );
};
