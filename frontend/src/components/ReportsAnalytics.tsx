import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  AlertTriangle,
  Layers,
  Building2,
  Calendar,
  Download,
  Printer,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  PieChart as PieIcon,
  ShoppingCart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Language, ThemeMode, ProductItem } from '../types';
import { getTranslation } from '../i18n';
import { productService } from '../services/product.service';
import { warehouseService } from '../services/warehouse.service';

interface ReportsAnalyticsProps {
  lang: Language;
  theme: ThemeMode;
  searchQuery?: string;
  onNavigateToPO?: () => void;
}

// Chart Colors
const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  lang,
  theme,
  searchQuery = '',
  onNavigateToPO,
}) => {
  const t = getTranslation(lang);
  const isDark = theme === 'dark';

  // States
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'30D' | '90D' | '6M' | '1Y'>('6M');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('ALL');

  // Load Products & Warehouses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, whRes] = await Promise.all([
          productService.getProducts({ limit: 100 }),
          warehouseService.getWarehouses(),
        ]);

        const prodList = prodRes.data || prodRes.items || (Array.isArray(prodRes) ? prodRes : []);
        const mappedProducts: ProductItem[] = prodList.map((p: any) => ({
          id: p.id,
          code: p.code || p.sku || 'N/A',
          sku: p.sku || p.code || 'N/A',
          slug: p.slug || '',
          name: p.name || 'Product',
          category: p.category?.name || p.categoryName || 'General',
          brand: p.brand?.name || p.brandName || 'Standard',
          manufacturer: p.manufacturer || 'Supplier Co.',
          uom: p.baseUnit?.name || p.uom || 'Unit',
          weightKg: p.weightKg || 0,
          widthCm: p.widthCm || 0,
          lengthCm: p.lengthCm || 0,
          heightCm: p.heightCm || 0,
          price: p.price || 1500,
          stockOnHand: p.stockOnHand ?? 90,
          reorderLevel: p.reorderPoint || 25,
          maxLevel: 500,
          barcodeType: 'CODE128',
          barcodeValue: p.barcode || p.sku || p.code,
          status: p.stockOnHand <= 20 ? 'low_stock' : 'active',
          imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&q=80',
          createdAt: p.createdAt || new Date().toISOString(),
        }));
        setProducts(mappedProducts);

        const whList = whRes.data || (Array.isArray(whRes) ? whRes : []);
        setWarehouses(whList);
      } catch (err) {
        console.error('Failed to load reports data:', err);
      }
    };

    fetchData();
  }, []);

  // 6-Month Inbound vs Outbound Trend Data
  const movementTrendData = [
    { month: 'มี.ค.', inbound: 1240, outbound: 980, net: 260 },
    { month: 'เม.ย.', inbound: 1450, outbound: 1320, net: 130 },
    { month: 'พ.ค.', inbound: 1890, outbound: 1650, net: 240 },
    { month: 'มิ.ย.', inbound: 2100, outbound: 1980, net: 120 },
    { month: 'ก.ค.', inbound: 2450, outbound: 2200, net: 250 },
    { month: 'ส.ค.', inbound: 2680, outbound: 2410, net: 270 },
  ];

  // Stock Valuation by Category
  const categoryValuationData = [
    { name: 'Bearings & Bushings', value: 450000, count: 24 },
    { name: 'Sensors & Automation', value: 380000, count: 18 },
    { name: 'Pneumatic Valves', value: 290000, count: 15 },
    { name: 'Mechanical Gears', value: 210000, count: 12 },
    { name: 'Fasteners & Bolts', value: 140000, count: 32 },
  ];

  // Top 5 Fast Moving SKUs
  const topMovingSKUs = [
    { name: 'SKU-001 (Bearing 6204)', velocity: 480, turnover: '6.2x' },
    { name: 'SKU-002 (Optic Sensor 24V)', velocity: 360, turnover: '5.4x' },
    { name: 'SKU-003 (Solenoid Valve 5/2)', velocity: 290, turnover: '4.8x' },
    { name: 'SKU-004 (Air Cylinder 32mm)', velocity: 220, turnover: '4.1x' },
    { name: 'SKU-005 (Linear Guide Block)', velocity: 180, turnover: '3.7x' },
  ];

  // Warehouse Capacity Utilization Data
  const warehouseCapacityData = [
    { name: 'WH-Bangkok Center (WH-01)', capacity: 10000, current: 8200, percent: 82 },
    { name: 'WH-Rayong EEC Logistics (WH-02)', capacity: 8000, current: 4600, percent: 57.5 },
    { name: 'WH-Chonburi Spare Parts (WH-03)', capacity: 5000, current: 1900, percent: 38 },
  ];

  // Calculations
  const totalStockValue = products.reduce((acc, curr) => acc + curr.stockOnHand * curr.price, 0) || 1470000;
  const totalStockUnits = products.reduce((acc, curr) => acc + curr.stockOnHand, 0) || 2850;
  const lowStockItems = products.filter((p) => p.stockOnHand <= p.reorderLevel);

  return (
    <div className="space-y-6">
      {/* Enterprise Title & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>
            รายงานและการวิเคราะห์สต็อกสินค้า (Inventory Reports & Analytics)
          </h2>
          <p className={`text-[15px] font-normal mt-0.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
            ศูนย์กลางการวิเคราะห์มูลค่าสินค้าคงคลัง, อัตราหมุนเวียน (Stock Turnover), และการใช้พื้นที่คลัง
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md p-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold">
            {(['30D', '90D', '6M', '1Y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-2.5 py-1 rounded-sm transition cursor-pointer ${
                  selectedTimeRange === range
                    ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[13px] font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์รายงาน</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-5 rounded-2xl border transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">มูลค่าสต็อกคงคลังรวม</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-2">
            ฿{totalStockValue.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4.2% จากไตรมาสก่อน</span>
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">อัตราหมุนเวียนสต็อก (Turnover)</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            5.2x <span className="text-xs font-medium text-slate-500">รอบ/ปี</span>
          </p>
          <div className="text-[11px] text-slate-500 mt-1">เกณฑ์ปกติระดับอุตสาหกรรม (Healthy)</div>
        </div>

        <div
          className={`p-5 rounded-2xl border transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">จำนวนสินค้าคงเหลือรวม</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-2">
            {totalStockUnits.toLocaleString()}{' '}
            <span className="text-xs font-medium text-slate-500">ชิ้น ({products.length} SKUs)</span>
          </p>
          <div className="text-[11px] text-slate-500 mt-1">กระจายใน 3 คลังสินค้า</div>
        </div>

        <div
          className={`p-5 rounded-2xl border transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">สินค้าใกล้หมดคลัง (ROP Alert)</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            {lowStockItems.length}{' '}
            <span className="text-xs font-medium text-slate-500">รายการ</span>
          </p>
          <div className="text-[11px] text-rose-600 font-semibold mt-1">ต้องการการสั่งซื้อเติมสต็อกด่วน</div>
        </div>
      </div>

      {/* Main Charts: Movement Trends & Category Share */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 6-Month Inbound vs Outbound Trend */}
        <div
          className={`lg:col-span-8 p-6 rounded-2xl border transition-all ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                แนวโน้มปริมาณการรับเข้า vs เบิกจ่าย (Inbound & Outbound Movement)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                เปรียบเทียบยอดรับเข้า (GR) และยอดเบิกจ่าย (GI) ตลอด 6 เดือนย้อนหลัง
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
              หน่วย: จำนวนชิ้น (Units)
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={movementTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="month" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  name="รับเข้าคลัง (Goods Receive)"
                  dataKey="inbound"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInbound)"
                />
                <Area
                  type="monotone"
                  name="เบิกจ่ายออก (Goods Issue)"
                  dataKey="outbound"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOutbound)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Category Valuation Share */}
        <div
          className={`lg:col-span-4 p-6 rounded-2xl border transition-all ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                สัดส่วนมูลค่าตามหมวดหมู่
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Stock Valuation by Category</p>
            </div>
            <PieIcon className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryValuationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryValuationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, 'มูลค่า']}
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Legend List */}
          <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {categoryValuationData.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                    {cat.name}
                  </span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                  ฿{cat.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warehouse Utilization & Fast-Moving SKUs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Warehouse Storage Capacity */}
        <div
          className={`lg:col-span-6 p-6 rounded-2xl border transition-all ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                อัตราการใช้พื้นที่คลังสินค้า (Capacity Utilization)
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {warehouseCapacityData.map((wh) => (
              <div
                key={wh.name}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{wh.name}</span>
                  <span
                    className={`font-bold font-mono ${
                      wh.percent > 80
                        ? 'text-rose-600'
                        : wh.percent > 50
                        ? 'text-blue-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {wh.percent}% ({wh.current.toLocaleString()}/{wh.capacity.toLocaleString()} Units)
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      wh.percent > 80 ? 'bg-rose-500' : wh.percent > 50 ? 'bg-blue-600' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${wh.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Top 5 Fast Moving SKUs */}
        <div
          className={`lg:col-span-6 p-6 rounded-2xl border transition-all ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                5 อันดับสินค้าเคลื่อนไหวเร็วสูงสุด (Top Fast-Moving SKUs)
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {topMovingSKUs.map((sku, idx) => (
              <div
                key={sku.name}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center font-mono text-[11px]">
                    #{idx + 1}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{sku.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {sku.velocity} ชิ้น/เดือน
                  </span>
                  <span className="ml-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    Turnover: {sku.turnover}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Reorder Alerts Table */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              แจ้งเตือนสินค้าถึงจุดสั่งซื้อซ้ำ (Reorder Point Alerts - Action Required)
            </h3>
          </div>
          <span className="text-xs text-rose-600 font-bold">
            {lowStockItems.length} รายการที่ต้องเปิด PO เติมสต็อก
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead
              className={`sticky top-0 ${
                theme === 'dark' ? 'bg-slate-800/90 text-slate-300' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <tr>
                <th className="py-3 px-3.5 font-semibold">รหัสสินค้า / SKU</th>
                <th className="py-3 px-3 font-semibold">ชื่อสินค้า</th>
                <th className="py-3 px-3 font-semibold">หมวดหมู่</th>
                <th className="py-3 px-3 font-semibold text-right">สต็อกปัจจุบัน</th>
                <th className="py-3 px-3 font-semibold text-right">จุดสั่งซื้อซ้ำ (ROP)</th>
                <th className="py-3 px-3 font-semibold text-right">แนะนำสั่งซื้อ</th>
                <th className="py-3 px-3.5 font-semibold text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.slice(0, 5).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {p.sku}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">{p.name}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{p.category}</td>
                  <td className="py-3 px-3 text-right font-bold text-rose-600">
                    {p.stockOnHand} {p.uom}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-600 dark:text-slate-400">
                    {p.reorderLevel} {p.uom}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-600">
                    +{p.maxLevel - p.stockOnHand} {p.uom}
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <button
                      onClick={onNavigateToPO}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-xs transition"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>เปิดใบสั่งซื้อ (PO)</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
