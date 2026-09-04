import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Warehouse,
  Search,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Layers,
  Package,
  Calendar,
  X,
  Loader2,
  RefreshCw,
  Barcode,
  Check,
  Split,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  ThemeMode,
  Language,
  StagedGoodsReceiptItem,
  SuggestedBin,
  WarehouseBin,
} from '../types';
import { transactionService } from '../services/transaction.service';
import { warehouseService } from '../services/warehouse.service';
import { CustomSelect } from './common/CustomSelect';

interface PutawayManagementProps {
  theme: ThemeMode;
  lang: Language;
  searchQuery?: string;
}

export const PutawayManagement: React.FC<PutawayManagementProps> = ({
  theme,
  lang,
  searchQuery = '',
}) => {
  const isDark = theme === 'dark';
  const isEn = lang === 'en';

  const [stagedItems, setStagedItems] = useState<StagedGoodsReceiptItem[]>([]);
  const [warehousesList, setWarehousesList] = useState<WarehouseBin[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState<string>(searchQuery);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Drawer / Modal State for Confirming Putaway
  const [selectedItem, setSelectedItem] = useState<StagedGoodsReceiptItem | null>(null);
  const [suggestedBin, setSuggestedBin] = useState<SuggestedBin | null>(null);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Multi-Bin Allocations State
  const [binAllocations, setBinAllocations] = useState<{ id: string; binId: string; binCode: string; quantity: number }[]>([]);
  const [activeAllocId, setActiveAllocId] = useState<string | null>(null);

  // State for Find Bin Search Modal
  const [isBinSearchOpen, setIsBinSearchOpen] = useState<boolean>(false);
  const [binSearchQuery, setBinSearchQuery] = useState<string>('');
  const [availableBins, setAvailableBins] = useState<WarehouseBin[]>([]);
  const [isLoadingBins, setIsLoadingBins] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, [selectedWarehouseId]);

  const fetchAndMapAllBins = async (rawWhs: any[]): Promise<WarehouseBin[]> => {
    const bins: WarehouseBin[] = [];

    for (const wh of rawWhs) {
      let whBins = Array.isArray(wh.bins) ? wh.bins : [];

      // If wh.bins is empty, attempt to fetch sub-bins via /warehouses/:id/bins
      if (whBins.length === 0 && wh.id) {
        try {
          const subBins = await warehouseService.getBinsByWarehouse(wh.id);
          if (Array.isArray(subBins) && subBins.length > 0) {
            whBins = subBins;
          }
        } catch (e) {
          console.warn(`Failed to fetch sub-bins for warehouse ${wh.id}:`, e);
        }
      }

      if (whBins.length > 0) {
        whBins.forEach((b: any) => {
          bins.push({
            id: b.id || b.binId,
            warehouseId: wh.id,
            warehouseName: wh.name,
            binCode: b.code || b.binCode || `${wh.code || 'WH'}-${(b.id || 'BIN').slice(0, 4)}`,
            zone: b.zone || 'A',
            rack: b.rack || '01',
            shelf: b.shelf || '1',
            capacityKg: Number(b.capacityKg || 1000),
            currentItemsCount: Number(b.currentItemsCount || 0),
            status: b.status || 'available',
          });
        });
      } else {
        // Fallback main warehouse location if no sub-bins exist
        bins.push({
          id: wh.id,
          warehouseId: wh.id,
          warehouseName: wh.name,
          binCode: `${wh.code || 'WH'}-MAIN`,
          zone: 'General',
          rack: '01',
          shelf: '1',
          capacityKg: 5000,
          currentItemsCount: 0,
          status: 'available',
        });
      }
    }

    return bins;
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stagedRes, whRes] = await Promise.all([
        transactionService.getStagedItems({
          warehouseId: selectedWarehouseId !== 'all' ? selectedWarehouseId : undefined,
          limit: 100,
        }),
        warehouseService.getWarehouses(),
      ]);
      setStagedItems(stagedRes.data || []);
      const rawWhs = Array.isArray(whRes.data) ? whRes.data : Array.isArray(whRes) ? whRes : [];
      setWarehousesList(rawWhs);

      const bins = await fetchAndMapAllBins(rawWhs);
      setAvailableBins(bins);
    } catch (e) {
      console.error('Failed to load putaway data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddBinRow = () => {
    if (!selectedItem) return;
    const currentAllocated = binAllocations.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0);
    const rem = Math.max(0, selectedItem.remainingQuantity - currentAllocated);

    setBinAllocations((prev) => [
      ...prev,
      {
        id: `alloc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        binId: '',
        binCode: '',
        quantity: rem > 0 ? rem : 1,
      },
    ]);
  };

  const handleRemoveBinRow = (id: string) => {
    if (binAllocations.length <= 1) return;
    setBinAllocations((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateBinRow = (id: string, field: 'binId' | 'binCode' | 'quantity', val: any) => {
    setBinAllocations((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          if (field === 'quantity') {
            return { ...a, quantity: Math.max(0, parseInt(val) || 0) };
          }
          if (field === 'binId') {
            return { ...a, binId: val, binCode: val };
          }
          return { ...a, [field]: val };
        }
        return a;
      })
    );
  };

  // Open Bin Search Modal Popup for a specific row
  const handleOpenBinSearchModal = async (allocId: string) => {
    setActiveAllocId(allocId);
    setIsBinSearchOpen(true);
    setBinSearchQuery('');
    setIsLoadingBins(true);
    try {
      const whRes = await warehouseService.getWarehouses();
      const rawWhs = Array.isArray(whRes.data) ? whRes.data : Array.isArray(whRes) ? whRes : [];
      const bins = await fetchAndMapAllBins(rawWhs);
      setAvailableBins(bins);
    } catch (err) {
      console.error('Failed to fetch bins for search popup:', err);
    } finally {
      setIsLoadingBins(false);
    }
  };

  // Open Putaway Confirm Modal
  const handleOpenPutaway = async (item: StagedGoodsReceiptItem) => {
    setSelectedItem(item);
    setSuggestedBin(null);

    const initialBin = item.suggestedBinLocationId || (availableBins[0] ? availableBins[0].id : '');
    const initialCode = availableBins.find(b => b.id === initialBin)?.binCode || initialBin;

    setBinAllocations([
      {
        id: 'alloc-1',
        binId: initialBin,
        binCode: initialCode,
        quantity: item.remainingQuantity,
      },
    ]);

    // Auto-fetch Suggest Bin helper if warehouse is known
    const whId = item.warehouseId || warehousesList[0]?.warehouseId || warehousesList[0]?.id;
    if (whId) {
      setIsSuggesting(true);
      try {
        const suggestion = await transactionService.getSuggestedBin(whId, item.remainingQuantity);
        if (suggestion) {
          setSuggestedBin(suggestion);
          setBinAllocations([
            {
              id: 'alloc-1',
              binId: suggestion.id,
              binCode: suggestion.code,
              quantity: item.remainingQuantity,
            },
          ]);
        }
      } catch (err) {
        console.warn('Auto suggest bin failed:', err);
      } finally {
        setIsSuggesting(false);
      }
    }
  };

  const handleManualSuggestBin = async () => {
    if (!selectedItem) return;
    const whId = selectedItem.warehouseId || warehousesList[0]?.warehouseId || warehousesList[0]?.id;
    if (!whId) return;

    const totalQty = binAllocations.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0);

    setIsSuggesting(true);
    try {
      const suggestion = await transactionService.getSuggestedBin(whId, totalQty || selectedItem.remainingQuantity);
      if (suggestion) {
        setSuggestedBin(suggestion);
        if (binAllocations.length > 0) {
          handleUpdateBinRow(binAllocations[0].id, 'binId', suggestion.id);
          handleUpdateBinRow(binAllocations[0].id, 'binCode', suggestion.code);
        }
        showToast(
          isEn
            ? `Suggested Bin: ${suggestion.code} (Free Capacity: ${suggestion.remainingCapacity || 0})`
            : `แนะนำช่องวาง: ${suggestion.code} (ความจุว่าง: ${suggestion.remainingCapacity || 0})`
        );
      } else {
        showToast(isEn ? 'No empty bin found for this quantity.' : 'ไม่พบช่องวางว่างที่เพียงพอกับจำนวนนี้');
      }
    } catch {
      showToast(isEn ? 'Failed to fetch suggested bin.' : 'ไม่สามารถดึงข้อมูลช่องวางแนะนำได้');
    } finally {
      setIsSuggesting(false);
    }
  };

  const isUUID = (str: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const handleConfirmPutaway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    // Filter valid non-zero allocations and resolve Bin Location UUID strictly
    const resolvedAllocations: { binId: string; binCode: string; quantity: number }[] = [];

    for (const alloc of binAllocations) {
      if (!alloc.quantity || alloc.quantity <= 0) continue;

      const targetStr = (alloc.binId || alloc.binCode || '').trim();
      if (!targetStr) continue;

      let binUuid = '';
      let binCodeDisplay = targetStr;

      // 1. Check if targetStr is a valid UUID in availableBins or regex
      if (isUUID(targetStr)) {
        binUuid = targetStr;
        const bObj = availableBins.find((b) => b.id === targetStr);
        if (bObj) binCodeDisplay = bObj.binCode;
      } else {
        // 2. Try match by binCode text (e.g. "A-01-01")
        const matchedByCode = availableBins.find(
          (b) => b.binCode.toLowerCase() === targetStr.toLowerCase()
        );
        if (matchedByCode && isUUID(matchedByCode.id)) {
          binUuid = matchedByCode.id;
          binCodeDisplay = matchedByCode.binCode;
        } else {
          // 3. Fallback: match any bin in selectedItem.warehouseId
          const whId = selectedItem.warehouseId;
          const whBin = availableBins.find((b) => (b.warehouseId === whId || b.id === whId) && isUUID(b.id));
          if (whBin) {
            binUuid = whBin.id;
          }
        }
      }

      if (!binUuid || !isUUID(binUuid)) {
        showToast(
          isEn
            ? `Bin location "${targetStr}" was not found. Please click "Find Bin" to select a valid shelf.`
            : `ไม่พบตำแหน่งชั้นวาง "${targetStr}" ในคลังสินค้า กรุณากดปุ่ม "ค้นหา Bin" เพื่อเลือกชั้นวางที่มีอยู่จริง`
        );
        return;
      }

      resolvedAllocations.push({
        binId: binUuid,
        binCode: binCodeDisplay,
        quantity: alloc.quantity,
      });
    }

    if (resolvedAllocations.length === 0) {
      showToast(isEn ? 'Please specify at least one valid Bin and Quantity.' : 'กรุณาระบุตำแหน่ง Bin และจำนวนอย่างน้อย 1 รายการ');
      return;
    }

    const totalAllocatedQty = resolvedAllocations.reduce((sum, a) => sum + a.quantity, 0);
    if (totalAllocatedQty > selectedItem.remainingQuantity) {
      showToast(
        isEn
          ? `Total quantity (${totalAllocatedQty}) cannot exceed remaining staged quantity (${selectedItem.remainingQuantity}).`
          : `จำนวนรวมที่จัดเก็บ (${totalAllocatedQty} ชิ้น) เกินจำนวนที่ค้างรอจัดเก็บ (${selectedItem.remainingQuantity} ชิ้น)`
      );
      return;
    }

    setIsConfirming(true);
    try {
      // Loop confirm putaway for each resolved allocation row
      for (const alloc of resolvedAllocations) {
        await transactionService.confirmPutaway({
          goodsReceiptLineId: selectedItem.goodsReceiptLineId,
          binLocationId: alloc.binId,
          quantity: alloc.quantity,
        });
      }

      showToast(
        isEn
          ? `Successfully put away ${totalAllocatedQty} units across ${resolvedAllocations.length} shelf location(s)!`
          : `จัดเก็บสินค้า ${totalAllocatedQty} ชิ้น กระจาย ${resolvedAllocations.length} ชั้นวาง สำเร็จแล้ว!`
      );

      setSelectedItem(null);
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'จัดเก็บสินค้าไม่สำเร็จ';
      showToast(isEn ? `Error: ${msg}` : `เกิดข้อผิดพลาด: ${msg}`);
    } finally {
      setIsConfirming(false);
    }
  };

  // Filter staged items by search
  const filteredItems = stagedItems.filter((item) => {
    const q = (localSearch || searchQuery).toLowerCase().trim();
    if (!q) return true;
    return (
      item.receiptNumber?.toLowerCase().includes(q) ||
      item.productName?.toLowerCase().includes(q) ||
      item.sku?.toLowerCase().includes(q) ||
      item.lotNumber?.toLowerCase().includes(q)
    );
  });

  // Calculate Metrics
  const totalStagedUnits = stagedItems.reduce((acc, item) => acc + (Number(item.remainingQuantity) || 0), 0);
  const totalStagedLines = stagedItems.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[10000] p-4 rounded-2xl bg-emerald-600 text-white shadow-xl flex items-center gap-3 text-sm font-semibold animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Flexible Putaway Workflow
            </span>
          </div>
          <h2 className={`text-xl font-bold tracking-tight mt-1 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {isEn ? 'Putaway Staging Queue & Shelf Placement' : 'งานจัดเก็บสินค้าเข้าชั้นวาง (Putaway System)'}
          </h2>
          <p className={`text-[15px] font-normal mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {isEn
              ? 'Scan-to-confirm items from Receiving Staging Docks onto warehouse shelves with smart bin suggestions.'
              : 'จัดการคิวสินค้าที่พักอยู่จุดรับ Staging Dock แนะนำช่องว่าง และสแกนยืนยันนำขึ้นชั้นวางจริง'}
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isEn ? 'Refresh Queue' : 'รีเฟรชคิวงาน'}</span>
        </button>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-5 rounded-2xl border shadow-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
            <span>{isEn ? 'Staged SKUs' : 'รายการสินค้าที่พักอยู่'}</span>
            <Boxes className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalStagedLines.toLocaleString()} <span className="text-xs font-semibold text-slate-400">{isEn ? 'items' : 'รายการ'}</span>
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
            <span>{isEn ? 'Total Units Pending' : 'จำนวนชิ้นที่รอจัดเก็บ'}</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalStagedUnits.toLocaleString()} <span className="text-xs font-semibold text-slate-400">{isEn ? 'units' : 'ชิ้น'}</span>
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
            <span>{isEn ? 'Active Warehouses' : 'คลังสินค้าที่มีของค้างรับ'}</span>
            <Warehouse className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {warehousesList.length} <span className="text-xs font-semibold text-slate-400">{isEn ? 'locations' : 'แห่ง'}</span>
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
            <span>{isEn ? 'Placement Strategy' : 'กลยุทธ์การจัดเก็บ'}</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Soft Suggestion + Override</span>
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Warehouse Selector */}
          <div className="flex items-center gap-2 min-w-[240px]">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
              {isEn ? 'Warehouse:' : 'คลังสินค้า:'}
            </span>
            <div className="flex-1">
              <CustomSelect
                theme={theme}
                value={selectedWarehouseId}
                onChange={setSelectedWarehouseId}
                searchable={true}
                placeholder={isEn ? 'All Warehouses' : 'ทุกคลังสินค้า'}
                searchPlaceholder="ค้นหาคลังสินค้า..."
                options={[
                  { value: 'all', label: isEn ? 'All Warehouses' : 'ทุกคลังสินค้า (All)' },
                  ...warehousesList.map((wh) => ({
                    value: wh.warehouseId || wh.id,
                    label: wh.warehouseName || (wh as any).name || wh.id,
                  })),
                ]}
              />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={isEn ? 'Search GR No., SKU, Lot...' : 'ค้นหาเลข GR, SKU, ล็อต...'}
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none ${
              isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
            }`}
          />
        </div>
      </div>

      {/* Staged Items Queue Table */}
      <div
        className={`rounded-3xl border shadow-sm overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              {isEn ? 'Staged Items Awaiting Putaway' : 'คิวสินค้าที่พักอยู่จุดรับ Staging รอจัดเก็บ'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEn
                ? 'Select an item to scan or confirm shelf placement.'
                : 'เลือกรายการเพื่อสแกนหรือระบุชั้นวางนำขึ้นจัดเก็บจริง'}
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {filteredItems.length} {isEn ? 'lines' : 'รายการในคิว'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-3.5 px-4">{isEn ? 'GR Number' : 'เลขที่ใบรับเข้า'}</th>
                <th className="py-3.5 px-4">{isEn ? 'Product & SKU' : 'สินค้า / รหัส SKU'}</th>
                <th className="py-3.5 px-4">{isEn ? 'Lot & Expiry' : 'ล็อต / วันหมดอายุ'}</th>
                <th className="py-3.5 px-4">{isEn ? 'Staged Qty' : 'ยอดรอจัดเก็บ'}</th>
                <th className="py-3.5 px-4">{isEn ? 'Status' : 'สถานะ'}</th>
                <th className="py-3.5 px-4 text-right">{isEn ? 'Action' : 'การกระทำ'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                    <span>{isEn ? 'Loading staged items...' : 'กำลังดึงรายการสินค้าในคิว...'}</span>
                  </td>
                </tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.goodsReceiptLineId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {item.receiptNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 min-w-[280px]">
                      <div className="font-bold text-slate-900 dark:text-white whitespace-normal break-words leading-tight">
                        {item.productName}
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">
                        {item.sku}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                        {item.lotNumber || '-'}
                      </div>
                      {item.expiryDate && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>EXP: {new Date(item.expiryDate).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US')}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800">
                        {item.remainingQuantity.toLocaleString()} ชิ้น
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Staged (Dock)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenPutaway(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <span>{isEn ? 'Put Away' : 'นำขึ้นชั้นวาง'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      {isEn ? 'No pending staged items!' : 'ไม่มีสินค้าค้างที่จุด Staging (จัดเก็บขึ้นชั้นวางครบทั้งหมดแล้ว)'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {isEn ? 'When a 2-Step Goods Receipt is created, it will appear here.' : 'เมื่อมีการรับสินค้าแบบ 2-Step รายการจะมาปรากฏในคิวนี้'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Putaway Scan-to-Confirm Modal / Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 z-[10000] overflow-hidden bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="fixed inset-0 -z-10" onClick={() => setSelectedItem(null)} />

          <div
            className={`w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden relative z-10 transition animate-in zoom-in-95 duration-200 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/75 dark:bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs shrink-0">
                  <Barcode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {isEn ? 'Scan-to-Confirm Putaway' : 'ยืนยันการจัดเก็บเข้าชั้นวาง (Putaway)'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedItem.receiptNumber} • {selectedItem.sku}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <form onSubmit={handleConfirmPutaway} className="p-5 sm:p-6 space-y-5">
              {/* Item Info Summary Card */}
              <div
                className={`p-4 rounded-2xl border space-y-1.5 text-xs ${
                  isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {selectedItem.productName}
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>{isEn ? 'Total Staged Remaining:' : 'จำนวนที่ค้างรอจัดเก็บ:'}</span>
                  <strong className="text-amber-600 dark:text-amber-400 font-mono text-sm">{selectedItem.remainingQuantity} ชิ้น</strong>
                </div>
                {selectedItem.lotNumber && (
                  <div className="flex justify-between text-slate-500">
                    <span>{isEn ? 'Lot Number:' : 'หมายเลขล็อต:'}</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{selectedItem.lotNumber}</span>
                  </div>
                )}
              </div>

              {/* AI Smart Bin Helper */}
              <div
                className={`p-3.5 rounded-2xl border space-y-2 ${
                  isDark ? 'bg-blue-950/20 border-blue-900/40' : 'bg-blue-50/50 border-blue-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>{isEn ? 'AI Smart Bin Suggestion' : 'ตัวช่วยแนะนำช่องวางอัจฉริยะ'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleManualSuggestBin}
                    disabled={isSuggesting}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                  >
                    {isSuggesting ? (isEn ? 'Finding...' : 'กำลังค้นหา...') : (isEn ? 'Re-calculate' : 'คำนวณใหม่')}
                  </button>
                </div>

                {suggestedBin ? (
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-600 dark:text-slate-400">
                      {isEn ? 'Recommended Bin:' : 'ช่องที่แนะนำ:'}{' '}
                      <strong className="text-blue-600 dark:text-blue-400 font-mono text-sm">{suggestedBin.code}</strong>
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ ว่าง {suggestedBin.remainingCapacity || 0} ชิ้น
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isEn
                      ? 'Click calculate to find the optimal empty shelf by capacity and category.'
                      : 'กดคำนวณเพื่อค้นหาช่องวางที่เหมาะสมที่สุดตามหมวดหมู่และความจุ'}
                  </p>
                )}
              </div>

              {/* Multi-Bin Split Allocations Rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span>{isEn ? 'Destination Shelves (Multi-Bins Allocation) *' : 'ระบุตำแหน่งชั้นวางและกระจายจำนวน (Bin) *'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBinRow}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isEn ? '+ Split Bin' : '+ เพิ่มแถว Bin (กระจายจัดเก็บ)'}</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {binAllocations.map((alloc, idx) => (
                    <div
                      key={alloc.id}
                      className={`p-3 rounded-2xl border transition space-y-2 ${
                        isDark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Bin #{idx + 1}</span>
                        {binAllocations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBinRow(alloc.id)}
                            className="text-rose-500 hover:text-rose-700 transition p-0.5 cursor-pointer"
                            title="ลบแถวนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-12 gap-2 items-center">
                        {/* Qty Input */}
                        <div className="col-span-4">
                          <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">จำนวนชิ้น</label>
                          <input
                            type="number"
                            min="1"
                            max={selectedItem.remainingQuantity}
                            value={alloc.quantity}
                            onChange={(e) => handleUpdateBinRow(alloc.id, 'quantity', e.target.value)}
                            className={`w-full p-2 rounded-xl border text-xs font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none ${
                              isDark ? 'bg-slate-900 border-slate-700 text-blue-400' : 'bg-white border-slate-200'
                            }`}
                          />
                        </div>

                        {/* Bin Code Input & Find Button */}
                        <div className="col-span-8">
                          <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">ช่องชั้นวาง (Bin Code)</label>
                          <div className="flex items-center gap-1.5">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                value={alloc.binCode}
                                onChange={(e) => {
                                  handleUpdateBinRow(alloc.id, 'binId', e.target.value);
                                  handleUpdateBinRow(alloc.id, 'binCode', e.target.value);
                                }}
                                placeholder="เช่น A-01-01"
                                className={`w-full p-2 pl-8 rounded-xl border text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none ${
                                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'
                                }`}
                              />
                              <Barcode className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenBinSearchModal(alloc.id)}
                              className="px-2.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Search className="w-3.5 h-3.5" />
                              <span>ค้นหา</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Allocation Summary Card */}
              {(() => {
                const totalAllocated = binAllocations.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0);
                const isExact = totalAllocated === selectedItem.remainingQuantity;
                const isOver = totalAllocated > selectedItem.remainingQuantity;
                const isPartial = totalAllocated < selectedItem.remainingQuantity;

                return (
                  <div
                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between font-medium ${
                      isExact
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                        : isOver
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    <div>
                      <span>ยอดระบุจัดเก็บ: </span>
                      <strong className="font-mono text-sm">{totalAllocated} / {selectedItem.remainingQuantity} ชิ้น</strong>
                    </div>
                    <div>
                      {isExact && <span className="font-bold flex items-center gap-1"><Check className="w-4 h-4" /> จัดเก็บครบพอดี 100%</span>}
                      {isPartial && <span>⚠️ เหลือค้างคิวอีก {selectedItem.remainingQuantity - totalAllocated} ชิ้น</span>}
                      {isOver && <span className="font-bold">❌ เกินยอดที่ค้างในคิว!</span>}
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'ยกเลิก'}
                </button>
                <button
                  type="submit"
                  disabled={isConfirming}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isEn ? 'Confirming...' : 'กำลังบันทึก...'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{isEn ? 'Confirm All Placements' : 'ยืนยันนำขึ้นชั้นวางทั้งหมด'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bin Location Search & Selection Modal Popup */}
      {isBinSearchOpen && (
        <div className="fixed inset-0 z-[10050] overflow-hidden bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="fixed inset-0 -z-10" onClick={() => setIsBinSearchOpen(false)} />

          <div
            className={`w-full max-w-xl rounded-3xl shadow-2xl border overflow-hidden relative z-10 flex flex-col max-h-[85vh] transition animate-in zoom-in-95 duration-200 ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/75 dark:bg-slate-900/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {isEn ? 'Search Bin Location' : 'ค้นหาและเลือกตำแหน่งชั้นวาง (Bin)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isEn
                      ? 'Select an empty or available shelf to store items.'
                      : 'เลือกช่องชั้นวางในคลังสินค้าเพื่อนำสินค้าขึ้นจัดเก็บ'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBinSearchOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Filter */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 shrink-0">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={binSearchQuery}
                  onChange={(e) => setBinSearchQuery(e.target.value)}
                  placeholder={
                    isEn
                      ? 'Search by Bin code (e.g. A-01-01), Zone, Warehouse...'
                      : 'ค้นหาตามรหัส Bin (เช่น A-01-01), โซน, คลังสินค้า...'
                  }
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border focus:ring-2 focus:ring-blue-500 outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                  }`}
                />
              </div>
            </div>

            {/* Bins List Body */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 max-h-[420px]">
              {isLoadingBins ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                  <span>{isEn ? 'Loading available bins...' : 'กำลังโหลดรายการชั้นวางในคลัง...'}</span>
                </div>
              ) : (
                (() => {
                  const filteredBins = availableBins.filter((b) => {
                    const q = binSearchQuery.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      (b.binCode && b.binCode.toLowerCase().includes(q)) ||
                      (b.warehouseName && b.warehouseName.toLowerCase().includes(q)) ||
                      (b.zone && b.zone.toLowerCase().includes(q)) ||
                      (b.rack && b.rack.toLowerCase().includes(q))
                    );
                  });

                  if (filteredBins.length === 0) {
                    return (
                      <div className="py-12 text-center text-slate-400">
                        <Boxes className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                        <p className="font-semibold text-slate-600 dark:text-slate-300">
                          {isEn ? 'No matching bins found.' : 'ไม่พบรายการชั้นวางตามคำค้นหา'}
                        </p>
                      </div>
                    );
                  }

                  return filteredBins.map((bin) => {
                    return (
                      <div
                        key={bin.id}
                        className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          isDark
                            ? 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-mono font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{bin.binCode}</span>
                              <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                โซน {bin.zone || 'A'} • ล็อก {bin.rack || '01'} • ชั้น {bin.shelf || '1'}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {bin.warehouseName}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (activeAllocId) {
                              handleUpdateBinRow(activeAllocId, 'binId', bin.id || bin.binCode);
                              handleUpdateBinRow(activeAllocId, 'binCode', bin.binCode);
                            }
                            setIsBinSearchOpen(false);
                            showToast(
                              isEn
                                ? `Selected Bin Location: ${bin.binCode}`
                                : `เลือกตำแหน่งชั้นวาง: ${bin.binCode} เรียบร้อยแล้ว`
                            );
                          }}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition shrink-0 cursor-pointer"
                        >
                          {isEn ? 'Select Bin' : 'เลือกตำแหน่งนี้'}
                        </button>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/90 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsBinSearchOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {isEn ? 'Close' : 'ปิด'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
