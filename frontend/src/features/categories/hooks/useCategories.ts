import React, { useState, useCallback } from 'react';
import { CategoryItem } from '../../../types';
import { masterDataService } from '../../../services/masterData.service';
import { masterDataCache } from '../../common/cache/useMasterDataCache';
import { ConfirmDeleteData } from '../../../components/master-data/modals/ConfirmDeleteModal';

const CACHE_KEY = 'categories_list';

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

export const useCategories = (showToast?: (msg: string) => void) => {
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(() => {
    return masterDataCache.get<CategoryItem[]>(CACHE_KEY) || [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Modal & Delete Confirmation
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editCatCode, setEditCatCode] = useState('');
  const [editCatName, setEditCatName] = useState('');
  const [editCatDescription, setEditCatDescription] = useState('');
  const [editCatIsActive, setEditCatIsActive] = useState(true);

  const [deleteConfirmData, setDeleteConfirmData] = useState<ConfirmDeleteData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = masterDataCache.get<CategoryItem[]>(CACHE_KEY);
      if (cached) {
        setCategoriesList(cached);
        return cached;
      }
    }

    setIsLoading(true);
    try {
      const cats = await masterDataService.getCategories();
      const rawCats = Array.isArray(cats) ? cats : (cats as any)?.data || [];
      setCategoriesList(rawCats);
      masterDataCache.set(CACHE_KEY, rawCats);
      return rawCats;
    } catch (err) {
      console.error('Error fetching categories:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const invalidateCache = useCallback(() => {
    masterDataCache.invalidate(CACHE_KEY);
  }, []);

  const openEditCategory = (cat: CategoryItem, viewOnly = false) => {
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
      await masterDataService.updateCategory(editingCategory.id, {
        name: editCatName.trim(),
        code: editCatCode.trim() || undefined,
        description: editCatDescription.trim() || undefined,
        isActive: editCatIsActive,
      });

      setCategoriesList((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: editCatName,
                code: editCatCode,
                description: editCatDescription,
                isActive: editCatIsActive,
              }
            : c
        )
      );
      invalidateCache();
      setEditingCategory(null);
      showToast?.(`แก้ไขหมวดหมู่ "${editCatName}" สำเร็จ`);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast?.(`เกิดข้อผิดพลาดในการแก้ไขหมวดหมู่: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = (cat: CategoryItem) => {
    setDeleteConfirmData({
      title: 'ยืนยันการลบหมวดหมู่สินค้า',
      itemType: 'Category',
      itemName: cat.name,
      itemCode: cat.code,
      description: cat.description || undefined,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await masterDataService.deleteCategory(cat.id);
          setCategoriesList((prev) => prev.filter((c) => c.id !== cat.id));
          invalidateCache();
          setDeleteConfirmData(null);
          showToast?.(`ลบหมวดหมู่ "${cat.name}" สำเร็จ`);
        } catch (err: any) {
          const msg = extractErrorMessage(err);
          showToast?.(`เกิดข้อผิดพลาดในการลบหมวดหมู่: ${msg}`);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return {
    categoriesList,
    setCategoriesList,
    isLoading,
    fetchCategories,
    invalidateCache,

    editingCategory,
    setEditingCategory,
    isViewOnly,
    setIsViewOnly,
    isSaving,
    editCatCode,
    setEditCatCode,
    editCatName,
    setEditCatName,
    editCatDescription,
    setEditCatDescription,
    editCatIsActive,
    setEditCatIsActive,

    deleteConfirmData,
    setDeleteConfirmData,
    isDeleting,

    openEditCategory,
    handleSaveEditCategory,
    handleDeleteCategory,
  };
};
