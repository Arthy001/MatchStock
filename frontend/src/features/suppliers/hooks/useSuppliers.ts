import React, { useState, useCallback } from 'react';
import { Supplier } from '../../../types';
import { masterDataService } from '../../../services/masterData.service';
import { masterDataCache } from '../../common/cache/useMasterDataCache';
import { ConfirmDeleteData } from '../../../components/master-data/modals/ConfirmDeleteModal';

const CACHE_KEY = 'suppliers_list';

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

export const useSuppliers = (showToast?: (msg: string) => void) => {
  const [suppliersList, setSuppliersList] = useState<Supplier[]>(() => {
    return masterDataCache.get<Supplier[]>(CACHE_KEY) || [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Delete Confirmation
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editSupCode, setEditSupCode] = useState('');
  const [editSupName, setEditSupName] = useState('');
  const [editSupContactPerson, setEditSupContactPerson] = useState('');
  const [editSupPhone, setEditSupPhone] = useState('');
  const [editSupEmail, setEditSupEmail] = useState('');
  const [editSupTaxId, setEditSupTaxId] = useState('');
  const [editSupAddress, setEditSupAddress] = useState('');
  const [editSupIsActive, setEditSupIsActive] = useState(true);

  const [deleteConfirmData, setDeleteConfirmData] = useState<ConfirmDeleteData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSuppliers = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = masterDataCache.get<Supplier[]>(CACHE_KEY);
      if (cached) {
        setSuppliersList(cached);
        return cached;
      }
    }

    setIsLoading(true);
    try {
      const sups = await masterDataService.getSuppliers();
      const rawSups = Array.isArray(sups) ? sups : (sups as any)?.data || [];
      setSuppliersList(rawSups);
      masterDataCache.set(CACHE_KEY, rawSups);
      return rawSups;
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const invalidateCache = useCallback(() => {
    masterDataCache.invalidate(CACHE_KEY);
  }, []);

  const openEditSupplier = (sup: Supplier, viewOnly = false) => {
    setEditingSupplier(sup);
    setIsViewOnly(viewOnly);
    setEditSupCode(sup.code || '');
    setEditSupName(sup.name || '');
    setEditSupContactPerson(sup.contactPerson || '');
    setEditSupPhone(sup.phone || '');
    setEditSupEmail(sup.email || '');
    setEditSupTaxId(sup.taxId || '');
    setEditSupAddress(sup.address || '');
    setEditSupIsActive(sup.isActive !== false);
  };

  const handleSaveEditSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier) return;
    setIsSaving(true);
    try {
      await masterDataService.updateSupplier(editingSupplier.id, {
        code: editSupCode.trim() || undefined,
        name: editSupName.trim(),
        contactPerson: editSupContactPerson.trim() || undefined,
        phone: editSupPhone.trim() || undefined,
        email: editSupEmail.trim() || undefined,
        taxId: editSupTaxId.trim() || undefined,
        address: editSupAddress.trim() || undefined,
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
              }
            : s
        )
      );
      invalidateCache();
      setEditingSupplier(null);
      showToast?.(`แก้ไขข้อมูลผู้จัดจำหน่าย "${editSupName}" สำเร็จ`);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast?.(`เกิดข้อผิดพลาดในการแก้ไขผู้จัดจำหน่าย: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSupplier = (sup: Supplier) => {
    setDeleteConfirmData({
      title: 'ยืนยันการลบผู้จัดจำหน่าย',
      itemType: 'Supplier',
      itemName: sup.name,
      itemCode: sup.code,
      description: `ผู้ติดต่อ: ${sup.contactPerson || '-'} | โทร: ${sup.phone || '-'}`,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await masterDataService.deleteSupplier(sup.id);
          setSuppliersList((prev) => prev.filter((s) => s.id !== sup.id));
          invalidateCache();
          setDeleteConfirmData(null);
          showToast?.(`ลบผู้จัดจำหน่าย "${sup.name}" สำเร็จ`);
        } catch (err: any) {
          const msg = extractErrorMessage(err);
          showToast?.(`เกิดข้อผิดพลาดในการลบผู้จัดจำหน่าย: ${msg}`);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return {
    suppliersList,
    setSuppliersList,
    isLoading,
    fetchSuppliers,
    invalidateCache,

    editingSupplier,
    setEditingSupplier,
    isViewOnly,
    setIsViewOnly,
    isSaving,
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

    deleteConfirmData,
    setDeleteConfirmData,
    isDeleting,

    openEditSupplier,
    handleSaveEditSupplier,
    handleDeleteSupplier,
  };
};
