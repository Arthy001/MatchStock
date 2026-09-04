import React, { useState, useCallback } from 'react';
import { WarehouseBin } from '../../../types';
import { warehouseService } from '../../../services/warehouse.service';
import { masterDataCache } from '../../common/cache/useMasterDataCache';
import { WarehouseItem } from '../components/EditWarehouseModal';
import { ConfirmDeleteData } from '../../../components/master-data/modals/ConfirmDeleteModal';

const CACHE_KEY = 'warehouses_bins_list';

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

export const useWarehouses = (showToast?: (msg: string) => void) => {
  const [binsList, setBinsList] = useState<WarehouseBin[]>(() => {
    return masterDataCache.get<WarehouseBin[]>(CACHE_KEY) || [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Modal & Delete confirmation states
  const [deleteConfirmData, setDeleteConfirmData] = useState<ConfirmDeleteData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Warehouse Modal States
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseItem | null>(null);
  const [isViewOnlyWh, setIsViewOnlyWh] = useState(false);
  const [isSavingWh, setIsSavingWh] = useState(false);
  const [editWhName, setEditWhName] = useState('');
  const [editWhCode, setEditWhCode] = useState('');
  const [editWhAddress, setEditWhAddress] = useState('');
  const [editWhIsActive, setEditWhIsActive] = useState(true);
  const [editWhMaxCapacity, setEditWhMaxCapacity] = useState('0');

  // Bin Modal States
  const [editingBin, setEditingBin] = useState<WarehouseBin | null>(null);
  const [isViewOnlyBin, setIsViewOnlyBin] = useState(false);
  const [isSavingBin, setIsSavingBin] = useState(false);
  const [editBinWhName, setEditBinWhName] = useState('');
  const [editBinCode, setEditBinCode] = useState('');
  const [editBinZone, setEditBinZone] = useState('');
  const [editBinRack, setEditBinRack] = useState('');
  const [editBinShelf, setEditBinShelf] = useState('');
  const [editBinCapacity, setEditBinCapacity] = useState('0');
  const [editBinIsActive, setEditBinIsActive] = useState(true);

  const fetchWarehouses = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = masterDataCache.get<WarehouseBin[]>(CACHE_KEY);
      if (cached) {
        setBinsList(cached);
        return cached;
      }
    }

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
              capacityKg: 0,
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
            maxCapacity: Number(wh.maxCapacity || wh.capacityKg || 0),
            capacityKg: Number(wh.maxCapacity || wh.capacityKg || 0),
            currentItemsCount: Number(wh.currentItemsCount || 0),
            status: wh.status || (whIsActive ? 'available' : 'maintenance'),
            isActive: whIsActive,
          });
        }
      });

      setBinsList(normalized);
      masterDataCache.set(CACHE_KEY, normalized);
      return normalized;
    } catch (err) {
      console.error('Error fetching warehouses/bins:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const invalidateCache = useCallback(() => {
    masterDataCache.invalidate(CACHE_KEY);
  }, []);

  // Open Edit Warehouse Modal
  const openEditWarehouse = (warehouse: WarehouseItem, viewOnly = false) => {
    setEditingWarehouse(warehouse);
    setIsViewOnlyWh(viewOnly);
    setEditWhName(warehouse.name || '');
    setEditWhCode(warehouse.code || '');
    setEditWhAddress(warehouse.address || '');
    setEditWhIsActive(warehouse.isActive !== false);
    setEditWhMaxCapacity(String(warehouse.maxCapacity || 0));
  };

  // Save Edit Warehouse
  const handleSaveEditWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWarehouse) return;
    setIsSavingWh(true);
    try {
      await warehouseService.updateWarehouse(editingWarehouse.id, {
        name: editWhName.trim(),
        code: editWhCode.trim() || undefined,
        address: editWhAddress.trim() || undefined,
        isActive: editWhIsActive,
        maxCapacity: parseInt(editWhMaxCapacity) || 0,
      });

      // Optimistically update binsList
      setBinsList((prev) =>
        prev.map((b) =>
          b.warehouseId === editingWarehouse.id
            ? { ...b, warehouseName: editWhName }
            : b
        )
      );
      invalidateCache();
      setEditingWarehouse(null);
      showToast?.(`แก้ไขข้อมูลคลังสินค้า "${editWhName}" สำเร็จ`);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast?.(`เกิดข้อผิดพลาดในการแก้ไขคลังสินค้า: ${msg}`);
    } finally {
      setIsSavingWh(false);
    }
  };

  // Delete Warehouse Confirmation
  const handleDeleteWarehouse = (warehouse: WarehouseItem) => {
    setDeleteConfirmData({
      title: 'ยืนยันการลบคลังสินค้า',
      itemType: 'Warehouse',
      itemName: warehouse.name,
      itemCode: warehouse.code,
      description: `รหัส UUID: ${warehouse.id}`,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await warehouseService.deleteWarehouse(warehouse.id);
          setBinsList((prev) => prev.filter((b) => b.warehouseId !== warehouse.id));
          invalidateCache();
          setDeleteConfirmData(null);
          showToast?.(`ลบคลังสินค้า "${warehouse.name}" สำเร็จ`);
        } catch (err: any) {
          const msg = extractErrorMessage(err);
          showToast?.(`เกิดข้อผิดพลาดในการลบคลังสินค้า: ${msg}`);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  // Open Edit Bin Modal
  const openEditBin = (bin: WarehouseBin, viewOnly = false) => {
    setEditingBin(bin);
    setIsViewOnlyBin(viewOnly);
    setEditBinWhName(bin.warehouseName || '');
    const binCodeVal = bin.binCode || (bin as any).name || '';
    setEditBinCode(binCodeVal);

    const codeParts = binCodeVal.split('-').map((s: string) => s.trim());
    const extractedZone = (bin as any).zoneName || bin.zone || (codeParts.length >= 4 ? codeParts[1] : (codeParts.length >= 2 ? codeParts[0] : ''));
    const extractedRack = bin.rack || (codeParts.length >= 4 ? codeParts[2] : (codeParts.length >= 2 ? codeParts[1] : ''));
    const extractedShelf = bin.shelf || (codeParts.length >= 4 ? codeParts[3] : '');

    setEditBinZone(extractedZone || '');
    setEditBinRack(extractedRack || '');
    setEditBinShelf(extractedShelf || '');
    const cap = (bin as any).maxCapacity ?? bin.capacityKg ?? 0;
    setEditBinCapacity(String(cap));
    const activeVal = (bin as any).isActive !== undefined ? Boolean((bin as any).isActive) : (bin.status as string !== 'maintenance' && bin.status as string !== 'inactive');
    setEditBinIsActive(activeVal);
  };

  // Save Edit Bin Location
  const handleSaveEditBin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBin) return;
    setIsSavingBin(true);
    try {
      const targetWhId = editingBin.warehouseId || editingBin.id;
      await warehouseService.updateBin(targetWhId, editingBin.id, {
        code: editBinCode.trim(),
        zoneName: editBinZone.trim() || undefined,
        rack: editBinRack.trim() || undefined,
        shelf: editBinShelf.trim() || undefined,
        capacityKg: 0,
        maxCapacity: parseInt(editBinCapacity) || 0,
        isActive: editBinIsActive,
      });

      setBinsList((prev) =>
        prev.map((b) =>
          b.id === editingBin.id
            ? {
                ...b,
                binCode: editBinCode,
                zone: editBinZone,
                zoneName: editBinZone,
                rack: editBinRack,
                shelf: editBinShelf,
                maxCapacity: parseInt(editBinCapacity) || 0,
                capacityKg: 0,
                isActive: editBinIsActive,
                status: editBinIsActive ? (b.status === 'maintenance' ? 'available' : b.status) : 'maintenance',
              }
            : b
        )
      );
      invalidateCache();
      setEditingBin(null);
      showToast?.(`แก้ไขตำแหน่ง Bin "${editBinCode}" สำเร็จ`);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast?.(`เกิดข้อผิดพลาดในการแก้ไขตำแหน่ง Bin: ${msg}`);
    } finally {
      setIsSavingBin(false);
    }
  };

  // Delete Bin Confirmation
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
          const targetWhId = bin.warehouseId || bin.id;
          await warehouseService.deleteBin(targetWhId, bin.id);
          setBinsList((prev) => prev.filter((b) => b.id !== bin.id));
          invalidateCache();
          setDeleteConfirmData(null);
          showToast?.(`ลบตำแหน่ง Bin "${bin.binCode}" สำเร็จ`);
        } catch (err: any) {
          const msg = extractErrorMessage(err);
          showToast?.(`เกิดข้อผิดพลาดในการลบตำแหน่ง Bin: ${msg}`);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return {
    binsList,
    setBinsList,
    isLoading,
    fetchWarehouses,
    invalidateCache,

    // Modals & Delete Dialog States
    deleteConfirmData,
    setDeleteConfirmData,
    isDeleting,

    // Warehouse Modal State & Handlers
    editingWarehouse,
    setEditingWarehouse,
    isViewOnlyWh,
    setIsViewOnlyWh,
    isSavingWh,
    editWhName,
    setEditWhName,
    editWhCode,
    setEditWhCode,
    editWhAddress,
    setEditWhAddress,
    editWhIsActive,
    setEditWhIsActive,
    editWhMaxCapacity,
    setEditWhMaxCapacity,
    openEditWarehouse,
    handleSaveEditWarehouse,
    handleDeleteWarehouse,

    // Bin Modal State & Handlers
    editingBin,
    setEditingBin,
    isViewOnlyBin,
    setIsViewOnlyBin,
    isSavingBin,
    editBinWhName,
    setEditBinWhName,
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
  };
};
