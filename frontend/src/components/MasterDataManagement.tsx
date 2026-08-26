import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  ArrowUpDown,
  Download,
  AlertTriangle,
  Layers,
  Building,
  Building2,
  Users,
  Scale,
  QrCode,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import {
  ThemeMode,
  Language,
  ProductItem,
  UserRole,
  Company,
  WarehouseBin,
  Supplier,
  MasterDataSubTab,
} from '../types';
import { productService } from '../services/product.service';
import { warehouseService } from '../services/warehouse.service';
import { masterDataService } from '../services/masterData.service';

// Modular Tabs
import { ProductCatalogTab } from './master-data/tabs/ProductCatalogTab';
import { CompanyManagementTab } from './master-data/tabs/CompanyManagementTab';
import { WarehouseBinTab } from './master-data/tabs/WarehouseBinTab';
import { SupplierManagementTab } from './master-data/tabs/SupplierManagementTab';
import { UnitManagementTab } from './master-data/tabs/UnitManagementTab';
import { RbacAccessTab } from './master-data/tabs/RbacAccessTab';
import { BarcodeManagementTab } from './master-data/tabs/BarcodeManagementTab';

// Modular Modals
import { ProductDrawer } from './master-data/modals/ProductDrawer';
import { EditCompanyModal } from './master-data/modals/EditCompanyModal';
import { EditSupplierModal } from './master-data/modals/EditSupplierModal';
import { EditWarehouseBinModal } from './master-data/modals/EditWarehouseBinModal';
import { EditUnitModal } from './master-data/modals/EditUnitModal';
import { AddMasterDataModal } from './master-data/modals/AddMasterDataModal';
import { BarcodeModal } from './master-data/modals/BarcodeModal';

interface MasterDataProps {
  theme: ThemeMode;
  lang: Language;
  searchQuery?: string;
  activeSubTab?: MasterDataSubTab;
  onSubTabChange?: (tab: MasterDataSubTab) => void;
}

interface RbacUser {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  status: string;
}

interface UnitItem {
  id: string;
  code: string;
  name: string;
}

