import React, { useEffect } from 'react';
import { Truck, Edit2, Trash2, CheckCircle2, XCircle, Phone, Mail, MapPin, Eye } from 'lucide-react';
import { ThemeMode, Language, Supplier } from '../../../types';
import { useSuppliers } from '../hooks/useSuppliers';
import { EditSupplierModal } from './EditSupplierModal';
import { ConfirmDeleteModal } from '../../../components/master-data/modals/ConfirmDeleteModal';

interface SupplierManagementTabProps {
  theme: ThemeMode;
  lang?: Language;
  t?: any;
  searchQuery?: string;
  suppliersList?: Supplier[];
  onOpenAddModal?: () => void;
  onOpenEditSupplier?: (supplier: Supplier, isViewOnly?: boolean) => void;
  onDeleteSupplier?: (supplier: Supplier) => void;
  showToast?: (msg: string) => void;
}

export const SupplierManagementTab: React.FC<SupplierManagementTabProps> = ({
  theme,
  lang = 'th',
  t,
  searchQuery = '',
  suppliersList: externalSuppliersList,
  onOpenAddModal,
  onOpenEditSupplier: externalOpenEdit,
  onDeleteSupplier: externalDelete,
  showToast,
}) => {
  const isEn = lang === 'en';
  const hook = useSuppliers(showToast);

  useEffect(() => {
    if (!externalSuppliersList) {
      hook.fetchSuppliers();
    }
  }, [externalSuppliersList]);

  const suppliers = externalSuppliersList || hook.suppliersList;
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

  const filteredSuppliers = searchQuery
    ? safeSuppliers.filter((s) =>
        (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.contactPerson || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : safeSuppliers;

  return (
    <div className="space-y-6">
      {/* Table Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            {isEn ? 'All Suppliers & Vendors' : 'ผู้จัดจำหน่ายและคู่ค้าทั้งหมด'} ({filteredSuppliers.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEn
              ? 'Manage vendor relationships, purchase orders contacts, and supply chain records'
              : 'จัดการรายชื่อผู้จัดจำหน่าย คู่ค้า ข้อมูลการติดต่อ และการจัดซื้อ'}
          </p>
        </div>
      </div>

      {/* Suppliers Table */}
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
                <th className="p-3">{isEn ? 'Supplier Code' : 'รหัสผู้จัดจำหน่าย'}</th>
                <th className="p-3">{isEn ? 'Supplier Name' : 'ชื่อผู้จัดจำหน่าย'}</th>
                <th className="p-3">{isEn ? 'Contact Person' : 'ผู้ติดต่อ'}</th>
                <th className="p-3">{isEn ? 'Phone / Email' : 'เบอร์โทร / อีเมล'}</th>
                <th className="p-3">{isEn ? 'Status' : 'สถานะ'}</th>
                <th className="p-3 text-right">{isEn ? 'Actions' : 'จัดการ (Actions)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <Truck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    {isEn ? 'No suppliers found' : 'ไม่พบข้อมูลผู้จัดจำหน่าย'}
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((sup, idx) => (
                  <tr
                    key={sup.id || idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs border ${
                          theme === 'dark'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {sup.code || '-'}
                      </span>
                    </td>
                    <td
                      className={`p-3 font-semibold ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      {sup.name}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {sup.contactPerson || '-'}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col gap-0.5">
                        {sup.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {sup.phone}
                          </span>
                        )}
                        {sup.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {sup.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {sup.isActive !== false ? (
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
                          if (externalOpenEdit) externalOpenEdit(sup, true);
                          else hook.openEditSupplier(sup, true);
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'View Details' : 'ดูรายละเอียด (View Detail)'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (externalOpenEdit) externalOpenEdit(sup, false);
                          else hook.openEditSupplier(sup, false);
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'Edit Supplier' : 'แก้ไขผู้จัดจำหน่าย (Edit Supplier)'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (externalDelete) externalDelete(sup);
                          else hook.handleDeleteSupplier(sup);
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'Delete Supplier' : 'ลบผู้จัดจำหน่าย (Delete Supplier)'}
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

      {/* Self-contained Supplier Modal */}
      <EditSupplierModal
        theme={theme}
        lang={lang}
        t={t}
        supplier={hook.editingSupplier}
        isViewOnly={hook.isViewOnly}
        onSwitchToEdit={() => hook.setIsViewOnly(false)}
        onClose={() => hook.setEditingSupplier(null)}
        onSave={hook.handleSaveEditSupplier}
        isSaving={hook.isSaving}
        editSupCode={hook.editSupCode}
        setEditSupCode={hook.setEditSupCode}
        editSupName={hook.editSupName}
        setEditSupName={hook.setEditSupName}
        editSupContactPerson={hook.editSupContactPerson}
        setEditSupContactPerson={hook.setEditSupContactPerson}
        editSupPhone={hook.editSupPhone}
        setEditSupPhone={hook.setEditSupPhone}
        editSupEmail={hook.editSupEmail}
        setEditSupEmail={hook.setEditSupEmail}
        editSupTaxId={hook.editSupTaxId}
        setEditSupTaxId={hook.setEditSupTaxId}
        editSupAddress={hook.editSupAddress}
        setEditSupAddress={hook.setEditSupAddress}
        editSupIsActive={hook.editSupIsActive}
        setEditSupIsActive={hook.setEditSupIsActive}
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
export default SupplierManagementTab;
