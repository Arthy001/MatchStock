import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Eye,
  FileText,
  Calendar,
  Clock,
  User,
  Building2,
  Phone,
  Mail,
  DollarSign,
  CheckCircle2,
  Clock3,
  XCircle,
  Package,
  Trash2,
  Download,
  Printer,
  ChevronRight,
  ArrowRight,
  Sparkles,
  X,
  CreditCard,
  Truck,
  Check,
} from 'lucide-react';
import { Language, ThemeMode, Order, OrderItem, OrderStatus, OrderType, ProductItem } from '../types';
import { getTranslation } from '../i18n';
import { productService } from '../services/product.service';
import { warehouseService } from '../services/warehouse.service';

interface OrdersManagementProps {
  type: OrderType;
  lang: Language;
  theme: ThemeMode;
  searchQuery?: string;
  onNavigateToStockAction?: (actionType: 'RECEIVE' | 'ISSUE', order: Order) => void;
}

export const OrdersManagement: React.FC<OrdersManagementProps> = ({
  type,
  lang,
  theme,
  searchQuery = '',
  onNavigateToStockAction,
}) => {
  const t = getTranslation(lang);
  const isSales = type === 'SALES';

  // States
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Products & Warehouses Cache
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);

  // Create Form State
  const [formPartyName, setFormPartyName] = useState<string>('');
  const [formContactPerson, setFormContactPerson] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formOrderDate, setFormOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formExpectedDate, setFormExpectedDate] = useState<string>(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [formWarehouseId, setFormWarehouseId] = useState<string>('');
  const [formPaymentTerms, setFormPaymentTerms] = useState<string>('Credit 30 Days');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formItems, setFormItems] = useState<OrderItem[]>([]);

  // Load Products & Warehouses on mount
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
          price: p.price || 1200,
          stockOnHand: p.stockOnHand ?? 85,
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
          setFormWarehouseId(whList[0].id || whList[0].code);
        }

        // Initialize Sample Orders with Real Database Products
        if (mappedProducts.length > 0) {
          if (isSales) {
            const sampleSO1: Order = {
              id: 'so-001',
              orderNo: 'SO-2026-08101',
              type: 'SALES',
              status: 'CONFIRMED',
              partyName: 'Apex Industrial Solutions Ltd.',
              contactPerson: 'Krit Kittisak',
              phone: '081-987-6543',
              email: 'procurement@apex-industrial.co.th',
              orderDate: '2026-08-21',
              expectedDate: '2026-08-25',
              warehouseId: whList[0]?.id || 'wh-001',
              warehouseName: whList[0]?.name || 'WH-Bangkok Center',
              paymentTerms: 'Credit 30 Days',
              notes: 'จัดส่งด่วนรอบเช้า พร้อมใบกำกับภาษีต้นฉบับ',
              createdBy: 'Sales Dept (Thanathat)',
              createdAt: '2026-08-21 09:15:00',
              items: [
                {
                  id: 'so-item-1',
                  productId: mappedProducts[0]?.id || 'p-1',
                  productCode: mappedProducts[0]?.code || 'SKU-001',
                  productName: mappedProducts[0]?.name || 'Industrial Heavy Duty Bearing',
                  sku: mappedProducts[0]?.sku || 'SKU-001',
                  uom: mappedProducts[0]?.uom || 'Unit',
                  quantity: 10,
                  unitPrice: mappedProducts[0]?.price || 1500,
                  discount: 0,
                  totalAmount: 10 * (mappedProducts[0]?.price || 1500),
                },
                {
                  id: 'so-item-2',
                  productId: mappedProducts[1]?.id || 'p-2',
                  productCode: mappedProducts[1]?.code || 'SKU-002',
                  productName: mappedProducts[1]?.name || 'High Precision Sensor Unit',
                  sku: mappedProducts[1]?.sku || 'SKU-002',
                  uom: mappedProducts[1]?.uom || 'Unit',
                  quantity: 5,
                  unitPrice: mappedProducts[1]?.price || 3200,
                  discount: 500,
                  totalAmount: 5 * (mappedProducts[1]?.price || 3200) - 500,
                },
              ],
              subtotal: 30500,
              taxAmount: 2135,
              discountTotal: 500,
              grandTotal: 32635,
            };

            const sampleSO2: Order = {
              id: 'so-002',
              orderNo: 'SO-2026-08098',
              type: 'SALES',
              status: 'COMPLETED',
              partyName: 'Siam Robotics & Automation',
              contactPerson: 'Natcha S.',
              phone: '089-123-4567',
              email: 'orders@siamrobotics.com',
              orderDate: '2026-08-19',
              expectedDate: '2026-08-20',
              warehouseId: whList[0]?.id || 'wh-001',
              warehouseName: whList[0]?.name || 'WH-Bangkok Center',
              paymentTerms: 'Cash On Delivery',
              createdBy: 'Sales Dept (Thanathat)',
              createdAt: '2026-08-19 14:20:00',
              items: [
                {
                  id: 'so-item-3',
                  productId: mappedProducts[0]?.id || 'p-1',
                  productCode: mappedProducts[0]?.code || 'SKU-001',
                  productName: mappedProducts[0]?.name || 'Industrial Heavy Duty Bearing',
                  sku: mappedProducts[0]?.sku || 'SKU-001',
                  uom: mappedProducts[0]?.uom || 'Unit',
                  quantity: 20,
                  unitPrice: mappedProducts[0]?.price || 1500,
                  discount: 1000,
                  totalAmount: 29000,
                },
              ],
              subtotal: 29000,
              taxAmount: 2030,
              discountTotal: 1000,
              grandTotal: 31030,
            };

            setOrders([sampleSO1, sampleSO2]);
          } else {
            const samplePO1: Order = {
              id: 'po-001',
              orderNo: 'PO-2026-08101',
              type: 'PURCHASE',
              status: 'CONFIRMED',
              partyName: 'Sumitomo Global Machinery Supplier',
              contactPerson: 'Tanaka Kenji',
              phone: '+81-3-5555-0199',
              email: 'export@sumitomo-machinery.jp',
              orderDate: '2026-08-21',
              expectedDate: '2026-08-28',
              warehouseId: whList[0]?.id || 'wh-001',
              warehouseName: whList[0]?.name || 'WH-Bangkok Center',
              paymentTerms: 'T/T 60 Days',
              notes: 'สั่งซื้อเติมสต็อกประจำสัปดาห์ (Reorder Cycle)',
              createdBy: 'Purchasing (Kittisak)',
              createdAt: '2026-08-21 11:00:00',
              items: [
                {
                  id: 'po-item-1',
                  productId: mappedProducts[0]?.id || 'p-1',
                  productCode: mappedProducts[0]?.code || 'SKU-001',
                  productName: mappedProducts[0]?.name || 'Industrial Heavy Duty Bearing',
                  sku: mappedProducts[0]?.sku || 'SKU-001',
                  uom: mappedProducts[0]?.uom || 'Unit',
                  quantity: 100,
                  unitPrice: 1100,
                  discount: 0,
                  totalAmount: 110000,
                },
                {
                  id: 'po-item-2',
                  productId: mappedProducts[1]?.id || 'p-2',
                  productCode: mappedProducts[1]?.code || 'SKU-002',
                  productName: mappedProducts[1]?.name || 'High Precision Sensor Unit',
                  sku: mappedProducts[1]?.sku || 'SKU-002',
                  uom: mappedProducts[1]?.uom || 'Unit',
                  quantity: 50,
                  unitPrice: 2400,
                  discount: 2000,
                  totalAmount: 118000,
                },
              ],
              subtotal: 228000,
              taxAmount: 15960,
              discountTotal: 2000,
              grandTotal: 243960,
            };

            const samplePO2: Order = {
              id: 'po-002',
              orderNo: 'PO-2026-08092',
              type: 'PURCHASE',
              status: 'COMPLETED',
              partyName: 'Bangkok Industrial Component Co., Ltd.',
              contactPerson: 'Prasert M.',
              phone: '02-777-8899',
              email: 'sales@bkk-industrial.co.th',
              orderDate: '2026-08-15',
              expectedDate: '2026-08-18',
              warehouseId: whList[0]?.id || 'wh-001',
              warehouseName: whList[0]?.name || 'WH-Bangkok Center',
              paymentTerms: 'Credit 30 Days',
              createdBy: 'Purchasing (Kittisak)',
              createdAt: '2026-08-15 10:30:00',
              items: [
                {
                  id: 'po-item-3',
                  productId: mappedProducts[0]?.id || 'p-1',
                  productCode: mappedProducts[0]?.code || 'SKU-001',
                  productName: mappedProducts[0]?.name || 'Industrial Heavy Duty Bearing',
                  sku: mappedProducts[0]?.sku || 'SKU-001',
                  uom: mappedProducts[0]?.uom || 'Unit',
                  quantity: 40,
                  unitPrice: 1150,
                  discount: 0,
                  totalAmount: 46000,
                },
              ],
              subtotal: 46000,
              taxAmount: 3220,
              discountTotal: 0,
              grandTotal: 49220,
            };

            setOrders([samplePO1, samplePO2]);
          }
        }
      } catch (err) {
        console.error('Failed to load orders data:', err);
      }
    };

    fetchData();
  }, [type]);

  // Open Create Order Modal with a default item
  const handleOpenCreateModal = () => {
    if (products.length > 0) {
      setFormItems([
        {
          id: `item-${Date.now()}-1`,
          productId: products[0].id,
          productCode: products[0].code,
          productName: products[0].name,
          sku: products[0].sku,
          uom: products[0].uom,
          quantity: 10,
          unitPrice: products[0].price,
          discount: 0,
          totalAmount: 10 * products[0].price,
        },
      ]);
    } else {
      setFormItems([]);
    }
    setIsCreateModalOpen(true);
  };

  // Add Item in Create Form
  const handleAddItemToForm = () => {
    if (products.length === 0) return;
    const defaultProd = products[0];
    const newItem: OrderItem = {
      id: `item-${Date.now()}-${formItems.length + 1}`,
      productId: defaultProd.id,
      productCode: defaultProd.code,
      productName: defaultProd.name,
      sku: defaultProd.sku,
      uom: defaultProd.uom,
      quantity: 1,
      unitPrice: defaultProd.price,
      discount: 0,
      totalAmount: defaultProd.price,
    };
    setFormItems([...formItems, newItem]);
  };

  // Update Item in Create Form
  const handleUpdateFormItem = (
    index: number,
    field: 'productId' | 'quantity' | 'unitPrice' | 'discount',
    val: any
  ) => {
    const updated = [...formItems];
    const target = { ...updated[index] };

    if (field === 'productId') {
      const matched = products.find((p) => p.id === val);
      if (matched) {
        target.productId = matched.id;
        target.productCode = matched.code;
        target.productName = matched.name;
        target.sku = matched.sku;
        target.uom = matched.uom;
        target.unitPrice = matched.price;
      }
    } else if (field === 'quantity') {
      target.quantity = Math.max(1, parseInt(val, 10) || 1);
    } else if (field === 'unitPrice') {
      target.unitPrice = Math.max(0, parseFloat(val) || 0);
    } else if (field === 'discount') {
      target.discount = Math.max(0, parseFloat(val) || 0);
    }

    target.totalAmount = Math.max(0, target.quantity * target.unitPrice - target.discount);
    updated[index] = target;
    setFormItems(updated);
  };

  // Remove Item in Create Form
  const handleRemoveFormItem = (index: number) => {
    setFormItems(formItems.filter((_, idx) => idx !== index));
  };

  // Calculate Form Totals
  const formSubtotal = formItems.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const formDiscountTotal = formItems.reduce((acc, curr) => acc + curr.discount, 0);
  const formTaxAmount = Math.round(formSubtotal * 0.07 * 100) / 100;
  const formGrandTotal = formSubtotal + formTaxAmount;

  // Submit Create Order
  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formItems.length === 0) {
      alert('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    const whObj = warehouses.find((w) => w.id === formWarehouseId) || {
      id: 'wh-001',
      name: 'WH-Bangkok Center',
    };

    const newOrderNo = `${isSales ? 'SO' : 'PO'}-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: `${isSales ? 'so' : 'po'}-${Date.now()}`,
      orderNo: newOrderNo,
      type,
      status: 'CONFIRMED',
      partyName: formPartyName,
      contactPerson: formContactPerson,
      phone: formPhone,
      email: formEmail,
      orderDate: formOrderDate,
      expectedDate: formExpectedDate,
      warehouseId: whObj.id,
      warehouseName: whObj.name,
      paymentTerms: formPaymentTerms,
      notes: formNotes,
      items: formItems,
      subtotal: formSubtotal,
      discountTotal: formDiscountTotal,
      taxAmount: formTaxAmount,
      grandTotal: formGrandTotal,
      createdBy: isSales ? 'Sales Dept (Staff)' : 'Purchasing Dept (Staff)',
      createdAt: new Date().toLocaleString(),
    };

    setOrders([newOrder, ...orders]);
    setIsCreateModalOpen(false);
    setFormPartyName('');
    setFormContactPerson('');
    setFormPhone('');
    setFormEmail('');
    setFormNotes('');
    alert(`สร้างใบ${isSales ? 'สั่งขาย (SO)' : 'สั่งซื้อ (PO)'} เลขที่ ${newOrderNo} สำเร็จเรียบร้อยแล้ว!`);
  };

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNo.toLowerCase().includes(q) ||
        o.partyName.toLowerCase().includes(q) ||
        o.warehouseName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPI Calculations
  const totalOrderValue = orders.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const confirmedCount = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PROCESSING').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isSales
                  ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                  : 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isSales ? <ShoppingCart className="w-6 h-6" /> : <ShoppingBag className="w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                {isSales ? 'ระบบจัดการใบสั่งขาย (Sales Order - SO)' : 'ระบบจัดการใบสั่งซื้อ (Purchase Order - PO)'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                {isSales
                  ? 'บันทึกคำสั่งซื้อจากลูกค้า จองสต็อกสินค้า (Reserved Stock) และส่งต่อเพื่อตัดเบิกจ่ายสินค้า (Goods Issue)'
                  : 'บันทึกใบสั่งซื้อสินค้าจากซัพพลายเออร์ ติดตามสถานะสินค้าเข้า (On-Order) และส่งต่อไปรับเข้าคลัง (Goods Receive)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className={`px-4 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 transition shadow-md ${
                isSales
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{isSales ? 'สร้างใบสั่งขายใหม่ (New SO)' : 'สร้างใบสั่งซื้อใหม่ (New PO)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`p-4 rounded-2xl border transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {isSales ? 'ใบสั่งขายทั้งหมด' : 'ใบสั่งซื้อทั้งหมด'}
            </span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">
            {orders.length}{' '}
            <span className="text-xs font-medium text-slate-500">ฉบับ</span>
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">รอดำเนินการ / จัดส่ง</span>
            <Clock3 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {confirmedCount}{' '}
            <span className="text-xs font-medium text-slate-500">รายการ</span>
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">เสร็จสมบูรณ์แล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {completedCount}{' '}
            <span className="text-xs font-medium text-slate-500">รายการ</span>
          </p>
        </div>

        <div
          className={`p-4 rounded-2xl border transition ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {isSales ? 'มูลค่ายอดขายรวม (Revenue)' : 'มูลค่ายอดสั่งซื้อรวม (Spend)'}
            </span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">
            ฿{totalOrderValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {/* Status Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap gap-1.5">
            {(['ALL', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st === 'ALL'
                  ? 'ทั้งหมด'
                  : st === 'CONFIRMED'
                  ? 'ยืนยันคำสั่ง'
                  : st === 'PROCESSING'
                  ? 'กำลังดำเนินงาน'
                  : st === 'COMPLETED'
                  ? 'เสร็จสมบูรณ์'
                  : 'ยกเลิก'}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-medium">
            พบ {filteredOrders.length} รายการ
          </span>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead
              className={`sticky top-0 ${
                theme === 'dark' ? 'bg-slate-800/90 text-slate-300' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <tr>
                <th className="py-3 px-3.5 font-semibold">เลขที่เอกสาร</th>
                <th className="py-3 px-3 font-semibold">{isSales ? 'ชื่อลูกค้า / บริษัท' : 'ชื่อซัพพลายเออร์'}</th>
                <th className="py-3 px-3 font-semibold">วันที่สั่ง</th>
                <th className="py-3 px-3 font-semibold">กำหนดส่งมอบ</th>
                <th className="py-3 px-3 font-semibold">คลังเป้าหมาย</th>
                <th className="py-3 px-3 font-semibold text-right">จำนวนสินค้า</th>
                <th className="py-3 px-3 font-semibold text-right">ยอดสุทธิ (Grand Total)</th>
                <th className="py-3 px-3 font-semibold text-center">สถานะ</th>
                <th className="py-3 px-3.5 font-semibold text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsDrawerOpen(true);
                  }}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer"
                >
                  <td className="py-3 px-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {order.orderNo}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{order.partyName}</div>
                    <div className="text-[11px] text-slate-500">{order.contactPerson || '-'}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono">{order.orderDate}</td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono">{order.expectedDate}</td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">{order.warehouseName}</td>
                  <td className="py-3 px-3 text-right font-medium">
                    {order.items.reduce((acc, curr) => acc + curr.quantity, 0)} ชิ้น ({order.items.length} SKUs)
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-slate-50">
                    ฿{order.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : order.status === 'CONFIRMED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                          : order.status === 'PROCESSING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      {order.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                      {order.status === 'CONFIRMED' && <Clock className="w-3 h-3 text-blue-500" />}
                      {order.status === 'COMPLETED'
                        ? 'เสร็จสมบูรณ์'
                        : order.status === 'CONFIRMED'
                        ? 'ยืนยันคำสั่ง'
                        : order.status === 'PROCESSING'
                        ? 'กำลังดำเนินการ'
                        : 'ยกเลิก'}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                        setIsDrawerOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                      title="ดูรายละเอียด"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 480px Slide-Over Detail Drawer */}
      {isDrawerOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div
            className={`w-full max-w-[480px] h-full shadow-2xl flex flex-col justify-between border-l transition-all animate-in slide-in-from-right duration-300 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{selectedOrder.orderNo}</h3>
                  <p className="text-[11px] text-slate-500">
                    {isSales ? 'ใบสั่งขาย (Sales Order)' : 'ใบสั่งซื้อ (Purchase Order)'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Partner / Customer Info */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isSales ? 'ข้อมูลลูกค้า (Customer Info)' : 'ข้อมูลซัพพลายเออร์ (Supplier Info)'}
                </p>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {selectedOrder.partyName}
                </h4>
                {selectedOrder.contactPerson && (
                  <p className="text-slate-600 dark:text-slate-400">ผู้ติดต่อ: {selectedOrder.contactPerson}</p>
                )}
                {selectedOrder.phone && (
                  <p className="text-slate-600 dark:text-slate-400">โทรศัพท์: {selectedOrder.phone}</p>
                )}
                {selectedOrder.email && (
                  <p className="text-slate-600 dark:text-slate-400">อีเมล: {selectedOrder.email}</p>
                )}
              </div>

              {/* Order Logistics Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <p className="text-[10px] text-slate-500 font-medium">วันที่สั่ง</p>
                  <p className="font-mono font-bold mt-0.5">{selectedOrder.orderDate}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <p className="text-[10px] text-slate-500 font-medium">กำหนดส่งมอบ</p>
                  <p className="font-mono font-bold mt-0.5 text-blue-600 dark:text-blue-400">
                    {selectedOrder.expectedDate}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <p className="text-[10px] text-slate-500 font-medium">คลังเป้าหมาย</p>
                  <p className="font-semibold mt-0.5 truncate">{selectedOrder.warehouseName}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <p className="text-[10px] text-slate-500 font-medium">เครดิต / ชำระเงิน</p>
                  <p className="font-semibold mt-0.5 truncate">{selectedOrder.paymentTerms}</p>
                </div>
              </div>

              {/* Order Items Table */}
              <div>
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                  รายการสินค้าในคำสั่ง ({selectedOrder.items.length} รายการ)
                </p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                          {item.productName}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500">
                          SKU: {item.sku} | ฿{item.unitPrice.toLocaleString()} x {item.quantity} {item.uom}
                        </p>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        ฿{item.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculations */}
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>มูลค่าสินค้ารวม (Subtotal):</span>
                  <span>฿{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                {selectedOrder.discountTotal > 0 && (
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>ส่วนลดรวม (Discount):</span>
                    <span>-฿{selectedOrder.discountTotal.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>ภาษีมูลค่าเพิ่ม 7% (VAT):</span>
                  <span>฿{selectedOrder.taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-base pt-2 border-t border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100">
                  <span>ยอดสุทธิ (Grand Total):</span>
                  <span>฿{selectedOrder.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  if (onNavigateToStockAction) {
                    onNavigateToStockAction(isSales ? 'ISSUE' : 'RECEIVE', selectedOrder);
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition"
              >
                <Truck className="w-4 h-4" />
                <span>{isSales ? 'ส่งไปทำรายการเบิกจ่าย (GI)' : 'ส่งไปทำรายการรับเข้า (GR)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-2xl rounded-2xl border shadow-2xl p-6 max-h-[90vh] overflow-y-auto transition ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-50' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold">
                {isSales ? 'สร้างใบสั่งขายใหม่ (Create Sales Order)' : 'สร้างใบสั่งซื้อใหม่ (Create Purchase Order)'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isSales ? 'ชื่อลูกค้า / บริษัท:' : 'ชื่อผู้จัดจำหน่าย / ซัพพลายเออร์:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formPartyName}
                    onChange={(e) => setFormPartyName(e.target.value)}
                    placeholder={isSales ? 'เช่น บจก. สยามโรโบติกส์' : 'เช่น บจก. ซูมิโตโม แมชชีนเนอรี่'}
                    className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 transition ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-slate-100'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ผู้ติดต่อ / เบอร์โทร:
                  </label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    placeholder="เช่น คุณกิตติศักดิ์ (081-xxx-xxxx)"
                    className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 transition ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-slate-100'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">วันที่สั่งซื้อ:</label>
                  <input
                    type="date"
                    required
                    value={formOrderDate}
                    onChange={(e) => setFormOrderDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 transition ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-slate-100'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">กำหนดส่งมอบ:</label>
                  <input
                    type="date"
                    required
                    value={formExpectedDate}
                    onChange={(e) => setFormExpectedDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 transition ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-slate-100'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">คลังเป้าหมาย:</label>
                  <select
                    value={formWarehouseId}
                    onChange={(e) => setFormWarehouseId(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-medium focus:ring-2 focus:ring-blue-500 transition ${
                      theme === 'dark'
                        ? 'bg-slate-800 border-slate-700 text-slate-100'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    {warehouses.map((w) => (
                      <option key={w.id || w.code} value={w.id || w.code}>
                        {w.name || w.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items in Order */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">รายการสินค้า (Order Items):</span>
                  <button
                    type="button"
                    onClick={handleAddItemToForm}
                    className="px-2.5 py-1 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white font-bold transition flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    เพิ่มสินค้า
                  </button>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {formItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                    >
                      <div className="sm:col-span-5">
                        <select
                          value={item.productId}
                          onChange={(e) => handleUpdateFormItem(idx, 'productId', e.target.value)}
                          className={`w-full px-2 py-1.5 rounded-lg border font-medium text-xs ${
                            theme === 'dark'
                              ? 'bg-slate-800 border-slate-700 text-slate-100'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Stock: {p.stockOnHand})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateFormItem(idx, 'quantity', e.target.value)}
                          placeholder="จำนวน"
                          className={`w-full text-center px-2 py-1.5 rounded-lg border font-mono font-bold text-xs ${
                            theme === 'dark'
                              ? 'bg-slate-800 border-slate-700 text-slate-100'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateFormItem(idx, 'unitPrice', e.target.value)}
                          placeholder="ราคา/หน่วย"
                          className={`w-full text-right px-2 py-1.5 rounded-lg border font-mono font-bold text-xs ${
                            theme === 'dark'
                              ? 'bg-slate-800 border-slate-700 text-slate-100'
                              : 'bg-white border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="sm:col-span-2 text-right font-bold text-blue-600 dark:text-blue-400">
                        ฿{item.totalAmount.toLocaleString()}
                      </div>

                      <div className="sm:col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveFormItem(idx)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold">
                <span>ยอดสุทธิรวมภาษี (Grand Total):</span>
                <span className="text-base text-blue-600 dark:text-blue-400 font-extrabold">
                  ฿{formGrandTotal.toLocaleString()}
                </span>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition"
                >
                  ยืนยันบันทึกเอกสาร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
