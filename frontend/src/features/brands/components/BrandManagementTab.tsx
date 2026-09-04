import React, { useEffect } from 'react';
import { Bookmark, Edit2, Trash2, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { ThemeMode, Language, BrandItem } from '../../../types';
import { useBrands } from '../hooks/useBrands';
import { EditBrandModal } from './EditBrandModal';
import { ConfirmDeleteModal } from '../../../components/master-data/modals/ConfirmDeleteModal';

interface BrandManagementTabProps {
  theme: ThemeMode;
  lang?: Language;
  t?: any;
  searchQuery?: string;
  brandsList?: BrandItem[];
  onOpenAddModal?: () => void;
  onOpenEditBrand?: (brand: BrandItem, isViewOnly?: boolean) => void;
  onDeleteBrand?: (brand: BrandItem) => void;
  showToast?: (msg: string) => void;
}

export const BrandManagementTab: React.FC<BrandManagementTabProps> = ({
  theme,
  lang = 'th',
  t,
  searchQuery = '',
  brandsList: externalBrandsList,
  onOpenAddModal,
  onOpenEditBrand: externalOpenEdit,
  onDeleteBrand: externalDelete,
  showToast,
}) => {
  const isEn = lang === 'en';
  const hook = useBrands(showToast);

  useEffect(() => {
    if (!externalBrandsList) {
      hook.fetchBrands();
    }
  }, [externalBrandsList]);

  const brands = externalBrandsList || hook.brandsList;
  const safeBrands = Array.isArray(brands) ? brands : [];

  const filteredBrands = searchQuery
    ? safeBrands.filter((b) =>
        (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : safeBrands;

  return (
    <div className="space-y-6">
      {/* Table Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-600" />
            {isEn ? 'All Brands & Manufacturers' : 'แบรนด์และผู้ผลิตทั้งหมด'} ({filteredBrands.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEn
              ? 'Maintain brand identities, manufacturers, and product origin metadata'
              : 'จัดการรายชื่อแบรนด์ ผู้ผลิต และข้อมูลต้นกำเนิดของสินค้า'}
          </p>
        </div>
      </div>

      {/* Brands Table */}
      <div
        className={`rounded-2xl border overflow-hidden transition ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 shadow-sm'
            : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                className={`border-b font-bold uppercase tracking-wider ${
                  theme === 'dark'
                    ? 'border-slate-800 bg-slate-950/60 text-slate-400'
                    : 'border-slate-200 bg-slate-50/80 text-slate-600'
                }`}
              >
                <th className="p-3 w-12 text-center">#</th>
                <th className="p-3">{isEn ? 'Brand Code' : 'รหัสแบรนด์ (Code)'}</th>
                <th className="p-3">{isEn ? 'Brand Name' : 'ชื่อแบรนด์ (Brand Name)'}</th>
                <th className="p-3">{isEn ? 'Description' : 'คำอธิบาย (Description)'}</th>
                <th className="p-3">{isEn ? 'Status' : 'สถานะ (Status)'}</th>
                <th className="p-3 text-right">{isEn ? 'Actions' : 'จัดการ (Actions)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    {isEn ? 'No brands found' : 'ไม่พบข้อมูลแบรนด์สินค้า'}
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand, idx) => (
                  <tr
                    key={brand.id || idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs border ${
                          theme === 'dark'
                            ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        {brand.code || '-'}
                      </span>
                    </td>
                    <td
                      className={`p-3 font-semibold ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      {brand.name}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {brand.description || '-'}
                    </td>
                    <td className="p-3">
                      {brand.isActive !== false ? (
                        <span
                          className={`font-medium inline-flex items-center gap-1 text-xs ${
                            theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span
                          className={`font-medium inline-flex items-center gap-1 text-xs ${
                            theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5 text-slate-400" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => {
                          if (externalOpenEdit) externalOpenEdit(brand, true);
                          else hook.openEditBrand(brand, true);
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'View Brand Details' : 'ดูรายละเอียดแบรนด์ (View Detail)'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (externalOpenEdit) externalOpenEdit(brand, false);
                          else hook.openEditBrand(brand, false);
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'Edit Brand' : 'แก้ไขแบรนด์ (Edit Brand)'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (externalDelete) externalDelete(brand);
                          else hook.handleDeleteBrand(brand);
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'Delete Brand' : 'ลบแบรนด์ (Delete Brand)'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Self-contained Brand Modal */}
      <EditBrandModal
        theme={theme}
        lang={lang}
        t={t}
        brand={hook.editingBrand}
        isViewOnly={hook.isViewOnly}
        onSwitchToEdit={() => hook.setIsViewOnly(false)}
        onClose={() => hook.setEditingBrand(null)}
        onSave={hook.handleSaveEditBrand}
        isSaving={hook.isSaving}
        editBrandCode={hook.editBrandCode}
        setEditBrandCode={hook.setEditBrandCode}
        editBrandName={hook.editBrandName}
        setEditBrandName={hook.setEditBrandName}
        editBrandDescription={hook.editBrandDescription}
        setEditBrandDescription={hook.setEditBrandDescription}
        editBrandIsActive={hook.editBrandIsActive}
        setEditBrandIsActive={hook.setEditBrandIsActive}
      />

      <ConfirmDeleteModal
        theme={theme}
        lang={lang}
        isOpen={Boolean(hook.deleteConfirmData)}
        isDeleting={hook.isDeleting}
        data={hook.deleteConfirmData}
        onClose={() => hook.setDeleteConfirmData(null)}
      />
    </div>
  );
};
export default BrandManagementTab;
