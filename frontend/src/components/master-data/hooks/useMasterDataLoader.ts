import { useState, useCallback, useRef } from 'react';
import {
  ProductItem,
  Company,
  Supplier,
  CategoryItem,
  BrandItem,
  BarcodeSymbologyItem,
  TaxTypeItem,
  WarehouseBin,
  UserRole,
  MasterDataSubTab,
} from '../../../types';
import { productService } from '../../../services/product.service';
import { warehouseService } from '../../../services/warehouse.service';
import { masterDataService } from '../../../services/masterData.service';

export interface UnitItem {
  id: string;
  code: string;
  name: string;
  type?: string;
  isActive?: boolean;
}

export interface RbacUser {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  status: string;
}

export const useMasterDataLoader = () => {
  const [isLoading, setIsLoading] = useState(false);

  // In-Memory Cached Tabs tracking
  const [loadedTabs, setLoadedTabs] = useState<Set<MasterDataSubTab>>(new Set());
  const fetchingRef = useRef<{ [key: string]: boolean }>({});

  // Entity States
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [companiesList, setCompaniesList] = useState<Company[]>([]);
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);
  const [unitsList, setUnitsList] = useState<UnitItem[]>([]);
  const [binsList, setBinsList] = useState<WarehouseBin[]>([]);
  const [usersList, setUsersList] = useState<RbacUser[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [brandsList, setBrandsList] = useState<BrandItem[]>([]);
  const [barcodeSymbologiesList, setBarcodeSymbologiesList] = useState<BarcodeSymbologyItem[]>([]);
  const [taxTypesList, setTaxTypesList] = useState<TaxTypeItem[]>([]);

  // Parallel helper loader
  const loadProductMasterHelpers = useCallback(async () => {
    try {
      const [cats, brds, units, sups, symbologies, taxTypes] = await Promise.all([
        masterDataService.getCategories().catch(() => []),
        masterDataService.getBrands().catch(() => []),
        masterDataService.getUnits().catch(() => []),
        masterDataService.getSuppliers().catch(() => []),
        masterDataService.getBarcodeSymbologies().catch(() => []),
        masterDataService.getTaxTypes().catch(() => []),
      ]);

      const rawCats = Array.isArray(cats) ? cats : (cats as any)?.data || [];
      const rawBrds = Array.isArray(brds) ? brds : (brds as any)?.data || [];
      const rawUnits = Array.isArray(units) ? units : (units as any)?.data || [];
      const rawSups = Array.isArray(sups) ? sups : (sups as any)?.data || [];

      if (rawCats.length > 0) setCategoriesList(rawCats);
      if (rawBrds.length > 0) setBrandsList(rawBrds);
      if (rawUnits.length > 0) setUnitsList(rawUnits);
      if (rawSups.length > 0) setSuppliersList(rawSups);
      if (Array.isArray(symbologies)) setBarcodeSymbologiesList(symbologies);
      if (Array.isArray(taxTypes)) setTaxTypesList(taxTypes);
    } catch (err) {
      console.warn('Unable to load some product master helper options:', err);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    if (fetchingRef.current['products']) return;
    fetchingRef.current['products'] = true;
    setIsLoading(true);
    try {
      loadProductMasterHelpers();

      const prods = await productService.getProducts({ page: 1, limit: 100 });
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
        }))
      );
      setLoadedTabs((prev) => new Set(prev).add('products').add('barcodes'));
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      fetchingRef.current['products'] = false;
      setIsLoading(false);
    }
  }, [loadProductMasterHelpers]);

  const loadCategories = useCallback(async () => {
    if (fetchingRef.current['categories']) return;
    fetchingRef.current['categories'] = true;
    setIsLoading(true);
    try {
      const cats = await masterDataService.getCategories().catch(() => []);
      const rawCats = Array.isArray(cats) ? cats : (cats as any)?.data || [];
      setCategoriesList(rawCats);
      setLoadedTabs((prev) => new Set(prev).add('categories'));
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      fetchingRef.current['categories'] = false;
      setIsLoading(false);
    }
  }, []);

  const loadBrands = useCallback(async () => {
    if (fetchingRef.current['brands']) return;
    fetchingRef.current['brands'] = true;
    setIsLoading(true);
    try {
      const brds = await masterDataService.getBrands().catch(() => []);
      const rawBrds = Array.isArray(brds) ? brds : (brds as any)?.data || [];
      setBrandsList(rawBrds);
      setLoadedTabs((prev) => new Set(prev).add('brands'));
    } catch (err) {
      console.error('Error loading brands:', err);
    } finally {
      fetchingRef.current['brands'] = false;
      setIsLoading(false);
    }
  }, []);

  const loadCompanies = useCallback(async () => {
    if (fetchingRef.current['companies']) return;
    fetchingRef.current['companies'] = true;
    setIsLoading(true);
    try {
      const comps = await masterDataService.getCompanies().catch(() => []);
      const rawComps = Array.isArray(comps) ? comps : Array.isArray((comps as any)?.data) ? (comps as any).data : [];
      setCompaniesList(rawComps);
      setLoadedTabs((prev) => new Set(prev).add('companies'));
    } catch (err) {
      console.error('Error loading companies:', err);
    } finally {
      fetchingRef.current['companies'] = false;
      setIsLoading(false);
    }
  }, []);

  const loadUnits = useCallback(async () => {
    if (fetchingRef.current['units']) return;
    fetchingRef.current['units'] = true;
    setIsLoading(true);
    try {
      const units = await masterDataService.getUnits().catch(() => []);
      const rawUnits = Array.isArray(units) ? units : Array.isArray((units as any)?.data) ? (units as any).data : [];
      setUnitsList(rawUnits);
      setLoadedTabs((prev) => new Set(prev).add('units'));
    } catch (err) {
      console.error('Error loading units:', err);
    } finally {
      fetchingRef.current['units'] = false;
      setIsLoading(false);
    }
  }, []);

  const loadBins = useCallback(async () => {
    if (fetchingRef.current['warehouses']) return;
    fetchingRef.current['warehouses'] = true;
    setIsLoading(true);
    try {
      const res = await warehouseService.getBins();
      const raw = Array.isArray(res) ? res : Array.isArray((res as any)?.data) ? (res as any).data : [];
      
      const normalized: WarehouseBin[] = [];
      raw.forEach((wh: any) => {
        const whIsActive = wh.isActive !== false;

        if (Array.isArray(wh.bins) && wh.bins.length > 0) {
          wh.bins.forEach((b: any) => {
            const bIsActive = b.isActive !== undefined ? Boolean(b.isActive) : whIsActive;
            normalized.push({
              ...b,
              id: b.id,
              warehouseId: wh.id,
              warehouseName: wh.name || 'Warehouse',
              warehouseCode: wh.code || undefined,
              binCode: b.code || b.binCode || 'BIN',
              zoneName: b.zoneName || b.zone || null,
              zone: b.zone || b.zoneName || null,
              rack: b.rack || null,
              shelf: b.shelf || null,
              maxCapacity: Number(b.maxCapacity ?? b.capacityKg ?? 0),
              capacityKg: Number(b.maxCapacity ?? b.capacityKg ?? 0),
              currentItemsCount: Number(b.currentItemsCount || 0),
              status: b.status || (bIsActive ? 'available' : 'maintenance'),
              isActive: bIsActive,
            });
          });
        } else {
          normalized.push({
            ...wh,
            id: wh.id,
            warehouseId: wh.id,
            warehouseName: wh.name || 'Warehouse',
            warehouseCode: wh.code || undefined,
            binCode: wh.code || wh.binCode || 'WH-MAIN',
            zoneName: wh.zoneName || wh.zone || null,
            zone: wh.zone || wh.zoneName || null,
            rack: wh.rack || null,
            shelf: wh.shelf || null,
            capacityKg: Number(wh.maxCapacity || wh.capacityKg || 0),
            currentItemsCount: Number(wh.currentItemsCount || 0),
            status: wh.status || (whIsActive ? 'available' : 'maintenance'),
            isActive: whIsActive,
          });
        }
      });

      setBinsList(normalized);
      setLoadedTabs((prev) => new Set(prev).add('warehouses'));
    } catch (err) {
      console.error('Error loading bins:', err);
    } finally {
      fetchingRef.current['warehouses'] = false;
      setIsLoading(false);
    }
  }, []);

  const loadSuppliers = useCallback(async () => {
    if (fetchingRef.current['suppliers']) return;
    fetchingRef.current['suppliers'] = true;
    setIsLoading(true);
    try {
      const sups = await masterDataService.getSuppliers().catch(() => []);
      const rawSups = Array.isArray(sups) ? sups : Array.isArray((sups as any)?.data) ? (sups as any).data : [];
      setSuppliersList(rawSups);
      setLoadedTabs((prev) => new Set(prev).add('suppliers'));
    } catch (err) {
      console.error('Error loading suppliers:', err);
    } finally {
      fetchingRef.current['suppliers'] = false;
      setIsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    if (fetchingRef.current['rbac']) return;
    fetchingRef.current['rbac'] = true;
    setIsLoading(true);
    try {
      const usrs = await masterDataService.getUsers().catch(() => []);
      const rawUsers = Array.isArray(usrs) ? usrs : Array.isArray((usrs as any)?.data) ? (usrs as any).data : [];
      setUsersList(rawUsers);
      setLoadedTabs((prev) => new Set(prev).add('rbac'));
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      fetchingRef.current['rbac'] = false;
      setIsLoading(false);
    }
  }, []);

  // Central On-Demand Dispatcher with In-Memory Cache Check
  const loadTabData = useCallback(
    (tab: MasterDataSubTab, forceRefresh = false) => {
      if (!forceRefresh && loadedTabs.has(tab)) {
        return;
      }

      switch (tab) {
        case 'products':
        case 'barcodes':
          loadProducts();
          break;
        case 'categories':
          loadCategories();
          break;
        case 'brands':
          loadBrands();
          break;
        case 'companies':
          loadCompanies();
          break;
        case 'units':
          loadUnits();
          break;
        case 'warehouses':
          loadBins();
          break;
        case 'suppliers':
          loadSuppliers();
          break;
        case 'rbac':
          loadUsers();
          break;
      }
    },
    [loadedTabs, loadProducts, loadCategories, loadBrands, loadCompanies, loadUnits, loadBins, loadSuppliers, loadUsers]
  );

  return {
    isLoading,
    loadedTabs,
    loadTabData,
    productsList,
    setProductsList,
    companiesList,
    setCompaniesList,
    suppliersList,
    setSuppliersList,
    unitsList,
    setUnitsList,
    binsList,
    setBinsList,
    usersList,
    setUsersList,
    categoriesList,
    setCategoriesList,
    brandsList,
    setBrandsList,
    barcodeSymbologiesList,
    taxTypesList,
  };
};
