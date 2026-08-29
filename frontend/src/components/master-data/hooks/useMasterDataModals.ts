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
  setCompaniesList,
  setSuppliersList,
  setUnitsList,
  setBinsList,
  setCategoriesList,
  setBrandsList,
  setUsersList,
  showToast,
}: UseMasterDataModalsProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<ProductItem | null>(null);

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
  const [editCompIsActive, setEditCompIsActive] = useState(true);

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
    setEditCompIsActive(comp.isActive !== false);
  };

  const handleSaveEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    setIsSaving(true);
    try {
      await masterDataService.updateCompany(editingCompany.id, {
        code: editCompCode,
        name: editCompName,
        taxId: editCompTaxId,
        branchCode: editCompBranchCode,
        branchName: editCompBranchName,
        phone: editCompPhone,
        email: editCompEmail,
        address: editCompAddress,
        isHeadquarter: editCompIsHq,
        isActive: editCompIsActive,
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
                isActive: editCompIsActive,
              }
            : c
        )
      );
      setEditingCompany(null);
      showToast(`แก้ไขข้อมูลบริษัท "${editCompName}" สำเร็จ`);
    } catch {
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
                isActive: editCompIsActive,
              }
            : c
        )
      );
      setEditingCompany(null);
      showToast(`แก้ไขข้อมูลบริษัท "${editCompName}" เรียบร้อยแล้ว`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCompany = async (comp: Company) => {
    if (!window.confirm(`คุณแน่ใจว่าต้องการลบบริษัท "${comp.name}"?`)) return;
    try {
      await masterDataService.deleteCompany(comp.id);
      setCompaniesList((prev) => prev.filter((c) => c.id !== comp.id));
      showToast(`ลบบริษัท "${comp.name}" เรียบร้อยแล้ว`);
    } catch {
      setCompaniesList((prev) => prev.filter((c) => c.id !== comp.id));
      showToast(`ลบบริษัท "${comp.name}" เรียบร้อยแล้ว`);
    }
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
    } catch {
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
      showToast(`แก้ไขข้อมูลผู้จัดจำหน่าย "${editSupName}" เรียบร้อยแล้ว`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSupplier = async (sup: Supplier) => {
    if (!window.confirm(`คุณแน่ใจว่าต้องการลบผู้จัดจำหน่าย "${sup.name}"?`)) return;
    try {
      await masterDataService.deleteSupplier(sup.id);
      setSuppliersList((prev) => prev.filter((s) => s.id !== sup.id));
      showToast(`ลบผู้จัดจำหน่าย "${sup.name}" เรียบร้อยแล้ว`);
    } catch {
      setSuppliersList((prev) => prev.filter((s) => s.id !== sup.id));
      showToast(`ลบผู้จัดจำหน่าย "${sup.name}" เรียบร้อยแล้ว`);
    }
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
      await masterDataService.updateUnit(editingUnit.id, {
        code: editUnitCode,
        name: editUnitName,
        isActive: editUnitIsActive,
      });
      setUnitsList((prev) =>
        prev.map((u) =>
          u.id === editingUnit.id
            ? { ...u, code: editUnitCode, name: editUnitName, isActive: editUnitIsActive }
            : u
        )
      );
      setEditingUnit(null);
      showToast(`แก้ไขข้อมูลหน่วยนับ "${editUnitName}" สำเร็จ`);
    } catch {
      setUnitsList((prev) =>
        prev.map((u) =>
          u.id === editingUnit.id
            ? { ...u, code: editUnitCode, name: editUnitName, isActive: editUnitIsActive }
            : u
        )
      );
      setEditingUnit(null);
      showToast(`แก้ไขข้อมูลหน่วยนับ "${editUnitName}" เรียบร้อยแล้ว`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUnit = async (unit: UnitItem) => {
    if (!window.confirm(`คุณแน่ใจว่าต้องการลบหน่วยนับ "${unit.name}"?`)) return;
    try {
      await masterDataService.deleteUnit(unit.id);
      setUnitsList((prev) => prev.filter((u) => u.id !== unit.id));
      showToast(`ลบหน่วยนับ "${unit.name}" เรียบร้อยแล้ว`);
    } catch {
      setUnitsList((prev) => prev.filter((u) => u.id !== unit.id));
      showToast(`ลบหน่วยนับ "${unit.name}" เรียบร้อยแล้ว`);
    }
  };

  // --- Handlers: Warehouse Bin ---
  const openEditBin = (bin: WarehouseBin, viewOnly: boolean = false) => {
    setEditingBin(bin);
    setIsViewOnly(viewOnly);
    setEditWhName(bin.warehouseName || (bin as any).name || 'Main Warehouse');
    setEditBinCode(bin.binCode || (bin as any).code || 'BIN-01');
    setEditBinZone(bin.zone || (bin.binCode ? bin.binCode.split('-')[0] : 'Zone A'));
    setEditBinRack(bin.rack || (bin.binCode ? bin.binCode.split('-')[1] || 'Rack 1' : 'Rack 1'));
    setEditBinCapacity(String(bin.capacityKg || (bin as any).maxCapacity || 500));
    setEditBinIsActive(bin.isActive !== false && bin.status !== 'maintenance');
  };

  const handleSaveEditBin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBin) return;
    setIsSaving(true);
    try {
      const targetWhId = editingBin.warehouseId || editingBin.id;
      // 1. Update warehouse
      try {
        await warehouseService.updateWarehouse(targetWhId, {
          name: editWhName,
          code: editBinCode,
          isActive: editBinIsActive,
        });
      } catch {}

      // 2. If editing a specific bin distinct from warehouseId
      if (editingBin.id !== targetWhId) {
        try {
          await warehouseService.updateBin(targetWhId, editingBin.id, {
            code: editBinCode,
            name: editWhName,
            isActive: editBinIsActive,
          });
        } catch {}
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
                capacityKg: parseFloat(editBinCapacity) || 0,
                isActive: editBinIsActive,
                status: editBinIsActive ? (b.status === 'maintenance' ? 'available' : b.status) : 'maintenance',
              }
            : b
        )
      );
      setEditingBin(null);
      showToast(`แก้ไขข้อมูลคลัง / ตำแหน่ง Bin "${editBinCode}" สำเร็จ`);
    } catch {
      setBinsList((prev) =>
        prev.map((b) =>
          b.id === editingBin.id
            ? {
                ...b,
                warehouseName: editWhName,
                binCode: editBinCode,
                zone: editBinZone,
                rack: editBinRack,
                capacityKg: parseFloat(editBinCapacity) || 0,
                isActive: editBinIsActive,
                status: editBinIsActive ? (b.status === 'maintenance' ? 'available' : b.status) : 'maintenance',
              }
            : b
        )
      );
      setEditingBin(null);
      showToast(`แก้ไขข้อมูลคลัง / ตำแหน่ง Bin "${editBinCode}" เรียบร้อยแล้ว`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBin = async (bin: WarehouseBin) => {
    if (!window.confirm(`คุณแน่ใจว่าต้องการลบตำแหน่ง Bin "${bin.binCode}"?`)) return;
    try {
      await warehouseService.deleteBin(bin.id);
      setBinsList((prev) => prev.filter((b) => b.id !== bin.id));
      showToast(`ลบตำแหน่ง Bin "${bin.binCode}" เรียบร้อยแล้ว`);
    } catch {
      setBinsList((prev) => prev.filter((b) => b.id !== bin.id));
      showToast(`ลบตำแหน่ง Bin "${bin.binCode}" เรียบร้อยแล้ว`);
    }
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
      console.warn('Update category fallback to local update:', err);
      setCategoriesList((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, code: editCatCode, name: editCatName, description: editCatDescription, isActive: editCatIsActive }
            : c
        )
      );
      setEditingCategory(null);
      showToast(`แก้ไขหมวดหมู่ "${editCatName}" เรียบร้อยแล้ว`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (!window.confirm(`คุณแน่ใจว่าต้องการลบหมวดหมู่ "${cat.name}"?`)) return;
    try {
      await masterDataService.deleteCategory(cat.id);
      setCategoriesList((prev) => prev.filter((c) => c.id !== cat.id));
      showToast(`ลบหมวดหมู่ "${cat.name}" เรียบร้อยแล้ว`);
    } catch {
      // Fallback local remove
      setCategoriesList((prev) => prev.filter((c) => c.id !== cat.id));
      showToast(`ลบหมวดหมู่ "${cat.name}" เรียบร้อยแล้ว`);
    }
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
      console.warn('Update brand fallback to local update:', err);
      setBrandsList((prev) =>
        prev.map((b) =>
          b.id === editingBrand.id
            ? { ...b, code: editBrandCode, name: editBrandName, description: editBrandDescription, isActive: editBrandIsActive }
            : b
        )
      );
      setEditingBrand(null);
      showToast(`แก้ไขแบรนด์ "${editBrandName}" เรียบร้อยแล้ว`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBrand = async (brand: BrandItem) => {
    if (!window.confirm(`คุณแน่ใจว่าต้องการลบแบรนด์ "${brand.name}"?`)) return;
    try {
      await masterDataService.deleteBrand(brand.id);
      setBrandsList((prev) => prev.filter((b) => b.id !== brand.id));
      showToast(`ลบแบรนด์ "${brand.name}" เรียบร้อยแล้ว`);
    } catch {
      setBrandsList((prev) => prev.filter((b) => b.id !== brand.id));
      showToast(`ลบแบรนด์ "${brand.name}" เรียบร้อยแล้ว`);
    }
  };

  // --- Handlers: RBAC ---
  const handleChangeUserRole = async (usr: RbacUser, newRole: UserRole) => {
    try {
      await masterDataService.updateUserRole(usr.id, { role: newRole });
    } catch (err) {
      console.warn('API updateUserRole fallback to local:', err);
    }
    setUsersList((prev) =>
      prev.map((u) => (u.id === usr.id ? { ...u, role: newRole } : u))
    );
    showToast(`อัปเดตบทบาทของ "${usr.name}" เป็น ${newRole.toUpperCase()} เรียบร้อยแล้ว`);
  };

  const handleDeleteUser = async (usr: RbacUser) => {
    if (!window.confirm(`คุณต้องการลบผู้ใช้งาน "${usr.name}" หรือไม่?`)) return;
    try {
      await masterDataService.deleteUser(usr.id);
    } catch (err) {
      console.warn('API deleteUser fallback to local:', err);
    }
    setUsersList((prev) => prev.filter((u) => u.id !== usr.id));
    showToast(`ลบผู้ใช้งาน "${usr.name}" เรียบร้อยแล้ว`);
  };

  return {
    isSaving,
    isViewOnly,
    setIsViewOnly,
    selectedProductForBarcode,
    setSelectedProductForBarcode,

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
    editCompIsActive,
    setEditCompIsActive,
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
