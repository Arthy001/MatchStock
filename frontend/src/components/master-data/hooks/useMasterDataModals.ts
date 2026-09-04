import { useState, Dispatch, SetStateAction } from 'react';
import {
  Company,
  Supplier,
  WarehouseBin,
  CategoryItem,
  BrandItem,
  UserRole,
  ProductItem,
} from '../../../types';
import { masterDataService } from '../../../services/masterData.service';
import { warehouseService } from '../../../services/warehouse.service';
import { UnitItem, RbacUser } from './useMasterDataLoader';
import { ConfirmDeleteData } from '../modals/ConfirmDeleteModal';

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
  if (Array.isArray(data.errors)) return data.errors.join(', ');
  return data.message || err.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์';
};

interface UseMasterDataModalsProps {
  companiesList: Company[];
  setCompaniesList: Dispatch<SetStateAction<Company[]>>;
  suppliersList: Supplier[];
  setSuppliersList: Dispatch<SetStateAction<Supplier[]>>;
  unitsList: UnitItem[];
  setUnitsList: Dispatch<SetStateAction<UnitItem[]>>;
  binsList: WarehouseBin[];
  setBinsList: Dispatch<SetStateAction<WarehouseBin[]>>;
  categoriesList: CategoryItem[];
  setCategoriesList: Dispatch<SetStateAction<CategoryItem[]>>;
  brandsList: BrandItem[];
  setBrandsList: Dispatch<SetStateAction<BrandItem[]>>;
  usersList: RbacUser[];
  setUsersList: Dispatch<SetStateAction<RbacUser[]>>;
  showToast: (msg: string) => void;
}

