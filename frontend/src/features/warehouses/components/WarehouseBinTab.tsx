import React, { useState, useEffect, useMemo } from 'react';
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
  Plus,
} from 'lucide-react';
import { ThemeMode, Language, WarehouseBin } from '../../../types';
import { ViewMode3D } from '../../../types/warehouse-3d';
import { Warehouse3DCanvas } from './warehouse-3d/Warehouse3DCanvas';
import { useWarehouses } from '../hooks/useWarehouses';
import { EditWarehouseModal, WarehouseItem } from './EditWarehouseModal';
import { EditBinLocationModal } from './EditBinLocationModal';
import { CreateWarehouseModal } from './CreateWarehouseModal';
import { CreateBinModal } from './CreateBinModal';
import { ConfirmDeleteModal } from '../../../components/master-data/modals/ConfirmDeleteModal';

interface WarehouseBinTabProps {
  theme: ThemeMode;
  lang?: Language;
  t?: any;
  searchQuery?: string;
  binsList?: WarehouseBin[];
  onOpenEditBin?: (bin: WarehouseBin, isViewOnly?: boolean) => void;
  onDeleteBin?: (bin: WarehouseBin) => void;
  onRelocateStock?: (sourceBinId: string, targetBinId: string, qty: number) => Promise<void>;
  showToast?: (msg: string) => void;
}

