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
import { transactionService } from '../../../services/transaction.service';

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

  // Load Real Orders from Backend API (Goods Issues for Sales, Goods Receipts for Purchases)
  useEffect(() => {
    const loadRealOrders = async () => {
      try {
        if (isSales) {
          const issuesRes = await transactionService.getGoodsIssues();
          const itemsList = issuesRes.data || issuesRes.items || (Array.isArray(issuesRes) ? issuesRes : []);
          if (itemsList.length > 0) {
            const mappedOrders: Order[] = itemsList.map((gi: any) => ({
              id: gi.id,
              orderNo: gi.soNumber || gi.issueNumber || `SO-${gi.id.slice(0, 8)}`,
              type: 'SALES',
              status: gi.status === 'completed' ? 'COMPLETED' : gi.status === 'draft' ? 'CONFIRMED' : 'PROCESSING',
              partyName: gi.reference || gi.notes || 'ลูกค้าคำสั่งขาย (Sales Customer)',
              contactPerson: gi.createdByType || 'Sales Operator',
              phone: '-',
              email: '-',
              orderDate: (gi.issuedAt || gi.createdAt)?.slice(0, 10) || new Date().toISOString().slice(0, 10),
              expectedDate: (gi.issuedAt || gi.createdAt)?.slice(0, 10) || new Date().toISOString().slice(0, 10),
              warehouseId: gi.warehouseId,
              warehouseName: gi.warehouse?.name || 'คลังสินค้าหลัก',
              paymentTerms: 'Credit 30 Days',
              subtotal: gi.lines?.reduce((sum: number, l: any) => sum + (l.quantity * (l.unitPriceMinor ? Number(l.unitPriceMinor) / 100 : 500)), 0) || 5000,
              taxAmount: 350,
              discountTotal: 0,
              grandTotal: gi.lines?.reduce((sum: number, l: any) => sum + (l.quantity * (l.unitPriceMinor ? Number(l.unitPriceMinor) / 100 : 500)), 0) || 5350,
              items: gi.lines?.map((l: any) => ({
                id: l.id,
                productId: l.productId,
                productCode: l.product?.code || 'SKU',
                productName: l.product?.name || 'สินค้า',
                sku: l.product?.sku || l.product?.code || 'SKU',
                uom: l.product?.baseUnit?.name || 'PCS',
                quantity: l.quantity,
                unitPrice: l.unitPriceMinor ? Number(l.unitPriceMinor) / 100 : 500,
                discount: 0,
                totalAmount: l.quantity * (l.unitPriceMinor ? Number(l.unitPriceMinor) / 100 : 500),
              })) || [],
              notes: gi.notes,
              createdBy: gi.createdByType || 'Sales Operator',
              createdAt: gi.createdAt || new Date().toISOString(),
            }));
            setOrders(mappedOrders);
            return;
          }
        } else {
          const receiptsRes = await transactionService.getGoodsReceipts();
          const itemsList = receiptsRes.data || receiptsRes.items || (Array.isArray(receiptsRes) ? receiptsRes : []);
          if (itemsList.length > 0) {
            const mappedOrders: Order[] = itemsList.map((gr: any) => ({
              id: gr.id,
              orderNo: gr.poNumber || gr.receiptNumber || `PO-${gr.id.slice(0, 8)}`,
              type: 'PURCHASE',
              status: 'COMPLETED',
              partyName: gr.supplier?.name || gr.notes || 'ผู้จัดจำหน่าย (Supplier)',
              contactPerson: gr.supplier?.contactPerson || 'ฝ่ายจัดซื้อ',
              phone: gr.supplier?.phone || '-',
              email: gr.supplier?.email || '-',
              orderDate: (gr.receivedAt || gr.createdAt)?.slice(0, 10) || new Date().toISOString().slice(0, 10),
              expectedDate: (gr.receivedAt || gr.createdAt)?.slice(0, 10) || new Date().toISOString().slice(0, 10),
              warehouseId: gr.warehouseId,
              warehouseName: gr.warehouse?.name || 'คลังสินค้าหลัก',
              paymentTerms: 'Credit 30 Days',
              subtotal: gr.lines?.reduce((sum: number, l: any) => sum + (l.quantity * (l.unitCostMinor ? Number(l.unitCostMinor) / 100 : 500)), 0) || 10000,
              taxAmount: 700,
              discountTotal: 0,
              grandTotal: gr.lines?.reduce((sum: number, l: any) => sum + (l.quantity * (l.unitCostMinor ? Number(l.unitCostMinor) / 100 : 500)), 0) || 10700,
              items: gr.lines?.map((l: any) => ({
                id: l.id,
                productId: l.productId,
                productCode: l.product?.code || 'SKU',
                productName: l.product?.name || 'สินค้า',
                sku: l.product?.sku || l.product?.code || 'SKU',
                uom: l.product?.baseUnit?.name || 'PCS',
                quantity: l.quantity,
                unitPrice: l.unitCostMinor ? Number(l.unitCostMinor) / 100 : 500,
                discount: 0,
                totalAmount: l.quantity * (l.unitCostMinor ? Number(l.unitCostMinor) / 100 : 500),
              })) || [],
              notes: gr.notes,
              createdBy: gr.createdByType || 'Purchasing Operator',
              createdAt: gr.createdAt || new Date().toISOString(),
            }));
            setOrders(mappedOrders);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend transactions fetch failed in OrdersManagement', err);
      }
    };
    loadRealOrders();
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

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formItems.length === 0) {
      alert('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ');
      return;
    }

    const wh = warehouses.find((w) => w.id === formWarehouseId) || warehouses[0];
    const prefix = isSales ? 'SO' : 'PO';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrderNumber = `${prefix}-2026-${randomNum}`;

    let backendId = `ord-${Date.now()}`;

    try {
      if (isSales) {
        const res = await transactionService.issueStock({
          warehouseId: formWarehouseId || wh?.id || 'wh-01',
          soNumber: newOrderNumber,
          recipient: formPartyName || 'ลูกค้าทั่วไป (Walk-in Customer)',
          notes: formNotes,
          items: formItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        });
        if (res?.data) {
          backendId = res.data.id;
        }
      } else {
        const res = await transactionService.receiveStock({
          warehouseId: formWarehouseId || wh?.id || 'wh-01',
          referenceNo: newOrderNumber,
          notes: formNotes || formPartyName,
          items: formItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        });
        if (res?.data) {
          backendId = res.data.id;
        }
      }
    } catch (err) {
      console.warn('Backend order persist failed, creating locally', err);
    }

    const newOrder: Order = {
      id: backendId,
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
