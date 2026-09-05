import React, { useState, useEffect } from 'react';
import { Scale, Plus, Edit2, Trash2, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { ThemeMode, Language } from '../../../types';
import { UnitItem } from '../../../components/master-data/hooks/useMasterDataLoader';
import { useUnits } from '../hooks/useUnits';
import { EditUnitModal } from './EditUnitModal';
import { CreateUnitModal } from './CreateUnitModal';
import { ConfirmDeleteModal } from '../../../components/master-data/modals/ConfirmDeleteModal';

interface UnitManagementTabProps {
  theme: ThemeMode;
  lang?: Language;
  t?: any;
  searchQuery?: string;
  unitsList?: UnitItem[];
  onOpenAddModal?: () => void;
  onOpenEditUnit?: (unit: UnitItem, isViewOnly?: boolean) => void;
  onDeleteUnit?: (unit: UnitItem) => void;
  showToast?: (msg: string) => void;
}

export const UnitManagementTab: React.FC<UnitManagementTabProps> = ({
  theme,
  lang = 'th',
  t,
  searchQuery = '',
  unitsList: externalUnitsList,
  onOpenAddModal,
  onOpenEditUnit: externalOpenEdit,
  onDeleteUnit: externalDelete,
  showToast,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const isEn = lang === 'en';
  const hook = useUnits(showToast);

  useEffect(() => {
    if (!externalUnitsList) {
      hook.fetchUnits();
    }
  }, [externalUnitsList]);

  const units = externalUnitsList || hook.unitsList;
  const safeUnits = Array.isArray(units) ? units : [];

  const filteredUnits = searchQuery
    ? safeUnits.filter((u) =>
        (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.code || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : safeUnits;

  return (
    <div className="space-y-6">
      {/* Table Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-purple-600" />
            {isEn ? 'All Units of Measurement (UoM)' : 'หน่วยนับสินค้าทั้งหมด'} ({filteredUnits.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEn
              ? 'Define counting and packaging units (e.g., PCS, BOX, CTN, KG, METER)'
              : 'กำหนดหน่วยนับและหน่วยบรรจุภัณฑ์ (เช่น ชิ้น, กล่อง, ลัง, กิโลกรัม, เมตร)'}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isEn ? 'Add Unit' : 'เพิ่มหน่วยนับ'}</span>
        </button>
      </div>

      {/* Units Table */}
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
                <th className="p-3">{isEn ? 'Unit Code' : 'รหัสหน่วยนับ (Code)'}</th>
                <th className="p-3">{isEn ? 'Unit Name' : 'ชื่อหน่วยนับ (Unit Name)'}</th>
                <th className="p-3">{isEn ? 'Status' : 'สถานะ (Status)'}</th>
                <th className="p-3 text-right">{isEn ? 'Actions' : 'จัดการ (Actions)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <Scale className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    {isEn ? 'No units of measurement found' : 'ไม่พบข้อมูลหน่วยนับสินค้า'}
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit, idx) => (
                  <tr
                    key={unit.id || idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs border ${
                          theme === 'dark'
                            ? 'bg-purple-950/60 text-purple-300 border-purple-800/60'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {unit.code || '-'}
                      </span>
                    </td>
                    <td
                      className={`p-3 font-semibold ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      {unit.name}
                    </td>
                    <td className="p-3">
                      {unit.isActive !== false ? (
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
                          if (externalOpenEdit) externalOpenEdit(unit, true);
                          else hook.openEditUnit(unit, true);
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-purple-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-purple-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'View Unit Details' : 'ดูรายละเอียดหน่วยนับ (View Detail)'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (externalOpenEdit) externalOpenEdit(unit, false);
                          else hook.openEditUnit(unit, false);
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-purple-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-purple-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'Edit Unit' : 'แก้ไขหน่วยนับ (Edit Unit)'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (externalDelete) externalDelete(unit);
                          else hook.handleDeleteUnit(unit);
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'Delete Unit' : 'ลบหน่วยนับ (Delete Unit)'}
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

      {/* Self-contained Unit Modal */}
      <CreateUnitModal
        theme={theme}
        lang={lang}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => hook.fetchUnits()}
        showToast={showToast}
      />

      <EditUnitModal
        theme={theme}
        lang={lang}
        t={t}
        unit={hook.editingUnit}
        isViewOnly={hook.isViewOnly}
        onSwitchToEdit={() => hook.setIsViewOnly(false)}
        onClose={() => hook.setEditingUnit(null)}
        onSave={hook.handleSaveEditUnit}
        isSaving={hook.isSaving}
        editUnitCode={hook.editUnitCode}
        setEditUnitCode={hook.setEditUnitCode}
        editUnitName={hook.editUnitName}
        setEditUnitName={hook.setEditUnitName}
        editUnitIsActive={hook.editUnitIsActive}
        setEditUnitIsActive={hook.setEditUnitIsActive}
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
export default UnitManagementTab;
