import React, { useEffect } from 'react';
import { Building2, Edit2, Trash2, Phone, Mail, MapPin, Eye } from 'lucide-react';
import { ThemeMode, Language, Company } from '../../../types';
import { useCompanies } from '../hooks/useCompanies';
import { EditCompanyModal } from './EditCompanyModal';
import { ConfirmDeleteModal } from '../../../components/master-data/modals/ConfirmDeleteModal';

interface CompanyManagementTabProps {
  theme: ThemeMode;
  lang?: Language;
  t?: any;
  searchQuery?: string;
  companiesList?: Company[];
  onOpenAddModal?: () => void;
  onOpenEditCompany?: (company: Company, isViewOnly?: boolean) => void;
  onDeleteCompany?: (company: Company) => void;
  showToast?: (msg: string) => void;
}

export const CompanyManagementTab: React.FC<CompanyManagementTabProps> = ({
  theme,
  lang = 'th',
  t,
  searchQuery = '',
  companiesList: externalCompaniesList,
  onOpenAddModal,
  onOpenEditCompany: externalOpenEdit,
  onDeleteCompany: externalDelete,
  showToast,
}) => {
  const isEn = lang === 'en';
  const hook = useCompanies(showToast);

  useEffect(() => {
    if (!externalCompaniesList) {
      hook.fetchCompanies();
    }
  }, [externalCompaniesList]);

  const companies = externalCompaniesList || hook.companiesList;
  const safeCompanies = Array.isArray(companies) ? companies : [];

  const filteredCompanies = searchQuery
    ? safeCompanies.filter((c) =>
        (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.branchName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.taxId || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : safeCompanies;

  return (
    <div className="space-y-6">
      {/* Table Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            {isEn ? 'All Subsidiary Companies & Branches' : 'บริษัทในเครือและสาขาทั้งหมด'} ({filteredCompanies.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isEn
              ? 'Multi-entity governance, branch tax IDs, headquarters, and billing locations'
              : 'บริหารจัดการนิติบุคคล บริษัทในเครือ สาขา และข้อมูลสำนักงานใหญ่'}
          </p>
        </div>
      </div>

      {/* Companies Table */}
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
                <th className="p-3">{isEn ? 'Code' : 'รหัส (Code)'}</th>
                <th className="p-3">{isEn ? 'Company Name' : 'ชื่อบริษัท (Company Name)'}</th>
                <th className="p-3">{isEn ? 'Branch / HQ' : 'สาขา / สำนักงานใหญ่'}</th>
                <th className="p-3">{isEn ? 'Tax ID' : 'เลขผู้เสียภาษี'}</th>
                <th className="p-3">{isEn ? 'Contact & Address' : 'ติดต่อ & ที่อยู่'}</th>
                <th className="p-3 text-right">{isEn ? 'Actions' : 'จัดการ (Actions)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    {isEn ? 'No companies or branches found' : 'ไม่พบข้อมูลบริษัทในเครือหรือสาขา'}
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((comp, idx) => (
                  <tr
                    key={comp.id || idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="p-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs border ${
                          theme === 'dark'
                            ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {comp.code || '-'}
                      </span>
                    </td>
                    <td
                      className={`p-3 font-semibold ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{comp.name}</span>
                        {comp.isHeadquarter && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            HQ
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {comp.branchName ? `${comp.branchName} (${comp.branchCode || '00000'})` : comp.branchCode || '-'}
                    </td>
                    <td className="p-3 font-mono text-slate-500 dark:text-slate-400">
                      {comp.taxId || '-'}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      <div className="flex flex-col gap-0.5">
                        {comp.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {comp.phone}
                          </span>
                        )}
                        {comp.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {comp.email}
                          </span>
                        )}
                        {comp.address && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {comp.address}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => {
                          if (externalOpenEdit) externalOpenEdit(comp, true);
                          else hook.openEditCompany(comp, true);
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'View Details' : 'ดูรายละเอียด (View Detail)'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (externalOpenEdit) externalOpenEdit(comp, false);
                          else hook.openEditCompany(comp, false);
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'Edit Company' : 'แก้ไขข้อมูลบริษัท (Edit Company)'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (externalDelete) externalDelete(comp);
                          else hook.handleDeleteCompany(comp);
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'Delete Company' : 'ลบบริษัท (Delete Company)'}
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

      {/* Self-contained Company Modal */}
      <EditCompanyModal
        theme={theme}
        lang={lang}
        t={t}
        company={hook.editingCompany}
        isViewOnly={hook.isViewOnly}
        onSwitchToEdit={() => hook.setIsViewOnly(false)}
        onClose={() => hook.setEditingCompany(null)}
        onSave={hook.handleSaveEditCompany}
        isSaving={hook.isSaving}
        editCompCode={hook.editCompCode}
        setEditCompCode={hook.setEditCompCode}
        editCompName={hook.editCompName}
        setEditCompName={hook.setEditCompName}
        editCompTaxId={hook.editCompTaxId}
        setEditCompTaxId={hook.setEditCompTaxId}
        editCompBranchCode={hook.editCompBranchCode}
        setEditCompBranchCode={hook.setEditCompBranchCode}
        editCompBranchName={hook.editCompBranchName}
        setEditCompBranchName={hook.setEditCompBranchName}
        editCompPhone={hook.editCompPhone}
        setEditCompPhone={hook.setEditCompPhone}
        editCompEmail={hook.editCompEmail}
        setEditCompEmail={hook.setEditCompEmail}
        editCompAddress={hook.editCompAddress}
        setEditCompAddress={hook.setEditCompAddress}
        editCompIsHq={hook.editCompIsHq}
        setEditCompIsHq={hook.setEditCompIsHq}
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
export default CompanyManagementTab;
