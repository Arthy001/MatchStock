import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Warehouse,
  Package,
  Barcode,
  RefreshCw,
  QrCode,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Boxes,
} from 'lucide-react';
import {
  ThemeMode,
  Language,
  StockBalanceItem,
  StockLookupResponse,
  WarehouseBin,
} from '../types';
import { transactionService } from '../services/transaction.service';
import { warehouseService } from '../services/warehouse.service';
import { CustomSelect } from './common/CustomSelect';

interface StockBalancesViewProps {
  theme: ThemeMode;
  lang: Language;
  searchQuery?: string;
}

export const StockBalancesView: React.FC<StockBalancesViewProps> = ({
  theme,
  lang,
  searchQuery = '',
}) => {
  const isDark = theme === 'dark';
  const isEn = lang === 'en';

  const [activeTab, setActiveTab] = useState<'balances' | 'lookup'>('balances');
  const [balances, setBalances] = useState<StockBalanceItem[]>([]);
  const [warehousesList, setWarehousesList] = useState<WarehouseBin[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('all');
  const [localSearch, setLocalSearch] = useState<string>(searchQuery);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Lookup State
  const [lookupQuery, setLookupQuery] = useState<string>('DEMO-SKU-001');
  const [lookupResult, setLookupResult] = useState<StockLookupResponse | null>(null);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    loadBalances();
  }, [selectedWarehouseId]);

  const loadBalances = async () => {
    setIsLoading(true);
    try {
      const [balRes, whRes] = await Promise.all([
        transactionService.getStockBalances({
          warehouseId: selectedWarehouseId !== 'all' ? selectedWarehouseId : undefined,
          limit: 100,
        }),
        warehouseService.getWarehouses(),
      ]);
      setBalances(balRes.data || []);
      setWarehousesList(whRes.data || whRes || []);
    } catch (e) {
      console.error('Failed to load stock balances:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);
    try {
      const res = await transactionService.lookupStock(lookupQuery.trim());
      if (res) {
        setLookupResult(res);
      } else {
        setLookupResult(null);
        setLookupError(
          isEn
            ? `No product found matching code: "${lookupQuery}"`
            : `ไม่พบข้อมูลสินค้าสำหรับรหัส: "${lookupQuery}"`
        );
      }
    } catch {
      setLookupError(
        isEn
          ? 'Failed to lookup stock. Please check the code.'
          : 'เกิดข้อผิดพลาดในการค้นหาสินค้า กรุณาตรวจสอบรหัส'
      );
    } finally {
      setIsLookingUp(false);
    }
  };

  const filteredBalances = balances.filter((b) => {
    const q = (localSearch || searchQuery).toLowerCase().trim();
    if (!q) return true;
    const pName = (b.productName || (b as any).product?.name || '').toLowerCase();
    const sku = (b.sku || (b as any).product?.sku || (b as any).product?.code || '').toLowerCase();
    const bin = (b.binCode || (b as any).binLocation?.code || '').toLowerCase();
    const whName = (b.warehouseName || (b as any).warehouse?.name || '').toLowerCase();
    const zone = ((b as any).binLocation?.zoneName || (b as any).zone || '').toLowerCase();
    const rack = ((b as any).binLocation?.rack || (b as any).rack || '').toLowerCase();
    const shelf = ((b as any).binLocation?.shelf || (b as any).shelf || '').toLowerCase();
    const lot = (b.lotNumber || '').toLowerCase();
    return (
      pName.includes(q) ||
      sku.includes(q) ||
      bin.includes(q) ||
      whName.includes(q) ||
      zone.includes(q) ||
      rack.includes(q) ||
      shelf.includes(q) ||
      lot.includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Real-time Ledger
            </span>
          </div>
          <h2 className={`text-xl font-bold tracking-tight mt-1 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {isEn ? 'Stock Balances & Universal Scanner Lookup' : 'ยอดคงเหลือสินค้าคงคลัง & ค้นหาพิกัดชั้นวาง'}
          </h2>
          <p className={`text-[15px] font-normal mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {isEn
              ? 'Query exact quantities on hand, reserved, and available across all warehouses and bin locations.'
              : 'ตรวจสอบยอดคงเหลือจริง ยอดจอง และยอดพร้อมใช้ แยกตามคลังและชั้นวาง พร้อมระบบค้นหาด่วน'}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('balances')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'balances'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isEn ? 'Balances Table' : 'ตารางยอดคงเหลือ'}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('lookup');
              if (!lookupResult) handleLookup();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'lookup'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>{isEn ? 'Universal Lookup' : 'สแกนค้นหาด่วน'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Stock Balances Table */}
      {activeTab === 'balances' && (
        <div className="space-y-4">
          {/* Filters */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
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

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder={isEn ? 'Search item, SKU, bin...' : 'ค้นหาสินค้า, SKU, ชั้นวาง...'}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <button
                onClick={loadBalances}
                disabled={isLoading}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div
            className={`rounded-3xl border shadow-sm overflow-hidden ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                    <th className="py-3.5 px-4">{isEn ? 'Product & SKU' : 'สินค้า / รหัส SKU'}</th>
                    <th className="py-3.5 px-4">{isEn ? 'Warehouse & Bin' : 'คลัง & ตำแหน่งชั้นวาง'}</th>
                    <th className="py-3.5 px-4">{isEn ? 'Lot / Expiry' : 'ล็อต / วันหมดอายุ'}</th>
                    <th className="py-3.5 px-4 text-right">{isEn ? 'On Hand' : 'คงเหลือจริง'}</th>
                    <th className="py-3.5 px-4 text-right">{isEn ? 'Reserved' : 'ยอดจอง'}</th>
                    <th className="py-3.5 px-4 text-right">{isEn ? 'Available' : 'พร้อมใช้'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-xs sm:text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                        <span>{isEn ? 'Loading balances...' : 'กำลังดึงยอดสต็อกคงเหลือ...'}</span>
                      </td>
                    </tr>
                  ) : filteredBalances.length > 0 ? (
                    filteredBalances.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 min-w-[280px]">
                          <div className="font-bold text-slate-900 dark:text-white whitespace-normal break-words leading-tight">
                            {item.productName || (item as any).product?.name || (isEn ? 'Unnamed Product' : 'ไม่ระบุชื่อสินค้า')}
                          </div>
                          <div className="text-xs font-mono text-slate-400 mt-0.5">
                            {item.sku || (item as any).product?.sku || (item as any).product?.code || '-'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {item.warehouseName || (item as any).warehouse?.name || warehousesList.find((w) => (w.warehouseId || w.id) === item.warehouseId)?.warehouseName || (isEn ? 'Main Warehouse' : 'คลังสินค้าหลัก')}
                          </div>
                          <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5 flex items-center gap-1 flex-wrap">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{item.binCode || (item as any).binLocation?.code || (isEn ? 'Staging Dock' : 'จุดพัก Staging')}</span>
                            {Boolean((item as any).binLocation?.zoneName || (item as any).binLocation?.rack || (item as any).binLocation?.shelf) && (
                              <span className="text-[10px] font-normal text-slate-400 font-sans ml-1">
                                ({[(item as any).binLocation?.zoneName, (item as any).binLocation?.rack ? `R:${(item as any).binLocation.rack}` : null, (item as any).binLocation?.shelf ? `L:${(item as any).binLocation.shelf}` : null].filter(Boolean).join(' / ')})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-xs text-slate-700 dark:text-slate-300 font-mono font-semibold">
                            {item.lotNumber || '-'}
                          </div>
                          {item.expiryDate && (
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(item.expiryDate).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US')}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                          {Number(item.quantityOnHand ?? (item as any).onHand ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-amber-600 dark:text-amber-400">
                          {Number(item.quantityReserved ?? (item as any).reserved ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          {Number(item.availableQuantity ?? (item as any).available ?? ((item.quantityOnHand ?? 0) - (item.quantityReserved ?? 0))).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        {isEn ? 'No stock balance records found.' : 'ไม่พบข้อมูลยอดสต็อกคงเหลือ'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Universal Scanner Lookup */}
      {activeTab === 'lookup' && (
        <div className="space-y-6">
          {/* Big Search Bar */}
          <div
            className={`p-6 rounded-3xl border shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <form onSubmit={handleLookup} className="space-y-3">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Barcode className="w-4 h-4 text-blue-600" />
                <span>{isEn ? 'Universal Stock Scanner Lookup' : 'สแกนค้นหาสินค้าด่วน (Universal Lookup)'}</span>
              </label>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <QrCode className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600" />
                  <input
                    type="text"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    placeholder={
                      isEn
                        ? 'Scan or enter Barcode, SKU, Product Code, or RFID Tag...'
                        : 'ยิงบาร์โค้ด หรือพิมพ์ SKU, รหัสสินค้า, หรือ RFID Tag...'
                    }
                    className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLookingUp}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isLookingUp ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>{isEn ? 'Search' : 'ค้นหา'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{isEn ? 'Quick test codes:' : 'ตัวอย่างรหัสทดสอบ:'}</span>
                {['DEMO-SKU-001', '8851234567890', 'LOGI-MX3S-GRY'].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      setLookupQuery(code);
                    }}
                    className="underline hover:text-blue-500 cursor-pointer font-mono"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </form>
          </div>

          {lookupError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{lookupError}</span>
            </div>
          )}

          {/* Lookup Result Display */}
          {lookupResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Product Header Card */}
              <div
                className={`p-6 rounded-3xl border shadow-sm ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase font-mono">
                      {lookupResult.sku}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {lookupResult.name}
                    </h3>
                    {lookupResult.barcodeValue && (
                      <p className="text-xs font-mono text-slate-400 mt-1 flex items-center gap-1.5">
                        <Barcode className="w-4 h-4" />
                        <span>{lookupResult.barcodeValue}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                    <div className="text-center px-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">{isEn ? 'On Hand' : 'คงเหลือ'}</span>
                      <strong className="text-lg font-black text-slate-900 dark:text-white">{lookupResult.totalOnHand.toLocaleString()}</strong>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                    <div className="text-center px-2">
                      <span className="text-[10px] font-bold uppercase text-amber-500 block">{isEn ? 'Reserved' : 'ยอดจอง'}</span>
                      <strong className="text-lg font-black text-amber-600 dark:text-amber-400">{lookupResult.totalReserved.toLocaleString()}</strong>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                    <div className="text-center px-2">
                      <span className="text-[10px] font-bold uppercase text-emerald-500 block">{isEn ? 'Available' : 'พร้อมใช้'}</span>
                      <strong className="text-lg font-black text-emerald-600 dark:text-emerald-400">{lookupResult.totalAvailable.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shelf Locations Table */}
              <div
                className={`rounded-3xl border shadow-sm overflow-hidden ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>{isEn ? 'Warehouse & Shelf Locations' : 'พิกัดชั้นวางที่สินค้านี้จัดเก็บอยู่ทั้งหมด'}</span>
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                        <th className="py-3 px-4">{isEn ? 'Warehouse' : 'คลังสินค้า'}</th>
                        <th className="py-3 px-4">{isEn ? 'Bin Location' : 'ตำแหน่งชั้นวาง (Bin)'}</th>
                        <th className="py-3 px-4">{isEn ? 'Lot Number' : 'หมายเลขล็อต'}</th>
                        <th className="py-3 px-4">{isEn ? 'Expiry Date' : 'วันหมดอายุ'}</th>
                        <th className="py-3 px-4 text-right">{isEn ? 'Quantity' : 'จำนวน'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-xs sm:text-sm">
                      {lookupResult.locations && lookupResult.locations.length > 0 ? (
                        lookupResult.locations.map((loc, i) => (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                              {loc.warehouseName || (loc as any).warehouse?.name || warehousesList.find((w) => (w.warehouseId || w.id) === loc.warehouseId)?.warehouseName || (isEn ? 'Main Warehouse' : 'คลังสินค้าหลัก')}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                                {loc.binCode || (loc as any).binLocation?.code || (isEn ? 'Staging Dock' : 'จุดพัก Staging')}
                              </span>
                              {Boolean((loc as any).binLocation?.zoneName || (loc as any).binLocation?.rack || (loc as any).binLocation?.shelf) && (
                                <span className="text-[10px] font-normal text-slate-400 font-sans ml-1.5">
                                  ({[(loc as any).binLocation?.zoneName, (loc as any).binLocation?.rack ? `R:${(loc as any).binLocation.rack}` : null, (loc as any).binLocation?.shelf ? `L:${(loc as any).binLocation.shelf}` : null].filter(Boolean).join(' / ')})
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                              {loc.lotNumber || '-'}
                            </td>
                            <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                              {loc.expiryDate
                                ? new Date(loc.expiryDate).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US')
                                : '-'}
                            </td>
                            <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white text-sm">
                              {loc.quantity.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            {isEn ? 'No location records found.' : 'ไม่พบข้อมูลตำแหน่งจัดเก็บ'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
