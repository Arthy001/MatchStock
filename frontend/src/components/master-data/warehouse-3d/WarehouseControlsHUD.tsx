import React, { useRef } from 'react';
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
  EyeOff,
  ArrowRightLeft,
  Upload,
  X,
  FileImage,
  Sparkles,
  Loader2,
  Save,
  Undo2,
  Move,
  PenTool,
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
  // Interactive Rack Move / Reposition Mode
  isMoveRackMode?: boolean;
  onToggleMoveRackMode?: () => void;
  stats: {
    total: number;
    available: number;
    full: number;
    maintenance: number;
  };
  warehouseName: string;
  // Step 2: Blueprint Image Overlay
  blueprintImage?: string | null;
  onUploadBlueprint?: (file: File) => void;
  onRemoveBlueprint?: () => void;
  blueprintVisible?: boolean;
  onToggleBlueprintVisible?: () => void;
  blueprintOpacity?: number;
  onBlueprintOpacityChange?: (opacity: number) => void;
  // AI Blueprint Scan (Gemini 3.5 Flash-Lite)
  isScanningBlueprint?: boolean;
  onScanBlueprint?: () => void;
  onLoadSampleBlueprint?: () => void;
  onOpenSketchPad?: () => void;
  // Solution 2: Zone Isolation Filter
  selectedZone?: string | 'all';
  onSelectZone?: (zone: string | 'all') => void;
  availableZones?: string[];
  // Aisle / Single Rack Focus
  selectedRack?: string | 'all';
  onSelectRack?: (rack: string | 'all') => void;
  availableRacksInZone?: string[];
  // X-Ray / Transparent Mode
  isXRayMode?: boolean;
  onToggleXRayMode?: () => void;
  // Save / Revert Blueprint Layout
  hasAiLayout?: boolean;
  onSaveLayout?: () => void;
  onRevertLayout?: () => void;
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
  isMoveRackMode = false,
  onToggleMoveRackMode,
  stats,
  warehouseName,
  blueprintImage,
  onUploadBlueprint,
  onRemoveBlueprint,
  blueprintVisible = true,
  onToggleBlueprintVisible,
  blueprintOpacity = 0.55,
  onBlueprintOpacityChange,
  isScanningBlueprint = false,
  onScanBlueprint,
  onLoadSampleBlueprint,
  onOpenSketchPad,
  selectedZone = 'all',
  onSelectZone,
  availableZones = [],
  selectedRack = 'all',
  onSelectRack,
  availableRacksInZone = [],
  isXRayMode = false,
  onToggleXRayMode,
  hasAiLayout = false,
  onSaveLayout,
  onRevertLayout,
}) => {
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="absolute inset-4 z-20 flex flex-col justify-between pointer-events-none">
      {/* Top Controls: Title, Move Mode, Search, and Status Filters */}
      <div className="flex flex-col gap-3 pointer-events-none">
        {/* Top Bar: Warehouse Title, Save AI Layout & Right Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
            {/* Warehouse Title & Stats Badge */}
            <div
              className={`px-4 py-2.5 rounded-2xl backdrop-blur-md border shadow-lg flex items-center gap-3 transition-colors ${
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

            {/* AI Generated Layout - Save & Revert Action Bar */}
            {hasAiLayout && (
              <div className="flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/40 text-emerald-100 px-3 py-1.5 rounded-2xl shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-left-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse shrink-0" />
                <span className="text-xs font-bold text-emerald-300">ผังจำลอง AI</span>
                <button
                  onClick={onSaveLayout}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-md flex items-center gap-1 active:scale-95"
                  title="บันทึกผังนี้ลงระบบถาวร"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกผังนี้</span>
                </button>
                <button
                  onClick={onRevertLayout}
                  className="px-2 py-1 rounded-xl bg-slate-800/90 hover:bg-rose-500/30 text-slate-300 hover:text-rose-300 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                  title="ยกเลิกผังจำลองและกลับไปใช้ผังเดิม"
                >
                  <Undo2 className="w-3 h-3" />
                  <span>กลับผังเดิม</span>
                </button>
              </div>
            )}
          </div>

          {/* Grouped Enterprise Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 pointer-events-auto">
            {/* Hidden Blueprint File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onUploadBlueprint) {
                  onUploadBlueprint(file);
                }
                e.target.value = '';
              }}
            />

            {/* GROUP 1: แผนผัง & AI (Blueprint & Gemini Auto-Generation) */}
            <div
              className={`flex items-center p-1 rounded-2xl border shadow-sm backdrop-blur-md ${
                isDark ? 'bg-slate-900/90 border-slate-700/80' : 'bg-white/95 border-slate-200'
              }`}
            >
              {/* Upload Blueprint Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  blueprintImage
                    ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                    : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title="อัปโหลดรูปภาพแปลนโกดังเพื่อนำมาทาบพื้น 2D/3D"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>{blueprintImage ? 'เปลี่ยนรูปแปลน' : 'อัปโหลดแปลน'}</span>
              </button>

              {/* Sketch Pad Button */}
              {onOpenSketchPad && (
                <button
                  onClick={onOpenSketchPad}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-cyan-300 hover:bg-cyan-950/50 transition flex items-center gap-1 cursor-pointer border-l border-slate-700/60 pl-2.5 ml-1"
                  title="เปิดกระดาษวาดผังคลังสินค้าด้วยตัวเอง แล้วให้ AI เสกเป็น 3D"
                >
                  <PenTool className="w-3.5 h-3.5 text-cyan-400" />
                  <span>วาดผังเอง</span>
                </button>
              )}

              {/* Sample Blueprint Button (if not loaded yet) */}
              {!blueprintImage && onLoadSampleBlueprint && (
                <button
                  onClick={onLoadSampleBlueprint}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-cyan-400 hover:bg-cyan-950/40 transition flex items-center gap-1 cursor-pointer"
                  title="โหลดรูปแปลนพิมพ์เขียวตัวอย่าง CAD"
                >
                  <FileImage className="w-3.5 h-3.5" />
                  <span>ตัวอย่าง CAD</span>
                </button>
              )}

              {/* Opacity & Visibility when blueprint is active */}
              {blueprintImage && (
                <div className="flex items-center gap-1 pl-1 border-l border-slate-700/60 ml-1">
                  <button
                    onClick={onToggleBlueprintVisible}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      blueprintVisible
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-white'
                    }`}
                    title={blueprintVisible ? 'คลิกเพื่อซ่อนภาพแปลนบนพื้น (ดูคลัง 3D ล้วน)' : 'คลิกเพื่อเปิดภาพแปลนบนพื้น (เทียบกับ 3D)'}
                  >
                    {blueprintVisible ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>แปลน: เปิด</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>แปลน: ปิด</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1 pr-1 text-[10px] text-slate-400">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={Math.round(blueprintOpacity * 100)}
                      onChange={(e) => onBlueprintOpacityChange?.(Number(e.target.value) / 100)}
                      className="w-12 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      title={`ความจาง ${Math.round(blueprintOpacity * 100)}%`}
                    />
                    <span className="w-5 text-right font-mono">{Math.round(blueprintOpacity * 100)}%</span>
                  </div>

                  <button
                    onClick={onRemoveBlueprint}
                    className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                    title="ลบภาพแปลนออก"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* AI Auto-Generate Gemini Button */}
              {blueprintImage && onScanBlueprint && (
                <div className="pl-1 border-l border-slate-700/60 ml-1">
                  <button
                    onClick={onScanBlueprint}
                    disabled={isScanningBlueprint}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md ${
                      isScanningBlueprint
                        ? 'bg-purple-950/80 text-purple-300 cursor-wait'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/30 active:scale-95'
                    }`}
                    title="ใช้ Gemini AI วิเคราะห์แปลนสร้างชั้นวาง 3D อัตโนมัติ"
                  >
                    {isScanningBlueprint ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
                        <span>AI กำลังสแกน...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span>AI สแกนสร้างผัง</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* GROUP 2: โหมดการทำงาน (Operational Modes: Move Rack & Swap Stock) */}
            <div
              className={`flex items-center p-1 rounded-2xl border shadow-sm backdrop-blur-md ${
                isDark ? 'bg-slate-900/90 border-slate-700/80' : 'bg-white/95 border-slate-200'
              }`}
            >
              {/* Move Rack Mode Toggle */}
              {onToggleMoveRackMode && (
                <button
                  onClick={onToggleMoveRackMode}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isMoveRackMode
                      ? 'bg-purple-600 text-white font-extrabold shadow-sm'
                      : isDark
                      ? 'hover:bg-slate-800 text-purple-300'
                      : 'hover:bg-slate-100 text-purple-700'
                  }`}
                  title="คลิกเพื่อเปิดโหมดขยับปรับตำแหน่ง Rack ให้ตรงกับแนวเส้นในแปลน"
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>{isMoveRackMode ? 'โหมดขยับแร็ค (เปิด)' : 'ขยับแร็ค'}</span>
                </button>
              )}

              {/* Swap Stock Mode Toggle */}
              {onToggleMoveMode && (
                <button
                  onClick={onToggleMoveMode}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isMoveMode
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : isDark
                      ? 'hover:bg-slate-800 text-amber-400'
                      : 'hover:bg-slate-100 text-amber-600'
                  }`}
                  title="คลิกเพื่อสลับ/โยกย้ายสต็อกข้ามช่อง"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{isMoveMode ? 'โหมดสลับ (เปิด)' : 'สลับสต็อก'}</span>
                </button>
              )}
            </div>

            {/* GROUP 3: มุมมอง & จัดกึ่งกลาง (Camera Controls) */}
            <div
              className={`flex items-center p-1 rounded-2xl border shadow-sm backdrop-blur-md ${
                isDark ? 'bg-slate-900/90 border-slate-700/80' : 'bg-white/95 border-slate-200'
              }`}
            >
              <button
                onClick={onResetCamera}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                title="จัดกึ่งกลางมุมมองชั้นวางสินค้า"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>กึ่งกลาง</span>
              </button>
            </div>
          </div>
        </div>


        {/* Sub-bar: Search, Filter Badges & Camera Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
            {/* Search Input for Pinpoint */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-sm ${
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
                className="bg-transparent border-none outline-none text-xs w-40 placeholder-slate-500 font-medium"
              />
            </div>

            {/* Solution 2: Zone Isolation Selector (Isolate Zone View) */}
            {availableZones.length > 1 && onSelectZone && (
              <div
                className={`flex items-center gap-1 p-1 rounded-xl backdrop-blur-md border shadow-sm ${
                  isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-slate-200'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 px-1.5">โซน:</span>
                <button
                  onClick={() => onSelectZone('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    selectedZone === 'all'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="แสดงชั้นวางทุกโซนพร้อมกัน"
                >
                  ทั้งหมด
                </button>
                {availableZones.map((z) => (
                  <button
                    key={z}
                    onClick={() => onSelectZone(z)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      selectedZone === z
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-emerald-400'
                    }`}
                    title={`เจาะจงดูเฉพาะ ${z}`}
                  >
                    {z}
                  </button>
                ))}
              </div>
            )}

            {/* Aisle / Rack Focus Selector (Appears when a zone is selected) */}
            {selectedZone !== 'all' && availableRacksInZone.length > 1 && onSelectRack && (
              <div
                className={`flex items-center gap-1 p-1 rounded-xl backdrop-blur-md border shadow-sm animate-in fade-in slide-in-from-left-2 ${
                  isDark ? 'bg-slate-900/90 border-purple-500/40' : 'bg-purple-50/90 border-purple-200'
                }`}
              >
                <span className="text-[10px] font-bold text-purple-400 px-1.5">แถว (Rack):</span>
                <button
                  onClick={() => onSelectRack('all')}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                    selectedRack === 'all'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-purple-300'
                  }`}
                >
                  ทุกแถว
                </button>
                {availableRacksInZone.map((r) => (
                  <button
                    key={r}
                    onClick={() => onSelectRack(r)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      selectedRack === r
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-purple-300'
                    }`}
                    title={`เจาะดูเฉพาะแถว ${r} (ซ่อนแถวอื่นเพื่อคลิกด้านในสะดวก)`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* X-Ray / Ghost Mode Toggle */}
            {onToggleXRayMode && (
              <button
                onClick={onToggleXRayMode}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border shadow-sm ${
                  isXRayMode
                    ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-400/50 shadow-indigo-600/30'
                    : isDark
                    ? 'bg-slate-900/80 text-slate-300 border-slate-800 hover:text-indigo-400'
                    : 'bg-white/90 text-slate-700 border-slate-200 hover:text-indigo-600'
                }`}
                title={isXRayMode ? 'ปิดโหมดโปร่งใส X-Ray' : 'เปิดโหมด X-Ray โปร่งใส (มองทะลุแถวด้านนอกเพื่อส่องชั้นใน)'}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>X-Ray มองทะลุ</span>
              </button>
            )}
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
          </div>
        </div>
      </div>

      {/* Bottom Bar: Floating Legend Badge at Bottom-Left */}
      <div className="flex items-center justify-between pointer-events-none">
        <div
          className={`pointer-events-auto hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl backdrop-blur-md border shadow-md text-[11px] font-semibold transition-colors ${
            isDark
              ? 'bg-slate-900/85 border-slate-800 text-slate-300'
              : 'bg-white/90 border-slate-200 text-slate-700 shadow-sm'
          }`}
        >
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-1">ความจุ:</span>
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
    </div>
  );
};

