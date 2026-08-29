import { useState, Dispatch, SetStateAction } from 'react';
import {
  ProductItem,
  Company,
  Supplier,
  WarehouseBin,
  CategoryItem,
  BrandItem,
  UserRole,
  MasterDataSubTab,
} from '../../../types';
import { productService } from '../../../services/product.service';
import { masterDataService } from '../../../services/masterData.service';
import { warehouseService } from '../../../services/warehouse.service';
import { UnitItem, RbacUser } from './useMasterDataLoader';

interface UseAddMasterDataFormProps {
  activeSubTab: MasterDataSubTab;
  categoriesList: CategoryItem[];
  brandsList: BrandItem[];
  unitsList: UnitItem[];
  setProductsList: Dispatch<SetStateAction<ProductItem[]>>;
  setCompaniesList: Dispatch<SetStateAction<Company[]>>;
  setSuppliersList: Dispatch<SetStateAction<Supplier[]>>;
  setUnitsList: Dispatch<SetStateAction<UnitItem[]>>;
  setBinsList: Dispatch<SetStateAction<WarehouseBin[]>>;
  setCategoriesList: Dispatch<SetStateAction<CategoryItem[]>>;
  setBrandsList: Dispatch<SetStateAction<BrandItem[]>>;
  setUsersList: Dispatch<SetStateAction<RbacUser[]>>;
  showToast: (msg: string) => void;
}