export const useMasterDataModals = ({
  companiesList,
  setCompaniesList,
  suppliersList,
  setSuppliersList,
  unitsList,
  setUnitsList,
  binsList,
  setBinsList,
  categoriesList,
  setCategoriesList,
  brandsList,
  setBrandsList,
  usersList,
  setUsersList,
  showToast,
}: UseMasterDataModalsProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<ProductItem | null>(null);

  // Modal confirm delete state
  const [deleteConfirmData, setDeleteConfirmData] = useState<ConfirmDeleteData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Selected item states
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingUnit, setEditingUnit] = useState<UnitItem | null>(null);
  const [editingBin, setEditingBin] = useState<WarehouseBin | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);

  // Edit Company form state
  const [editCompCode, setEditCompCode] = useState('');
  const [editCompName, setEditCompName] = useState('');
  const [editCompTaxId, setEditCompTaxId] = useState('');
  const [editCompBranchCode, setEditCompBranchCode] = useState('00000');
  const [editCompBranchName, setEditCompBranchName] = useState('');
  const [editCompPhone, setEditCompPhone] = useState('');
  const [editCompEmail, setEditCompEmail] = useState('');
  const [editCompAddress, setEditCompAddress] = useState('');
  const [editCompIsHq, setEditCompIsHq] = useState(false);

  // Edit Supplier form state
  const [editSupCode, setEditSupCode] = useState('');
  const [editSupName, setEditSupName] = useState('');
  const [editSupContactPerson, setEditSupContactPerson] = useState('');
  const [editSupPhone, setEditSupPhone] = useState('');
  const [editSupEmail, setEditSupEmail] = useState('');
  const [editSupTaxId, setEditSupTaxId] = useState('');
  const [editSupAddress, setEditSupAddress] = useState('');
  const [editSupIsActive, setEditSupIsActive] = useState(true);

  // Edit Unit form state
  const [editUnitCode, setEditUnitCode] = useState('');
  const [editUnitName, setEditUnitName] = useState('');
  const [editUnitIsActive, setEditUnitIsActive] = useState(true);

  // Edit Warehouse/Bin form state
  const [editWhName, setEditWhName] = useState('');
  const [editBinCode, setEditBinCode] = useState('');
  const [editBinZone, setEditBinZone] = useState('');
  const [editBinRack, setEditBinRack] = useState('');
  const [editBinShelf, setEditBinShelf] = useState('');
  const [editBinCapacity, setEditBinCapacity] = useState('0');
  const [editBinIsActive, setEditBinIsActive] = useState(true);

  // Edit Category form state
  const [editCatCode, setEditCatCode] = useState('');
  const [editCatName, setEditCatName] = useState('');
  const [editCatDescription, setEditCatDescription] = useState('');
  const [editCatIsActive, setEditCatIsActive] = useState(true);

  // Edit Brand form state
  const [editBrandCode, setEditBrandCode] = useState('');
  const [editBrandName, setEditBrandName] = useState('');
  const [editBrandDescription, setEditBrandDescription] = useState('');
  const [editBrandIsActive, setEditBrandIsActive] = useState(true);

  // --- Handlers: Company ---
  const openEditCompany = (comp: Company, viewOnly: boolean = false) => {
    setEditingCompany(comp);
    setIsViewOnly(viewOnly);
    setEditCompCode(comp.code);
    setEditCompName(comp.name);
    setEditCompTaxId(comp.taxId || '');
    setEditCompBranchCode(comp.branchCode || '00000');
    setEditCompBranchName(comp.branchName || '');
    setEditCompPhone(comp.phone || '');
    setEditCompEmail(comp.email || '');
    setEditCompAddress(comp.address || '');
    setEditCompIsHq(Boolean(comp.isHeadquarter));
  };

  const handleSaveEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    if (!editCompName.trim()) {
      showToast('กรุณากรอกชื่อบริษัท / นิติบุคคล');
      return;
    }

    const targetName = editCompName.trim().toLowerCase();
    const targetBranch = (editCompBranchCode.trim() || '00000').toLowerCase();
    const targetTaxId = editCompTaxId.trim();

    // 1. ตรวจสอบชื่อบริษัท + รหัสสาขา ซ้ำกับบริษัทอื่น
    const duplicateBranch = companiesList.find(
      (c) =>
        c.id !== editingCompany.id &&
        c.name.trim().toLowerCase() === targetName &&
        (c.branchCode || '00000').toLowerCase() === targetBranch
    );
    if (duplicateBranch) {
      showToast(`สาขา ${editCompBranchCode.trim() || '00000'} ของบริษัท "${editCompName.trim()}" มีอยู่ในระบบแล้ว`);
      return;
    }

    // 2. ถ้ากรอก Tax ID ตรวจสอบ Tax ID + รหัสสาขา ซ้ำกับบริษัทอื่น
    if (targetTaxId) {
      const duplicateTaxBranch = companiesList.find(
        (c) =>
          c.id !== editingCompany.id &&
          c.taxId &&
          c.taxId.trim() === targetTaxId &&
          (c.branchCode || '00000').toLowerCase() === targetBranch
      );
      if (duplicateTaxBranch) {
        showToast(`เลขประจำตัวผู้เสียภาษีนี้มีรหัสสาขา ${editCompBranchCode.trim() || '00000'} อยู่แล้ว`);
        return;
      }
    }

    setIsSaving(true);
    try {
      await masterDataService.updateCompany(editingCompany.id, {
        code: editCompCode,
        name: editCompName.trim(),
        taxId: editCompTaxId,
        branchCode: editCompBranchCode.trim() || '00000',
        branchName: editCompBranchName,
        phone: editCompPhone,
        email: editCompEmail,
        address: editCompAddress,
        isHeadquarter: editCompIsHq,
      });

      setCompaniesList((prev) =>
        prev.map((c) =>
          c.id === editingCompany.id
            ? {
                ...c,
                code: editCompCode,
                name: editCompName,
                taxId: editCompTaxId,
                branchCode: editCompBranchCode,
                branchName: editCompBranchName,
                phone: editCompPhone,
                email: editCompEmail,
                address: editCompAddress,
                isHeadquarter: editCompIsHq,
              }
            : c
        )
      );
      setEditingCompany(null);
      showToast(`แก้ไขข้อมูลบริษัท "${editCompName}" สำเร็จ`);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast(`เกิดข้อผิดพลาดในการแก้ไขบริษัท: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCompany = (comp: Company) => {
    setDeleteConfirmData({
      title: 'ยืนยันการลบบริษัทในเครือ',
      itemType: 'บริษัท / สาขา',
      itemName: comp.name,
      itemCode: comp.code || comp.branchCode,
      description: `สาขา: ${comp.branchName || comp.branchCode || '00000'} | เลขผู้เสียภาษี: ${comp.taxId || '-'}`,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await masterDataService.deleteCompany(comp.id);
          setCompaniesList((prev) => prev.filter((c) => c.id !== comp.id));
          showToast(`ลบบริษัท "${comp.name}" เรียบร้อยแล้ว`);
          setDeleteConfirmData(null);
        } catch (err: any) {
          const msg = extractErrorMessage(err);
          showToast(`เกิดข้อผิดพลาดในการลบบริษัท: ${msg}`);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  // --- Handlers: Supplier ---
  const openEditSupplier = (sup: Supplier, viewOnly: boolean = false) => {
    setEditingSupplier(sup);
    setIsViewOnly(viewOnly);
    setEditSupCode(sup.code || '');
    setEditSupName(sup.name);
    setEditSupContactPerson(sup.contactPerson || '');
    setEditSupPhone(sup.phone || '');
    setEditSupEmail(sup.email || '');
    setEditSupTaxId(sup.taxId || '');
    setEditSupAddress(sup.address || '');
    setEditSupIsActive(sup.isActive !== false && sup.status !== 'inactive');
  };

  const handleSaveEditSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    setIsSaving(true);
    try {
      await masterDataService.updateSupplier(editingSupplier.id, {
        code: editSupCode,
        name: editSupName,
        contactPerson: editSupContactPerson,
        phone: editSupPhone,
        email: editSupEmail,
        taxId: editSupTaxId,
        address: editSupAddress,
        isActive: editSupIsActive,
      });

      setSuppliersList((prev) =>
        prev.map((s) =>
          s.id === editingSupplier.id
            ? {
                ...s,
                code: editSupCode,
                name: editSupName,
                contactPerson: editSupContactPerson,
                phone: editSupPhone,
                email: editSupEmail,
                taxId: editSupTaxId,
                address: editSupAddress,
                isActive: editSupIsActive,
                status: editSupIsActive ? 'active' : 'inactive',
              }
            : s
        )
      );
      setEditingSupplier(null);
      showToast(`แก้ไขข้อมูลผู้จัดจำหน่าย "${editSupName}" สำเร็จ`);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast(`เกิดข้อผิดพลาดในการแก้ไขผู้จัดจำหน่าย: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSupplier = (sup: Supplier) => {
    setDeleteConfirmData({
      title: 'ยืนยันการลบผู้จัดจำหน่าย',
      itemType: 'คู่ค้า / ซัพพลายเออร์',
      itemName: sup.name,
      itemCode: sup.code,
      description: `ผู้ติดต่อ: ${sup.contactPerson || '-'} | โทร: ${sup.phone || '-'}`,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await masterDataService.deleteSupplier(sup.id);
          setSuppliersList((prev) => prev.filter((s) => s.id !== sup.id));
          showToast(`ลบผู้จัดจำหน่าย "${sup.name}" เรียบร้อยแล้ว`);
          setDeleteConfirmData(null);
        } catch (err: any) {
          const msg = extractErrorMessage(err);
          showToast(`เกิดข้อผิดพลาดในการลบผู้จัดจำหน่าย: ${msg}`);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  // --- Handlers: Unit ---
  const openEditUnit = (unit: UnitItem, viewOnly: boolean = false) => {
    setEditingUnit(unit);
    setIsViewOnly(viewOnly);
    setEditUnitCode(unit.code);
    setEditUnitName(unit.name);
    setEditUnitIsActive(unit.isActive !== false);
  };

  const handleSaveEditUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    setIsSaving(true);
    try {
      const updated = await masterDataService.updateUnit(editingUnit.id, {
        code: editUnitCode,
        name: editUnitName,
        isActive: editUnitIsActive,
      });
      setUnitsList((prev) =>
        prev.map((u) =>
          u.id === editingUnit.id
            ? { ...u, ...updated, code: editUnitCode, name: editUnitName, isActive: editUnitIsActive }
            : u
        )
      );
      setEditingUnit(null);
      showToast(`แก้ไขหน่วยนับ "${editUnitName}" สำเร็จ`);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast(`เกิดข้อผิดพลาดในการแก้ไขหน่วยนับ: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUnit = (unit: UnitItem) => {
    setDeleteConfirmData({
      title: 'ยืนยันการลบหน่วยนับสินค้า',
      itemType: 'หน่วยนับ (UOM)',
      itemName: unit.name,
      itemCode: unit.code,
      description: (unit as any).description || undefined,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await masterDataService.deleteUnit(unit.id);
          setUnitsList((prev) => prev.filter((u) => u.id !== unit.id));
          showToast(`ลบหน่วยนับ "${unit.name}" เรียบร้อยแล้ว`);
          setDeleteConfirmData(null);
        } catch (err: any) {
          const msg = extractErrorMessage(err);
          showToast(`เกิดข้อผิดพลาดในการลบหน่วยนับ: ${msg}`);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  // --- Handlers: Warehouse Bin ---
  const openEditBin = (bin: WarehouseBin, viewOnly: boolean = false) => {
    setEditingBin(bin);
    setIsViewOnly(viewOnly);
    setEditWhName(bin.warehouseName || (bin as any).name || 'Main Warehouse');
    setEditBinCode(bin.binCode || (bin as any).code || 'BIN-01');
    setEditBinZone(bin.zone || (bin.binCode ? bin.binCode.split('-')[0] : 'Zone A'));
    setEditBinRack(bin.rack || (bin.binCode ? bin.binCode.split('-')[1] || 'Rack 1' : 'Rack 1'));
    setEditBinShelf(bin.shelf || '');
    setEditBinCapacity(String(bin.capacityKg || (bin as any).maxCapacity || 500));
    setEditBinIsActive(bin.isActive !== false && bin.status !== 'maintenance');
  };

  const handleSaveEditBin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBin) return;
    setIsSaving(true);
    try {
      const targetWhId = editingBin.warehouseId || editingBin.id;
      // Update warehouse / bin
      if (editingBin.id !== targetWhId) {
        await warehouseService.updateBin(targetWhId, editingBin.id, {
          code: editBinCode,
          name: editWhName,
          zone: editBinZone,
          rack: editBinRack,
          shelf: editBinShelf,
          capacityKg: parseFloat(editBinCapacity) || 0,
          maxCapacity: parseInt(editBinCapacity) || 0,
          isActive: editBinIsActive,
        });
      } else {
        await warehouseService.updateWarehouse(targetWhId, {
          name: editWhName,
          code: editBinCode,
          isActive: editBinIsActive,
        });
      }

      setBinsList((prev) =>
        prev.map((b) =>
          b.id === editingBin.id
            ? {
                ...b,
                warehouseName: editWhName,
                binCode: editBinCode,
                zone: editBinZone,
                rack: editBinRack,
                shelf: editBinShelf,
                capacityKg: parseFloat(editBinCapacity) || 0,
                isActive: editBinIsActive,
                status: editBinIsActive ? (b.status === 'maintenance' ? 'available' : b.status) : 'maintenance',
              }
            : b
        )
      );
      setEditingBin(null);
      showToast(`แก้ไขข้อมูลคลัง / ตำแหน่ง Bin "${editBinCode}" สำเร็จ`);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast(`เกิดข้อผิดพลาดในการแก้ไขตำแหน่ง Bin: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBin = (bin: WarehouseBin) => {
    setDeleteConfirmData({
      title: 'ยืนยันการลบตำแหน่งจัดเก็บ Bin',
      itemType: 'Bin Location',
      itemName: bin.binCode,
      itemCode: bin.zone ? `โซน ${bin.zone}` : undefined,
      description: `คลังสินค้า: ${bin.warehouseName || '-'} | แร็ค: ${bin.rack || '-'}`,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          // bin.warehouseId must be passed explicitly - warehouseService.deleteBin()
          // falls back to the literal string 'default' as the warehouseId when only
          // one argument is given, which 404s/500s against the real API (not a real id).
          await warehouseService.deleteBin(bin.warehouseId || bin.id, bin.id);
          setBinsList((prev) => prev.filter((b) => b.id !== bin.id));
          showToast(`ลบตำแหน่ง Bin "${bin.binCode}" เรียบร้อยแล้ว`);
          setDeleteConfirmData(null);
        } catch (err: any) {
          const msg = extractErrorMessage(err);
          showToast(`เกิดข้อผิดพลาดในการลบตำแหน่ง Bin: ${msg}`);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  // --- Handlers: Category ---
  const openEditCategory = (cat: CategoryItem, viewOnly: boolean = false) => {
    setEditingCategory(cat);
    setIsViewOnly(viewOnly);
    setEditCatCode(cat.code || '');
    setEditCatName(cat.name || '');
    setEditCatDescription(cat.description || '');
    setEditCatIsActive(cat.isActive !== false);
  };

  const handleSaveEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setIsSaving(true);
    try {
      const updated = await masterDataService.updateCategory(editingCategory.id, {
        code: editCatCode,
        name: editCatName,
        description: editCatDescription,
        isActive: editCatIsActive,
      });
      setCategoriesList((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, ...updated, code: editCatCode, name: editCatName, description: editCatDescription, isActive: editCatIsActive }
            : c
        )
      );
      setEditingCategory(null);
      showToast(`แก้ไขหมวดหมู่ "${editCatName}" สำเร็จ`);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast(`เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = (cat: CategoryItem) => {
    setDeleteConfirmData({
      title: 'ยืนยันการลบหมวดหมู่สินค้า',
      itemType: 'หมวดหมู่ (Category)',
      itemName: cat.name,
      itemCode: cat.code,
      description: cat.description || undefined,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await masterDataService.deleteCategory(cat.id);
          setCategoriesList((prev) => prev.filter((c) => c.id !== cat.id));
          showToast(`ลบหมวดหมู่ "${cat.name}" เรียบร้อยแล้ว`);
          setDeleteConfirmData(null);
        } catch (err: any) {
          const msg = extractErrorMessage(err);
          showToast(`เกิดข้อผิดพลาดในการลบหมวดหมู่: ${msg}`);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  // --- Handlers: Brand ---
  const openEditBrand = (brand: BrandItem, viewOnly: boolean = false) => {
    setEditingBrand(brand);
    setIsViewOnly(viewOnly);
    setEditBrandCode(brand.code || '');
    setEditBrandName(brand.name || '');
    setEditBrandDescription(brand.description || '');
    setEditBrandIsActive(brand.isActive !== false);
  };

  const handleSaveEditBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;
    setIsSaving(true);
    try {
      const updated = await masterDataService.updateBrand(editingBrand.id, {
        code: editBrandCode,
        name: editBrandName,
        description: editBrandDescription,
        isActive: editBrandIsActive,
      });
      setBrandsList((prev) =>
        prev.map((b) =>
          b.id === editingBrand.id
            ? { ...b, ...updated, code: editBrandCode, name: editBrandName, description: editBrandDescription, isActive: editBrandIsActive }
            : b
        )
      );
      setEditingBrand(null);
      showToast(`แก้ไขแบรนด์ "${editBrandName}" สำเร็จ`);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast(`เกิดข้อผิดพลาดในการแก้ไขแบรนด์: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBrand = (brand: BrandItem) => {
    setDeleteConfirmData({
      title: 'ยืนยันการลบแบรนด์สินค้า',
      itemType: 'แบรนด์ (Brand)',
      itemName: brand.name,
      itemCode: brand.code,
      description: brand.description || undefined,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await masterDataService.deleteBrand(brand.id);
          setBrandsList((prev) => prev.filter((b) => b.id !== brand.id));
          showToast(`ลบแบรนด์ "${brand.name}" เรียบร้อยแล้ว`);
          setDeleteConfirmData(null);
        } catch (err: any) {
          const msg = extractErrorMessage(err);
          showToast(`เกิดข้อผิดพลาดในการลบแบรนด์: ${msg}`);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  // --- Handlers: RBAC ---
  const handleChangeUserRole = async (usr: RbacUser, newRole: UserRole) => {
    try {
      await masterDataService.updateUserRole(usr.id, { role: newRole });
      setUsersList((prev) =>
        prev.map((u) => (u.id === usr.id ? { ...u, role: newRole } : u))
      );
      showToast(`อัปเดตบทบาทของ "${usr.name}" เป็น ${newRole.toUpperCase()} เรียบร้อยแล้ว`);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast(`เกิดข้อผิดพลาดในการอัปเดตบทบาท: ${msg}`);
    }
  };

  const handleDeleteUser = (usr: RbacUser) => {
    setDeleteConfirmData({
      title: 'ยืนยันการลบผู้ใช้งานระบบ',
      itemType: 'ผู้ใช้ (User)',
      itemName: usr.name,
      itemCode: usr.role?.toUpperCase(),
      description: `อีเมล: ${usr.email}`,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await masterDataService.deleteUser(usr.id);
          setUsersList((prev) => prev.filter((u) => u.id !== usr.id));
          showToast(`ลบผู้ใช้งาน "${usr.name}" เรียบร้อยแล้ว`);
          setDeleteConfirmData(null);
        } catch (err: any) {
          const msg = extractErrorMessage(err);
          showToast(`เกิดข้อผิดพลาดในการลบผู้ใช้งาน: ${msg}`);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return {
    isSaving,
    isViewOnly,
    setIsViewOnly,
    selectedProductForBarcode,
    setSelectedProductForBarcode,

    // Confirm Delete
    deleteConfirmData,
    setDeleteConfirmData,
    isDeleting,

    // Company
    editingCompany,
    setEditingCompany,
    editCompCode,
    setEditCompCode,
    editCompName,
    setEditCompName,
    editCompTaxId,
    setEditCompTaxId,
    editCompBranchCode,
    setEditCompBranchCode,
    editCompBranchName,
    setEditCompBranchName,
    editCompPhone,
    setEditCompPhone,
    editCompEmail,
    setEditCompEmail,
    editCompAddress,
    setEditCompAddress,
    editCompIsHq,
    setEditCompIsHq,
    openEditCompany,
    handleSaveEditCompany,
    handleDeleteCompany,

    // Supplier
    editingSupplier,
    setEditingSupplier,
    editSupCode,
    setEditSupCode,
    editSupName,
    setEditSupName,
    editSupContactPerson,
    setEditSupContactPerson,
    editSupPhone,
    setEditSupPhone,
    editSupEmail,
    setEditSupEmail,
    editSupTaxId,
    setEditSupTaxId,
    editSupAddress,
    setEditSupAddress,
    editSupIsActive,
    setEditSupIsActive,
    openEditSupplier,
    handleSaveEditSupplier,
    handleDeleteSupplier,

    // Unit
    editingUnit,
    setEditingUnit,
    editUnitCode,
    setEditUnitCode,
    editUnitName,
    setEditUnitName,
    editUnitIsActive,
    setEditUnitIsActive,
    openEditUnit,
    handleSaveEditUnit,
    handleDeleteUnit,

    // Warehouse Bin
    editingBin,
    setEditingBin,
    editWhName,
    setEditWhName,
    editBinCode,
    setEditBinCode,
    editBinZone,
    setEditBinZone,
    editBinRack,
    setEditBinRack,
    editBinShelf,
    setEditBinShelf,
    editBinCapacity,
    setEditBinCapacity,
    editBinIsActive,
    setEditBinIsActive,
    openEditBin,
    handleSaveEditBin,
    handleDeleteBin,

    // Category
    editingCategory,
    setEditingCategory,
    editCatCode,
    setEditCatCode,
    editCatName,
    setEditCatName,
    editCatDescription,
    setEditCatDescription,
    editCatIsActive,
    setEditCatIsActive,
    openEditCategory,
    handleSaveEditCategory,
    handleDeleteCategory,

    // Brand
    editingBrand,
    setEditingBrand,
    editBrandCode,
    setEditBrandCode,
    editBrandName,
    setEditBrandName,
    editBrandDescription,
    setEditBrandDescription,
    editBrandIsActive,
    setEditBrandIsActive,
    openEditBrand,
    handleSaveEditBrand,
    handleDeleteBrand,

    // RBAC
    handleChangeUserRole,
    handleDeleteUser,
  };
};
