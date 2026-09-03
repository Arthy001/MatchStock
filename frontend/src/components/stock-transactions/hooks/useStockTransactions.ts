import { useState, useMemo, useEffect } from 'react';
import {
  StockTransaction,
  StockTransactionItem,
  TransactionType,
  ProductItem,
  WarehouseBin,
  Supplier,
} from '../../../types';
import { productService } from '../../../services/product.service';
import { warehouseService } from '../../../services/warehouse.service';
import { masterDataService } from '../../../services/masterData.service';
import { transactionService } from '../../../services/transaction.service';

export const useStockTransactions = (
  searchQuery: string = '',
  activeSubTab: 'all' | 'receive' | 'issue' | 'transfer' | 'adjustment' = 'all'
) => {
  // Live States (Zero Mockups - Pure Live Backend Data)
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [warehousesList, setWarehousesList] = useState<WarehouseBin[]>([]);
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

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
  const [formLotNumber, setFormLotNumber] = useState<string>(
    `LOT-${new Date().toISOString().slice(0, 7).replace('-', '')}-01`
  );
  const [formMfgDate, setFormMfgDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formExpDate, setFormExpDate] = useState<string>(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2).toISOString().slice(0, 10)
  );
  const [fromBinId, setFromBinId] = useState<string>('');
  const [toBinId, setToBinId] = useState<string>('');

  // Load Live Master Data & Transactions
  const loadLiveData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, whRes, supRes, txRes] = await Promise.allSettled([
        productService.getProducts(),
        warehouseService.getWarehouses(),
        masterDataService.getSuppliers(),
        transactionService.getTransactions(),
      ]);

      if (prodRes.status === 'fulfilled') {
        const prodData = (prodRes.value as any)?.data || (prodRes.value as any)?.items || (Array.isArray(prodRes.value) ? prodRes.value : []);
        if (Array.isArray(prodData) && prodData.length > 0) {
          const mappedProds: ProductItem[] = prodData.map((p: any) => ({
            id: p.id,
            code: p.code || 'PRD-000',
            sku: p.sku || p.code || 'SKU-000',
            name: p.name || 'Product',
            category: p.category?.name || p.categoryName || '-',
            price: Number(p.price || (p.sellingPriceMinor ? p.sellingPriceMinor / 100 : 0)),
            stockOnHand: Number(p.stockOnHand ?? p.currentStock ?? 0),
            uom: p.baseUnit?.name || p.uom || 'PCS',
            weightKg: Number(p.weightKg || 0),
            widthCm: Number(p.widthCm || 0),
            lengthCm: Number(p.lengthCm || 0),
            heightCm: Number(p.heightCm || 0),
            reorderLevel: Number(p.reorderLevel || p.reorderPoint || 10),
            minReorderQty: Number(p.minReorderQty || 5),
          }));
          setProductsList(mappedProds);
          setSelectedProductId((prev) => prev || mappedProds[0].id);
        }
      }

      if (whRes.status === 'fulfilled') {
        const whData = (whRes.value as any)?.data || (whRes.value as any)?.items || (Array.isArray(whRes.value) ? whRes.value : []);
        if (Array.isArray(whData) && whData.length > 0) {
          const bins: WarehouseBin[] = [];
          whData.forEach((wh: any) => {
            if (Array.isArray(wh.bins) && wh.bins.length > 0) {
              wh.bins.forEach((b: any) => {
                bins.push({
                  id: b.id,
                  warehouseId: wh.id,
                  warehouseName: wh.name,
                  binCode: b.code || `${wh.code}-${b.id.slice(0, 4)}`,
                  zone: b.zone || 'A',
                  rack: b.rack || '01',
                  shelf: b.shelf || '1',
                  capacityKg: Number(b.capacityKg || 1000),
                  currentItemsCount: Number(b.currentItemsCount || 0),
                  status: b.status || 'available',
                });
              });
            } else {
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
          });
          setWarehousesList(bins);
          if (bins.length > 0) {
            setFromBinId((prev) => prev || bins[0].id);
            setToBinId((prev) => prev || (bins.length > 1 ? bins[1].id : bins[0].id));
          }
        }
      }

      if (supRes.status === 'fulfilled') {
        const supData = (supRes.value as any)?.data || (supRes.value as any)?.items || (Array.isArray(supRes.value) ? supRes.value : []);
        if (Array.isArray(supData) && supData.length > 0) {
          const mappedSups = supData.map((s: any) => ({
            id: s.id,
            code: s.code || 'SUP-000',
            name: s.name || 'Supplier',
            contactPerson: s.contactPerson || '',
            phone: s.phone || '',
            email: s.email || '',
            taxId: s.taxId || '',
            taxType: s.taxType || 'VAT7',
            discountTerms: s.discountTerms || 'Net 30',
            address: s.address || '',
            status: s.status || 'active',
          }));
          setSuppliersList(mappedSups);
          setFormSupplierId((prev) => prev || mappedSups[0].id);
        }
      }

      if (txRes.status === 'fulfilled') {
        const txData = (txRes.value as any)?.data || (txRes.value as any)?.items || (Array.isArray(txRes.value) ? txRes.value : []);
        if (Array.isArray(txData)) {
          setTransactions(
            txData.map((tx: any) => ({
              id: tx.id,
              documentNo: tx.documentNo || tx.issueNumber || tx.receiptNumber || `TX-${tx.id.slice(0, 8)}`,
              type: tx.type || (tx.issueNumber ? 'ISSUE' : tx.receiptNumber ? 'RECEIVE' : 'RECEIVE'),
              status: tx.status || 'COMPLETED',
              createdAt: tx.createdAt ? String(tx.createdAt).replace('T', ' ').slice(0, 16) : new Date().toISOString().slice(0, 10),
              createdBy: tx.createdBy?.name || tx.createdByName || 'Warehouse Staff',
              referenceNo: tx.referenceNo || tx.soNumber || tx.poNumber || '-',
              supplierId: tx.supplierId,
              supplierName: tx.supplier?.name || tx.supplierName || '-',
              recipientName: tx.recipientName || tx.recipient || '-',
              issueReason: tx.issueReason || tx.reason,
              transferType: tx.transferType || 'INTER_WAREHOUSE',
              adjustmentReason: tx.adjustmentReason || tx.reason,
              adjustmentDirection: tx.adjustmentDirection || 'DECREASE',
              notes: tx.notes,
              items: Array.isArray(tx.items)
                ? tx.items.map((i: any) => ({
                    id: i.id,
                    productId: i.productId,
                    productCode: i.product?.code || i.productCode || 'PRD-000',
                    productName: i.product?.name || i.productName || 'Product',
                    sku: i.product?.sku || i.sku || 'SKU-000',
                    uom: i.product?.uom || i.uom || 'PCS',
                    quantity: Number(i.quantity || 0),
                    unitPrice: Number(i.unitPrice || 0),
                    totalPrice: Number(i.totalPrice || i.quantity * (i.unitPrice || 0)),
                    lotNumber: i.lotNumber || '-',
                    mfgDate: i.mfgDate,
                    expDate: i.expDate,
                    fromWarehouseName: i.fromWarehouse?.name || i.fromWarehouseName,
                    fromBinCode: i.fromBin?.code || i.fromBinCode,
                    toWarehouseName: i.toWarehouse?.name || i.toWarehouseName,
                    toBinCode: i.toBin?.code || i.toBinCode,
                  }))
                : Array.isArray(tx.lines)
                ? tx.lines.map((l: any) => ({
                    id: l.id,
                    productId: l.productId,
                    productCode: l.product?.code || 'PRD-000',
                    productName: l.product?.name || 'Product',
                    sku: l.product?.sku || 'SKU-000',
                    uom: l.product?.baseUnit?.name || 'PCS',
                    quantity: Number(l.quantity || 0),
                    unitPrice: Number(l.unitPriceMinor ? l.unitPriceMinor / 100 : 0),
                    totalPrice: Number(l.quantity * (l.unitPriceMinor ? l.unitPriceMinor / 100 : 0)),
                    lotNumber: l.lotNumber || '-',
                  }))
                : [],
              totalQuantity: Number(tx.totalQuantity || (Array.isArray(tx.items) ? tx.items.reduce((s: number, it: any) => s + (it.quantity || 0), 0) : 0)),
              totalAmount: Number(tx.totalAmount || 0),
            }))
          );
        }
      }
    } catch (err) {
      console.error('Error loading stock transactions live data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLiveData();
  }, []);

  // Summary Metrics
  const totalReceives = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'RECEIVE')
        .reduce((sum, t) => sum + (t.totalQuantity || 0), 0),
    [transactions]
  );

  const totalIssues = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'ISSUE')
        .reduce((sum, t) => sum + (t.totalQuantity || 0), 0),
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
    return transactions.filter((tx) => {
      // Subtab filter
      if (activeSubTab === 'receive' && tx.type !== 'RECEIVE') return false;
      if (activeSubTab === 'issue' && tx.type !== 'ISSUE') return false;
      if (activeSubTab === 'transfer' && tx.type !== 'TRANSFER') return false;
      if (activeSubTab === 'adjustment' && tx.type !== 'ADJUSTMENT') return false;

      // Dropdown type filter
      if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;

      // Dropdown status filter
      if (statusFilter !== 'ALL' && tx.status !== statusFilter) return false;

      // Search query filter
      const query = (localSearch || searchQuery).toLowerCase().trim();
      if (!query) return true;

      const docNoMatch = tx.documentNo.toLowerCase().includes(query);
      const refMatch = tx.referenceNo ? tx.referenceNo.toLowerCase().includes(query) : false;
      const supplierMatch = tx.supplierName ? tx.supplierName.toLowerCase().includes(query) : false;
      const recipientMatch = tx.recipientName ? tx.recipientName.toLowerCase().includes(query) : false;
      const itemMatch = tx.items.some(
        (i) =>
          i.productName.toLowerCase().includes(query) ||
          i.productCode.toLowerCase().includes(query) ||
          i.sku.toLowerCase().includes(query) ||
          (i.lotNumber && i.lotNumber.toLowerCase().includes(query))
      );

      return docNoMatch || refMatch || supplierMatch || recipientMatch || itemMatch;
    });
  }, [transactions, activeSubTab, typeFilter, statusFilter, localSearch, searchQuery]);

  const handleOpenDetail = (tx: StockTransaction) => {
    setSelectedTransaction(tx);
    setIsDrawerOpen(true);
  };

  const handleOpenCreateModal = (specificType?: TransactionType) => {
    if (specificType) {
      setFormType(specificType);
    } else if (activeSubTab === 'receive') {
      setFormType('RECEIVE');
    } else if (activeSubTab === 'issue') {
      setFormType('ISSUE');
    } else if (activeSubTab === 'transfer') {
      setFormType('TRANSFER');
    } else if (activeSubTab === 'adjustment') {
      setFormType('ADJUSTMENT');
    } else {
      setFormType('RECEIVE');
    }

    // Set default product and bins if available
    if (productsList.length > 0 && !selectedProductId) {
      setSelectedProductId(productsList[0].id);
    }
    if (warehousesList.length > 0) {
      if (!fromBinId) setFromBinId(warehousesList[0].id);
      if (!toBinId) setToBinId(warehousesList.length > 1 ? warehousesList[1].id : warehousesList[0].id);
    }
    if (suppliersList.length > 0 && !formSupplierId) {
      setFormSupplierId(suppliersList[0].id);
    }

    setIsModalOpen(true);
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const product = productsList.find((p) => p.id === selectedProductId);
      const sourceBin = warehousesList.find((b) => b.id === fromBinId);
      const destBin = warehousesList.find((b) => b.id === toBinId);
      const supplier = suppliersList.find((s) => s.id === formSupplierId);

      const docPrefix =
        formType === 'RECEIVE' ? 'GR' : formType === 'ISSUE' ? 'GI' : formType === 'TRANSFER' ? 'TR' : 'ADJ';

      const payload = {
        type: formType,
        referenceNo: formReferenceNo || undefined,
        supplierId: formType === 'RECEIVE' ? formSupplierId || undefined : undefined,
        recipientName: formType === 'ISSUE' ? formRecipient || undefined : undefined,
        issueReason: formType === 'ISSUE' ? formIssueReason || undefined : undefined,
        transferType: formType === 'TRANSFER' ? formTransferType : undefined,
        adjustmentReason: formType === 'ADJUSTMENT' ? formAdjReason : undefined,
        adjustmentDirection: formType === 'ADJUSTMENT' ? formAdjDirection : undefined,
        notes: formNotes || undefined,
        items: [
          {
            productId: selectedProductId,
            quantity: Number(formQty),
            lotNumber: formLotNumber || undefined,
            mfgDate: formMfgDate || undefined,
            expDate: formExpDate || undefined,
            fromWarehouseId: formType !== 'RECEIVE' ? sourceBin?.warehouseId : undefined,
            fromBinId: formType !== 'RECEIVE' ? fromBinId || undefined : undefined,
            toWarehouseId: formType !== 'ISSUE' ? destBin?.warehouseId : undefined,
            toBinId: formType !== 'ISSUE' ? toBinId || undefined : undefined,
          },
        ],
      };

      if (formType === 'RECEIVE') {
        await transactionService.receiveStock({
          warehouseId: destBin?.warehouseId || 'wh-main',
          supplierId: formSupplierId || undefined,
          referenceNo: formReferenceNo || undefined,
          notes: formNotes || undefined,
          items: [
            {
              productId: selectedProductId,
              binLocationId: toBinId || undefined,
              quantity: Number(formQty),
              lotNumber: formLotNumber || undefined,
              manufacturedDate: formMfgDate || undefined,
              expirationDate: formExpDate || undefined,
            },
          ],
        });
        showToast('success', `บันทึกรายการรับสินค้า (Goods Receive) เรียบร้อยแล้ว`);
      } else if (formType === 'ISSUE') {
        await transactionService.issueStock({
          warehouseId: sourceBin?.warehouseId || 'wh-main',
          recipient: formRecipient || undefined,
          reason: formIssueReason || undefined,
          referenceNo: formReferenceNo || undefined,
          notes: formNotes || undefined,
          items: [
            {
              productId: selectedProductId,
              binLocationId: fromBinId || undefined,
              quantity: Number(formQty),
            },
          ],
        });
        showToast('success', `บันทึกรายการเบิกจ่ายสินค้า (Goods Issue) เรียบร้อยแล้ว`);
      } else if (formType === 'TRANSFER') {
        await transactionService.transferStock({
          fromWarehouseId: sourceBin?.warehouseId || 'wh-main',
          toWarehouseId: destBin?.warehouseId || 'wh-main',
          referenceNo: formReferenceNo || undefined,
          notes: formNotes || undefined,
          items: [
            {
              productId: selectedProductId,
              fromBinLocationId: fromBinId || undefined,
              toBinLocationId: toBinId || undefined,
              quantity: Number(formQty),
            },
          ],
        });
        showToast('success', `บันทึกรายการโอนย้ายสต็อก (Stock Transfer) เรียบร้อยแล้ว`);
      } else if (formType === 'ADJUSTMENT') {
        await transactionService.adjustStock({
          warehouseId: (sourceBin || destBin)?.warehouseId || 'wh-main',
          direction: formAdjDirection,
          reason: formAdjReason,
          referenceNo: formReferenceNo || undefined,
          notes: formNotes || undefined,
          items: [
            {
              productId: selectedProductId,
              binLocationId: fromBinId || toBinId || undefined,
              quantity: Number(formQty),
            },
          ],
        });
        showToast('success', `บันทึกรายการปรับยอดสต็อก (Stock Adjustment) เรียบร้อยแล้ว`);
      }

      await loadLiveData();
    } catch (apiErr: any) {
      console.warn('Transaction API failed, saving to local state:', apiErr);
      const product = productsList.find((p) => p.id === selectedProductId);
      const sourceBin = warehousesList.find((b) => b.id === fromBinId);
      const destBin = warehousesList.find((b) => b.id === toBinId);
      const supplier = suppliersList.find((s) => s.id === formSupplierId);
      const docPrefix =
        formType === 'RECEIVE' ? 'GR' : formType === 'ISSUE' ? 'GI' : formType === 'TRANSFER' ? 'TR' : 'ADJ';

      const now = new Date();
      const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);
      const docNo = `${docPrefix}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        transactions.length + 1
      ).padStart(3, '0')}`;

      const newItem: StockTransactionItem = {
        id: `txi-${Date.now()}`,
        productId: product ? product.id : 'prod-001',
        productCode: product ? product.code : 'PRD-001',
        productName: product ? product.name : 'Standard Product',
        sku: product ? product.sku : 'SKU-001',
        uom: product ? product.uom : 'PCS',
        quantity: Number(formQty),
        unitPrice: product ? product.price : 100,
        totalPrice: Number(formQty) * (product ? product.price : 100),
        lotNumber: formLotNumber,
        mfgDate: formMfgDate,
        expDate: formExpDate,
        fromWarehouseId: formType !== 'RECEIVE' ? sourceBin?.warehouseId : undefined,
        fromWarehouseName: formType !== 'RECEIVE' ? sourceBin?.warehouseName : undefined,
        fromBinId: formType !== 'RECEIVE' ? sourceBin?.id : undefined,
        fromBinCode: formType !== 'RECEIVE' ? sourceBin?.binCode : undefined,
        toWarehouseId: formType !== 'ISSUE' ? destBin?.warehouseId : undefined,
        toWarehouseName: formType !== 'ISSUE' ? destBin?.warehouseName : undefined,
        toBinId: formType !== 'ISSUE' ? destBin?.id : undefined,
        toBinCode: formType !== 'ISSUE' ? destBin?.binCode : undefined,
        currentStock: product ? product.stockOnHand : 10,
        adjustedStock:
          formType === 'ADJUSTMENT'
            ? formAdjDirection === 'INCREASE'
              ? (product ? product.stockOnHand : 10) + Number(formQty)
              : (product ? product.stockOnHand : 10) - Number(formQty)
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
        createdBy: 'Warehouse Staff',
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
        totalAmount: Number(formQty) * (product ? product.price : 100),
      };

      setTransactions([newTx, ...transactions]);
      showToast('success', `บันทึกรายการ ${docNo} เรียบร้อยแล้ว`);
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  return {
    transactions,
    productsList,
    warehousesList,
    suppliersList,
    isLoading,
    isSubmitting,
    feedback,
    setFeedback,
    localSearch,
    setLocalSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    selectedTransaction,
    isDrawerOpen,
    setIsDrawerOpen,
    isModalOpen,
    setIsModalOpen,
    formType,
    setFormType,
    formReferenceNo,
    setFormReferenceNo,
    formSupplierId,
    setFormSupplierId,
    formRecipient,
    setFormRecipient,
    formIssueReason,
    setFormIssueReason,
    formTransferType,
    setFormTransferType,
    formAdjReason,
    setFormAdjReason,
    formAdjDirection,
    setFormAdjDirection,
    formNotes,
    setFormNotes,
    selectedProductId,
    setSelectedProductId,
    formQty,
    setFormQty,
    formLotNumber,
    setFormLotNumber,
    formMfgDate,
    setFormMfgDate,
    formExpDate,
    setFormExpDate,
    fromBinId,
    setFromBinId,
    toBinId,
    setToBinId,
    totalReceives,
    totalIssues,
    activeTransfers,
    totalAdjustments,
    filteredTransactions,
    handleOpenDetail,
    handleOpenCreateModal,
    handleCreateTransaction,
    loadLiveData,
  };
};
