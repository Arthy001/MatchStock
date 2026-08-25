import React from 'react';
import {
  Building2,
  Landmark,
  Building,
  Edit2,
  Trash2,
} from 'lucide-react';
import { ThemeMode, Company } from '../../../types';

interface CompanyManagementTabProps {
  theme: ThemeMode;
  searchQuery: string;
  companies: Company[];
  onOpenEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export const CompanyManagementTab: React.FC<CompanyManagementTabProps> = ({
  theme,
  searchQuery = '',
  companies = [],
  onOpenEdit,
  onDelete,
}) => {
  const safeCompanies = Array.isArray(companies) ? companies : [];
  const q = (searchQuery || '').toLowerCase();
  const filtered = safeCompanies.filter(
    (c) =>
      c &&
      ((c.name || '').toLowerCase().includes(q) ||
        (c.code || '').toLowerCase().includes(q) ||
        (c.taxId && c.taxId.includes(searchQuery)))
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`p-5 rounded-2xl border ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">บริษัทในเครือทั้งหมด</p>
              <h4 className="text-xl font-bold">{companies.length} บริษัท</h4>
            </div>
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">
                สำนักงานใหญ่ (Headquarters)
              </p>
              <h4 className="text-xl font-bold">
                {companies.filter((c) => c.isHeadquarter).length} แห่ง
              </h4>
            </div>
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800'
              : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">สาขาย่อย (Branches)</p>
              <h4 className="text-xl font-bold">
                {companies.filter((c) => !c.isHeadquarter).length} สาขา
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Companies Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((company) => (
          <div
            key={company.id}
            className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    company.isHeadquarter
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {company.isHeadquarter ? (
                    <Landmark className="w-6 h-6" />
                  ) : (
                    <Building2 className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4
                      className={`font-bold text-sm ${
                        theme === 'dark' ? 'text-slate-50' : 'text-slate-900'
                      }`}
                    >
                      {company.name}
                    </h4>
                    {company.isHeadquarter ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        ★ สำนักงานใหญ่
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                        สาขา {company.branchCode}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {company.code} • สาขา: {company.branchName || company.branchCode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onOpenEdit(company)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="แก้ไขข้อมูลบริษัท (Edit Company)"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(company)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="ลบบริษัท (Delete Company)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400 font-medium">เลขประจำตัวผู้เสียภาษี (Tax ID)</p>
                <p className="font-mono font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                  {company.taxId || '-'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">ติดต่อ (Phone / Email)</p>
                <p className="font-medium text-slate-700 dark:text-slate-200 mt-0.5 truncate">
                  {company.phone || company.email || '-'}
                </p>
              </div>
            </div>

            {company.address && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/50 text-xs">
                <p className="text-slate-400 font-medium">ที่อยู่สถานประกอบการ:</p>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                  {company.address}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
