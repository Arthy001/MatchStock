import React, { useState, useCallback } from 'react';
import { ProductItem } from '../../../types';
import { productService } from '../../../services/product.service';
import { masterDataCache } from '../../common/cache/useMasterDataCache';
import { ConfirmDeleteData } from '../../../components/master-data/modals/ConfirmDeleteModal';

const CACHE_KEY = 'products_list';

const extractErrorMessage = (err: any): string => {
  const data = err.response?.data;
  if (!data) return err.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้';
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors
      .map((e: any) => (typeof e === 'string' ? e : (e.message || e.error || `${e.field || 'field'}: invalid`)))
      .join(', ');
  }
  if (data.message && data.message !== 'Validation failed') {
    return Array.isArray(data.message) ? data.message.join(', ') : String(data.message);
  }
  if (data.error) return String(data.error);
  return data.message || err.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์';
};

export const useProducts = (showToast?: (msg: string) => void) => {
  const [productsList, setProductsList] = useState<ProductItem[]>(() => {
    return masterDataCache.get<ProductItem[]>(CACHE_KEY) || [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Drawer state
  const [drawerProduct, setDrawerProduct] = useState<ProductItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Barcode modal state
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<ProductItem | null>(null);

  // Delete confirmation state
  const [deleteConfirmData, setDeleteConfirmData] = useState<ConfirmDeleteData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states for Product Edit
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editBrandId, setEditBrandId] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editUnitId, setEditUnitId] = useState('');
  const [editSupplierId, setEditSupplierId] = useState('');
  const [editBarcodeSymbologyId, setEditBarcodeSymbologyId] = useState('');
  const [editTaxTypeId, setEditTaxTypeId] = useState('');
  const [editBarcode, setEditBarcode] = useState('');
  const [editPrice, setEditPrice] = useState('0');
  const [editCostPrice, setEditCostPrice] = useState('0');
  const [editWeightKg, setEditWeightKg] = useState('0');
  const [editWidthCm, setEditWidthCm] = useState('0');
  const [editLengthCm, setEditLengthCm] = useState('0');
  const [editHeightCm, setEditHeightCm] = useState('0');
  const [editReorderLevel, setEditReorderLevel] = useState('0');
  const [editMinReorderQty, setEditMinReorderQty] = useState('0');
  const [editIsLotControl, setEditIsLotControl] = useState(false);
  const [editIsReturnable, setEditIsReturnable] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editWarrantyDays, setEditWarrantyDays] = useState('0');
  const [editDescription, setEditDescription] = useState('');

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = masterDataCache.get<ProductItem[]>(CACHE_KEY);
      if (cached) {
        setProductsList(cached);
        return cached;
      }
    }

    setIsLoading(true);
    try {
      const prods = await productService.getProducts({ page: 1, limit: 100 });
      const rawProds = Array.isArray(prods)
        ? prods
        : Array.isArray((prods as any)?.data)
        ? (prods as any).data
        : Array.isArray((prods as any)?.items)
        ? (prods as any).items
        : [];

      const mapped: ProductItem[] = rawProds.map((p: any) => ({
        ...p,
        id: p.id || `prod-${Math.random().toString(36).substring(2, 9)}`,
        code: p.code || 'PRD-000',
        name: p.name || 'Unnamed Product',
        sku: p.sku || p.code || 'SKU-GEN',
        category: typeof p.category === 'object' ? (p.category?.name || '-') : (p.category || '-'),
        categoryId: p.categoryId || (typeof p.category === 'object' ? p.category?.id : undefined),
        brand: typeof p.brand === 'object' ? (p.brand?.name || '-') : (p.brand || '-'),
        brandId: p.brandId || (typeof p.brand === 'object' ? p.brand?.id : undefined),
        unitId: p.unitId || (typeof p.unit === 'object' ? p.unit?.id : undefined),
        supplierId: p.supplierId || (typeof p.supplier === 'object' ? p.supplier?.id : undefined),
        barcodeSymbologyId: p.barcodeSymbologyId,
        taxTypeId: p.taxTypeId,
        barcodeValue: p.barcodeValue || p.barcode || '',
        price: Number(p.price || (p.sellingPriceMinor ? p.sellingPriceMinor / 100 : 0)),
        costPrice: Number(p.costPrice || (p.costPriceMinor ? p.costPriceMinor / 100 : 0)),
        stockOnHand: Number(p.stockOnHand || p.inStockCount || 0),
        reorderLevel: Number(p.reorderLevel || p.reorderPoint || 10),
        minReorderQty: Number(p.minReorderQty || p.minReorderQuantity || 5),
        weightKg: Number(p.weightKg || p.weightValue || 0),
        widthCm: Number(p.widthCm || p.widthValue || 0),
        lengthCm: Number(p.lengthCm || p.lengthValue || 0),
        heightCm: Number(p.heightCm || p.heightValue || 0),
        isLotControl: Boolean(p.isLotControl || p.lotControlled),
        isReturnable: Boolean(p.isReturnable),
        isActive: p.isActive !== false,
        warrantyPeriodDays: Number(p.warrantyPeriodDays || 0),
        barcodeType: p.barcodeType || 'CODE128',
        status: p.status || (p.stockOnHand > 0 ? 'active' : 'out_of_stock'),
        imageUrl: p.imageUrl || p.images?.[0]?.url || '',
        images: p.images || [],
      }));

      setProductsList(mapped);
      masterDataCache.set(CACHE_KEY, mapped);
      return mapped;
    } catch (err) {
      console.error('Error fetching products:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const invalidateCache = useCallback(() => {
    masterDataCache.invalidate(CACHE_KEY);
  }, []);

  const openDrawerForProduct = (prod: ProductItem) => {
    setDrawerProduct(prod);
    setEditName(prod.name);
    setEditCode(prod.code);
    setEditSku(prod.sku);
    setEditBrand(prod.brand || '');
    setEditBrandId(prod.brandId || '');
    setEditCategoryId(prod.categoryId || '');
    setEditUnitId(prod.unitId || '');
    setEditSupplierId(prod.supplierId || '');
    setEditBarcodeSymbologyId(prod.barcodeSymbologyId || '');
    setEditTaxTypeId(prod.taxTypeId || '');
    setEditBarcode(prod.barcodeValue || '');
    setEditPrice(String(prod.price || 0));
    setEditCostPrice(String(prod.costPrice || 0));
    setEditWeightKg(String(prod.weightKg || 0));
    setEditWidthCm(String(prod.widthCm || 0));
    setEditLengthCm(String(prod.lengthCm || 0));
    setEditHeightCm(String(prod.heightCm || 0));
    setEditReorderLevel(String(prod.reorderLevel || 10));
    setEditMinReorderQty(String(prod.minReorderQty || 5));
    setEditIsLotControl(Boolean(prod.isLotControl));
    setEditIsReturnable(Boolean(prod.isReturnable));
    setEditIsActive(prod.isActive !== false);
    setEditWarrantyDays(String(prod.warrantyPeriodDays || 0));
    setEditDescription((prod as any).description || '');
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerProduct) return;
    setIsSaving(true);
    try {
      await productService.updateProduct(drawerProduct.id, {
        name: editName.trim(),
        code: editCode.trim() || undefined,
        sku: editSku.trim() || undefined,
        categoryId: editCategoryId || undefined,
        brandId: editBrandId || undefined,
        unitId: editUnitId || undefined,
        supplierId: editSupplierId || undefined,
        barcodeSymbologyId: editBarcodeSymbologyId || undefined,
        taxTypeId: editTaxTypeId || undefined,
        barcode: editBarcode.trim() || undefined,
        sellingPriceMinor: Math.round((parseFloat(editPrice) || 0) * 100),
        costPriceMinor: Math.round((parseFloat(editCostPrice) || 0) * 100),
        weightValue: parseFloat(editWeightKg) || 0,
        widthValue: parseFloat(editWidthCm) || 0,
        lengthValue: parseFloat(editLengthCm) || 0,
        heightValue: parseFloat(editHeightCm) || 0,
        reorderPoint: parseInt(editReorderLevel) || 10,
        minReorderQuantity: parseInt(editMinReorderQty) || 5,
        lotControlled: editIsLotControl,
        isReturnable: editIsReturnable,
        isActive: editIsActive,
        warrantyPeriodDays: parseInt(editWarrantyDays) || 0,
        description: editDescription.trim() || undefined,
      });

      setProductsList((prev) =>
        prev.map((p) =>
          p.id === drawerProduct.id
            ? {
                ...p,
                name: editName,
                code: editCode,
                sku: editSku,
                categoryId: editCategoryId || p.categoryId,
                brandId: editBrandId || p.brandId,
                unitId: editUnitId || p.unitId,
                supplierId: editSupplierId || p.supplierId,
                barcodeSymbologyId: editBarcodeSymbologyId || p.barcodeSymbologyId,
                taxTypeId: editTaxTypeId || p.taxTypeId,
                barcodeValue: editBarcode,
                price: parseFloat(editPrice) || 0,
                costPrice: parseFloat(editCostPrice) || 0,
                weightKg: parseFloat(editWeightKg) || 0,
                widthCm: parseFloat(editWidthCm) || 0,
                lengthCm: parseFloat(editLengthCm) || 0,
                heightCm: parseFloat(editHeightCm) || 0,
                reorderLevel: parseInt(editReorderLevel) || 0,
                minReorderQty: parseInt(editMinReorderQty) || 0,
                isLotControl: editIsLotControl,
                isReturnable: editIsReturnable,
                isActive: editIsActive,
                warrantyPeriodDays: parseInt(editWarrantyDays) || 0,
              }
            : p
        )
      );
      invalidateCache();
      setDrawerProduct(null);
      showToast?.(`แก้ไขข้อมูลสินค้า "${editName}" สำเร็จ`);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast?.(`เกิดข้อผิดพลาดในการแก้ไขสินค้า: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = (prod: ProductItem) => {
    setDeleteConfirmData({
      title: 'ยืนยันการลบสินค้า',
      itemType: 'Product',
      itemName: prod.name,
      itemCode: prod.code,
      description: `SKU: ${prod.sku} | บาร์โค้ด: ${prod.barcodeValue || '-'}`,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await productService.deleteProduct(prod.id);
          setProductsList((prev) => prev.filter((p) => p.id !== prod.id));
          invalidateCache();
          setDeleteConfirmData(null);
          setDrawerProduct(null);
          showToast?.(`ลบสินค้า "${prod.name}" สำเร็จ`);
        } catch (err: any) {
          const msg = extractErrorMessage(err);
          showToast?.(`เกิดข้อผิดพลาดในการลบสินค้า: ${msg}`);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return {
    productsList,
    setProductsList,
    isLoading,
    fetchProducts,
    invalidateCache,

    drawerProduct,
    setDrawerProduct,
    isSaving,
    openDrawerForProduct,
    handleSaveEditProduct,
    handleDeleteProduct,

    selectedProductForBarcode,
    setSelectedProductForBarcode,

    deleteConfirmData,
    setDeleteConfirmData,
    isDeleting,

    editName,
    setEditName,
    editCode,
    setEditCode,
    editSku,
    setEditSku,
    editBrand,
    setEditBrand,
    editBrandId,
    setEditBrandId,
    editCategoryId,
    setEditCategoryId,
    editUnitId,
    setEditUnitId,
    editSupplierId,
    setEditSupplierId,
    editBarcodeSymbologyId,
    setEditBarcodeSymbologyId,
    editTaxTypeId,
    setEditTaxTypeId,
    editBarcode,
    setEditBarcode,
    editPrice,
    setEditPrice,
    editCostPrice,
    setEditCostPrice,
    editWeightKg,
    setEditWeightKg,
    editWidthCm,
    setEditWidthCm,
    editLengthCm,
    setEditLengthCm,
    editHeightCm,
    setEditHeightCm,
    editReorderLevel,
    setEditReorderLevel,
    editMinReorderQty,
    setEditMinReorderQty,
    editIsLotControl,
    setEditIsLotControl,
    editIsReturnable,
    setEditIsReturnable,
    editIsActive,
    setEditIsActive,
    editWarrantyDays,
    setEditWarrantyDays,
    editDescription,
    setEditDescription,
  };
};
