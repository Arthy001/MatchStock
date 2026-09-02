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
  const [putawayQty, setPutawayQty] = useState<number>(1);
  const [targetBinId, setTargetBinId] = useState<string>('');
  const [suggestedBin, setSuggestedBin] = useState<SuggestedBin | null>(null);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedWarehouseId]);

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
      setWarehousesList(whRes.data || whRes || []);
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

  // Open Putaway Confirm Drawer
  const handleOpenPutaway = async (item: StagedGoodsReceiptItem) => {
    setSelectedItem(item);
    setPutawayQty(item.remainingQuantity);
    setTargetBinId(item.suggestedBinLocationId || '');
    setSuggestedBin(null);

    // Auto-fetch Suggest Bin helper if warehouse is known
    const whId = item.warehouseId || warehousesList[0]?.warehouseId || warehousesList[0]?.id;
    if (whId) {
      setIsSuggesting(true);
      try {
        const suggestion = await transactionService.getSuggestedBin(whId, item.remainingQuantity);
        if (suggestion) {
          setSuggestedBin(suggestion);
          setTargetBinId(suggestion.id);
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

    setIsSuggesting(true);
    try {
      const suggestion = await transactionService.getSuggestedBin(whId, putawayQty);
      if (suggestion) {
        setSuggestedBin(suggestion);
        setTargetBinId(suggestion.id);
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

  const handleConfirmPutaway = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (!targetBinId) {
      showToast(isEn ? 'Please select or scan a destination Bin.' : 'กรุณาระบุหรือสแกนตำแหน่ง Bin ปลายทาง');
      return;
    }

    if (putawayQty <= 0 || putawayQty > selectedItem.remainingQuantity) {
      showToast(
        isEn
          ? `Quantity must be between 1 and ${selectedItem.remainingQuantity}.`
          : `จำนวนจัดเก็บต้องอยู่ระหว่าง 1 ถึง ${selectedItem.remainingQuantity}`
      );
      return;
    }

    setIsConfirming(true);
    try {
      const res = await transactionService.confirmPutaway({
        goodsReceiptLineId: selectedItem.goodsReceiptLineId,
        binLocationId: targetBinId,
        quantity: putawayQty,
      });

      const isPartial = Boolean(res.remaining && res.remaining.quantity > 0);

      showToast(
        isEn
          ? `Successfully put away ${putawayQty} units! ${isPartial ? `(${res.remaining?.quantity} units remaining)` : '(Complete)'}`
          : `จัดเก็บสินค้า ${putawayQty} ชิ้นขึ้นชั้นวางสำเร็จ! ${isPartial ? `(เหลือค้างคิว ${res.remaining?.quantity} ชิ้น)` : '(ครบสมบูรณ์)'}`
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
              {isEn ? 'Warehouse:' : 'คลังสินค้า:'}
            </span>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className={`p-2 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
              }`}
            >
              <option value="all">{isEn ? 'All Warehouses' : 'ทุกคลังสินค้า'}</option>
              {warehousesList.map((wh) => (
                <option key={wh.id} value={wh.warehouseId || wh.id}>
                  {wh.warehouseName || (wh as any).name || wh.id}
                </option>
              ))}
            </select>
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
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.productName}
                      </div>
                      <div className="text-xs font-mono text-slate-400">
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
                  <strong className="text-amber-600 dark:text-amber-400">{selectedItem.remainingQuantity} ชิ้น</strong>
                </div>
                {selectedItem.lotNumber && (
                  <div className="flex justify-between text-slate-500">
                    <span>{isEn ? 'Lot Number:' : 'หมายเลขล็อต:'}</span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{selectedItem.lotNumber}</span>
                  </div>
                )}
              </div>

              {/* Quantity to Putaway (Allows Partial) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? 'Quantity to Place *' : 'จำนวนที่จะวางลงชั้นนี้ *'}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    (Max: {selectedItem.remainingQuantity})
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.remainingQuantity}
                  value={putawayQty}
                  onChange={(e) => setPutawayQty(parseInt(e.target.value) || 1)}
                  className={`w-full p-2.5 rounded-xl border text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-white border-slate-200'
                  }`}
                />
                {putawayQty < selectedItem.remainingQuantity && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
                    <Split className="w-3.5 h-3.5" />
                    <span>
                      {isEn
                        ? `Partial putaway: ${selectedItem.remainingQuantity - putawayQty} units will remain staged.`
                        : `แยกจัดเก็บ: จะเหลือค้างในคิวอีก ${selectedItem.remainingQuantity - putawayQty} ชิ้นเพื่อไปวางชั้นอื่น`}
                    </span>
                  </p>
                )}
              </div>

              {/* Intelligent Suggest Bin Helper */}
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

              {/* Destination Bin Selection / Scan Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isEn ? 'Destination Shelf (Bin Location) *' : 'สแกนหรือเลือกตำแหน่งชั้นวางจริง (Bin) *'}
                </label>
                <input
                  type="text"
                  value={targetBinId}
                  onChange={(e) => setTargetBinId(e.target.value)}
                  placeholder="e.g. A-01-01 หรือใส่ Bin UUID"
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                  }`}
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {isEn
                    ? 'Soft Suggestion: You can freely override and scan any valid bin barcode on the floor.'
                    : 'ระบบยืดหยุ่น: แม้มีคำแนะนำ แต่พนักงานสามารถสแกนบาร์โค้ดชั้นอื่นหน้างานจริงได้อิสระ'}
                </p>
              </div>

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
                      <span>{isEn ? 'Confirm Placement' : 'ยืนยันนำขึ้นชั้นวาง'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
