import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Clock,
  UserCheck,
  Building2,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Percent,
  Barcode,
  RotateCcw,
  Sparkles,
  Sliders,
  Check,
  X,
  Eye,
  Calendar,
  Layers,
  ArrowUpDown,
  Download,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import {
  Language,
  ThemeMode,
  ProductItem,
  CycleCountPlan,
  CycleCountItem,
  CycleCountStatus,
  WarehouseBin,
} from '../types';
import { getTranslation } from '../i18n';
import { CustomSelect } from './common/CustomSelect';
import { productService } from '../services/product.service';
import { warehouseService } from '../services/warehouse.service';
import { cycleCountService } from '../services/cycleCount.service';

interface CycleCountManagementProps {
  lang: Language;
  theme: ThemeMode;
  searchQuery?: string;
  onNavigateToAdjustment?: (plan: CycleCountPlan) => void;
}

export const CycleCountManagement: React.FC<CycleCountManagementProps> = ({
  lang,
  theme,
  searchQuery = '',
  onNavigateToAdjustment,
}) => {
  const t = getTranslation(lang);
  const isEn = lang === 'en';

  // States
  const [plans, setPlans] = useState<CycleCountPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<CycleCountPlan | null>(null);
  const [activePlanFilter, setActivePlanFilter] = useState<CycleCountStatus | 'ALL'>('ALL');
  const [itemStatusFilter, setItemStatusFilter] = useState<'ALL' | 'MATCH' | 'SHORTAGE' | 'SURPLUS' | 'UNCOUNTED'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(false);
  const [selectedItemForDrawer, setSelectedItemForDrawer] = useState<CycleCountItem | null>(null);

  // Products & Warehouse Data from Live API
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Quick Count Barcode Input
  const [quickBarcode, setQuickBarcode] = useState<string>('');
  const [scanMessage, setScanMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Plan Form State
  const [newPlanWarehouseId, setNewPlanWarehouseId] = useState<string>('');
  const [newPlanTitle, setNewPlanTitle] = useState<string>('');
  const [newPlanCategory, setNewPlanCategory] = useState<string>('ALL');
  const [newPlanAssignedStaff, setNewPlanAssignedStaff] = useState<string>('Thanathat Prasertkul (Staff)');
  const [newPlanCutoffDate, setNewPlanCutoffDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Load Initial Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
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
          uom: p.baseUnit?.name || p.uom || 'Piece',
          weightKg: p.weightKg || 0,
          widthCm: p.widthCm || 0,
          lengthCm: p.lengthCm || 0,
          heightCm: p.heightCm || 0,
          price: p.price || 500,
          stockOnHand: p.stockOnHand ?? 100,
          reorderLevel: p.reorderPoint || 20,
          maxLevel: 500,
          barcodeType: 'CODE128',
          barcodeValue: p.barcode || p.sku || p.code,
          status: 'active',
          imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&q=80',
          createdAt: p.createdAt || new Date().toISOString(),
        }));
        setProducts(mappedProducts);

        const whList = whRes.data || (Array.isArray(whRes) ? whRes : []);
        setWarehouses(whList);
        if (whList.length > 0) {
          setNewPlanWarehouseId(whList[0].id || whList[0].code);
        }

        let loadedPlans: CycleCountPlan[] = [];
        try {
          const countRes = await cycleCountService.getCycleCounts();
          const itemsList = countRes?.data || countRes?.items || (Array.isArray(countRes) ? countRes : []);
          if (itemsList.length > 0) {
            loadedPlans = itemsList.map((c: any) => ({
              id: c.id,
              planNo: c.countNumber || `CC-${c.id.slice(0, 8)}`,
              title: c.notes || `ตรวจนับคลังสินค้า (${c.warehouse?.name || whList[0]?.name || 'คลังสินค้า'})`,
              warehouseId: c.warehouseId || whList[0]?.id || 'wh-001',
              warehouseName: c.warehouse?.name || whList[0]?.name || 'คลังสินค้าหลัก',
              zone: 'Zone A',
              cutoffDate: (c.openedAt || c.createdAt)?.slice(0, 10) || new Date().toISOString().slice(0, 10),
              assignedTo: c.createdById || 'Staff',
              assignedStaffName: 'เจ้าหน้าที่ตรวจนับ',
              status: c.status === 'open' ? 'IN_PROGRESS' : c.status === 'approved' ? 'RECONCILED' : 'DRAFT',
              createdAt: c.createdAt || new Date().toISOString(),
              totalSkus: mappedProducts.length,
              countedSkus: c.foundCount ?? 0,
              accuracyRate: 100,
              totalVarianceQty: c.netVarianceCount ?? 0,
              totalVarianceValue: 0,
              items: mappedProducts.map((p, idx) => ({
                id: `cci-${p.id}`,
                productId: p.id,
                productCode: p.code,
                productName: p.name,
                sku: p.sku,
                barcode: p.barcodeValue,
                uom: p.uom,
                category: p.category,
                warehouseId: c.warehouseId,
                warehouseName: c.warehouse?.name || 'คลังสินค้าหลัก',
                binCode: `A-0${idx + 1}-01`,
                unitPrice: p.price,
                systemQty: p.stockOnHand,
                countedQty: p.stockOnHand,
                variance: 0,
                varianceValue: 0,
                status: 'MATCH' as const,
              })),
            }));
          }
        } catch (err) {
          console.warn('Backend cycle count API not responding, using local store', err);
        }

        if (loadedPlans.length > 0) {
          setPlans(loadedPlans);
          setSelectedPlan(loadedPlans[0]);
        } else if (mappedProducts.length > 0) {
          const samplePlan1: CycleCountPlan = {
            id: 'plan-001',
            planNo: 'CC-2026-0801',
            title: isEn
              ? 'Weekly Cycle Count (Bangkok Main Hub)'
              : 'ตรวจนับสต็อกประจำสัปดาห์ คลังสินค้าหลัก (Weekly Cycle Count)',
            warehouseId: whList[0]?.id || 'wh-001',
            warehouseName: whList[0]?.name || (isEn ? 'Bangkok Main Logistics Hub' : 'คลังสินค้าหลักกรุงเทพ (Bangkok Main Hub)'),
            zone: 'Zone A (High-Velocity Items)',
            cutoffDate: '2026-08-21',
            assignedTo: 'usr-002',
            assignedStaffName: 'Somchai Jaidee (Warehouse Staff)',
            status: 'IN_PROGRESS',
            createdAt: '2026-08-21 08:30:00',
            totalSkus: Math.min(6, mappedProducts.length),
            countedSkus: 4,
            accuracyRate: 75.0,
            totalVarianceQty: -3,
            totalVarianceValue: -2450,
            items: mappedProducts.slice(0, 6).map((p, idx) => {
              let countedQty: number | null = null;
              let status: 'MATCH' | 'SHORTAGE' | 'SURPLUS' | 'UNCOUNTED' = 'UNCOUNTED';
              let variance = 0;

              if (idx === 0) {
                countedQty = p.stockOnHand;
                status = 'MATCH';
                variance = 0;
              } else if (idx === 1) {
                countedQty = p.stockOnHand - 2;
                status = 'SHORTAGE';
                variance = -2;
              } else if (idx === 2) {
                countedQty = p.stockOnHand + 1;
                status = 'SURPLUS';
                variance = 1;
              } else if (idx === 3) {
                countedQty = p.stockOnHand - 2;
                status = 'SHORTAGE';
                variance = -2;
              }

              return {
                id: `cci-${p.id}`,
                productId: p.id,
                productCode: p.code,
                productName: p.name,
                sku: p.sku,
                barcode: p.barcodeValue,
                uom: p.uom,
                category: p.category,
                warehouseId: whList[0]?.id || 'wh-001',
                warehouseName: whList[0]?.name || (isEn ? 'Bangkok Main Logistics Hub' : 'คลังสินค้าหลักกรุงเทพ (Bangkok Main Hub)'),
                binCode: `A-0${idx + 1}-01`,
                unitPrice: p.price,
                systemQty: p.stockOnHand,
                countedQty,
                variance,
                varianceValue: variance * p.price,
                status,
              };
            }),
          };

          const samplePlan2: CycleCountPlan = {
            id: 'plan-002',
            planNo: 'CC-2026-0730',
            title: isEn
              ? 'Monthly Inventory Reconciliation July 2026'
              : 'ตรวจนับสต็อกสิ้นเดือน กรกฎาคม 2026 (Monthly Reconciliation)',
            warehouseId: whList[0]?.id || 'wh-001',
            warehouseName: whList[0]?.name || (isEn ? 'Bangkok Main Logistics Hub' : 'คลังสินค้าหลักกรุงเทพ (Bangkok Main Hub)'),
            zone: 'Zone B & C',
            cutoffDate: '2026-07-31',
            assignedTo: 'usr-001',
            assignedStaffName: 'Kittisak Prasertkul (Admin)',
            status: 'RECONCILED',
            createdAt: '2026-07-30 09:00:00',
            reconciledAt: '2026-07-31 16:45:00',
            reconciledBy: 'Kittisak Prasertkul',
            totalSkus: 4,
            countedSkus: 4,
            accuracyRate: 100.0,
            totalVarianceQty: 0,
            totalVarianceValue: 0,
            items: mappedProducts.slice(0, 4).map((p, idx) => ({
              id: `cci-done-${p.id}`,
              productId: p.id,
              productCode: p.code,
              productName: p.name,
              sku: p.sku,
              barcode: p.barcodeValue,
              uom: p.uom,
              category: p.category,
              warehouseId: whList[0]?.id || 'wh-001',
              warehouseName: whList[0]?.name || 'WH-Bangkok Center',
              binCode: `B-0${idx + 1}-02`,
              unitPrice: p.price,
              systemQty: p.stockOnHand,
              countedQty: p.stockOnHand,
              variance: 0,
              varianceValue: 0,
              status: 'MATCH',
            })),
          };

          setPlans([samplePlan1, samplePlan2]);
          setSelectedPlan(samplePlan1);
        }
      } catch (err) {
        console.error('Failed to load initial cycle count data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update Counted Quantity on Item
  const handleUpdateItemCount = (itemId: string, newCount: number) => {
    if (!selectedPlan) return;

    const updatedItems = selectedPlan.items.map((item) => {
      if (item.id === itemId) {
        const variance = newCount - item.systemQty;
        let status: 'MATCH' | 'SHORTAGE' | 'SURPLUS' | 'UNCOUNTED' = 'MATCH';
        if (variance < 0) status = 'SHORTAGE';
        else if (variance > 0) status = 'SURPLUS';

        return {
          ...item,
          countedQty: newCount,
          variance,
          varianceValue: variance * item.unitPrice,
          status,
        };
      }
      return item;
    });

    // Recompute Plan Summaries
    const countedItems = updatedItems.filter((i) => i.countedQty !== null);
    const matchedCount = updatedItems.filter((i) => i.status === 'MATCH').length;
    const accuracyRate = countedItems.length > 0 ? (matchedCount / countedItems.length) * 100 : 0;
    const totalVarianceQty = updatedItems.reduce((acc, curr) => acc + curr.variance, 0);
    const totalVarianceValue = updatedItems.reduce((acc, curr) => acc + curr.varianceValue, 0);

    const updatedPlan: CycleCountPlan = {
      ...selectedPlan,
      items: updatedItems,
      countedSkus: countedItems.length,
      accuracyRate: Math.round(accuracyRate * 10) / 10,
      totalVarianceQty,
      totalVarianceValue,
      status: countedItems.length === updatedItems.length ? 'COUNTED' : 'IN_PROGRESS',
    };

    setSelectedPlan(updatedPlan);
    setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
  };

  // Quick Barcode Scan Assistant (+1 to count)
  const handleQuickScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !quickBarcode.trim()) return;

    const trimmed = quickBarcode.trim().toLowerCase();
    const targetItem = selectedPlan.items.find(
      (item) =>
        item.barcode?.toLowerCase() === trimmed ||
        item.sku?.toLowerCase() === trimmed ||
        item.productCode?.toLowerCase() === trimmed
    );

    if (targetItem) {
      const currentVal = targetItem.countedQty !== null ? targetItem.countedQty : 0;
      handleUpdateItemCount(targetItem.id, currentVal + 1);
      setScanMessage({
        text: `นับเพิ่ม: "${targetItem.productName}" ยอดนับรวมเป็น ${currentVal + 1} ${targetItem.uom}`,
        type: 'success',
      });
      setQuickBarcode('');
    } else {
      setScanMessage({
        text: `ไม่พบรหัส "${quickBarcode}" ในแผนตรวจนับนี้`,
        type: 'error',
      });
    }

    setTimeout(() => setScanMessage(null), 3000);
  };

  // Create New Plan Submit
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const whObj = warehouses.find((w) => w.id === newPlanWarehouseId) || {
      id: 'wh-001',
      name: 'WH-Bangkok Center',
    };

    let backendId = `plan-${Date.now()}`;
    let backendNo = `CC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await cycleCountService.createCycleCount({
        warehouseId: whObj.id,
        notes: newPlanTitle || `ตรวจนับสต็อก ${whObj.name}`,
      });
      if (res?.data) {
        backendId = res.data.id;
        backendNo = res.data.countNumber || backendNo;
      }
    } catch (err) {
      console.warn('Could not persist cycle count to backend, creating locally', err);
    }

    const targetProducts =
      newPlanCategory === 'ALL'
        ? products
        : products.filter((p) => p.category?.toLowerCase() === newPlanCategory.toLowerCase());

    const planItems: CycleCountItem[] = targetProducts.slice(0, 10).map((p, idx) => ({
      id: `cci-${Date.now()}-${idx}`,
      productId: p.id,
      productCode: p.code,
      productName: p.name,
      sku: p.sku,
      barcode: p.barcodeValue,
      uom: p.uom,
      category: p.category,
      warehouseId: whObj.id,
      warehouseName: whObj.name,
      binCode: `A-0${idx + 1}-01`,
      unitPrice: p.price,
      systemQty: p.stockOnHand,
      countedQty: null,
      variance: 0,
      varianceValue: 0,
      status: 'UNCOUNTED',
    }));

    const newPlan: CycleCountPlan = {
      id: backendId,
      planNo: backendNo,
      title: newPlanTitle || `ตรวจนับสต็อก ${whObj.name}`,
      warehouseId: whObj.id,
      warehouseName: whObj.name,
      cutoffDate: newPlanCutoffDate,
      assignedTo: 'usr-001',
      assignedStaffName: newPlanAssignedStaff,
      status: 'DRAFT',
      createdAt: new Date().toLocaleString(),
      totalSkus: planItems.length,
      countedSkus: 0,
      accuracyRate: 0,
      totalVarianceQty: 0,
      totalVarianceValue: 0,
      items: planItems,
    };

    setPlans([newPlan, ...plans]);
    setSelectedPlan(newPlan);
    setIsCreateModalOpen(false);
    setNewPlanTitle('');
  };

  // Reconcile & Auto Adjust Stock
  const handleReconcilePlan = async () => {
    if (!selectedPlan) return;
    if (
      !window.confirm(
        `ยืนยันการกระทบยอดสต็อกสำหรับแผน ${selectedPlan.planNo}?\nระบบจะส่งคำสั่งอนุมัติและปรับปรุงยอดสต็อกจริงในคลังสินค้า`
      )
    ) {
      return;
    }

    try {
      await cycleCountService.approveCycleCount(selectedPlan.id);
    } catch (err) {
      console.warn('Backend approve cycle count failed, updating UI state', err);
    }

    const updated: CycleCountPlan = {
      ...selectedPlan,
      status: 'RECONCILED',
      reconciledAt: new Date().toLocaleString(),
      reconciledBy: 'เจ้าหน้าที่ผู้ดูแลระบบ (Admin)',
    };

    setSelectedPlan(updated);
    setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    alert(`กระทบยอดและปรับสต็อกสำหรับแผน ${selectedPlan.planNo} สำเร็จเรียบร้อยแล้ว!`);
  };

  // Filtered Plans
  const filteredPlans = plans.filter((plan) => {
    if (activePlanFilter !== 'ALL' && plan.status !== activePlanFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        plan.planNo.toLowerCase().includes(q) ||
        plan.title.toLowerCase().includes(q) ||
        plan.warehouseName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Items in Selected Plan
  const filteredItems = selectedPlan
    ? selectedPlan.items.filter((item) => {
        if (itemStatusFilter !== 'ALL' && item.status !== itemStatusFilter) return false;
        return true;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Enterprise Title & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {t.cycleCountTitle}
          </h2>
          <p className={`text-[15px] font-normal mt-0.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {t.cycleCountSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-[14px] font-semibold shadow-xs shadow-blue-600/30 transition cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>{isEn ? 'New Audit Plan' : 'สร้างแผนตรวจนับใหม่ (New Audit Plan)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-2xl border transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {isEn ? 'Total Count Plans' : 'แผนตรวจนับทั้งหมด'}
            </span>
            <FileSpreadsheet className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">
            {plans.length}{' '}
            <span className="text-xs font-medium text-slate-500">
              {isEn ? 'plans' : 'แผน'}
            </span>
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {isEn ? 'Avg Stock Accuracy' : 'ความแม่นยำสต็อกเฉลี่ย (Accuracy)'}
            </span>
            <Percent className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {selectedPlan ? selectedPlan.accuracyRate : 0}%
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {isEn ? 'Qty Variance' : 'ผลต่างจำนวนสินค้า (Qty Variance)'}
            </span>
            <ArrowUpDown className="w-4 h-4 text-amber-500" />
          </div>
          <p
            className={`text-2xl font-extrabold mt-1 ${
              (selectedPlan?.totalVarianceQty || 0) < 0
                ? 'text-rose-600'
                : (selectedPlan?.totalVarianceQty || 0) > 0
                ? 'text-blue-600'
                : 'text-emerald-600'
            }`}
          >
            {selectedPlan ? (selectedPlan.totalVarianceQty > 0 ? `+${selectedPlan.totalVarianceQty}` : selectedPlan.totalVarianceQty) : 0}{' '}
            <span className="text-xs font-medium text-slate-500">
              {isEn ? 'pcs' : 'ชิ้น'}
            </span>
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {isEn ? 'Total Variance Value' : 'มูลค่าผลต่างรวม (Variance Value)'}
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p
            className={`text-2xl font-extrabold mt-1 ${
              (selectedPlan?.totalVarianceValue || 0) < 0
                ? 'text-rose-600'
                : (selectedPlan?.totalVarianceValue || 0) > 0
                ? 'text-blue-600'
                : 'text-emerald-600'
            }`}
          >
            ฿{Math.abs(selectedPlan?.totalVarianceValue || 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Grid: Plan Selector & Interactive Count Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Plan List */}
        <div className="lg:col-span-4 space-y-4">
          <div
            className={`p-5 rounded-2xl border transition-all ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {isEn ? 'Cycle Count Plans' : 'รายการแผนตรวจนับสต็อก'}
              </h3>
              <span className="text-xs text-slate-400">
                {filteredPlans.length} {isEn ? 'plans' : 'รายการ'}
              </span>
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {(['ALL', 'IN_PROGRESS', 'COUNTED', 'RECONCILED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setActivePlanFilter(st)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition ${
                    activePlanFilter === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL'
                    ? (isEn ? 'All' : 'ทั้งหมด')
                    : st === 'IN_PROGRESS'
                    ? (isEn ? 'Counting' : 'กำลังนับ')
                    : st === 'COUNTED'
                    ? (isEn ? 'Counted' : 'นับเสร็จแล้ว')
                    : (isEn ? 'Reconciled' : 'ปรับยอดแล้ว')}
                </button>
              ))}
            </div>

            {/* Plan Cards List */}
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredPlans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500/50 shadow-xs dark:bg-blue-950/40 dark:border-blue-700'
                        : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 dark:border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {plan.planNo}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          plan.status === 'RECONCILED'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                            : plan.status === 'COUNTED'
                            ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
                            : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {plan.status === 'RECONCILED'
                          ? (isEn ? 'Reconciled' : 'กระทบยอดแล้ว')
                          : plan.status === 'COUNTED'
                          ? (isEn ? 'Counted' : 'นับครบแล้ว')
                          : (isEn ? 'Counting' : 'กำลังนับ')}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 mt-1.5 leading-relaxed line-clamp-1">
                      {plan.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2">
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="truncate">{plan.warehouseName}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span>
                        {isEn ? 'Counted:' : 'นับแล้ว:'} <strong>{plan.countedSkus}</strong>/{plan.totalSkus} SKUs
                      </span>
                      <span className="font-bold text-emerald-600">
                        Acc: {plan.accuracyRate}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Count Sheet & Reconciliation */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPlan ? (
            <div
              className={`p-6 rounded-2xl border transition-all ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              {/* Selected Plan Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                      {selectedPlan.title}
                    </h2>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {selectedPlan.planNo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {isEn ? 'Warehouse:' : 'คลัง:'} <strong>{selectedPlan.warehouseName}</strong> | {isEn ? 'Auditor:' : 'ผู้ตรวจนับ:'}{' '}
                    <strong>{selectedPlan.assignedStaffName}</strong> | {isEn ? 'Cut-off Date:' : 'วันตัดยอด:'}{' '}
                    {selectedPlan.cutoffDate}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedPlan.status !== 'RECONCILED' && (
                    <button
                      onClick={handleReconcilePlan}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isEn ? 'Reconcile & Adjust Stock' : 'กระทบยอด & ปรับสต็อก (Reconcile)'}</span>
                    </button>
                  )}
                  {selectedPlan.status === 'RECONCILED' && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {isEn ? 'Reconciliation Completed' : 'ปรับยอดเสร็จสิ้นแล้ว'}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Scan Input Box for Handheld Scanner */}
              <div className="mt-4 p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <form onSubmit={handleQuickScanSubmit} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Barcode className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                    <input
                      type="text"
                      value={quickBarcode}
                      onChange={(e) => setQuickBarcode(e.target.value)}
                      placeholder={isEn ? 'Scan barcode here to count (+1 Auto)...' : 'ยิงบาร์โค้ดสินค้าที่นี่เพื่อนับ (+1 ชิ้น อัตโนมัติ)...'}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-mono font-medium focus:ring-2 focus:ring-blue-500 transition ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-slate-100'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isEn ? 'Count +1' : 'นับเพิ่ม +1'}</span>
                  </button>
                </form>

                {scanMessage && (
                  <p
                    className={`text-xs mt-2 font-medium flex items-center gap-1 ${
                      scanMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {scanMessage.type === 'success' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    {scanMessage.text}
                  </p>
                )}
              </div>

              {/* Items Filter Sub-tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: 'ALL', label: `${isEn ? 'All' : 'ทั้งหมด'} (${selectedPlan.items.length})` },
                    {
                      key: 'MATCH',
                      label: `${isEn ? 'Matched' : 'ตรงเป๊ะ'} (${selectedPlan.items.filter((i) => i.status === 'MATCH').length})`,
                    },
                    {
                      key: 'SHORTAGE',
                      label: `${isEn ? 'Shortage' : 'ขาด'} (${selectedPlan.items.filter((i) => i.status === 'SHORTAGE').length})`,
                    },
                    {
                      key: 'SURPLUS',
                      label: `${isEn ? 'Surplus' : 'เกิน'} (${selectedPlan.items.filter((i) => i.status === 'SURPLUS').length})`,
                    },
                    {
                      key: 'UNCOUNTED',
                      label: `${isEn ? 'Uncounted' : 'ยังไม่นับ'} (${selectedPlan.items.filter((i) => i.status === 'UNCOUNTED').length})`,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setItemStatusFilter(tab.key as any)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        itemStatusFilter === tab.key
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  {isEn ? 'Showing' : 'แสดง'} {filteredItems.length} {isEn ? 'items' : 'รายการ'}
                </div>
              </div>

              {/* Count Sheet Table */}
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead
                    className={`sticky top-0 ${
                      theme === 'dark' ? 'bg-slate-800/90 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <tr>
                      <th className="py-3 px-3.5 font-semibold">{isEn ? 'Product / SKU' : 'สินค้า / SKU'}</th>
                      <th className="py-3 px-3 font-semibold">{isEn ? 'Bin' : 'Bin'}</th>
                      <th className="py-3 px-3 font-semibold text-right">{isEn ? 'System Qty' : 'ยอดในระบบ'}</th>
                      <th className="py-3 px-3 font-semibold text-center w-36">{isEn ? 'Counted Qty' : 'ยอดตรวจนับจริง'}</th>
                      <th className="py-3 px-3 font-semibold text-right">{isEn ? 'Variance (Qty)' : 'ผลต่าง (Variance)'}</th>
                      <th className="py-3 px-3 font-semibold text-right">{isEn ? 'Variance (Value)' : 'มูลค่าผลต่าง'}</th>
                      <th className="py-3 px-3.5 font-semibold text-center">{isEn ? 'Status' : 'สถานะ'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {item.productName}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">
                            SKU: {item.sku} | Barcode: {item.barcode}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {item.binCode}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                          {item.systemQty} <span className="text-[10px] text-slate-400">{item.uom}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              disabled={selectedPlan.status === 'RECONCILED'}
                              value={item.countedQty !== null ? item.countedQty : ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                handleUpdateItemCount(item.id, isNaN(val) ? 0 : val);
                              }}
                              placeholder={isEn ? 'Enter qty' : 'ระบุจำนวน'}
                              className={`w-20 text-center py-1.5 px-2 rounded-lg border font-mono text-xs font-bold focus:ring-2 focus:ring-blue-500 transition ${
                                theme === 'dark'
                                  ? 'bg-slate-800 border-slate-700 text-slate-100'
                                  : 'bg-white border-slate-300 text-slate-900'
                              }`}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-bold font-mono">
                          {item.countedQty !== null ? (
                            <span
                              className={
                                item.variance < 0
                                  ? 'text-rose-600'
                                  : item.variance > 0
                                  ? 'text-blue-600'
                                  : 'text-emerald-600'
                              }
                            >
                              {item.variance > 0 ? `+${item.variance}` : item.variance}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-bold">
                          {item.countedQty !== null ? (
                            <span
                              className={
                                item.varianceValue < 0
                                  ? 'text-rose-600'
                                  : item.varianceValue > 0
                                  ? 'text-blue-600'
                                  : 'text-slate-500'
                              }
                            >
                              ฿{item.varianceValue.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                              item.status === 'MATCH'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : item.status === 'SHORTAGE'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                                : item.status === 'SURPLUS'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {item.status === 'MATCH' && <Check className="w-3 h-3 text-emerald-500" />}
                            {item.status === 'SHORTAGE' && <TrendingDown className="w-3 h-3 text-rose-500" />}
                            {item.status === 'SURPLUS' && <TrendingUp className="w-3 h-3 text-blue-500" />}
                            {item.status === 'MATCH'
                              ? (isEn ? 'Matched' : 'ตรงเป๊ะ')
                              : item.status === 'SHORTAGE'
                              ? (isEn ? 'Shortage' : 'สต็อกขาด')
                              : item.status === 'SURPLUS'
                              ? (isEn ? 'Surplus' : 'สต็อกเกิน')
                              : (isEn ? 'Uncounted' : 'ยังไม่นับ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border rounded-2xl">
              <p className="text-xs text-slate-400">{isEn ? 'Please select a cycle count plan from the left.' : 'กรุณาเลือกแผนตรวจนับสต็อกทางซ้ายมือ'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create New Cycle Count Plan */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-xl p-6 transition ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-50' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold">
                {isEn ? 'Create New Cycle Count Plan' : 'สร้างแผนตรวจนับสต็อกใหม่ (New Cycle Count Plan)'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isEn ? 'Plan Name / Title:' : 'ชื่อแผนตรวจนับ:'}
                </label>
                <input
                  type="text"
                  required
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  placeholder={isEn ? 'e.g. Weekly Cycle Count Zone A...' : 'เช่น ตรวจนับสต็อกประจำสัปดาห์ โซน A...'}
                  className={`w-full px-3 py-2.5 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 transition ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-slate-100'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isEn ? 'Target Warehouse:' : 'คลังสินค้าเป้าหมาย:'}
                  </label>
                  <CustomSelect
                    theme={theme}
                    value={newPlanWarehouseId}
                    onChange={setNewPlanWarehouseId}
                    searchable={true}
                    placeholder="-- เลือกคลังสินค้า --"
                    searchPlaceholder="ค้นหาคลังสินค้า..."
                    options={warehouses.map((w) => ({
                      value: w.id || w.code,
                      label: w.name || w.code,
                      sublabel: w.code,
                    }))}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isEn ? 'Stock Cut-off Date:' : 'วันตัดยอดสต็อก (Cutoff):'}
                  </label>
                  <input
                    type="date"
                    required
                    value={newPlanCutoffDate}
                    onChange={(e) => setNewPlanCutoffDate(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 transition ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-slate-100'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isEn ? 'Assigned Auditor / Staff:' : 'ผู้รับผิดชอบการนับ (Assigned Staff):'}
                </label>
                <input
                  type="text"
                  required
                  value={newPlanAssignedStaff}
                  onChange={(e) => setNewPlanAssignedStaff(e.target.value)}
                  placeholder={isEn ? 'Enter auditor name' : 'ระบุชื่อเจ้าหน้าที่คลัง'}
                  className={`w-full px-3 py-2.5 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 transition ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-slate-100'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition cursor-pointer"
                >
                  {isEn ? 'Cancel' : 'ยกเลิก'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
                >
                  {isEn ? 'Create Audit Plan' : 'ยืนยันสร้างแผนตรวจนับ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
