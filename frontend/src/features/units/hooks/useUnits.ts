import React, { useState, useCallback } from 'react';
import { masterDataService } from '../../../services/masterData.service';
import { masterDataCache } from '../../common/cache/useMasterDataCache';
import { UnitItem } from '../../../components/master-data/hooks/useMasterDataLoader';
import { ConfirmDeleteData } from '../../../components/master-data/modals/ConfirmDeleteModal';

const CACHE_KEY = 'units_list';

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

export const useUnits = (showToast?: (msg: string) => void) => {
  const [unitsList, setUnitsList] = useState<UnitItem[]>(() => {
    return masterDataCache.get<UnitItem[]>(CACHE_KEY) || [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Delete Confirmation
  const [editingUnit, setEditingUnit] = useState<UnitItem | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editUnitCode, setEditUnitCode] = useState('');
  const [editUnitName, setEditUnitName] = useState('');
  const [editUnitIsActive, setEditUnitIsActive] = useState(true);

  const [deleteConfirmData, setDeleteConfirmData] = useState<ConfirmDeleteData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUnits = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = masterDataCache.get<UnitItem[]>(CACHE_KEY);
      if (cached) {
        setUnitsList(cached);
        return cached;
      }
    }

    setIsLoading(true);
    try {
      const units = await masterDataService.getUnits();
      const rawUnits = Array.isArray(units) ? units : (units as any)?.data || [];
      setUnitsList(rawUnits);
      masterDataCache.set(CACHE_KEY, rawUnits);
      return rawUnits;
    } catch (err) {
      console.error('Error fetching units:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const invalidateCache = useCallback(() => {
    masterDataCache.invalidate(CACHE_KEY);
  }, []);

  const openEditUnit = (unit: UnitItem, viewOnly = false) => {
    setEditingUnit(unit);
    setIsViewOnly(viewOnly);
    setEditUnitCode(unit.code || '');
    setEditUnitName(unit.name || '');
    setEditUnitIsActive(unit.isActive !== false);
  };

  const handleSaveEditUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;
    setIsSaving(true);
    try {
      await masterDataService.updateUnit(editingUnit.id, {
        code: editUnitCode.trim() || undefined,
        name: editUnitName.trim(),
        isActive: editUnitIsActive,
      });

      setUnitsList((prev) =>
        prev.map((u) =>
          u.id === editingUnit.id
            ? {
                ...u,
                code: editUnitCode,
                name: editUnitName,
                isActive: editUnitIsActive,
              }
            : u
        )
      );
      invalidateCache();
      setEditingUnit(null);
      showToast?.(`แก้ไขหน่วยนับ "${editUnitName}" สำเร็จ`);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast?.(`เกิดข้อผิดพลาดในการแก้ไขหน่วยนับ: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUnit = (unit: UnitItem) => {
    setDeleteConfirmData({
      title: 'ยืนยันการลบหน่วยนับสินค้า',
      itemType: 'Unit of Measure',
      itemName: unit.name,
      itemCode: unit.code,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await masterDataService.deleteUnit(unit.id);
          setUnitsList((prev) => prev.filter((u) => u.id !== unit.id));
          invalidateCache();
          setDeleteConfirmData(null);
          showToast?.(`ลบหน่วยนับ "${unit.name}" สำเร็จ`);
        } catch (err: any) {
          const msg = extractErrorMessage(err);
          showToast?.(`เกิดข้อผิดพลาดในการลบหน่วยนับ: ${msg}`);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return {
    unitsList,
    setUnitsList,
    isLoading,
    fetchUnits,
    invalidateCache,

    editingUnit,
    setEditingUnit,
    isViewOnly,
    setIsViewOnly,
    isSaving,
    editUnitCode,
    setEditUnitCode,
    editUnitName,
    setEditUnitName,
    editUnitIsActive,
    setEditUnitIsActive,

    deleteConfirmData,
    setDeleteConfirmData,
    isDeleting,

    openEditUnit,
    handleSaveEditUnit,
    handleDeleteUnit,
  };
};