export const useAddMasterDataForm = ({
  activeSubTab,
  categoriesList,
  brandsList,
  unitsList,
  setProductsList,
  setCompaniesList,
  setSuppliersList,
  setUnitsList,
  setBinsList,
  setCategoriesList,
  setBrandsList,
  setUsersList,
  showToast,
}: UseAddMasterDataFormProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Product form states
  const [addName, setAddName] = useState('');
  const [addCode, setAddCode] = useState('');
  const [addSku, setAddSku] = useState('');
  const [addBrand, setAddBrand] = useState('');
  const [addBrandId, setAddBrandId] = useState('');
  const [addCategoryId, setAddCategoryId] = useState('');
  const [addUnitId, setAddUnitId] = useState('');
  const [addSupplierId, setAddSupplierId] = useState('');
  const [addBarcodeSymbologyId, setAddBarcodeSymbologyId] = useState('');
  const [addTaxTypeId, setAddTaxTypeId] = useState('');
  const [addBarcode, setAddBarcode] = useState('');
  const [addPrice, setAddPrice] = useState('0');
  const [addCostPrice, setAddCostPrice] = useState('0');
  const [addStock, setAddStock] = useState('0');
  const [addUom, setAddUom] = useState('PCS');
  const [addWeightKg, setAddWeightKg] = useState('0');
  const [addWidthCm, setAddWidthCm] = useState('0');
  const [addLengthCm, setAddLengthCm] = useState('0');
  const [addHeightCm, setAddHeightCm] = useState('0');
  const [addReorderPoint, setAddReorderPoint] = useState('10');
  const [addMinReorderQty, setAddMinReorderQty] = useState('5');
  const [addIsLotControl, setAddIsLotControl] = useState(false);
  const [addIsReturnable, setAddIsReturnable] = useState(false);
  const [addWarrantyDays, setAddWarrantyDays] = useState('0');
  const [addDescription, setAddDescription] = useState('');
  const [addProductImageFile, setAddProductImageFile] = useState<File | null>(null);
  const [addProductImagePreview, setAddProductImagePreview] = useState<string | null>(null);

  // Category Add state
  const [addCatCode, setAddCatCode] = useState('');
  const [addCatName, setAddCatName] = useState('');
  const [addCatDescription, setAddCatDescription] = useState('');

  // Brand Add state
  const [addBrdCode, setAddBrdCode] = useState('');
  const [addBrdName, setAddBrdName] = useState('');
  const [addBrdDescription, setAddBrdDescription] = useState('');

  // Company Add state
  const [addCompanyCode, setAddCompanyCode] = useState('');
  const [addCompanyName, setAddCompanyName] = useState('');
  const [addCompanyTaxId, setAddCompanyTaxId] = useState('');
  const [addCompanyBranchCode, setAddCompanyBranchCode] = useState('00000');
  const [addCompanyBranchName, setAddCompanyBranchName] = useState('');
  const [addCompanyPhone, setAddCompanyPhone] = useState('');
  const [addCompanyEmail, setAddCompanyEmail] = useState('');
  const [addCompanyAddress, setAddCompanyAddress] = useState('');
  const [addCompanyIsHq, setAddCompanyIsHq] = useState(false);

  // RBAC Add state
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('warehouse_staff');

  // Warehouse Add state
  const [addWarehouseName, setAddWarehouseName] = useState('');
  const [addBinCode, setAddBinCode] = useState('');
  const [addZone, setAddZone] = useState('');
  const [addRack, setAddRack] = useState('');
  const [addCapacityKg, setAddCapacityKg] = useState('500');

  // Supplier Add state
  const [addSupplierName, setAddSupplierName] = useState('');
  const [addContactPerson, setAddContactPerson] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addTaxId, setAddTaxId] = useState('');

  const resetForm = () => {
    setAddName('');
    setAddCode('');
    setAddSku('');
    setAddBrand('');
    setAddBrandId('');
    setAddCategoryId('');
    setAddUnitId('');
    setAddSupplierId('');
    setAddBarcodeSymbologyId('');
    setAddTaxTypeId('');
    setAddBarcode('');
    setAddPrice('0');
    setAddCostPrice('0');
    setAddStock('0');
    setAddUom('PCS');
    setAddWeightKg('0');
    setAddWidthCm('0');
    setAddLengthCm('0');
    setAddHeightCm('0');
    setAddReorderPoint('10');
    setAddMinReorderQty('5');
    setAddIsLotControl(false);
    setAddIsReturnable(false);
    setAddWarrantyDays('0');
    setAddDescription('');
    setAddProductImageFile(null);
    setAddProductImagePreview(null);
    setAddCompanyName('');
    setAddCompanyCode('');
    setAddCompanyTaxId('');
    setAddEmail('');
    setAddCatCode('');
    setAddCatName('');
    setAddCatDescription('');
    setAddBrdCode('');
    setAddBrdName('');
    setAddBrdDescription('');
    setAddWarehouseName('');
    setAddBinCode('');
    setAddZone('');
    setAddRack('');
    setAddCapacityKg('500');
    setAddSupplierName('');
    setAddContactPerson('');
    setAddPhone('');
    setAddTaxId('');
  };

  const handleCreateNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeSubTab === 'products' || activeSubTab === 'barcodes') {
        const itemCode = addCode.trim() || `PRD-${Date.now().toString().slice(-4)}`;
        const itemSku = addSku.trim() || `SKU-${Date.now().toString().slice(-6)}`;
        const itemBarcode = addBarcode.trim() || `885${Date.now().toString().slice(-10)}`;

        let createdProduct: ProductItem;
        try {
          const apiRes = await productService.createProduct({
            name: addName,
            code: itemCode,
            sku: itemSku,
            brand: addBrand || '-',
            brandId: addBrandId || undefined,
            categoryId: addCategoryId || undefined,
            unitId: addUnitId || undefined,
            supplierId: addSupplierId || undefined,
            barcodeSymbologyId: addBarcodeSymbologyId || undefined,
            taxTypeId: addTaxTypeId || undefined,
            barcode: itemBarcode,
            barcodeValue: itemBarcode,
            price: parseFloat(addPrice) || 0,
            sellingPriceMinor: Math.round((parseFloat(addPrice) || 0) * 100),
            costPriceMinor: Math.round((parseFloat(addCostPrice) || 0) * 100),
            stockOnHand: parseInt(addStock) || 0,
            reorderLevel: parseInt(addReorderPoint) || 10,
            reorderPoint: parseInt(addReorderPoint) || 10,
            minReorderQuantity: parseInt(addMinReorderQty) || 5,
            uom: addUom || 'PCS',
            weightValue: parseFloat(addWeightKg) || 0,
            widthValue: parseFloat(addWidthCm) || 0,
            lengthValue: parseFloat(addLengthCm) || 0,
            heightValue: parseFloat(addHeightCm) || 0,
            isLotControl: addIsLotControl,
            lotControlled: addIsLotControl,
            isReturnable: addIsReturnable,
            warrantyPeriodDays: parseInt(addWarrantyDays) || 0,
            description: addDescription,
          });

          // Upload image to backend if image file was selected
          let finalImageUrl = addProductImagePreview || '';
          if (addProductImageFile && apiRes?.id) {
            try {
              const formData = new FormData();
              formData.append('images', addProductImageFile);
              const uploadRes = await productService.uploadImages(apiRes.id, formData);
              if (uploadRes?.data?.[0]?.url) {
                finalImageUrl = uploadRes.data[0].url;
              }
            } catch (upErr) {
              console.warn('Image upload failed, using local preview:', upErr);
            }
          }

          const selectedCategory = categoriesList.find((c) => c.id === addCategoryId);
          const selectedBrand = brandsList.find((b) => b.id === addBrandId);
          const selectedUnit = unitsList.find((u) => u.id === addUnitId);

          createdProduct = {
            id: apiRes?.id || `prod-${Date.now()}`,
            name: apiRes?.name || addName,
            code: apiRes?.code || itemCode,
            sku: apiRes?.sku || itemSku,
            brand: apiRes?.brand?.name || selectedBrand?.name || addBrand || '-',
            brandId: apiRes?.brandId || addBrandId,
            category: apiRes?.category?.name || selectedCategory?.name || '-',
            categoryId: apiRes?.categoryId || addCategoryId,
            price: Number(apiRes?.price || addPrice || 0),
            costPrice: parseFloat(addCostPrice) || 0,
            stockOnHand: Number(apiRes?.stockOnHand || addStock || 0),
            reorderLevel: Number(apiRes?.reorderLevel || apiRes?.reorderPoint || addReorderPoint || 10),
            minReorderQty: Number(apiRes?.minReorderQty || addMinReorderQty || 5),
            uom: apiRes?.uom || apiRes?.unit || selectedUnit?.name || addUom || 'PCS',
            unitId: apiRes?.unitId || addUnitId,
            supplierId: apiRes?.supplierId || addSupplierId,
            weightKg: Number(apiRes?.weightKg || addWeightKg || 0),
            widthCm: Number(apiRes?.widthCm || addWidthCm || 0),
            lengthCm: Number(apiRes?.lengthCm || addLengthCm || 0),
            heightCm: Number(apiRes?.heightCm || addHeightCm || 0),
            isLotControl: Boolean(apiRes?.isLotControl ?? addIsLotControl),
            isReturnable: addIsReturnable,
            warrantyPeriodDays: parseInt(addWarrantyDays) || 0,
            barcodeValue: apiRes?.barcode || apiRes?.barcodeValue || itemBarcode,
            barcodeSymbologyId: addBarcodeSymbologyId,
            taxTypeId: addTaxTypeId,
            barcodeType: 'CODE128',
            description: apiRes?.description || addDescription,
            status: parseInt(addStock || '0') > 0 ? 'active' : 'out_of_stock',
            imageUrl: finalImageUrl || '',
          };

          setProductsList((prev) => [createdProduct, ...prev]);
          showToast(`เพิ่มสินค้า "${createdProduct.name}" (${createdProduct.sku}) เรียบร้อยแล้ว`);
        } catch (apiErr: any) {
          console.error('Failed to create product in backend API:', apiErr.response?.data || apiErr.message);
          const errData = apiErr.response?.data;
          let msg = 'Server error';
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
          showToast(`ไม่สามารถบันทึกสินค้าลงฐานข้อมูลได้: ${msg}`);
          return;
        }
      } else if (activeSubTab === 'categories') {
        const catCode = addCatCode.trim() || `CAT-${Date.now().toString().slice(-4)}`;
        let createdCat: CategoryItem;
        try {
          const res = await masterDataService.createCategory({
            code: catCode,
            name: addCatName,
            description: addCatDescription,
          });
          createdCat = {
            id: res?.id || `cat-${Date.now()}`,
            code: res?.code || catCode,
            name: res?.name || addCatName,
            description: res?.description || addCatDescription,
            isActive: true,
          };
        } catch {
          createdCat = {
            id: `cat-${Date.now()}`,
            code: catCode,
            name: addCatName,
            description: addCatDescription,
            isActive: true,
          };
        }
        setCategoriesList((prev) => [createdCat, ...prev]);
        showToast(`เพิ่มหมวดหมู่ "${createdCat.name}" เรียบร้อยแล้ว`);
      } else if (activeSubTab === 'brands') {
        const brdCode = addBrdCode.trim() || `BRD-${Date.now().toString().slice(-4)}`;
        let createdBrd: BrandItem;
        try {
          const res = await masterDataService.createBrand({
            code: brdCode,
            name: addBrdName,
            description: addBrdDescription,
          });
          createdBrd = {
            id: res?.id || `brd-${Date.now()}`,
            code: res?.code || brdCode,
            name: res?.name || addBrdName,
            description: res?.description || addBrdDescription,
            isActive: true,
          };
        } catch {
          createdBrd = {
            id: `brd-${Date.now()}`,
            code: brdCode,
            name: addBrdName,
            description: addBrdDescription,
            isActive: true,
          };
        }
        setBrandsList((prev) => [createdBrd, ...prev]);
        showToast(`เพิ่มแบรนด์ "${createdBrd.name}" เรียบร้อยแล้ว`);
      } else if (activeSubTab === 'companies') {
        const compCode = addCompanyCode.trim() || `COMP-${Date.now().toString().slice(-3)}`;
        let createdCompany: Company;
        try {
          createdCompany = await masterDataService.createCompany({
            code: compCode,
            name: addCompanyName,
            taxId: addCompanyTaxId,
            branchCode: addCompanyBranchCode || '00000',
            branchName: addCompanyBranchName,
            phone: addCompanyPhone,
            email: addCompanyEmail,
            address: addCompanyAddress,
            isHeadquarter: addCompanyIsHq,
          });
        } catch {
          createdCompany = {
            id: `comp-${Date.now()}`,
            code: compCode,
            name: addCompanyName,
            taxId: addCompanyTaxId,
            branchCode: addCompanyBranchCode || '00000',
            branchName: addCompanyBranchName,
            phone: addCompanyPhone,
            email: addCompanyEmail,
            address: addCompanyAddress,
            isHeadquarter: addCompanyIsHq,
            createdAt: new Date().toISOString(),
          };
        }
        setCompaniesList((prev) => [createdCompany, ...prev]);
        showToast(`เพิ่มบริษัท "${createdCompany.name}" เรียบร้อยแล้ว`);
      } else if (activeSubTab === 'units') {
        const uomCode = addCode.trim() || `UOM-${Date.now().toString().slice(-3)}`;
        let createdUnit: UnitItem;
        try {
          createdUnit = await masterDataService.createUnit({
            code: uomCode,
            name: addName,
          });
        } catch {
          createdUnit = {
            id: `uom-${Date.now()}`,
            code: uomCode,
            name: addName,
          };
        }
        setUnitsList((prev) => [createdUnit, ...prev]);
        showToast(`เพิ่มหน่วยนับ "${createdUnit.name}" เรียบร้อยแล้ว`);
      } else if (activeSubTab === 'warehouses') {
        const binCode = addBinCode.trim() || `BIN-${Date.now().toString().slice(-3)}`;
        let createdBin: WarehouseBin;
        try {
          createdBin = await warehouseService.createBin('wh-main', {
            code: binCode,
          });
        } catch {
          createdBin = {
            id: `bin-${Date.now()}`,
            warehouseId: 'wh-main',
            warehouseName: addWarehouseName || 'Main Warehouse',
            binCode: binCode,
            zone: addZone || 'A',
            rack: addRack || '01',
            shelf: '1',
            capacityKg: parseFloat(addCapacityKg) || 500,
            currentItemsCount: 0,
            status: 'available',
          };
        }
        setBinsList((prev) => [createdBin, ...prev]);
        showToast(`เพิ่มตำแหน่ง Bin "${createdBin.binCode}" เรียบร้อยแล้ว`);
      } else if (activeSubTab === 'suppliers') {
        const supCode = addCode.trim() || `SUP-${Date.now().toString().slice(-3)}`;
        let createdSup: Supplier;
        try {
          createdSup = await masterDataService.createSupplier({
            code: supCode,
            name: addSupplierName || addName,
            contactPerson: addContactPerson,
            phone: addPhone,
            taxId: addTaxId,
          });
        } catch {
          createdSup = {
            id: `sup-${Date.now()}`,
            code: supCode,
            name: addSupplierName || addName,
            contactPerson: addContactPerson,
            phone: addPhone,
            email: addEmail || '',
            taxId: addTaxId,
            taxType: 'VAT7',
            discountTerms: 'Net 30',
            address: '',
            status: 'active',
          };
        }
        setSuppliersList((prev) => [createdSup, ...prev]);
        showToast(`เพิ่มผู้จัดจำหน่าย "${createdSup.name}" เรียบร้อยแล้ว`);
      } else if (activeSubTab === 'rbac') {
        let createdId = String(Date.now());
        try {
          const res = await masterDataService.createUser({
            email: addEmail,
            fullName: addName,
            role: addRole,
          });
          if (res?.id) createdId = res.id;
        } catch (uErr) {
          console.warn('API createUser fallback to local:', uErr);
        }
        const newUser: RbacUser = {
          id: createdId,
          name: addName,
          email: addEmail,
          department: 'Operations',
          role: addRole,
          status: 'Active',
        };
        setUsersList((prev) => [...prev, newUser]);
        showToast(`เพิ่มผู้ใช้งาน "${newUser.name}" สิทธิ์ ${newUser.role} เรียบร้อยแล้ว`);
      }

      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Error in handleCreateNewItem:', err);
      showToast('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
    }
  };

  return {
    isAddModalOpen,
    setIsAddModalOpen,
    handleCreateNewItem,
    addName,
    setAddName,
    addCode,
    setAddCode,
    addSku,
    setAddSku,
    addBrand,
    setAddBrand,
    addBrandId,
    setAddBrandId,
    addCategoryId,
    setAddCategoryId,
    addUnitId,
    setAddUnitId,
    addSupplierId,
    setAddSupplierId,
    addBarcodeSymbologyId,
    setAddBarcodeSymbologyId,
    addTaxTypeId,
    setAddTaxTypeId,
    addBarcode,
    setAddBarcode,
    addPrice,
    setAddPrice,
    addCostPrice,
    setAddCostPrice,
    addStock,
    setAddStock,
    addUom,
    setAddUom,
    addWeightKg,
    setAddWeightKg,
    addWidthCm,
    setAddWidthCm,
    addLengthCm,
    setAddLengthCm,
    addHeightCm,
    setAddHeightCm,
    addReorderPoint,
    setAddReorderPoint,
    addMinReorderQty,
    setAddMinReorderQty,
    addIsLotControl,
    setAddIsLotControl,
    addIsReturnable,
    setAddIsReturnable,
    addWarrantyDays,
    setAddWarrantyDays,
    addDescription,
    setAddDescription,
    addCompanyCode,
    setAddCompanyCode,
    addCompanyName,
    setAddCompanyName,
    addCompanyTaxId,
    setAddCompanyTaxId,
    addCompanyBranchCode,
    setAddCompanyBranchCode,
    addCompanyBranchName,
    setAddCompanyBranchName,
    addCompanyPhone,
    setAddCompanyPhone,
    addCompanyEmail,
    setAddCompanyEmail,
    addCompanyAddress,
    setAddCompanyAddress,
    addCompanyIsHq,
    setAddCompanyIsHq,
    addEmail,
    setAddEmail,
    addRole,
    setAddRole,
    addWarehouseName,
    setAddWarehouseName,
    addBinCode,
    setAddBinCode,
    addZone,
    setAddZone,
    addRack,
    setAddRack,
    addCapacityKg,
    setAddCapacityKg,
    addSupplierName,
    setAddSupplierName,
    addContactPerson,
    setAddContactPerson,
    addPhone,
    setAddPhone,
    addTaxId,
    setAddTaxId,
    addCatCode,
    setAddCatCode,
    addCatName,
    setAddCatName,
    addCatDescription,
    setAddCatDescription,
    addBrdCode,
    setAddBrdCode,
    addBrdName,
    setAddBrdName,
    addBrdDescription,
    setAddBrdDescription,
    addProductImageFile,
    setAddProductImageFile,
    addProductImagePreview,
    setAddProductImagePreview,
  };
};
