import { useState, useEffect, useMemo } from 'react';
import {
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  ProductItem,
} from '../../../types';
import { productService } from '../../../services/product.service';
import { warehouseService } from '../../../services/warehouse.service';

export const useOrdersManagement = (
  type: OrderType,
  searchQuery: string = ''
) => {
  const isSales = type === 'SALES';

  // Orders state
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
          name: p.name || 'Product',
          category: p.category?.name || p.categoryName || 'General',
          brand: p.brand?.name || p.brandName || 'Standard',
          uom: p.baseUnit?.name || p.uom || 'Unit',
          weightKg: p.weightKg || 0,
          widthCm: p.widthCm || 0,
          lengthCm: p.lengthCm || 0,
          heightCm: p.heightCm || 0,
          price: p.sellingPriceMinor ? p.sellingPriceMinor / 100 : p.price || 0,
          costPrice: p.costPriceMinor ? p.costPriceMinor / 100 : p.costPrice || 0,
          stockOnHand: p.stockOnHand || p.currentStock || 0,
          reorderLevel: p.reorderLevel || p.reorderPoint || 10,
          minReorderQty: p.minReorderQty || 5,
        }));
        setProducts(mappedProducts);

        const whList = whRes.data || whRes.items || (Array.isArray(whRes) ? whRes : []);
        setWarehouses(whList);
        if (whList.length > 0) {
          setFormWarehouseId(whList[0].id);
        }
      } catch (err) {
        console.error('Failed to load products/warehouses in OrdersManagement:', err);
      }
    };
    fetchData();
  }, []);

  // Initial Sample Orders
  useEffect(() => {
    const initialOrders: Order[] = isSales
      ? [
          {
            id: 'so-001',
            orderNo: 'SO-2026-0042',
            type: 'SALES',
            status: 'PROCESSING',
            partyName: 'Siam Retail Group Co., Ltd.',
            contactPerson: 'คุณสมชาย วงศ์สวัสดิ์',
            phone: '081-234-5678',
            email: 'somchai@siamretail.co.th',
            orderDate: '2026-08-25',
            expectedDate: '2026-08-29',
            warehouseId: 'wh-01',
            warehouseName: 'Bangkok Main DC',
            paymentTerms: 'Credit 30 Days',
            subtotal: 45000,
            taxAmount: 3150,
            discountTotal: 0,
            grandTotal: 48150,
            items: [
              {
                id: 'soi-1',
                productId: 'prod-001',
                productCode: 'PRD-001',
                productName: 'Ergonomic Mesh Chair (Black Edition)',
                sku: 'FUR-CHA-001',
                uom: 'PCS',
                quantity: 10,
                unitPrice: 3500,
                discount: 0,
                totalAmount: 35000,
              },
              {
                id: 'soi-2',
                productId: 'prod-002',
                productCode: 'PRD-002',
                productName: 'Motorized Standing Desk 140x60cm',
                sku: 'FUR-DES-002',
                uom: 'PCS',
                quantity: 2,
                unitPrice: 5000,
                discount: 0,
                totalAmount: 10000,
              },
            ],
            notes: 'จัดส่งช่วงเช้า มีลิฟต์ขนของชั้น 4',
            createdBy: 'Sales Dept (Staff)',
            createdAt: '2026-08-25 09:30',
          },
          {
            id: 'so-002',
            orderNo: 'SO-2026-0041',
            type: 'SALES',
            status: 'COMPLETED',
            partyName: 'TechVision Solutions Ltd.',
            contactPerson: 'คุณวิภาวรรณ สุขสม',
            phone: '089-987-6543',
            email: 'wipawan@techvision.io',
            orderDate: '2026-08-24',
            expectedDate: '2026-08-26',
            warehouseId: 'wh-01',
            warehouseName: 'Bangkok Main DC',
            paymentTerms: 'Cash on Delivery',
            subtotal: 12400,
            taxAmount: 868,
            discountTotal: 400,
            grandTotal: 12868,
            items: [
              {
                id: 'soi-3',
                productId: 'prod-003',
                productCode: 'PRD-003',
                productName: 'Heavy-Duty Steel Storage Rack 4-Tier',
                sku: 'RACK-ST-04',
                uom: 'SETS',
                quantity: 4,
                unitPrice: 3100,
                discount: 0,
                totalAmount: 12400,
              },
            ],
            createdBy: 'Sales Dept (Staff)',
            createdAt: '2026-08-24 14:15',
          },
          {
            id: 'so-003',
            orderNo: 'SO-2026-0043',
            type: 'SALES',
            status: 'CONFIRMED',
            partyName: 'Modern Office Inter Co., Ltd.',
            contactPerson: 'คุณกิตติศักดิ์ ศรีสุข',
            phone: '062-445-1234',
            email: 'kittisak@modernoffice.th',
            orderDate: '2026-08-26',
            expectedDate: '2026-08-30',
            warehouseId: 'wh-02',
            warehouseName: 'Eastern Logistics Hub',
            paymentTerms: 'Credit 60 Days',
            subtotal: 28000,
            taxAmount: 1960,
            discountTotal: 1000,
            grandTotal: 28960,
            items: [
              {
                id: 'soi-4',
                productId: 'prod-001',
                productCode: 'PRD-001',
                productName: 'Ergonomic Mesh Chair (Black Edition)',
                sku: 'FUR-CHA-001',
                uom: 'PCS',
                quantity: 8,
                unitPrice: 3500,
                discount: 0,
                totalAmount: 28000,
              },
            ],
            createdBy: 'Sales Dept (Staff)',
            createdAt: '2026-08-26 11:00',
          },
        ]
      : [
          {
            id: 'po-001',
            orderNo: 'PO-2026-0018',
            type: 'PURCHASE',
            status: 'PROCESSING',
            partyName: 'Apex Industrial Parts Supplier Ltd.',
            contactPerson: 'Sale Dept / Mr. David Chen',
            phone: '02-789-0123',
            email: 'orders@apex-industrial.com',
            orderDate: '2026-08-23',
            expectedDate: '2026-08-28',
            warehouseId: 'wh-01',
            warehouseName: 'Bangkok Main DC',
            paymentTerms: 'Credit 45 Days',
            subtotal: 85000,
            taxAmount: 5950,
            discountTotal: 2000,
            grandTotal: 88950,
            items: [
              {
                id: 'poi-1',
                productId: 'prod-001',
                productCode: 'PRD-001',
                productName: 'Ergonomic Mesh Chair (Black Edition)',
                sku: 'FUR-CHA-001',
                uom: 'PCS',
                quantity: 30,
                unitPrice: 2100,
                discount: 0,
                totalAmount: 63000,
              },
              {
                id: 'poi-2',
                productId: 'prod-002',
                productCode: 'PRD-002',
                productName: 'Motorized Standing Desk 140x60cm',
                sku: 'FUR-DES-002',
                uom: 'PCS',
                quantity: 7,
                unitPrice: 3142.85,
                discount: 0,
                totalAmount: 22000,
              },
            ],
            notes: 'นำเข้าล็อตใหม่ พร้อมใบเซอร์ ISO9001',
            createdBy: 'Purchasing Dept (Staff)',
            createdAt: '2026-08-23 10:00',
          },
          {
            id: 'po-002',
            orderNo: 'PO-2026-0019',
            type: 'PURCHASE',
            status: 'CONFIRMED',
            partyName: 'SteelTech Manufacturing Group',
            contactPerson: 'คุณอารียา ธนกิจ',
            phone: '038-123-456',
            email: 'areeya@steeltech.co.th',
            orderDate: '2026-08-25',
            expectedDate: '2026-09-02',
            warehouseId: 'wh-02',
            warehouseName: 'Eastern Logistics Hub',
            paymentTerms: 'Credit 30 Days',
            subtotal: 42000,
            taxAmount: 2940,
            discountTotal: 0,
            grandTotal: 44940,
            items: [
              {
                id: 'poi-3',
                productId: 'prod-003',
                productCode: 'PRD-003',
                productName: 'Heavy-Duty Steel Storage Rack 4-Tier',
                sku: 'RACK-ST-04',
                uom: 'SETS',
                quantity: 20,
                unitPrice: 2100,
                discount: 0,
                totalAmount: 42000,
              },
            ],
            createdBy: 'Purchasing Dept (Staff)',
            createdAt: '2026-08-25 15:40',
          },
        ];

    setOrders(initialOrders);
  }, [isSales]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.contactPerson && o.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())) ||
        o.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()) || i.sku.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalCount = orders.length;
    const confirmedCount = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'DRAFT').length;
    const processingCount = orders.filter((o) => o.status === 'PROCESSING').length;
    const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;
    const totalValue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

    return { totalCount, confirmedCount, processingCount, completedCount, totalValue };
  }, [orders]);

  // Form Calculations
  const calculatedSubtotal = useMemo(() => {
    return formItems.reduce((acc, item) => acc + (item.totalAmount || 0), 0);
  }, [formItems]);

  const calculatedDiscount = useMemo(() => {
    return formItems.reduce((acc, item) => acc + (item.discount || 0), 0);
  }, [formItems]);

  const calculatedTax = useMemo(() => {
    return Math.round(calculatedSubtotal * 0.07);
  }, [calculatedSubtotal]);

  const calculatedTotal = useMemo(() => {
    return calculatedSubtotal + calculatedTax;
  }, [calculatedSubtotal, calculatedTax]);

  // Item form helpers
  const handleAddItem = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingIndex = formItems.findIndex((i) => i.productId === productId);
    if (existingIndex >= 0) {
      const updated = [...formItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalAmount =
        updated[existingIndex].quantity * updated[existingIndex].unitPrice - (updated[existingIndex].discount || 0);
      setFormItems(updated);
    } else {
      const unitPrice = isSales ? product.price : product.costPrice || product.price * 0.7;
      const newItem: OrderItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        sku: product.sku,
        uom: product.uom,
        quantity: 1,
        unitPrice: unitPrice,
        discount: 0,
        totalAmount: unitPrice,
      };
      setFormItems([...formItems, newItem]);
    }
  };

  const handleUpdateItemQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setFormItems(formItems.filter((i) => i.id !== id));
      return;
    }
    setFormItems(
      formItems.map((i) =>
        i.id === id
          ? {
              ...i,
              quantity: qty,
              totalAmount: Math.max(0, qty * i.unitPrice - (i.discount || 0)),
            }
          : i
      )
    );
  };

  const handleUpdateItemPrice = (id: string, price: number) => {
    setFormItems(
      formItems.map((i) =>
        i.id === id
          ? {
              ...i,
              unitPrice: price,
              totalAmount: Math.max(0, i.quantity * price - (i.discount || 0)),
            }
          : i
      )
    );
  };

  const handleUpdateItemDiscount = (id: string, disc: number) => {
    setFormItems(
      formItems.map((i) =>
        i.id === id
          ? {
              ...i,
              discount: disc,
              totalAmount: Math.max(0, i.quantity * i.unitPrice - disc),
            }
          : i
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setFormItems(formItems.filter((i) => i.id !== id));
  };

  const handleOpenCreateModal = () => {
    setFormPartyName('');
    setFormContactPerson('');
    setFormPhone('');
    setFormEmail('');
    setFormOrderDate(new Date().toISOString().split('T')[0]);
    setFormExpectedDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setFormPaymentTerms('Credit 30 Days');
    setFormNotes('');
    if (products.length > 0) {
      handleAddItem(products[0].id);
    } else {
      setFormItems([]);
    }
    setIsCreateModalOpen(true);
  };

  const handleSaveOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (formItems.length === 0) {
      alert('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    const wh = warehouses.find((w) => w.id === formWarehouseId) || warehouses[0];
    const prefix = isSales ? 'SO' : 'PO';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrderNumber = `${prefix}-2026-${randomNum}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNo: newOrderNumber,
      type: type,
      status: 'CONFIRMED',
      partyName: formPartyName || (isSales ? 'ลูกค้าทั่วไป (Walk-in Customer)' : 'ผู้จัดจำหน่ายหลัก'),
      contactPerson: formContactPerson || '-',
      phone: formPhone || '-',
      email: formEmail || '-',
      orderDate: formOrderDate,
      expectedDate: formExpectedDate,
      warehouseId: formWarehouseId || wh?.id || 'wh-01',
      warehouseName: wh?.name || 'Main Warehouse',
      paymentTerms: formPaymentTerms,
      notes: formNotes,
      items: formItems,
      subtotal: calculatedSubtotal,
      discountTotal: calculatedDiscount,
      taxAmount: calculatedTax,
      grandTotal: calculatedTotal,
      createdBy: isSales ? 'Sales Dept (Staff)' : 'Purchasing Dept (Staff)',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setOrders([newOrder, ...orders]);
    setIsCreateModalOpen(false);
  };

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  return {
    isSales,
    orders,
    selectedOrder,
    statusFilter,
    setStatusFilter,
    isDrawerOpen,
    setIsDrawerOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    products,
    warehouses,
    formPartyName,
    setFormPartyName,
    formContactPerson,
    setFormContactPerson,
    formPhone,
    setFormPhone,
    formEmail,
    setFormEmail,
    formOrderDate,
    setFormOrderDate,
    formExpectedDate,
    setFormExpectedDate,
    formWarehouseId,
    setFormWarehouseId,
    formPaymentTerms,
    setFormPaymentTerms,
    formNotes,
    setFormNotes,
    formItems,
    calculatedSubtotal,
    calculatedDiscount,
    calculatedTax,
    calculatedTotal,
    filteredOrders,
    metrics,
    handleAddItem,
    handleUpdateItemQty,
    handleUpdateItemPrice,
    handleUpdateItemDiscount,
    handleRemoveItem,
    handleOpenCreateModal,
    handleSaveOrder,
    handleOpenDetail,
    handleUpdateOrderStatus,
  };
};
