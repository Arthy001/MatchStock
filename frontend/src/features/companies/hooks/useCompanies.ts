import React, { useState, useCallback } from 'react';
import { Company } from '../../../types';
import { masterDataService } from '../../../services/masterData.service';
import { masterDataCache } from '../../common/cache/useMasterDataCache';
import { ConfirmDeleteData } from '../../../components/master-data/modals/ConfirmDeleteModal';

const CACHE_KEY = 'companies_list';

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

export const useCompanies = (showToast?: (msg: string) => void) => {
  const [companiesList, setCompaniesList] = useState<Company[]>(() => {
    return masterDataCache.get<Company[]>(CACHE_KEY) || [];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Delete Confirmation
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editCompCode, setEditCompCode] = useState('');
  const [editCompName, setEditCompName] = useState('');
  const [editCompTaxId, setEditCompTaxId] = useState('');
  const [editCompBranchCode, setEditCompBranchCode] = useState('00000');
  const [editCompBranchName, setEditCompBranchName] = useState('');
  const [editCompPhone, setEditCompPhone] = useState('');
  const [editCompEmail, setEditCompEmail] = useState('');
  const [editCompAddress, setEditCompAddress] = useState('');
  const [editCompIsHq, setEditCompIsHq] = useState(false);

  const [deleteConfirmData, setDeleteConfirmData] = useState<ConfirmDeleteData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCompanies = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = masterDataCache.get<Company[]>(CACHE_KEY);
      if (cached) {
        setCompaniesList(cached);
        return cached;
      }
    }

    setIsLoading(true);
    try {
      const comps = await masterDataService.getCompanies();
      const rawComps = Array.isArray(comps) ? comps : (comps as any)?.data || [];
      setCompaniesList(rawComps);
      masterDataCache.set(CACHE_KEY, rawComps);
      return rawComps;
    } catch (err) {
      console.error('Error fetching companies:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const invalidateCache = useCallback(() => {
    masterDataCache.invalidate(CACHE_KEY);
  }, []);

  const openEditCompany = (comp: Company, viewOnly = false) => {
    setEditingCompany(comp);
    setIsViewOnly(viewOnly);
    setEditCompCode(comp.code || '');
    setEditCompName(comp.name || '');
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
      await masterDataService.updateCompany(editingCompany.id, {
        code: editCompCode.trim() || undefined,
        name: editCompName.trim(),
        taxId: editCompTaxId.trim() || undefined,
        branchCode: editCompBranchCode.trim() || undefined,
        branchName: editCompBranchName.trim() || undefined,
        phone: editCompPhone.trim() || undefined,
        email: editCompEmail.trim() || undefined,
        address: editCompAddress.trim() || undefined,
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
      invalidateCache();
      setEditingCompany(null);
      showToast?.(`แก้ไขข้อมูลบริษัท "${editCompName}" สำเร็จ`);
    } catch (err: any) {
      const msg = extractErrorMessage(err);
      showToast?.(`เกิดข้อผิดพลาดในการแก้ไขบริษัท: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCompany = (comp: Company) => {
    setDeleteConfirmData({
      title: 'ยืนยันการลบบริษัทในเครือ / สาขา',
      itemType: 'Company',
      itemName: comp.name,
      itemCode: comp.code,
      description: `สาขา: ${comp.branchName || comp.branchCode || 'สำนักงานใหญ่'}`,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await masterDataService.deleteCompany(comp.id);
          setCompaniesList((prev) => prev.filter((c) => c.id !== comp.id));
          invalidateCache();
          setDeleteConfirmData(null);
          showToast?.(`ลบบริษัท "${comp.name}" สำเร็จ`);
        } catch (err: any) {
          const msg = extractErrorMessage(err);
          showToast?.(`เกิดข้อผิดพลาดในการลบบริษัท: ${msg}`);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return {
    companiesList,
    setCompaniesList,
    isLoading,
    fetchCompanies,
    invalidateCache,

    editingCompany,
    setEditingCompany,
    isViewOnly,
    setIsViewOnly,
    isSaving,
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

    deleteConfirmData,
    setDeleteConfirmData,
    isDeleting,

    openEditCompany,
    handleSaveEditCompany,
    handleDeleteCompany,
  };
};
