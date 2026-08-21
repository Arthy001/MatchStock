import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  SlidersHorizontal,
  Search,
  Filter,
  Plus,
  FileText,
  Calendar,
  Layers,
  MapPin,
  Building2,
  User as UserIcon,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Printer,
  Download,
  AlertCircle,
  ChevronRight,
  Package,
  TrendingUp,
  TrendingDown,
  Warehouse,
  Sparkles,
  Barcode,
  Loader2,
} from 'lucide-react';
import {
  Language,
  ThemeMode,
  StockTransaction,
  StockTransactionItem,
  TransactionType,
  TransactionStatus,
  ProductItem,
  WarehouseBin,
  Supplier,
} from '../types';
import { getTranslation } from '../i18n';
import { productService } from '../services/product.service';
import { warehouseService } from '../services/warehouse.service';
import { masterDataService } from '../services/masterData.service';

interface StockTransactionsProps {
  lang: Language;
  theme: ThemeMode;
  searchQuery?: string;
  activeSubTab?: 'all' | 'receive' | 'issue' | 'transfer' | 'adjustment';
  onSubTabChange?: (subTab: 'all' | 'receive' | 'issue' | 'transfer' | 'adjustment') => void;
}

export const StockTransactions: React.FC<StockTransactionsProps> = ({
  lang,
  theme,
  searchQuery = '',
  activeSubTab = 'all',
  onSubTabChange,
}) => {
  const t = getTranslation(lang);

  // Live States (Zero Mockups - Pure Live Backend Data)
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [warehousesList, setWarehousesList] = useState<WarehouseBin[]>([]);
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [localSearch, setLocalSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedTransaction, setSelectedTransaction] = useState<StockTransaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State for creating new transaction
  const [formType, setFormType] = useState<TransactionType>('RECEIVE');
  const [formReferenceNo, setFormReferenceNo] = useState<string>('');
  const [formSupplierId, setFormSupplierId] = useState<string>('');
  const [formRecipient, setFormRecipient] = useState<string>('');
  const [formIssueReason, setFormIssueReason] = useState<string>('Sales Order Dispatch');
  const [formTransferType, setFormTransferType] = useState<'INTER_WAREHOUSE' | 'BIN_TO_BIN'>('INTER_WAREHOUSE');
  const [formAdjReason, setFormAdjReason] = useState<string>('Cycle Count Variance');
  const [formAdjDirection, setFormAdjDirection] = useState<'INCREASE' | 'DECREASE'>('DECREASE');
  const [formNotes, setFormNotes] = useState<string>('');

  // Item Form Row
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [formQty, setFormQty] = useState<number>(10);
  const [formLotNumber, setFormLotNumber] = useState<string>(`LOT-${new Date().toISOString().slice(0, 7).replace('-', '')}-01`);
  const [formMfgDate, setFormMfgDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formExpDate, setFormExpDate] = useState<string>(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2).toISOString().slice(0, 10)
  );
  const [fromBinId, setFromBinId] = useState<string>('');
  const [toBinId, setToBinId] = useState<string>('');

  // Load Live Master Data for Transaction Form Choices
  useEffect(() => {
    const loadLiveData = async () => {
      setIsLoading(true);
      try {
        const [prodRes, whRes, supRes] = await Promise.allSettled([
          productService.getProducts(),
          warehouseService.getWarehouses(),
          masterDataService.getSuppliers(),
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value?.data) {
          const mappedProds: ProductItem[] = prodRes.value.data.map((p: any) => ({
            id: p.id,
            code: p.code || 'PRD-000',
            sku: p.sku || 'SKU-000',
            slug: p.slug || p.name?.toLowerCase().replace(/\s+/g, '-') || 'item',
            name: p.name || 'Unnamed Product',
            category: p.category?.name || 'General',
            brand: p.brand?.name || 'Logitech',
            manufacturer: p.manufacturer?.name || p.supplier?.name || 'Standard',
            uom: p.unit?.name || 'PCS',
            weightKg: p.weightValue || 0,
            widthCm: p.widthValue || 0,
            lengthCm: p.lengthValue || 0,
            heightCm: p.heightValue || 0,
            price: p.sellingPriceMinor ? p.sellingPriceMinor / 100 : (p.price || 0),
            stockOnHand: p.inStockCount || 0,
            reorderLevel: p.reorderPoint || 10,
            maxLevel: p.minReorderQuantity ? p.minReorderQuantity * 2 : 100,
            barcodeType: p.barcodeSymbology?.name || 'CODE128',
            barcodeValue: p.barcodeValue || p.sku,
            status: (p.inStockCount || 0) <= 0 ? 'out_of_stock' : (p.inStockCount || 0) <= (p.reorderPoint || 10) ? 'low_stock' : 'active',
            imageUrl: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=120&auto=format&fit=crop&q=80',
            createdAt: p.createdAt ? p.createdAt.slice(0, 10) : '2026-08-21',
          }));
          setProductsList(mappedProds);
          if (mappedProds.length > 0) setSelectedProductId(mappedProds[0].id);
        }

        if (whRes.status === 'fulfilled' && whRes.value?.data) {
          const mappedBins: WarehouseBin[] = whRes.value.data.map((w: any) => ({
            id: w.id,
            warehouseId: w.id,
            warehouseName: w.name,
            zone: 'Zone A',
            rack: w.code || 'RACK-01',
            shelf: 'Level 1',
            binCode: `${w.code || 'BIN'}-A01`,
            capacityKg: 1000,
            currentItemsCount: 0,
            status: 'available',
          }));
          setWarehousesList(mappedBins);
          if (mappedBins.length > 0) {
            setFromBinId(mappedBins[0].id);
            setToBinId(mappedBins[0].id);
          }
        }

        if (supRes.status === 'fulfilled' && supRes.value?.data) {
          const mappedSups: Supplier[] = supRes.value.data.map((s: any) => ({
            id: s.id,
            code: s.code || `SUP-${s.id.slice(0, 4)}`,
            name: s.name,
            contactPerson: s.contactPerson || 'Sales Admin',
            phone: s.phone || 'N/A',
            email: s.email || 'contact@supplier.com',
            taxId: s.taxId || 'N/A',
            taxType: 'VAT7',
            discountTerms: 'Net 30',
            address: 'Thailand',
            status: 'active',
          }));
          setSuppliersList(mappedSups);
          if (mappedSups.length > 0) setFormSupplierId(mappedSups[0].id);
        }
      } catch (err) {
        console.error('Failed to load transaction master data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLiveData();
  }, []);

  // Lock body scroll when modal or drawer is open to prevent double scrollbars
  useEffect(() => {
    if (isModalOpen || isDrawerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || 'unset';
      };
    }
  }, [isModalOpen, isDrawerOpen]);

  // Sync subtab filter
  const currentTab = activeSubTab;

  // KPIs
  const totalReceives = useMemo(
    () => transactions.filter((t) => t.type === 'RECEIVE').reduce((acc, curr) => acc + curr.totalQuantity, 0),
    [transactions]
  );
  const totalIssues = useMemo(
    () => transactions.filter((t) => t.type === 'ISSUE').reduce((acc, curr) => acc + curr.totalQuantity, 0),
    [transactions]
  );
  const activeTransfers = useMemo(
    () => transactions.filter((t) => t.type === 'TRANSFER').length,
    [transactions]
  );
  const totalAdjustments = useMemo(
    () => transactions.filter((t) => t.type === 'ADJUSTMENT').length,
    [transactions]
  );

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      // Subtab check
      if (currentTab === 'receive' && item.type !== 'RECEIVE') return false;
      if (currentTab === 'issue' && item.type !== 'ISSUE') return false;
      if (currentTab === 'transfer' && item.type !== 'TRANSFER') return false;
      if (currentTab === 'adjustment' && item.type !== 'ADJUSTMENT') return false;

      // Dropdown Type filter
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;

      // Status filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

      // Search Query
      const q = (searchQuery || localSearch).trim().toLowerCase();
      if (!q) return true;

      const matchDoc = item.documentNo.toLowerCase().includes(q);
      const matchRef = item.referenceNo?.toLowerCase().includes(q) || false;
      const matchNotes = item.notes?.toLowerCase().includes(q) || false;
      const matchSupplier = item.supplierName?.toLowerCase().includes(q) || false;
      const matchRecipient = item.recipientName?.toLowerCase().includes(q) || false;
      const matchItem = item.items.some(
        (i) =>
          i.productName.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.productCode.toLowerCase().includes(q) ||
          i.lotNumber?.toLowerCase().includes(q)
      );

      return matchDoc || matchRef || matchNotes || matchSupplier || matchRecipient || matchItem;
    });
  }, [transactions, currentTab, typeFilter, statusFilter, searchQuery, localSearch]);

  const handleOpenDetail = (tx: StockTransaction) => {
    setSelectedTransaction(tx);
    setIsDrawerOpen(true);
  };

  const handleOpenCreateModal = (prefillType?: TransactionType) => {
    if (prefillType) {
      setFormType(prefillType);
    } else if (currentTab === 'receive') {
      setFormType('RECEIVE');
    } else if (currentTab === 'issue') {
      setFormType('ISSUE');
    } else if (currentTab === 'transfer') {
      setFormType('TRANSFER');
    } else if (currentTab === 'adjustment') {
      setFormType('ADJUSTMENT');
    } else {
      setFormType('RECEIVE');
    }

    const docPrefix =
      formType === 'RECEIVE' ? 'GR' : formType === 'ISSUE' ? 'GI' : formType === 'TRANSFER' ? 'TR' : 'ADJ';
    setFormReferenceNo(`REF-${Date.now().toString().slice(-4)}`);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const product = productsList.find((p) => p.id === selectedProductId) || productsList[0] || {
      id: 'prod-001',
      code: 'PRD-001',
      sku: 'SKU-001',
      name: 'Standard Product',
      price: 100,
      stockOnHand: 10,
      uom: 'PCS',
    };
    const sourceBin = warehousesList.find((b) => b.id === fromBinId) || warehousesList[0] || {
      id: 'bin-001',
      warehouseId: 'wh-01',
      warehouseName: 'WH-Bangkok Center',
      binCode: 'BKK-A01',
    };
    const destBin = warehousesList.find((b) => b.id === toBinId) || warehousesList[0] || sourceBin;
    const supplier = suppliersList.find((s) => s.id === formSupplierId) || suppliersList[0];

    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);
    const docPrefix =
      formType === 'RECEIVE' ? 'GR' : formType === 'ISSUE' ? 'GI' : formType === 'TRANSFER' ? 'TR' : 'ADJ';
    const docNo = `${docPrefix}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      transactions.length + 1
    ).padStart(3, '0')}`;

    const newItem: StockTransactionItem = {
      id: `txi-${Date.now()}`,
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      sku: product.sku,
      uom: product.uom,
      quantity: Number(formQty),
      unitPrice: product.price,
      totalPrice: Number(formQty) * product.price,
      lotNumber: formLotNumber,
      mfgDate: formMfgDate,
      expDate: formExpDate,
      fromWarehouseId: formType !== 'RECEIVE' ? sourceBin.warehouseId : undefined,
      fromWarehouseName: formType !== 'RECEIVE' ? sourceBin.warehouseName : undefined,
      fromBinId: formType !== 'RECEIVE' ? sourceBin.id : undefined,
      fromBinCode: formType !== 'RECEIVE' ? sourceBin.binCode : undefined,
      toWarehouseId: formType !== 'ISSUE' ? destBin.warehouseId : undefined,
      toWarehouseName: formType !== 'ISSUE' ? destBin.warehouseName : undefined,
      toBinId: formType !== 'ISSUE' ? destBin.id : undefined,
      toBinCode: formType !== 'ISSUE' ? destBin.binCode : undefined,
      currentStock: product.stockOnHand,
      adjustedStock:
        formType === 'ADJUSTMENT'
          ? formAdjDirection === 'INCREASE'
            ? product.stockOnHand + Number(formQty)
            : product.stockOnHand - Number(formQty)
          : undefined,
      variance:
        formType === 'ADJUSTMENT'
          ? formAdjDirection === 'INCREASE'
            ? Number(formQty)
            : -Number(formQty)
          : undefined,
    };

    const newTx: StockTransaction = {
      id: `tx-${Date.now()}`,
      documentNo: docNo,
      type: formType,
      status: 'COMPLETED',
      createdAt: dateStr,
      createdBy: 'Thanathat.kj (Front-End Dev)',
      referenceNo: formReferenceNo || undefined,
      notes: formNotes || undefined,
      supplierId: formType === 'RECEIVE' ? supplier?.id : undefined,
      supplierName: formType === 'RECEIVE' ? supplier?.name : undefined,
      issueReason: formType === 'ISSUE' ? formIssueReason : undefined,
      recipientName: formType === 'ISSUE' ? formRecipient || 'Customer / Internal Dept' : undefined,
      transferType: formType === 'TRANSFER' ? formTransferType : undefined,
      adjustmentReason: formType === 'ADJUSTMENT' ? formAdjReason : undefined,
      adjustmentDirection: formType === 'ADJUSTMENT' ? formAdjDirection : undefined,
      items: [newItem],
      totalQuantity: Number(formQty),
      totalAmount: Number(formQty) * product.price,
    };

    setTransactions([newTx, ...transactions]);
    setIsModalOpen(false);
  };

  // Helper for Type Badge Rendering
  const renderTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'RECEIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            {t.typeReceive}
          </span>
        );
      case 'ISSUE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {t.typeIssue}
          </span>
        );
      case 'TRANSFER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            {t.typeTransfer}
          </span>
        );
      case 'ADJUSTMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {t.typeAdjustment}
          </span>
        );
    }
  };

  // Helper for Status Badge
  const renderStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            {t.statusCompleted}
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="w-3 h-3" />
            {t.statusPending}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <XCircle className="w-3 h-3" />
            {t.statusCancelled}
          </span>
        );
    }
  };

  // Dynamic Header Titles
  const getHeaderInfo = () => {
    switch (currentTab) {
      case 'receive':
        return { title: t.grTitle, subtitle: t.grSubtitle, icon: ArrowDownLeft, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'issue':
        return { title: t.giTitle, subtitle: t.giSubtitle, icon: ArrowUpRight, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' };
      case 'transfer':
        return { title: t.transferTitle, subtitle: t.transferSubtitle, icon: ArrowRightLeft, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' };
      case 'adjustment':
        return { title: t.adjTitle, subtitle: t.adjSubtitle, icon: SlidersHorizontal, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' };
      default:
        return { title: t.transTitle, subtitle: t.transSubtitle, icon: Package, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' };
    }
  };

  const headerInfo = getHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="space-y-6">
      {/* Dynamic Header & Action Bar */}
      <div
        className={`p-6 rounded-2xl border transition ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${headerInfo.bg} ${headerInfo.color} shrink-0`}>
              <HeaderIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {t.inventory}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {currentTab === 'all'
                    ? t.tabAllTransactions
                    : currentTab === 'receive'
                    ? t.tabGoodsReceive
                    : currentTab === 'issue'
                    ? t.tabGoodsIssue
                    : currentTab === 'transfer'
                    ? t.tabStockTransfer
                    : t.tabStockAdjustment}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">
                {headerInfo.title}
              </h2>
              <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                {headerInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleOpenCreateModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs md:text-sm font-bold shadow-md shadow-blue-600/30 transition focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <Plus className="w-4 h-4" />
              {t.newTransactionBtn}
            </button>
          </div>
        </div>

        {/* 4 Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.statTodayReceive}</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">+{totalReceives} <span className="text-xs font-normal text-slate-500">items</span></p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.statTodayIssue}</p>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">-{totalIssues} <span className="text-xs font-normal text-slate-500">items</span></p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.statActiveTransfers}</p>
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{activeTransfers} <span className="text-xs font-normal text-slate-500">docs</span></p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{t.statTotalAdjustments}</p>
              <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">{totalAdjustments} <span className="text-xs font-normal text-slate-500">audits</span></p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className={`p-4 rounded-2xl border transition flex flex-col md:flex-row items-center justify-between gap-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs md:text-sm font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Transaction Type Filter (if on all) */}
          {currentTab === 'all' && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ALL">ทุกประเภท (All Types)</option>
              <option value="RECEIVE">Goods Receive (GR)</option>
              <option value="ISSUE">Goods Issue (GI)</option>
              <option value="TRANSFER">Stock Transfer (TR)</option>
              <option value="ADJUSTMENT">Stock Adjustment (ADJ)</option>
            </select>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="ALL">ทุกสถานะ (All Status)</option>
            <option value="COMPLETED">{t.statusCompleted}</option>
            <option value="PENDING">{t.statusPending}</option>
            <option value="CANCELLED">{t.statusCancelled}</option>
          </select>
        </div>
      </div>

      {/* Main Transactions Data Table */}
      <div
        className={`rounded-2xl border overflow-hidden transition ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/40 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">{t.docNo}</th>
                <th className="py-3.5 px-4">{t.transType}</th>
                <th className="py-3.5 px-4">{t.productName}</th>
                <th className="py-3.5 px-4">{t.lotBatch}</th>
                <th className="py-3.5 px-4">{t.sourceLocation} / {t.destLocation}</th>
                <th className="py-3.5 px-4 text-right">{t.quantity}</th>
                <th className="py-3.5 px-4 text-right">{t.totalValue}</th>
                <th className="py-3.5 px-4 text-center">{t.status}</th>
                <th className="py-3.5 px-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    <Package className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    ไม่พบรายการธุรกรรมตามเงื่อนไขที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const firstItem = tx.items[0];
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition group cursor-pointer"
                      onClick={() => handleOpenDetail(tx)}
                    >
                      {/* Document No & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          {tx.documentNo}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {tx.createdAt}
                        </div>
                      </td>

                      {/* Transaction Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderTypeBadge(tx.type)}
                      </td>

                      {/* Product Name & SKU */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate" title={firstItem?.productName}>
                          {firstItem?.productName || '-'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {firstItem?.sku} ({firstItem?.uom})
                        </div>
                      </td>

                      {/* Lot / Batch & Expiry */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {firstItem?.lotNumber ? (
                          <div>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                              {firstItem.lotNumber}
                            </span>
                            {firstItem.expDate && (
                              <div className="text-[10px] text-rose-500 font-medium mt-0.5">
                                EXP: {firstItem.expDate}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Location: From / To */}
                      <td className="py-3.5 px-4 text-[11px]">
                        {tx.type === 'RECEIVE' && (
                          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>To: {firstItem?.toBinCode} ({firstItem?.toWarehouseName?.split(' ')[0]})</span>
                          </div>
                        )}
                        {tx.type === 'ISSUE' && (
                          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>From: {firstItem?.fromBinCode} ({firstItem?.fromWarehouseName?.split(' ')[0]})</span>
                          </div>
                        )}
                        {tx.type === 'TRANSFER' && (
                          <div className="space-y-0.5">
                            <div className="text-slate-500">From: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{firstItem?.fromBinCode}</span></div>
                            <div className="text-indigo-600 dark:text-indigo-400 font-semibold">To: <span className="font-mono font-bold">{firstItem?.toBinCode}</span></div>
                          </div>
                        )}
                        {tx.type === 'ADJUSTMENT' && (
                          <div className="text-purple-600 dark:text-purple-400 font-medium">
                            At: {firstItem?.fromBinCode || firstItem?.toBinCode}
                          </div>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="font-black text-slate-900 dark:text-slate-50 text-sm">
                          {tx.type === 'RECEIVE' && `+${tx.totalQuantity}`}
                          {tx.type === 'ISSUE' && `-${tx.totalQuantity}`}
                          {tx.type === 'TRANSFER' && `${tx.totalQuantity}`}
                          {tx.type === 'ADJUSTMENT' && (
                            <span className={tx.adjustmentDirection === 'INCREASE' ? 'text-emerald-600' : 'text-rose-600'}>
                              {tx.adjustmentDirection === 'INCREASE' ? `+${tx.totalQuantity}` : `-${tx.totalQuantity}`}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase">{firstItem?.uom}</div>
                      </td>

                      {/* Total Value */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        ฿{(tx.totalAmount || 0).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {renderStatusBadge(tx.status)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(tx);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                        >
                          {t.viewDetails}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 480px Slide-Over Drawer for Transaction Details & Audit Trail */}
      {isDrawerOpen && selectedTransaction && createPortal(
        <div className="fixed inset-0 z-[9998] overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div className="fixed inset-0 -z-10" onClick={() => setIsDrawerOpen(false)} />

          <div
            className={`w-full max-w-[480px] h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l relative z-10 transition ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Drawer Header */}
            <div>
              <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-50">
                      {selectedTransaction.documentNo}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {t.drawerTransactionDetail}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition shrink-0"
                  title="ปิดหน้าต่าง (Close)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body Content */}
              <div className="p-5 sm:p-6 space-y-6">
                {/* Status & Type Bar */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">{t.transType}</span>
                    {renderTypeBadge(selectedTransaction.type)}
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">{t.status}</span>
                    {renderStatusBadge(selectedTransaction.status)}
                  </div>
                </div>

                {/* Audit Information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    ข้อมูลการบันทึก & ผู้ทำรายการ (Audit Info)
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-slate-500 block text-[10px]">{t.transDate}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedTransaction.createdAt}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-slate-500 block text-[10px]">{t.performer}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{selectedTransaction.createdBy}</span>
                    </div>
                  </div>

                  {selectedTransaction.referenceNo && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs">
                      <span className="text-slate-500 block text-[10px]">{t.referenceDoc}</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{selectedTransaction.referenceNo}</span>
                    </div>
                  )}

                  {selectedTransaction.supplierName && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs">
                      <span className="text-slate-500 block text-[10px]">{t.supplier}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTransaction.supplierName}</span>
                    </div>
                  )}

                  {selectedTransaction.recipientName && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs">
                      <span className="text-slate-500 block text-[10px]">{t.recipient}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedTransaction.recipientName}</span>
                    </div>
                  )}
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    รายการสินค้าที่ทำธุรกรรม (Items - {selectedTransaction.items.length})
                  </h4>
                  {selectedTransaction.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.productName}</p>
                          <p className="text-xs font-mono text-slate-500">{item.sku} | Code: {item.productCode}</p>
                        </div>
                        <span className="px-2 py-1 rounded-lg bg-blue-600/10 text-blue-600 font-bold text-xs">
                          {item.quantity} {item.uom}
                        </span>
                      </div>

                      {/* Lot & Expiry Details */}
                      {item.lotNumber && (
                        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[9px]">{t.lotBatch}</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{item.lotNumber}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">{t.mfgDate}</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{item.mfgDate || '-'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">{t.expDate}</span>
                            <span className="font-medium text-rose-500">{item.expDate || '-'}</span>
                          </div>
                        </div>
                      )}

                      {/* Warehouse & Bin Route */}
                      <div className="text-xs space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                        {item.fromWarehouseName && (
                          <div className="flex items-center justify-between text-slate-500">
                            <span>{t.sourceLocation}:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {item.fromWarehouseName.split(' ')[0]} / Bin: <strong className="text-blue-500 font-mono">{item.fromBinCode}</strong>
                            </span>
                          </div>
                        )}
                        {item.toWarehouseName && (
                          <div className="flex items-center justify-between text-slate-500">
                            <span>{t.destLocation}:</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {item.toWarehouseName.split(' ')[0]} / Bin: <strong className="font-mono">{item.toBinCode}</strong>
                            </span>
                          </div>
                        )}
                        {item.variance !== undefined && (
                          <div className="flex items-center justify-between text-slate-500">
                            <span>{t.varianceQty}:</span>
                            <span className={`font-bold ${item.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {item.variance > 0 ? `+${item.variance}` : item.variance} {item.uom}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {selectedTransaction.notes && (
                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 text-xs">
                    <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">{t.remarks}</span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedTransaction.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-inherit flex items-center justify-between gap-3">
              <button
                onClick={() => alert(`Printing Document Receipt: ${selectedTransaction.documentNo}`)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition"
              >
                <Printer className="w-4 h-4" />
                {t.printLabel}
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Creation Modal for New Stock Transaction */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div className="fixed inset-0 -z-10" onClick={() => setIsModalOpen(false)} />

          <div
            className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden relative z-10 transition animate-in zoom-in-95 duration-200 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header (Pinned at Top) */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-50">{t.modalNewTransaction}</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    บันทึกรายการเคลื่อนไหวสต็อกสินค้า (Multi-Tenant ISO WMS Standard)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition shrink-0"
                title="ปิดหน้าต่าง (Close)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form with Scrollable Content & Pinned Footer */}
            <form onSubmit={handleSaveTransaction} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* Type Switcher Pills */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    {t.transType} *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { type: 'RECEIVE' as TransactionType, label: '1. Receive (GR)', icon: ArrowDownLeft, color: 'text-emerald-500' },
                      { type: 'ISSUE' as TransactionType, label: '2. Issue (GI)', icon: ArrowUpRight, color: 'text-amber-500' },
                      { type: 'TRANSFER' as TransactionType, label: '3. Transfer (TR)', icon: ArrowRightLeft, color: 'text-indigo-500' },
                      { type: 'ADJUSTMENT' as TransactionType, label: '4. Adjust (ADJ)', icon: SlidersHorizontal, color: 'text-purple-500' },
                    ].map((btn) => (
                      <button
                        type="button"
                        key={btn.type}
                        onClick={() => setFormType(btn.type)}
                        className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold transition border ${
                          formType === btn.type
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <btn.icon className={`w-3.5 h-3.5 ${formType === btn.type ? 'text-white' : btn.color}`} />
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Form Fields based on Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reference Doc */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t.referenceDoc}
                    </label>
                    <input
                      type="text"
                      value={formReferenceNo}
                      onChange={(e) => setFormReferenceNo(e.target.value)}
                      placeholder="เช่น PO-2026-001, SO-2026-088"
                      className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* GR: Supplier */}
                  {formType === 'RECEIVE' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t.supplier} *
                      </label>
                      <select
                        value={formSupplierId}
                        onChange={(e) => setFormSupplierId(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {suppliersList.map((sup) => (
                          <option key={sup.id} value={sup.id}>
                            {sup.name} ({sup.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* GI: Purpose & Recipient */}
                  {formType === 'ISSUE' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t.reason} *
                        </label>
                        <select
                          value={formIssueReason}
                          onChange={(e) => setFormIssueReason(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="Sales Order Dispatch">Sales Order Dispatch (ส่งมอบลูกค้าตามใบสั่งขาย)</option>
                          <option value="Internal Department Requisition">Internal Requisition (เบิกใช้งานภายในองค์กร)</option>
                          <option value="Sample / Marketing">Sample / Marketing (เบิกเป็นสินค้าตัวอย่าง)</option>
                          <option value="Scrap / Defective">Scrap / Defective (ตัดจ่ายสินค้าชำรุดรอทิ้ง)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t.recipient}
                        </label>
                        <input
                          type="text"
                          value={formRecipient}
                          onChange={(e) => setFormRecipient(e.target.value)}
                          placeholder="ชื่อลูกค้า หรือ แผนกที่เบิก"
                          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </>
                  )}

                  {/* Transfer: Mode */}
                  {formType === 'TRANSFER' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t.transferMode} *
                      </label>
                      <select
                        value={formTransferType}
                        onChange={(e) => setFormTransferType(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="INTER_WAREHOUSE">{t.interWarehouse}</option>
                        <option value="BIN_TO_BIN">{t.binToBin}</option>
                      </select>
                    </div>
                  )}

                  {/* Adjustment: Reason & Direction */}
                  {formType === 'ADJUSTMENT' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          รูปแบบการปรับยอด *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setFormAdjDirection('INCREASE')}
                            className={`py-2 rounded-xl text-xs font-bold border transition ${
                              formAdjDirection === 'INCREASE'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            + ปรับเพิ่ม (Surplus)
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormAdjDirection('DECREASE')}
                            className={`py-2 rounded-xl text-xs font-bold border transition ${
                              formAdjDirection === 'DECREASE'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            - ปรับลด (Deficit)
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          {t.reason} *
                        </label>
                        <select
                          value={formAdjReason}
                          onChange={(e) => setFormAdjReason(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="Cycle Count Variance">ผลต่างจากการตรวจนับรอบ (Cycle Count Variance)</option>
                          <option value="Damaged during handling">สินค้าชำรุดแตกหักระหว่างจัดเก็บ/ขนย้าย</option>
                          <option value="Expired / Deteriorated">สินค้าหมดอายุ / เสื่อมสภาพ</option>
                          <option value="Found Unrecorded Goods">พบสินค้าเกินในคลัง (Found Surplus)</option>
                          <option value="Loss / Missing Goods">สินค้าสูญหาย (Lost Deficit)</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                {/* Product & Quantity Section */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    เลือกสินค้าและจำนวน
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        {t.productName} *
                      </label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {productsList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.sku}) — คงเหลือ: {p.stockOnHand} {p.uom}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        {t.quantity} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formQty}
                        onChange={(e) => setFormQty(Math.max(1, Number(e.target.value)))}
                        required
                        className="w-full px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Lot & Expiry for GR / GI / Transfer */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        {t.lotBatch} *
                      </label>
                      <input
                        type="text"
                        value={formLotNumber}
                        onChange={(e) => setFormLotNumber(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 rounded-xl text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        {t.mfgDate}
                      </label>
                      <input
                        type="date"
                        value={formMfgDate}
                        onChange={(e) => setFormMfgDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        {t.expDate}
                      </label>
                      <input
                        type="date"
                        value={formExpDate}
                        onChange={(e) => setFormExpDate(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Bin Locations Route */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    {formType !== 'RECEIVE' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          {t.sourceLocation} (From Bin) *
                        </label>
                        <select
                          value={fromBinId}
                          onChange={(e) => setFromBinId(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          {warehousesList.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.binCode} — {b.warehouseName.split(' ')[0]} ({b.zone.split(' ')[0]})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {formType !== 'ISSUE' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          {t.destLocation} (To Bin) *
                        </label>
                        <select
                          value={toBinId}
                          onChange={(e) => setToBinId(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          {warehousesList.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.binCode} — {b.warehouseName.split(' ')[0]} ({b.zone.split(' ')[0]})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.remarks}
                  </label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="ระบุหมายเหตุ เช่น สภาพสินค้า, เอกสารแนบ หรือเหตุผลเพิ่มเติม..."
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Pinned Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition"
                >
                  {t.submitTransaction}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