export const WarehouseBinTab: React.FC<WarehouseBinTabProps> = ({
  theme,
  lang = 'th',
  t,
  searchQuery = '',
  binsList: externalBinsList,
  onOpenEditBin: externalOpenEditBin,
  onDeleteBin: externalDeleteBin,
  onRelocateStock,
  showToast,
}) => {
  const isEn = lang === 'en';
  const [viewMode, setViewMode] = useState<ViewMode3D>('cards');

  // Dedicated Create Modals states
  const [isCreateWhOpen, setIsCreateWhOpen] = useState(false);
  const [isCreateBinOpen, setIsCreateBinOpen] = useState(false);
  const [createBinWarehouseId, setCreateBinWarehouseId] = useState<string | undefined>(undefined);

  // Self-contained warehouse hook
  const hook = useWarehouses(showToast);

  useEffect(() => {
    if (!externalBinsList) {
      hook.fetchWarehouses();
    }
  }, [externalBinsList]);

  const binsList = externalBinsList || hook.binsList;
  const safeBins = Array.isArray(binsList) ? binsList : [];

  // Distinct warehouses list for Bin Modal dropdown
  const warehousesList = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code?: string }>();
    safeBins.forEach((b) => {
      const id = b.warehouseId || b.id;
      if (id && !map.has(id)) {
        map.set(id, {
          id,
          name: b.warehouseName || 'คลังสินค้า',
          code: (b as any).warehouseCode || (b as any).code,
        });
      }
    });
    return Array.from(map.values());
  }, [safeBins]);

  // Filter bins by searchQuery
  const filteredBins = searchQuery
    ? safeBins.filter((b) =>
        (b.binCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.warehouseName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.zone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.rack || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.shelf || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : safeBins;

  // Group bins by warehouseId
  const warehouseGroups = filteredBins.reduce(
    (acc: { [whId: string]: { id: string; name: string; code?: string; bins: WarehouseBin[] } }, bin) => {
      const whId = bin.warehouseId || bin.id || 'wh-default';
      const whName = bin.warehouseName || 'คลังสินค้าหลัก';
      if (!acc[whId]) {
        acc[whId] = {
          id: whId,
          name: whName,
          code: bin.binCode,
          bins: [],
        };
      }
      acc[whId].bins.push(bin);
      return acc;
    },
    {}
  );

  const groupValues = Object.values(warehouseGroups);

  const handleOpenCreateBin = (whId?: string) => {
    setCreateBinWarehouseId(whId);
    setIsCreateBinOpen(true);
  };

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
              {t?.warehouseTitle || (isEn ? 'Warehouses, Zones & Bins' : 'คลังสินค้า, โซน และตำแหน่งจัดเก็บ (Bins)')}
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

        {/* Action Buttons & View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dedicated Action Buttons: Add Warehouse & Add Bin */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateWhOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-indigo-600/30 transition cursor-pointer active:scale-[0.99] whitespace-nowrap"
            >
              <Building className="w-3.5 h-3.5" />
              <span>{isEn ? '+ Add Warehouse' : '+ เพิ่มคลังสินค้า'}</span>
            </button>

            <button
              onClick={() => handleOpenCreateBin()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-blue-600/30 transition cursor-pointer active:scale-[0.99] whitespace-nowrap"
            >
              <Box className="w-3.5 h-3.5" />
              <span>{isEn ? '+ Add Bin Location' : '+ เพิ่มตำแหน่ง Bin'}</span>
            </button>
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
              title="มุมมอง 2D Orthographic ผังแบบแปลน 2 มิติ"
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
              title="มุมมองรายการการ์ดมาตรฐาน (Standard Cards List)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render 3D / 2D Canvas OR Standard Cards */}
      {viewMode !== 'cards' ? (
        <div className="space-y-4">
          <Warehouse3DCanvas
            binsList={filteredBins}
            viewMode={viewMode}
            theme={theme}
            onViewModeChange={setViewMode}
            onOpenEditBin={(bin, isViewOnly) => {
              if (externalOpenEditBin) {
                externalOpenEditBin(bin, isViewOnly);
              } else {
                hook.openEditBin(bin, isViewOnly);
              }
            }}
            onDeleteBin={(bin) => {
              if (externalDeleteBin) {
                externalDeleteBin(bin);
              } else {
                hook.handleDeleteBin(bin);
              }
            }}
            onRelocateStock={onRelocateStock}
          />
        </div>
      ) : (
        <div>
          {groupValues.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                {isEn ? 'No warehouses or bin locations found.' : 'ไม่พบข้อมูลคลังสินค้าหรือตำแหน่งจัดเก็บ'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {groupValues.map((group) => {
                const isSelected = true;

                return (
                  <div
                    key={group.id}
                    className={`rounded-2xl border p-5 transition-all ${
                      isSelected
                        ? theme === 'dark'
                          ? 'border-blue-500/30 bg-slate-900/60 shadow-lg shadow-blue-500/5'
                          : 'border-blue-200 bg-blue-50/20 shadow-sm'
                        : theme === 'dark'
                        ? 'border-slate-800 bg-slate-900/40'
                        : 'border-slate-200/80 bg-slate-50/50'
                    }`}
                  >
                    {/* Warehouse Header Bar with Distinct Warehouse-Level Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200/60 dark:border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            theme === 'dark'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-blue-100 text-blue-600 border border-blue-200'
                          }`}
                        >
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-base font-bold tracking-tight ${
                                theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
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

                      {/* Dedicated Warehouse Actions: Quick Add Bin, View, Edit, Delete */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => handleOpenCreateBin(group.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer flex items-center gap-1 text-xs font-semibold shadow-xs"
                          title={isEn ? `Add Bin in ${group.name}` : `เพิ่มตำแหน่ง Bin ใน ${group.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isEn ? '+ Add Bin' : '+ เพิ่ม Bin ในคลังนี้'}</span>
                        </button>
                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />
                        <span className="text-[11px] font-bold text-slate-400 px-1">
                          {isEn ? 'Warehouse:' : 'คลังสินค้า:'}
                        </span>
                        <button
                          onClick={() => {
                            const whObj: WarehouseItem = {
                              id: group.id,
                              name: group.name,
                              code: group.code,
                              isActive: true,
                            };
                            hook.openEditWarehouse(whObj, true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-500 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                          title={isEn ? 'View Warehouse' : 'ดูรายละเอียดคลังสินค้า'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">{isEn ? 'View' : 'ดู'}</span>
                        </button>
                        <button
                          onClick={() => {
                            const whObj: WarehouseItem = {
                              id: group.id,
                              name: group.name,
                              code: group.code,
                              isActive: true,
                            };
                            hook.openEditWarehouse(whObj, false);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-500 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                          title={isEn ? 'Edit Warehouse' : 'แก้ไขคลังสินค้า'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">{isEn ? 'Edit' : 'แก้ไข'}</span>
                        </button>
                        <button
                          onClick={() => {
                            const whObj: WarehouseItem = {
                              id: group.id,
                              name: group.name,
                              code: group.code,
                            };
                            hook.handleDeleteWarehouse(whObj);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                          title={isEn ? 'Delete Warehouse' : 'ลบคลังสินค้า'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">{isEn ? 'Delete' : 'ลบ'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Bin Location Cards Grid inside this Warehouse */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.bins.map((bin) => {
                        const isActiveBool = (bin as any).isActive !== undefined 
                          ? Boolean((bin as any).isActive) 
                          : String(bin.status || '').toLowerCase() !== 'maintenance' && String(bin.status || '').toLowerCase() !== 'inactive';
                        const isInactive = !isActiveBool;
                        const isFull = !isInactive && String(bin.status || '').toLowerCase() === 'full';
                        const capacity = Number((bin as any).maxCapacity ?? bin.capacityKg ?? 0);
                        const currentItems = Number(bin.currentItemsCount || 0);

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
                                  <CheckCircle2 className="w-3 h-3" />
                                )}
                                {isInactive
                                  ? (isEn ? 'MAINTENANCE' : 'ปิดปรับปรุง')
                                  : isFull
                                  ? (isEn ? 'FULL' : 'เต็ม')
                                  : (isEn ? 'ACTIVE' : 'พร้อมใช้งาน')}
                              </span>

                              {/* Bin Card Actions: View, Edit, Delete */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    if (externalOpenEditBin) {
                                      externalOpenEditBin(bin, true);
                                    } else {
                                      hook.openEditBin(bin, true);
                                    }
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                  title={isEn ? 'View Bin Details' : 'ดูรายละเอียดตำแหน่ง Bin'}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (externalOpenEditBin) {
                                      externalOpenEditBin(bin, false);
                                    } else {
                                      hook.openEditBin(bin, false);
                                    }
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                  title={isEn ? 'Edit Bin Location' : 'แก้ไขข้อมูลตำแหน่ง Bin'}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (externalDeleteBin) {
                                      externalDeleteBin(bin);
                                    } else {
                                      hook.handleDeleteBin(bin);
                                    }
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                  title={isEn ? 'Delete Bin Location' : 'ลบตำแหน่งจัดเก็บ Bin'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-800 dark:text-slate-100 font-mono">
                                  {bin.binCode}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                                <span>{isEn ? 'Zone / Rack / Shelf:' : 'โซน / แร็ค / ชั้น:'}</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {bin.zone || '-'} - {bin.rack || '-'} - {bin.shelf || '-'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                                <span>{isEn ? 'Max Capacity:' : 'ความจุสูงสุด:'}</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {capacity.toLocaleString()} {isEn ? 'items' : 'ชิ้น'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                                <span>{isEn ? 'Current Stored:' : 'จัดเก็บอยู่:'}</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">
                                  {currentItems.toLocaleString()} {isEn ? 'items' : 'ชิ้น'}
                                </span>
                              </div>
                            </div>

                            {/* Capacity Progress Bar */}
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  capacity > 0 && currentItems >= capacity
                                    ? 'bg-rose-500'
                                    : capacity > 0 && currentItems / capacity > 0.8
                                    ? 'bg-amber-500'
                                    : 'bg-blue-500'
                                }`}
                                style={{
                                  width: `${
                                    capacity > 0 ? Math.min(100, Math.round((currentItems / capacity) * 100)) : 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Self-contained Modals */}
      <EditWarehouseModal
        theme={theme}
        lang={lang}
        warehouse={hook.editingWarehouse}
        isViewOnly={hook.isViewOnlyWh}
        onSwitchToEdit={() => hook.setIsViewOnlyWh(false)}
        onClose={() => hook.setEditingWarehouse(null)}
        onSave={hook.handleSaveEditWarehouse}
        isSaving={hook.isSavingWh}
        editWhName={hook.editWhName}
        setEditWhName={hook.setEditWhName}
        editWhCode={hook.editWhCode}
        setEditWhCode={hook.setEditWhCode}
        editWhAddress={hook.editWhAddress}
        setEditWhAddress={hook.setEditWhAddress}
        editWhIsActive={hook.editWhIsActive}
        setEditWhIsActive={hook.setEditWhIsActive}
        editWhMaxCapacity={hook.editWhMaxCapacity}
        setEditWhMaxCapacity={hook.setEditWhMaxCapacity}
      />

      <EditBinLocationModal
        theme={theme}
        lang={lang}
        bin={hook.editingBin}
        isViewOnly={hook.isViewOnlyBin}
        onSwitchToEdit={() => hook.setIsViewOnlyBin(false)}
        onClose={() => hook.setEditingBin(null)}
        onSave={hook.handleSaveEditBin}
        isSaving={hook.isSavingBin}
        editWhName={hook.editBinWhName}
        setEditWhName={hook.setEditBinWhName}
        editBinCode={hook.editBinCode}
        setEditBinCode={hook.setEditBinCode}
        editBinZone={hook.editBinZone}
        setEditBinZone={hook.setEditBinZone}
        editBinRack={hook.editBinRack}
        setEditBinRack={hook.setEditBinRack}
        editBinShelf={hook.editBinShelf}
        setEditBinShelf={hook.setEditBinShelf}
        editBinCapacity={hook.editBinCapacity}
        setEditBinCapacity={hook.setEditBinCapacity}
        editBinIsActive={hook.editBinIsActive}
        setEditBinIsActive={hook.setEditBinIsActive}
      />

      <CreateWarehouseModal
        theme={theme}
        lang={lang}
        isOpen={isCreateWhOpen}
        onClose={() => setIsCreateWhOpen(false)}
        onSuccess={() => {
          hook.fetchWarehouses(true);
        }}
        showToast={showToast}
      />

      <CreateBinModal
        theme={theme}
        lang={lang}
        isOpen={isCreateBinOpen}
        onClose={() => setIsCreateBinOpen(false)}
        onSuccess={() => {
          hook.fetchWarehouses(true);
        }}
        warehousesList={warehousesList}
        defaultWarehouseId={createBinWarehouseId}
        showToast={showToast}
      />

      <ConfirmDeleteModal
        theme={theme}
        lang={lang}
        isOpen={Boolean(hook.deleteConfirmData)}
        isDeleting={hook.isDeleting}
        data={hook.deleteConfirmData}
        onClose={() => hook.setDeleteConfirmData(null)}
      />
    </div>
  );
};
export default WarehouseBinTab;
