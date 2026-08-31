import { useState, Dispatch, SetStateAction } from 'react';
import { ProductItem, CategoryItem, BrandItem, Supplier } from '../../../types';
import { productService } from '../../../services/product.service';
import { UnitItem } from './useMasterDataLoader';

interface UseProductDrawerProps {
  productsList: ProductItem[];
  setProductsList: Dispatch<SetStateAction<ProductItem[]>>;
  categoriesList: CategoryItem[];
  brandsList: BrandItem[];
  unitsList: UnitItem[];
  suppliersList: Supplier[];
  showToast: (msg: string) => void;
}

export const useProductDrawer = ({
  setProductsList,
  categoriesList,
  brandsList,
  unitsList,
  suppliersList,
  showToast,
}: UseProductDrawerProps) => {
  const [drawerProduct, setDrawerProduct] = useState<ProductItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
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
    setEditPrice(String(prod.price || (prod.sellingPriceMinor ? prod.sellingPriceMinor / 100 : 0)));
    setEditCostPrice(String(prod.costPrice || (prod.costPriceMinor ? prod.costPriceMinor / 100 : 0)));
    setEditWeightKg(String(prod.weightKg || prod.weightValue || 0));
    setEditWidthCm(String(prod.widthCm || prod.widthValue || 0));
    setEditLengthCm(String(prod.lengthCm || prod.lengthValue || 0));
    setEditHeightCm(String(prod.heightCm || prod.heightValue || 0));
    setEditReorderLevel(String(prod.reorderLevel || prod.reorderPoint || 10));
    setEditMinReorderQty(String(prod.minReorderQty || prod.minReorderQuantity || 5));
    setEditIsLotControl(Boolean(prod.isLotControl || prod.lotControlled));
    setEditIsReturnable(Boolean(prod.isReturnable));
    setEditIsActive(prod.isActive !== false);
    setEditWarrantyDays(String(prod.warrantyPeriodDays || 0));
    setEditDescription(prod.description || '');
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerProduct) return;
    setIsSaving(true);
    try {
      const selectedCategory = categoriesList.find((c) => c.id === editCategoryId);
      const selectedBrand = brandsList.find((b) => b.id === editBrandId);
      const selectedUnit = unitsList.find((u) => u.id === editUnitId);
      const selectedSupplier = suppliersList.find((s) => s.id === editSupplierId);

      const parsedPriceMinor = Math.round((parseFloat(editPrice) || 0) * 100);
      const parsedCostPriceMinor = Math.round((parseFloat(editCostPrice) || 0) * 100);

      const updateData: any = {
        name: editName,
        code: editCode,
        sku: editSku,
        price: parseFloat(editPrice) || 0,
        sellingPriceMinor: parsedPriceMinor,
        costPrice: parseFloat(editCostPrice) || 0,
        costPriceMinor: parsedCostPriceMinor,
        categoryId: editCategoryId || undefined,
        brandId: editBrandId || undefined,
        unitId: editUnitId || undefined,
        baseUnitId: editUnitId || undefined,
        supplierId: editSupplierId || undefined,
        barcodeSymbologyId: editBarcodeSymbologyId || undefined,
        taxTypeId: editTaxTypeId || undefined,
        barcode: editBarcode || undefined,
        barcodeValue: editBarcode || undefined,
        reorderPoint: parseInt(editReorderLevel) || 10,
        reorderLevel: parseInt(editReorderLevel) || 10,
        minReorderQuantity: parseInt(editMinReorderQty) || 5,
        minReorderQty: parseInt(editMinReorderQty) || 5,
        weightKg: parseFloat(editWeightKg) || 0,
        weightValue: parseFloat(editWeightKg) || 0,
        widthCm: parseFloat(editWidthCm) || 0,
        widthValue: parseFloat(editWidthCm) || 0,
        lengthCm: parseFloat(editLengthCm) || 0,
        lengthValue: parseFloat(editLengthCm) || 0,
        heightCm: parseFloat(editHeightCm) || 0,
        heightValue: parseFloat(editHeightCm) || 0,
        isLotControl: editIsLotControl,
        lotControlled: editIsLotControl,
        isReturnable: editIsReturnable,
        isActive: editIsActive,
        warrantyPeriodDays: parseInt(editWarrantyDays) || 0,
        description: editDescription,
        imageUrl: drawerProduct.imageUrl || undefined,
      };

      await productService.updateProduct(drawerProduct.id, updateData);

      setProductsList((prev) =>
        prev.map((p) =>
          p.id === drawerProduct.id
            ? {
                ...p,
                name: editName,
                code: editCode,
                sku: editSku,
                brand: selectedBrand?.name || editBrand || p.brand || '-',
                brandId: editBrandId || p.brandId,
                category: selectedCategory?.name || p.category || '-',
                categoryId: editCategoryId || p.categoryId,
                uom: selectedUnit?.name || selectedUnit?.code || p.uom,
                unitId: editUnitId || p.unitId,
                supplierId: editSupplierId || p.supplierId,
                barcodeSymbologyId: editBarcodeSymbologyId,
                taxTypeId: editTaxTypeId,
                barcodeValue: editBarcode,
                price: parseFloat(editPrice) || 0,
                costPrice: parseFloat(editCostPrice) || 0,
                sellingPriceMinor: parsedPriceMinor,
                costPriceMinor: parsedCostPriceMinor,
                weightKg: parseFloat(editWeightKg) || 0,
                widthCm: parseFloat(editWidthCm) || 0,
                lengthCm: parseFloat(editLengthCm) || 0,
                heightCm: parseFloat(editHeightCm) || 0,
                reorderLevel: parseInt(editReorderLevel) || 10,
                minReorderQty: parseInt(editMinReorderQty) || 5,
                isLotControl: editIsLotControl,
                isReturnable: editIsReturnable,
                isActive: editIsActive,
                warrantyPeriodDays: parseInt(editWarrantyDays) || 0,
                description: editDescription,
                imageUrl: drawerProduct.imageUrl || p.imageUrl || '',
              }
            : p
        )
      );

      setDrawerProduct(null);
      showToast(`บันทึกข้อมูลสินค้า "${editName}" สำเร็จ`);
    } catch (apiErr: any) {
      console.error('Backend API update failed:', apiErr.response?.data || apiErr.message);
      const errData = apiErr.response?.data;
      let msg = 'Update failed';
      if (errData?.errors && Array.isArray(errData.errors)) {
        msg = errData.errors
          .map((e: any) => (typeof e === 'string' ? e : (e.message || e.error || `${e.path?.join('.') || e.field || 'field'}: invalid`)))
          .join(', ');
      } else if (errData?.message) {
        msg = Array.isArray(errData.message) ? errData.message.join(', ') : errData.message;
      } else if (errData?.error) {
        msg = String(errData.error);
      } else if (apiErr.message) {
        msg = apiErr.message;
      }
      showToast(`แก้ไขข้อมูลสินค้าไม่สำเร็จ: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (prod: ProductItem) => {
    if (!window.confirm(`คุณแน่ใจว่าต้องการลบสินค้า "${prod.name}" (${prod.sku})?`)) {
      return;
    }
    try {
      await productService.deleteProduct(prod.id);
      setProductsList((prev) => prev.filter((p) => p.id !== prod.id));
      if (drawerProduct?.id === prod.id) {
        setDrawerProduct(null);
      }
      showToast(`ลบสินค้า "${prod.name}" เรียบร้อยแล้ว`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'ไม่สามารถลบสินค้าได้';
      showToast(`ไม่สามารถลบสินค้าได้: ${msg}`);
    }
  };

  return {
    drawerProduct,
    setDrawerProduct,
    isSaving,
    openDrawerForProduct,
    handleSaveEditProduct,
    handleDeleteProduct,
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
