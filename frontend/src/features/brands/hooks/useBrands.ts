import React, { useState, useCallback } from 'react';
import { BrandItem } from '../../../types';
import { masterDataService } from '../../../services/masterData.service';
import { masterDataCache } from '../../common/cache/useMasterDataCache';
import { ConfirmDeleteData } from '../../../components/master-data/modals/ConfirmDeleteModal';

const CACHE_KEY = 'brands_list';

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

export const useBrands = (showToast?: (msg: string) => void) => {
  const [brandsList, setBrandsList] = useState<BrandItem[]>(() => {
    return masterDataCache.get<BrandItem[]>(CACHE_KEY) || [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Delete Confirmation
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editBrandCode, setEditBrandCode] = useState('');
  const [editBrandName, setEditBrandName] = useState('');
  const [editBrandDescription, setEditBrandDescription] = useState('');
  const [editBrandIsActive, setEditBrandIsActive] = useState(true);

  const [deleteConfirmData, setDeleteConfirmData] = useState<ConfirmDeleteData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBrands = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = masterDataCache.get<BrandItem[]>(CACHE_KEY);
      if (cached) {
        setBrandsList(cached);
        return cached;
      }
    }

    setIsLoading(true);
    try {
      const brds = await masterDataService.getBrands();
      const rawBrds = Array.isArray(brds) ? brds : (brds as any)?.data || [];
      setBrandsList(rawBrds);
      masterDataCache.set(CACHE_KEY, rawBrds);
      return rawBrds;
    } catch (err) {
      console.error('Error fetching brands:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const invalidateCache = useCallback(() => {
    masterDataCache.invalidate(CACHE_KEY);
  }, []);

  const openEditBrand = (brand: BrandItem, viewOnly = false) => {
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
      await masterDataService.updateBrand(editingBrand.id, {
        name: editBrandName.trim(),
        code: editBrandCode.trim() || undefined,
        description: editBrandDescription.trim() || undefined,
        isActive: editBrandIsActive,
      });

      setBrandsList((prev) =>
        prev.map((b) =>
          b.id === editingBrand.id
            ? {
                ...b,
                name: editBrandName,
                code: editBrandCode,
                description: editBrandDescription,
                isActive: editBrandIsActive,
              }
            : b
        )
      );
      invalidateCache();
      setEditingBrand(null);
      showToast?.(`แก้ไขแบรนด์สินค้า "${editBrandName}" สำเร็จ`);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast?.(`เกิดข้อผิดพลาดในการแก้ไขแบรนด์: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBrand = (brand: BrandItem) => {
    setDeleteConfirmData({
      title: 'ยืนยันการลบแบรนด์สินค้า',
      itemType: 'Brand',
      itemName: brand.name,
      itemCode: brand.code,
      description: brand.description || undefined,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await masterDataService.deleteBrand(brand.id);
          setBrandsList((prev) => prev.filter((b) => b.id !== brand.id));
          invalidateCache();
          setDeleteConfirmData(null);
          showToast?.(`ลบแบรนด์สินค้า "${brand.name}" สำเร็จ`);
        } catch (err: any) {
          const msg = extractErrorMessage(err);
          showToast?.(`เกิดข้อผิดพลาดในการลบแบรนด์: ${msg}`);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return {
    brandsList,
    setBrandsList,
    isLoading,
    fetchBrands,
    invalidateCache,

    editingBrand,
    setEditingBrand,
    isViewOnly,
    setIsViewOnly,
    isSaving,
    editBrandCode,
    setEditBrandCode,
    editBrandName,
    setEditBrandName,
    editBrandDescription,
    setEditBrandDescription,
    editBrandIsActive,
    setEditBrandIsActive,

    deleteConfirmData,
    setDeleteConfirmData,
    isDeleting,

    openEditBrand,
    handleSaveEditBrand,
    handleDeleteBrand,
  };
};