export const MasterDataManagement: React.FC<MasterDataProps> = ({
  theme,
  lang,
  activeSubTab = 'products',
  onSubTabChange,
}) => {
  // Search query & feedback states
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pure Live Entities state (Zero Mockups)
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [companiesList, setCompaniesList] = useState<Company[]>([]);
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);
  const [unitsList, setUnitsList] = useState<UnitItem[]>([]);
  const [binsList, setBinsList] = useState<WarehouseBin[]>([]);
  const [usersList, setUsersList] = useState<RbacUser[]>([]);

  // Selected item modals / drawer state
  const [drawerProduct, setDrawerProduct] = useState<ProductItem | null>(null);
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<ProductItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingUnit, setEditingUnit] = useState<UnitItem | null>(null);
  const [editingBin, setEditingBin] = useState<WarehouseBin | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Product Drawer form state
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editBarcode, setEditBarcode] = useState('');
  const [editPrice, setEditPrice] = useState('0');
  const [editWeightKg, setEditWeightKg] = useState('0');
  const [editWidthCm, setEditWidthCm] = useState('0');
  const [editLengthCm, setEditLengthCm] = useState('0');
  const [editHeightCm, setEditHeightCm] = useState('0');
  const [editReorderLevel, setEditReorderLevel] = useState('0');
  const [editMinReorderQty, setEditMinReorderQty] = useState('0');
  const [editIsLotControl, setEditIsLotControl] = useState(false);
  const [editDescription, setEditDescription] = useState('');

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

  // Edit Unit form state
  const [editUnitCode, setEditUnitCode] = useState('');
  const [editUnitName, setEditUnitName] = useState('');

  // Edit Warehouse/Bin form state
  const [editWhName, setEditWhName] = useState('');
  const [editBinCode, setEditBinCode] = useState('');
  const [editBinZone, setEditBinZone] = useState('');
  const [editBinRack, setEditBinRack] = useState('');
  const [editBinCapacity, setEditBinCapacity] = useState('0');

  // Unified Add modal form states
  const [addName, setAddName] = useState('');
  const [addCode, setAddCode] = useState('');
  const [addSku, setAddSku] = useState('');
  const [addBrand, setAddBrand] = useState('');
  const [addBarcode, setAddBarcode] = useState('');
  const [addPrice, setAddPrice] = useState('0');
  const [addStock, setAddStock] = useState('0');
  const [addUom, setAddUom] = useState('PCS');
  const [addWeightKg, setAddWeightKg] = useState('0');
  const [addWidthCm, setAddWidthCm] = useState('0');
  const [addLengthCm, setAddLengthCm] = useState('0');
  const [addHeightCm, setAddHeightCm] = useState('0');
  const [addReorderPoint, setAddReorderPoint] = useState('10');
  const [addMinReorderQty, setAddMinReorderQty] = useState('5');
  const [addIsLotControl, setAddIsLotControl] = useState(false);
  const [addDescription, setAddDescription] = useState('');

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Translations
  const t = {
    title: lang === 'en' ? 'Master Data Management' : 'การจัดการข้อมูลหลัก (Master Data)',
    productTitle: lang === 'en' ? 'Product Catalog & SKUs' : 'แคตตาล็อกสินค้า & รหัสสินค้า (SKUs)',
    productSubtitle: lang === 'en' ? 'Manage product definitions, barcodes, weight & dimensions, and inventory parameters' : 'จัดการข้อมูลสินค้า รหัสบาร์โค้ด ขนาดมิติกายภาพ และค่าควบคุมคลัง',
    rbacTitle: lang === 'en' ? 'Tenant & Role-Based Access Control (RBAC)' : 'การจัดการผู้ใช้และสิทธิ์การเข้าถึง (RBAC)',
    rbacSubtitle: lang === 'en' ? 'Configure role permissions, staff assignments, and multi-tenant access boundaries' : 'กำหนดสิทธิ์การใช้งานของพนักงาน ขอบเขตการเข้าถึง และการจัดการผู้ใช้',
    unitsTitle: lang === 'en' ? 'Units of Measure & Dimensions' : 'หน่วยนับและมิติขนาด (Units & Dimensions)',
    unitsSubtitle: lang === 'en' ? 'Configure conversion units, physical package dimensions (CBM), and net weight' : 'กำหนดหน่วยนับสินค้า หน่วยแปลง ปริมาตรลูกบาศก์เมตร (CBM) และน้ำหนักสุทธิ',
    barcodeTitle: lang === 'en' ? 'Barcode & Label Symbologies' : 'รูปแบบบาร์โค้ดและป้ายสินค้า (Barcode Symbologies)',
    barcodeSubtitle: lang === 'en' ? 'Configure Code128, EAN-13, QR Code formats and print templates' : 'ตั้งค่ามาตรฐานบาร์โค้ด Code128, EAN-13, QR Code และแบบฟอร์มพิมพ์ป้าย',
    warehouseTitle: lang === 'en' ? 'Multi-Warehouse & Storage Bins' : 'คลังสินค้าและตำแหน่งจัดเก็บ (Warehouse & Storage Bins)',
    warehouseSubtitle: lang === 'en' ? 'Manage warehouse zones, storage racks, and maximum capacity limits' : 'บริหารจัดการโซนคลัง แร็คจัดเก็บ และขีดความสามารถการรองรับน้ำหนักสูงสุด',
    supplierTitle: lang === 'en' ? 'Suppliers & Tax Configurations' : 'ผู้จัดจำหน่ายและภาษี (Suppliers & Tax Types)',
    supplierSubtitle: lang === 'en' ? 'Manage vendor records, payment terms, and applicable tax classifications' : 'จัดการรายชื่อซัพพลายเออร์ เครดิตเทอม และประเภทอัตราภาษี',
    tabProducts: lang === 'en' ? 'Products & SKUs' : 'สินค้าและรหัส SKU',
    tabUserAccess: lang === 'en' ? 'User Access (RBAC)' : 'ผู้ใช้งาน & สิทธิ์',
    tabUnits: lang === 'en' ? 'Units (UOM)' : 'หน่วยนับสินค้า',
    tabBarcodes: lang === 'en' ? 'Barcodes' : 'บาร์โค้ดและป้าย',
    tabWarehouses: lang === 'en' ? 'Warehouses & Bins' : 'คลังและตำแหน่ง Bin',
    tabSuppliers: lang === 'en' ? 'Suppliers' : 'ผู้จัดจำหน่าย',
    searchPlaceholder: lang === 'en' ? 'Search master data by name, SKU, code, or tag...' : 'ค้นหาข้อมูลหลักด้วยชื่อ, SKU, รหัส, หรือแท็ก...',
    addNewBtn: lang === 'en' ? 'Add Product' : 'เพิ่มสินค้าใหม่',
    actions: lang === 'en' ? 'Actions' : 'จัดการ',
    productName: lang === 'en' ? 'Product Name' : 'ชื่อสินค้า',
    sku: lang === 'en' ? 'SKU Code' : 'รหัส SKU',
    code: lang === 'en' ? 'Item Code' : 'รหัสสินค้า',
    brand: lang === 'en' ? 'Brand' : 'แบรนด์',
    stockOnHand: lang === 'en' ? 'Stock On Hand' : 'ยอดคงเหลือ',
    reorderLevel: lang === 'en' ? 'Reorder Level' : 'จุดสั่งซื้อซ้ำ (ROP)',
    price: lang === 'en' ? 'Unit Price' : 'ราคาต่อหน่วย',
    status: lang === 'en' ? 'Status' : 'สถานะ',
    roleAdmin: lang === 'en' ? 'Admin' : 'ผู้ดูแลระบบ (Admin)',
    roleManager: lang === 'en' ? 'Warehouse Manager' : 'ผู้จัดการคลัง (Manager)',
    roleWarehouse: lang === 'en' ? 'Warehouse Staff' : 'เจ้าหน้าที่คลัง (Staff)',
    rolePurchasing: lang === 'en' ? 'Purchasing Staff' : 'เจ้าหน้าที่จัดซื้อ (Purchasing)',
    role: lang === 'en' ? 'Role' : 'บทบาทหน้าที่',
    warehouseName: lang === 'en' ? 'Warehouse' : 'ชื่อคลังสินค้า',
    binCode: lang === 'en' ? 'Bin Location' : 'ตำแหน่งจัดเก็บ (Bin)',
    zone: lang === 'en' ? 'Zone' : 'โซน',
    rack: lang === 'en' ? 'Rack' : 'แร็ค',
    capacity: lang === 'en' ? 'Capacity' : 'ความจุจัดเก็บ',
    capacityKg: lang === 'en' ? 'Max Capacity (kg)' : 'ความจุสูงสุด (กก.)',
    supplierName: lang === 'en' ? 'Supplier Name' : 'ชื่อผู้จัดจำหน่าย',
    previewBarcode: lang === 'en' ? 'Preview Barcode' : 'ดูตัวอย่างบาร์โค้ด',
    printLabel: lang === 'en' ? 'Print Label' : 'พิมพ์ป้ายบาร์โค้ด',
    modalAddTitle: lang === 'en' ? 'Add New Master Data Entry' : 'เพิ่มข้อมูลหลักใหม่ลงในระบบ',
    save: lang === 'en' ? 'Save Changes' : 'บันทึกข้อมูล',
    cancel: lang === 'en' ? 'Cancel' : 'ยกเลิก',
    close: lang === 'en' ? 'Close' : 'ปิดหน้าต่าง',
  };

  // Load Data
  const loadAllMasterData = async () => {
    setIsLoading(true);
    try {
      const [prods, bins, sups, units, comps, usrs] = await Promise.all([
        productService.getAllProducts().catch(() => []),
        warehouseService.getBins().catch(() => []),
        masterDataService.getSuppliers().catch(() => []),
        masterDataService.getUnits().catch(() => []),
        masterDataService.getCompanies().catch(() => []),
        masterDataService.getUsers().catch(() => []),
      ]);

      const rawProds = Array.isArray(prods)
        ? prods
        : Array.isArray((prods as any)?.data)
        ? (prods as any).data
        : Array.isArray((prods as any)?.items)
        ? (prods as any).items
        : [];

      setProductsList(
        rawProds.map((p: any) => ({
          ...p,
          id: p.id || `prod-${Math.random().toString(36).substring(2, 9)}`,
          code: p.code || 'PRD-000',
          name: p.name || 'Unnamed Product',
          sku: p.sku || p.code || 'SKU-GEN',
          category: typeof p.category === 'object' ? (p.category?.name || 'General') : (p.category || 'General'),
          brand: typeof p.brand === 'object' ? (p.brand?.name || 'General') : (p.brand || 'General'),
          barcodeValue: p.barcodeValue || p.barcode || '',
          price: Number(p.price || 0),
          stockOnHand: Number(p.stockOnHand || 0),
          reorderLevel: Number(p.reorderLevel || p.reorderPoint || 10),
          uom: typeof p.uom === 'object' ? (p.uom?.name || 'PCS') : typeof p.unit === 'object' ? (p.unit?.name || 'PCS') : (p.uom || p.unit || 'PCS'),
        }))
      );

      const rawBins = Array.isArray(bins) ? bins : Array.isArray((bins as any)?.data) ? (bins as any).data : [];
      setBinsList(rawBins);

      const rawSups = Array.isArray(sups) ? sups : Array.isArray((sups as any)?.data) ? (sups as any).data : [];
      setSuppliersList(rawSups);

      const rawUnits = Array.isArray(units) ? units : Array.isArray((units as any)?.data) ? (units as any).data : [];
      setUnitsList(rawUnits);

      const rawComps = Array.isArray(comps) ? comps : Array.isArray((comps as any)?.data) ? (comps as any).data : [];
      setCompaniesList(rawComps);

      const rawUsers = Array.isArray(usrs) ? usrs : Array.isArray((usrs as any)?.data) ? (usrs as any).data : [];
      setUsersList(rawUsers);
    } catch (err) {
      console.error('Error loading master data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllMasterData();
  }, []);

  // Handlers for Product Drawer
  const openDrawerForProduct = (prod: ProductItem) => {
    setDrawerProduct(prod);
    setEditName(prod.name);
    setEditCode(prod.code);
    setEditSku(prod.sku);
    setEditBrand(prod.brand);
    setEditBarcode(prod.barcodeValue || '');
    setEditPrice(String(prod.price));
    setEditWeightKg(String(prod.weightKg));
    setEditWidthCm(String(prod.widthCm));
    setEditLengthCm(String(prod.lengthCm));
    setEditHeightCm(String(prod.heightCm));
    setEditReorderLevel(String(prod.reorderLevel));
    setEditMinReorderQty(String(prod.minReorderQty || 0));
    setEditIsLotControl(Boolean(prod.isLotControl));
    setEditDescription(prod.description || '');
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drawerProduct) return;
    setIsSaving(true);
    try {
      const updated = await productService.updateProduct(drawerProduct.id, {
        name: editName,
        code: editCode,
        sku: editSku,
        brand: editBrand,
        barcodeValue: editBarcode,
        price: parseFloat(editPrice) || 0,
        weightKg: parseFloat(editWeightKg) || 0,
        widthCm: parseFloat(editWidthCm) || 0,
        lengthCm: parseFloat(editLengthCm) || 0,
        heightCm: parseFloat(editHeightCm) || 0,
        reorderLevel: parseInt(editReorderLevel) || 0,
        minReorderQty: parseInt(editMinReorderQty) || 0,
        isLotControl: editIsLotControl,
        description: editDescription,
      });
      setProductsList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setDrawerProduct(null);
      showToast(`แก้ไขข้อมูลสินค้า "${updated.name}" สำเร็จครบ 14 ฟิลด์`);
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกสินค้า');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (prod: ProductItem) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${prod.name}"?`)) return;
    try {
      await productService.deleteProduct(prod.id);
      setProductsList((prev) => prev.filter((p) => p.id !== prod.id));
      if (drawerProduct?.id === prod.id) setDrawerProduct(null);
      showToast(`ลบสินค้า "${prod.name}" เรียบร้อยแล้ว`);
    } catch {
      showToast('ไม่สามารถลบสินค้าได้');
    }
  };

  // Handlers for Company
  const openEditCompany = (comp: Company) => {
    setEditingCompany(comp);
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
    setIsSaving(true);
    try {
      const updated = await masterDataService.updateCompany(editingCompany.id, {
        code: editCompCode,
        name: editCompName,
        taxId: editCompTaxId,
        branchCode: editCompBranchCode,
        branchName: editCompBranchName,
        phone: editCompPhone,
        email: editCompEmail,
        address: editCompAddress,
        isHeadquarter: editCompIsHq,
      });
      setCompaniesList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditingCompany(null);
      showToast(`บันทึกข้อมูลบริษัท "${updated.name}" สำเร็จ`);
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูลบริษัท');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCompany = async (comp: Company) => {
    if (!window.confirm(`คุณต้องการลบบริษัท "${comp.name}" ใช่หรือไม่?`)) return;
    try {
      await masterDataService.deleteCompany(comp.id);
      setCompaniesList((prev) => prev.filter((c) => c.id !== comp.id));
      showToast(`ลบบริษัท "${comp.name}" เรียบร้อยแล้ว`);
    } catch {
      showToast('ไม่สามารถลบบริษัทได้');
    }
  };

  // Handlers for Supplier
  const openEditSupplier = (sup: Supplier) => {
    setEditingSupplier(sup);
    setEditSupCode(sup.code);
    setEditSupName(sup.name);
    setEditSupContactPerson(sup.contactPerson || '');
    setEditSupPhone(sup.phone || '');
    setEditSupEmail(sup.email || '');
    setEditSupTaxId(sup.taxId || '');
    setEditSupAddress(sup.address || '');
  };

  const handleSaveEditSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    setIsSaving(true);
    try {
      const updated = await masterDataService.updateSupplier(editingSupplier.id, {
        code: editSupCode,
        name: editSupName,
        contactPerson: editSupContactPerson,
        phone: editSupPhone,
        email: editSupEmail,
        taxId: editSupTaxId,
        address: editSupAddress,
      });
      setSuppliersList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingSupplier(null);
      showToast(`แก้ไขข้อมูลผู้จัดจำหน่าย "${updated.name}" ครบทุกฟิลด์เรียบร้อย`);
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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
      showToast('ไม่สามารถลบผู้จัดจำหน่ายได้');
    }
  };

  // Handlers for Unit
  const openEditUnit = (unit: UnitItem) => {
    setEditingUnit(unit);
    setEditUnitCode(unit.code);
    setEditUnitName(unit.name);
  };

  const handleSaveEditUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    setIsSaving(true);
    try {
      const updated = await masterDataService.updateUnit(editingUnit.id, {
        code: editUnitCode,
        name: editUnitName,
      });
      setUnitsList((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditingUnit(null);
      showToast(`แก้ไขหน่วยนับ "${updated.code} - ${updated.name}" สำเร็จ`);
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกหน่วยนับ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUnit = async (unit: UnitItem) => {
    if (!window.confirm(`คุณแน่ใจว่าต้องการลบหน่วยนับ "${unit.code} - ${unit.name}"?`)) return;
    try {
      await masterDataService.deleteUnit(unit.id);
      setUnitsList((prev) => prev.filter((u) => u.id !== unit.id));
      showToast(`ลบหน่วยนับ "${unit.code}" เรียบร้อยแล้ว`);
    } catch {
      showToast('ไม่สามารถลบหน่วยนับได้ (อาจมีสินค้าใช้งานอยู่)');
    }
  };

  // Handlers for Warehouse & Bins
  const openEditBin = (bin: WarehouseBin) => {
    setEditingBin(bin);
    setEditWhName(bin.warehouseName);
    setEditBinCode(bin.binCode);
    setEditBinZone(bin.zone);
    setEditBinRack(bin.rack);
    setEditBinCapacity(String(bin.capacityKg));
  };

  const handleSaveEditBin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBin) return;
    setIsSaving(true);
    try {
      await warehouseService.updateBin(editingBin.id, {
        code: editBinCode,
      });
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
              }
            : b
        )
      );
      setEditingBin(null);
      showToast(`แก้ไขข้อมูลคลัง / ตำแหน่ง Bin "${editBinCode}" สำเร็จ`);
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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
      showToast('ไม่สามารถลบตำแหน่ง Bin ได้');
    }
  };

  // Handlers for RBAC
  const handleChangeUserRole = (usr: RbacUser, newRole: UserRole) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === usr.id ? { ...u, role: newRole } : u))
    );
    showToast(`อัปเดตบทบาทของ "${usr.name}" เป็น ${newRole.toUpperCase()} เรียบร้อยแล้ว`);
  };

  const handleDeleteUser = (usr: RbacUser) => {
    if (!window.confirm(`คุณต้องการลบผู้ใช้งาน "${usr.name}" หรือไม่?`)) return;
    setUsersList((prev) => prev.filter((u) => u.id !== usr.id));
    showToast(`ลบผู้ใช้งาน "${usr.name}" เรียบร้อยแล้ว`);
  };

  // Global Add Modal Submit Handler
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
            brand: addBrand || 'General',
            barcode: itemBarcode,
            barcodeValue: itemBarcode,
            price: parseFloat(addPrice) || 0,
            stockOnHand: parseInt(addStock) || 0,
            uom: addUom || 'PCS',
            weightKg: parseFloat(addWeightKg) || 0,
            widthCm: parseFloat(addWidthCm) || 0,
            lengthCm: parseFloat(addLengthCm) || 0,
            heightCm: parseFloat(addHeightCm) || 0,
            reorderPoint: parseInt(addReorderPoint) || 10,
            reorderLevel: parseInt(addReorderPoint) || 10,
            minReorderQty: parseInt(addMinReorderQty) || 5,
            isLotControl: addIsLotControl,
            description: addDescription,
          });

          createdProduct = {
            id: apiRes?.id || `prod-${Date.now()}`,
            name: apiRes?.name || addName,
            code: apiRes?.code || itemCode,
            sku: apiRes?.sku || itemSku,
            brand: apiRes?.brand?.name || apiRes?.brand || addBrand || 'General',
            category: apiRes?.category?.name || apiRes?.category || 'General',
            price: Number(apiRes?.price || addPrice || 0),
            stockOnHand: Number(apiRes?.stockOnHand || addStock || 0),
            reorderLevel: Number(apiRes?.reorderLevel || apiRes?.reorderPoint || addReorderPoint || 10),
            minReorderQty: Number(apiRes?.minReorderQty || addMinReorderQty || 5),
            uom: apiRes?.uom || apiRes?.unit || addUom || 'PCS',
            weightKg: Number(apiRes?.weightKg || addWeightKg || 0),
            widthCm: Number(apiRes?.widthCm || addWidthCm || 0),
            lengthCm: Number(apiRes?.lengthCm || addLengthCm || 0),
            heightCm: Number(apiRes?.heightCm || addHeightCm || 0),
            isLotControl: Boolean(apiRes?.isLotControl ?? addIsLotControl),
            barcodeValue: apiRes?.barcode || apiRes?.barcodeValue || itemBarcode,
            barcodeType: 'CODE128',
            description: apiRes?.description || addDescription,
            status: parseInt(addStock || '0') > 0 ? 'active' : 'out_of_stock',
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60',
          };
        } catch (apiErr) {
          console.warn('Backend API offline or returned error, saving product locally:', apiErr);
          createdProduct = {
            id: `prod-${Date.now()}`,
            name: addName,
            code: itemCode,
            sku: itemSku,
            brand: addBrand || 'General',
            category: 'General',
            price: parseFloat(addPrice) || 0,
            stockOnHand: parseInt(addStock) || 0,
            reorderLevel: parseInt(addReorderPoint) || 10,
            minReorderQty: parseInt(addMinReorderQty) || 5,
            uom: addUom || 'PCS',
            weightKg: parseFloat(addWeightKg) || 0,
            widthCm: parseFloat(addWidthCm) || 0,
            lengthCm: parseFloat(addLengthCm) || 0,
            heightCm: parseFloat(addHeightCm) || 0,
            isLotControl: addIsLotControl,
            barcodeValue: itemBarcode,
            barcodeType: 'CODE128',
            description: addDescription,
            status: parseInt(addStock || '0') > 0 ? 'active' : 'out_of_stock',
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60',
          };
        }

        setProductsList((prev) => [createdProduct, ...prev]);
        showToast(`เพิ่มสินค้า "${createdProduct.name}" (${createdProduct.sku}) เรียบร้อยแล้ว`);
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
        } catch (e) {
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
          };
        }
        setCompaniesList((prev) => [createdCompany, ...prev]);
        showToast(`เพิ่มบริษัทในเครือ "${createdCompany.name}" เรียบร้อยแล้ว`);
      } else if (activeSubTab === 'units') {
        const unitCode = addCode.trim().toUpperCase() || `UNIT-${Date.now().toString().slice(-2)}`;
        let createdUnit: UnitItem;
        try {
          createdUnit = await masterDataService.createUnit({
            code: unitCode,
            name: addName || unitCode,
          });
        } catch (e) {
          createdUnit = {
            id: `unit-${Date.now()}`,
            code: unitCode,
            name: addName || unitCode,
          };
        }
        setUnitsList((prev) => [createdUnit, ...prev]);
        showToast(`เพิ่มหน่วยนับ "${createdUnit.code} - ${createdUnit.name}" สำเร็จ`);
      } else if (activeSubTab === 'warehouses') {
        const newBinObj: WarehouseBin = {
          id: `bin-${Date.now()}`,
          warehouseId: 'wh-main',
          warehouseName: addWarehouseName || 'WH-Main Logistics',
          binCode: addBinCode || `BIN-${Date.now().toString().slice(-4)}`,
          zone: addZone || 'A',
          rack: addRack || '01',
          shelf: '01',
          capacityKg: parseFloat(addCapacityKg) || 500,
          currentItemsCount: 0,
          status: 'available',
        };
        setBinsList((prev) => [newBinObj, ...prev]);
        showToast(`เพิ่มคลังและตำแหน่งจัดเก็บ "${newBinObj.binCode}" เรียบร้อยแล้ว`);
      } else if (activeSubTab === 'suppliers') {
        const supCode = `SUP-${Date.now().toString().slice(-3)}`;
        let createdSup: Supplier;
        try {
          createdSup = await masterDataService.createSupplier({
            code: supCode,
            name: addSupplierName,
            contactPerson: addContactPerson,
            phone: addPhone,
            email: addEmail,
            taxId: addTaxId,
          });
        } catch (e) {
          createdSup = {
            id: `sup-${Date.now()}`,
            code: supCode,
            name: addSupplierName,
            contactPerson: addContactPerson,
            phone: addPhone,
            email: addEmail,
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
        const newUser: RbacUser = {
          id: String(Date.now()),
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
      // Reset form inputs
      setAddName('');
      setAddCode('');
      setAddSku('');
      setAddBrand('');
      setAddBarcode('');
      setAddPrice('0');
      setAddStock('0');
      setAddDescription('');
      setAddCompanyName('');
      setAddCompanyCode('');
      setAddCompanyTaxId('');
      setAddEmail('');
    } catch (err: any) {
      console.error('Error in handleCreateNewItem:', err);
      showToast('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
    }
  };

  // Dynamic Header title & Add button label
  const getHeaderInfo = () => {
    switch (activeSubTab) {
      case 'rbac':
        return { title: t.rbacTitle, subtitle: t.rbacSubtitle };
      case 'companies':
        return {
          title: lang === 'en' ? 'Subsidiary Companies (Holding Group)' : 'บริษัทในเครือ (Companies)',
          subtitle: lang === 'en' ? 'Manage multi-company entities, Tax IDs, branches, and legal addresses' : 'จัดการรายชื่อบริษัทในเครือ, สาขา, เลขประจำตัวผู้เสียภาษี และที่อยู่สถานประกอบการ',
        };
      case 'units':
        return { title: t.unitsTitle, subtitle: t.unitsSubtitle };
      case 'barcodes':
        return { title: t.barcodeTitle, subtitle: t.barcodeSubtitle };
      case 'warehouses':
        return { title: t.warehouseTitle, subtitle: t.warehouseSubtitle };
      case 'suppliers':
        return { title: t.supplierTitle, subtitle: t.supplierSubtitle };
      case 'products':
      default:
        return { title: t.productTitle, subtitle: t.productSubtitle };
    }
  };

  const getAddButtonLabel = () => {
    switch (activeSubTab) {
      case 'products':
        return t.addNewBtn;
      case 'companies':
        return lang === 'en' ? 'Add Subsidiary Company' : 'เพิ่มบริษัทในเครือ';
      case 'rbac':
        return lang === 'en' ? 'Add New User' : 'เพิ่มผู้ใช้งานใหม่';
      case 'warehouses':
        return lang === 'en' ? 'Add Warehouse / Bin' : 'เพิ่มคลัง / ตำแหน่ง Bin';
      case 'suppliers':
        return lang === 'en' ? 'Add Supplier' : 'เพิ่มผู้จัดจำหน่าย';
      case 'units':
        return lang === 'en' ? 'Add Unit (UOM)' : 'เพิ่มหน่วยนับ';
      case 'barcodes':
      default:
        return null;
    }
  };

  const filteredProducts = productsList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2.5 border border-zinc-700 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span className="font-medium text-xs">{toastMessage}</span>
        </div>
      )}

      {/* Enterprise Title & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h2 className={`text-lg font-bold tracking-tight ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {getHeaderInfo().title}
          </h2>
          <p className={`text-xs font-normal mt-0.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {getHeaderInfo().subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {getAddButtonLabel() && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs shadow-blue-600/30 transition cursor-pointer active:scale-[0.99]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{getAddButtonLabel()}</span>
            </button>
          )}
          <button
            className={`px-2.5 py-1 rounded-md border text-xs font-medium flex items-center gap-1.5 transition ${
              theme === 'dark'
                ? 'border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 shadow-xs'
            }`}
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* 7 Enterprise Master Data Subtabs Segment */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar border-b border-zinc-200/80 dark:border-zinc-800/80">
        {[
          { key: 'companies', label: lang === 'en' ? 'Companies' : 'บริษัทในเครือ', count: companiesList.length },
          { key: 'products', label: lang === 'en' ? 'Products & SKUs' : 'สินค้าและ SKU', count: productsList.length },
          { key: 'units', label: lang === 'en' ? 'Units (UOM)' : 'หน่วยนับ', count: unitsList.length },
          { key: 'warehouses', label: lang === 'en' ? 'Warehouses & Bins' : 'คลังและตำแหน่งจัดเก็บ', count: binsList.length },
          { key: 'suppliers', label: lang === 'en' ? 'Suppliers' : 'ผู้จัดจำหน่าย', count: suppliersList.length },
          { key: 'barcodes', label: lang === 'en' ? 'Barcodes' : 'บาร์โค้ด' },
          { key: 'rbac', label: lang === 'en' ? 'User Access' : 'สิทธิ์ผู้ใช้งาน', count: usersList.length },
        ].map((tab) => {
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSubTabChange && onSubTabChange(tab.key as any)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 select-none ${
                isActive
                  ? theme === 'dark'
                    ? 'bg-zinc-800 text-white font-semibold shadow-xs'
                    : 'bg-white text-zinc-900 border border-zinc-300 font-semibold shadow-xs'
                  : theme === 'dark'
                  ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/60'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive
                      ? theme === 'dark'
                        ? 'bg-zinc-700 text-zinc-200'
                        : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                      : theme === 'dark'
                      ? 'bg-zinc-800 text-zinc-500'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Enterprise Fast Search & Filter Toolbar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className={`w-full pl-9 pr-14 py-2 rounded-md border text-xs font-normal transition outline-hidden ${
            theme === 'dark'
              ? 'bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500'
              : 'bg-white border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 shadow-xs'
          }`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
          ⌘K
        </span>
      </div>

      {/* TAB CONTENT ROUTING */}
      {activeSubTab === 'products' && (
        <ProductCatalogTab
          theme={theme}
          t={t}
          products={filteredProducts}
          onOpenDrawer={openDrawerForProduct}
          onSelectBarcode={setSelectedProductForBarcode}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {activeSubTab === 'companies' && (
        <CompanyManagementTab
          theme={theme}
          searchQuery={searchQuery}
          companies={companiesList}
          onOpenEdit={openEditCompany}
          onDelete={handleDeleteCompany}
        />
      )}

      {activeSubTab === 'rbac' && (
        <RbacAccessTab
          theme={theme}
          t={t}
          usersList={usersList}
          onChangeUserRole={handleChangeUserRole}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {activeSubTab === 'units' && (
        <UnitManagementTab
          theme={theme}
          t={t}
          unitsList={unitsList}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenEditUnit={openEditUnit}
          onDeleteUnit={handleDeleteUnit}
        />
      )}

      {activeSubTab === 'barcodes' && <BarcodeManagementTab theme={theme} t={t} />}

      {activeSubTab === 'warehouses' && (
        <WarehouseBinTab
          theme={theme}
          t={t}
          binsList={binsList}
          onOpenEditBin={openEditBin}
          onDeleteBin={handleDeleteBin}
        />
      )}

      {activeSubTab === 'suppliers' && (
        <SupplierManagementTab
          theme={theme}
          t={t}
          suppliersList={suppliersList}
          onOpenEditSupplier={openEditSupplier}
          onDeleteSupplier={handleDeleteSupplier}
        />
      )}

      {/* MODALS & DRAWERS */}
      <ProductDrawer
        theme={theme}
        t={t}
        product={drawerProduct}
        onClose={() => setDrawerProduct(null)}
        onSave={handleSaveEditProduct}
        onDelete={handleDeleteProduct}
        isSaving={isSaving}
        editName={editName}
        setEditName={setEditName}
        editCode={editCode}
        setEditCode={setEditCode}
        editSku={editSku}
        setEditSku={setEditSku}
        editBrand={editBrand}
        setEditBrand={setEditBrand}
        editBarcode={editBarcode}
        setEditBarcode={setEditBarcode}
        editPrice={editPrice}
        setEditPrice={setEditPrice}
        editWeightKg={editWeightKg}
        setEditWeightKg={setEditWeightKg}
        editWidthCm={editWidthCm}
        setEditWidthCm={setEditWidthCm}
        editLengthCm={editLengthCm}
        setEditLengthCm={setEditLengthCm}
        editHeightCm={editHeightCm}
        setEditHeightCm={setEditHeightCm}
        editReorderLevel={editReorderLevel}
        setEditReorderLevel={setEditReorderLevel}
        editMinReorderQty={editMinReorderQty}
        setEditMinReorderQty={setEditMinReorderQty}
        editIsLotControl={editIsLotControl}
        setEditIsLotControl={setEditIsLotControl}
        editDescription={editDescription}
        setEditDescription={setEditDescription}
      />

      <EditCompanyModal
        theme={theme}
        t={t}
        company={editingCompany}
        onClose={() => setEditingCompany(null)}
        onSave={handleSaveEditCompany}
        isSaving={isSaving}
        editCompCode={editCompCode}
        setEditCompCode={setEditCompCode}
        editCompName={editCompName}
        setEditCompName={setEditCompName}
        editCompTaxId={editCompTaxId}
        setEditCompTaxId={setEditCompTaxId}
        editCompBranchCode={editCompBranchCode}
        setEditCompBranchCode={setEditCompBranchCode}
        editCompBranchName={editCompBranchName}
        setEditCompBranchName={setEditCompBranchName}
        editCompPhone={editCompPhone}
        setEditCompPhone={setEditCompPhone}
        editCompEmail={editCompEmail}
        setEditCompEmail={setEditCompEmail}
        editCompAddress={editCompAddress}
        setEditCompAddress={setEditCompAddress}
        editCompIsHq={editCompIsHq}
        setEditCompIsHq={setEditCompIsHq}
      />

      <EditSupplierModal
        theme={theme}
        t={t}
        supplier={editingSupplier}
        onClose={() => setEditingSupplier(null)}
        onSave={handleSaveEditSupplier}
        isSaving={isSaving}
        editSupCode={editSupCode}
        setEditSupCode={setEditSupCode}
        editSupName={editSupName}
        setEditSupName={setEditSupName}
        editSupContactPerson={editSupContactPerson}
        setEditSupContactPerson={setEditSupContactPerson}
        editSupPhone={editSupPhone}
        setEditSupPhone={setEditSupPhone}
        editSupEmail={editSupEmail}
        setEditSupEmail={setEditSupEmail}
        editSupTaxId={editSupTaxId}
        setEditSupTaxId={setEditSupTaxId}
        editSupAddress={editSupAddress}
        setEditSupAddress={setEditSupAddress}
      />

      <EditWarehouseBinModal
        theme={theme}
        t={t}
        bin={editingBin}
        onClose={() => setEditingBin(null)}
        onSave={handleSaveEditBin}
        isSaving={isSaving}
        editWhName={editWhName}
        setEditWhName={setEditWhName}
        editBinCode={editBinCode}
        setEditBinCode={setEditBinCode}
        editBinZone={editBinZone}
        setEditBinZone={setEditBinZone}
        editBinRack={editBinRack}
        setEditBinRack={setEditBinRack}
        editBinCapacity={editBinCapacity}
        setEditBinCapacity={setEditBinCapacity}
      />

      <EditUnitModal
        theme={theme}
        t={t}
        unit={editingUnit}
        onClose={() => setEditingUnit(null)}
        onSave={handleSaveEditUnit}
        isSaving={isSaving}
        editUnitCode={editUnitCode}
        setEditUnitCode={setEditUnitCode}
        editUnitName={editUnitName}
        setEditUnitName={setEditUnitName}
      />

      <BarcodeModal
        theme={theme}
        product={selectedProductForBarcode}
        onClose={() => setSelectedProductForBarcode(null)}
      />

      <AddMasterDataModal
        theme={theme}
        t={t}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        activeSubTab={activeSubTab}
        onSubmit={handleCreateNewItem}
        addName={addName}
        setAddName={setAddName}
        addCode={addCode}
        setAddCode={setAddCode}
        addSku={addSku}
        setAddSku={setAddSku}
        addBrand={addBrand}
        setAddBrand={setAddBrand}
        addBarcode={addBarcode}
        setAddBarcode={setAddBarcode}
        addPrice={addPrice}
        setAddPrice={setAddPrice}
        addStock={addStock}
        setAddStock={setAddStock}
        addUom={addUom}
        setAddUom={setAddUom}
        addWeightKg={addWeightKg}
        setAddWeightKg={setAddWeightKg}
        addWidthCm={addWidthCm}
        setAddWidthCm={setAddWidthCm}
        addLengthCm={addLengthCm}
        setAddLengthCm={setAddLengthCm}
        addHeightCm={addHeightCm}
        setAddHeightCm={setAddHeightCm}
        addReorderPoint={addReorderPoint}
        setAddReorderPoint={setAddReorderPoint}
        addMinReorderQty={addMinReorderQty}
        setAddMinReorderQty={setAddMinReorderQty}
        addIsLotControl={addIsLotControl}
        setAddIsLotControl={setAddIsLotControl}
        addDescription={addDescription}
        setAddDescription={setAddDescription}
        addCompanyCode={addCompanyCode}
        setAddCompanyCode={setAddCompanyCode}
        addCompanyName={addCompanyName}
        setAddCompanyName={setAddCompanyName}
        addCompanyTaxId={addCompanyTaxId}
        setAddCompanyTaxId={setAddCompanyTaxId}
        addCompanyBranchCode={addCompanyBranchCode}
        setAddCompanyBranchCode={setAddCompanyBranchCode}
        addCompanyBranchName={addCompanyBranchName}
        setAddCompanyBranchName={setAddCompanyBranchName}
        addCompanyPhone={addCompanyPhone}
        setAddCompanyPhone={setAddCompanyPhone}
        addCompanyEmail={addCompanyEmail}
        setAddCompanyEmail={setAddCompanyEmail}
        addCompanyAddress={addCompanyAddress}
        setAddCompanyAddress={setAddCompanyAddress}
        addCompanyIsHq={addCompanyIsHq}
        setAddCompanyIsHq={setAddCompanyIsHq}
        addEmail={addEmail}
        setAddEmail={setAddEmail}
        addRole={addRole}
        setAddRole={setAddRole}
        addWarehouseName={addWarehouseName}
        setAddWarehouseName={setAddWarehouseName}
        addBinCode={addBinCode}
        setAddBinCode={setAddBinCode}
        addZone={addZone}
        setAddZone={setAddZone}
        addRack={addRack}
        setAddRack={setAddRack}
        addCapacityKg={addCapacityKg}
        setAddCapacityKg={setAddCapacityKg}
        addSupplierName={addSupplierName}
        setAddSupplierName={setAddSupplierName}
        addContactPerson={addContactPerson}
        setAddContactPerson={setAddContactPerson}
        addPhone={addPhone}
        setAddPhone={setAddPhone}
        addTaxId={addTaxId}
        setAddTaxId={setAddTaxId}
      />
    </div>
  );
};
export default MasterDataManagement;
