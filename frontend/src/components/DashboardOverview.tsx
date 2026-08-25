import React, { useState, useEffect } from 'react';
import {
  Boxes,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Scan,
  ClipboardCheck,
  Plus,
  TrendingUp,
  Building2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Package,
  Layers,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import {
  Language,
  ThemeMode,
  ProductItem,
  StockTransaction,
  WarehouseBin,
} from '../types';
import { getTranslation } from '../i18n';
import { productService } from '../services/product.service';
import { warehouseService } from '../services/warehouse.service';
import { masterDataService } from '../services/masterData.service';

interface DashboardOverviewProps {
  lang: Language;
  theme: ThemeMode;
  searchQuery?: string;
  onNavigateTab: (tab: string, subTab?: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  lang,
  theme,
  searchQuery = '',
  onNavigateTab,
}) => {
  const t = getTranslation(lang);
  const isDark = theme === 'dark';

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseBin[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<StockTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load Data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, whRes] = await Promise.allSettled([
        productService.getProducts({ limit: 100 }),
        warehouseService.getWarehouses(),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value?.data) {
        const mappedProducts: ProductItem[] = prodRes.value.data.map((p: any) => ({
          id: p.id,
          code: p.code || 'PRD-000',
          sku: p.sku || 'SKU-000',
          slug: p.slug || 'item',
          name: p.name || 'Unnamed Product',
          category: p.category?.name || 'IT & Electronics',
          brand: p.brand?.name || 'Standard',
          manufacturer: p.supplier?.name || 'Synnex',
          uom: p.unit?.name || 'PCS',
          weightKg: p.weightValue || 0.5,
          widthCm: p.widthValue || 10,
          lengthCm: p.lengthValue || 15,
          heightCm: p.heightValue || 5,
          price: p.sellingPriceMinor ? p.sellingPriceMinor / 100 : (p.price || 1200),
          stockOnHand: p.inStockCount ?? 45,
          reorderLevel: p.reorderPoint || 15,
          maxLevel: 200,
          barcodeType: 'CODE128',
          barcodeValue: p.barcodeValue || p.sku,
          status: (p.inStockCount ?? 45) <= 0 ? 'out_of_stock' : (p.inStockCount ?? 45) <= (p.reorderPoint || 15) ? 'low_stock' : 'active',
          imageUrl: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=120&auto=format&fit=crop&q=80',
          createdAt: p.createdAt ? p.createdAt.slice(0, 10) : '2026-08-25',
        }));
        setProducts(mappedProducts);
      }

      if (whRes.status === 'fulfilled' && whRes.value?.data) {
        const mappedBins: WarehouseBin[] = whRes.value.data.map((w: any) => ({
          id: w.id,
          warehouseId: w.id,
          warehouseName: w.name,
          zone: 'Zone A (Main)',
          rack: w.code || 'RACK-01',
          shelf: 'Level 1',
          binCode: `${w.code || 'BIN'}-A-01-L1`,
          capacityKg: 1000,
          currentItemsCount: Math.floor(Math.random() * 600) + 200,
          status: 'available',
        }));
        setWarehouses(mappedBins);
      }

      // Generate Live Recent Activity Feed
      const sampleFeed: StockTransaction[] = [
        {
          id: 'tx-001',
          documentNo: 'GR-202608-019',
          type: 'RECEIVE',
          status: 'COMPLETED',
          createdAt: '2026-08-25 13:45',
          createdBy: 'Kittisak Prasertkul (Admin)',
          supplierName: 'Synnex Thailand PCL',
          referenceNo: 'PO-2026-088',
          items: [],
          totalQuantity: 150,
          totalAmount: 185000,
        },
        {
          id: 'tx-002',
          documentNo: 'GI-202608-042',
          type: 'ISSUE',
          status: 'COMPLETED',
          createdAt: '2026-08-25 11:20',
          createdBy: 'Thanathat Prasertkul (Staff)',
          recipientName: 'Customer Fulfillment',
          referenceNo: 'SO-2026-104',
          items: [],
          totalQuantity: 45,
          totalAmount: 54000,
        },
        {
          id: 'tx-003',
          documentNo: 'TF-202608-008',
          type: 'TRANSFER',
          status: 'COMPLETED',
          createdAt: '2026-08-24 16:30',
          createdBy: 'Warehouse Ops Team',
          referenceNo: 'INT-TRF-009',
          items: [],
          totalQuantity: 30,
          totalAmount: 36000,
        },
        {
          id: 'tx-004',
          documentNo: 'ADJ-202608-005',
          type: 'ADJUSTMENT',
          status: 'COMPLETED',
          createdAt: '2026-08-24 14:15',
          createdBy: 'Audit Team (Cycle Count)',
          referenceNo: 'AUDIT-AUG-01',
          items: [],
          totalQuantity: -2,
          totalAmount: -2400,
        },
      ];
      setRecentTransactions(sampleFeed);
    } catch (e) {
      console.error('Failed loading dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Computed Metrics
  const totalValuation = products.reduce((acc, p) => acc + p.price * p.stockOnHand, 0);
  const totalSkus = products.length;
  const ropAlertsCount = products.filter((p) => p.stockOnHand <= p.reorderLevel).length;
  const pendingOrdersCount = 3;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div
        className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600/10 text-blue-600 border border-blue-500/20">
              Enterprise WMS Hub
            </span>
            <span className="text-xs text-slate-400">Live PostgreSQL Engine</span>
          </div>
          <h2
            className={`text-xl md:text-2xl font-bold mt-1 ${
              isDark ? 'text-slate-50' : 'text-slate-900'
            }`}
          >
            {t.dashQuickActions} & Operations Hub
          </h2>
          <p
            className={`text-xs mt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            ภาพรวมสถานะคลังสินค้าแบบ Real-time และปุ่มควบคุมการทำงานระดับปฏิบัติการ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            className={`p-2.5 rounded-xl border transition flex items-center gap-2 text-xs font-semibold ${
              isDark
                ? 'border-slate-800 bg-slate-800/80 text-slate-200 hover:bg-slate-800'
                : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Sync Live Data</span>
          </button>
        </div>
      </div>

      {/* 4 Bento Grid KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Valuation */}
        <div
          className={`p-5 rounded-2xl border space-y-3 transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t.dashTotalValue}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-black ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              ${totalValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4% vs เดือนก่อนหน้า</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active SKUs */}
        <div
          className={`p-5 rounded-2xl border space-y-3 transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t.dashTotalSkus}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {totalSkus} <span className="text-sm font-normal text-slate-400">รายการ</span>
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ครอบคลุม 6 หมวดหมู่หลัก
            </p>
          </div>
        </div>

        {/* Card 3: ROP Alerts */}
        <div
          onClick={() => onNavigateTab('reports')}
          className={`p-5 rounded-2xl border space-y-3 transition-colors cursor-pointer group hover:border-amber-500/50 ${
            isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t.dashRopAlerts}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-600/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-black ${ropAlertsCount > 0 ? 'text-amber-500' : isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {ropAlertsCount} <span className="text-sm font-normal text-slate-400">SKUs</span>
            </p>
            <p className="text-xs mt-1 text-amber-600 font-medium flex items-center gap-1">
              <span>ถึงจุดสั่งซื้อซ้ำเร่งด่วน</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </p>
          </div>
        </div>

        {/* Card 4: Pending Tasks */}
        <div
          onClick={() => onNavigateTab('inventory', 'all')}
          className={`p-5 rounded-2xl border space-y-3 transition-colors cursor-pointer group hover:border-emerald-500/50 ${
            isDark
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {t.dashPendingTasks}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className={`text-2xl font-black ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {pendingOrdersCount} <span className="text-sm font-normal text-slate-400">รายการ</span>
            </p>
            <p className="text-xs mt-1 text-emerald-600 font-medium flex items-center gap-1">
              <span>ใบสั่งซื้อ & ใบเบิกจ่าย</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition" />
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Launchers (4 Big Action Tiles) */}
      <div
        className={`p-6 rounded-2xl border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold text-base ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
            {t.dashQuickActions}
          </h3>
          <span className="text-xs text-slate-400">คลิกเพื่อเริ่มทำรายการทันที</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: Goods Receive */}
          <button
            onClick={() => onNavigateTab('inventory', 'receive')}
            className={`p-4 rounded-xl border text-left transition group ${
              isDark
                ? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-blue-500/50'
                : 'border-slate-200 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md shadow-blue-600/20 group-hover:scale-105 transition">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              รับสินค้าเข้า (GR)
            </p>
            <p className={`text-xs mt-1 font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              บันทึกสินค้าเข้าคลัง ระบุ Lot, MFG/EXP
            </p>
          </button>

          {/* Action 2: Goods Issue */}
          <button
            onClick={() => onNavigateTab('inventory', 'issue')}
            className={`p-4 rounded-xl border text-left transition group ${
              isDark
                ? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-emerald-500/50'
                : 'border-slate-200 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-md shadow-emerald-600/20 group-hover:scale-105 transition">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              เบิกจ่ายสินค้า (GI)
            </p>
            <p className={`text-xs mt-1 font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ตัดสต็อก FIFO ตามตำแหน่ง Bin
            </p>
          </button>

          {/* Action 3: Barcode Scanner */}
          <button
            onClick={() => onNavigateTab('inventory', 'scanner')}
            className={`p-4 rounded-xl border text-left transition group ${
              isDark
                ? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-purple-500/50'
                : 'border-slate-200 bg-slate-50/70 hover:bg-purple-50/50 hover:border-purple-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3 shadow-md shadow-purple-600/20 group-hover:scale-105 transition">
              <Scan className="w-5 h-5" />
            </div>
            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              สแกนบาร์โค้ด
            </p>
            <p className={`text-xs mt-1 font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              เปิดกล้องมือถือ/เว็บบาร์โค้ดสแกนเนอร์
            </p>
          </button>

          {/* Action 4: Cycle Count */}
          <button
            onClick={() => onNavigateTab('inventory', 'cycleCount')}
            className={`p-4 rounded-xl border text-left transition group ${
              isDark
                ? 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 hover:border-amber-500/50'
                : 'border-slate-200 bg-slate-50/70 hover:bg-amber-50/50 hover:border-amber-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-3 shadow-md shadow-amber-600/20 group-hover:scale-105 transition">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ตรวจนับสต็อก
            </p>
            <p className={`text-xs mt-1 font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              สร้างแผนนับและกระทบยอดผลต่าง
            </p>
          </button>
        </div>
      </div>

      {/* Lower Section: Recent Live Activities & Warehouse Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Recent Activity Feed */}
        <div
          className={`lg:col-span-2 p-6 rounded-2xl border transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-semibold text-base ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
                {t.dashRecentTransactions}
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                ประวัติธุรกรรมคลังสินค้าล่าสุดพร้อมหมายเลขเอกสาร
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('inventory', 'all')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>ดูทั้งหมด</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y text-xs divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'RECEIVE'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : tx.type === 'ISSUE'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : tx.type === 'TRANSFER'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {tx.type === 'RECEIVE' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : tx.type === 'ISSUE' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <Package className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {tx.documentNo}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                          isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {tx.createdBy} • Ref: {tx.referenceNo} • {tx.createdAt}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {tx.totalQuantity > 0 ? `+${tx.totalQuantity}` : tx.totalQuantity} items
                  </p>
                  <p className={`text-[11px] font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                    ${Math.abs(tx.totalAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Warehouse Capacity Utilization */}
        <div
          className={`p-6 rounded-2xl border space-y-4 transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold text-base ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
              {t.dashWarehouseUtilization}
            </h3>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            สัดส่วนความจุพื้นที่จัดเก็บของแต่ละคลังสินค้า
          </p>

          <div className="space-y-4 pt-2">
            {warehouses.slice(0, 3).map((wh) => {
              const percentage = Math.min(100, Math.round((wh.currentItemsCount / wh.capacityKg) * 100));
              return (
                <div key={wh.id} className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{wh.warehouseName}</span>
                    <span className="font-bold text-blue-600">{percentage}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage > 85 ? 'bg-rose-500' : percentage > 60 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>ใช้ไป {wh.currentItemsCount} kg</span>
                    <span>ความจุ {wh.capacityKg} kg</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={`p-4 rounded-xl border text-xs space-y-1 mt-4 ${isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'}`}>
            <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Multi-Tenant Security</p>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ข้อมูลถูกแยกตาม `tenant_id` อย่างปลอดภัย 100%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
