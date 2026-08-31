import React from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Layers, Eye } from 'lucide-react';
import { ThemeMode, Language, CategoryItem } from '../../../types';

interface CategoryManagementTabProps {
  theme: ThemeMode;
  lang?: Language;
  t: any;
  categoriesList: CategoryItem[];
  onOpenAddModal: () => void;
  onOpenEditCategory: (category: CategoryItem, isViewOnly?: boolean) => void;
  onDeleteCategory: (category: CategoryItem) => void;
}

export const CategoryManagementTab: React.FC<CategoryManagementTabProps> = ({
  theme,
  lang = 'th',
  t,
  categoriesList = [],
  onOpenAddModal,
  onOpenEditCategory,
  onDeleteCategory,
}) => {
  const isEn = lang === 'en';
  const safeCategories = Array.isArray(categoriesList) ? categoriesList : [];

  return (
    <div className="space-y-6">
      {/* Table Section Header */}
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          {isEn ? 'All Product Categories' : 'หมวดหมู่สินค้าทั้งหมด'} ({safeCategories.length})
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {isEn
            ? 'Manage product category hierarchy for inventory organization and reporting'
            : 'จัดการโครงสร้างหมวดหมู่เพื่อจัดระเบียบสต็อกและการออกรายงาน'}
        </p>
      </div>

      {/* Categories Table */}
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
                <th className="p-3">{isEn ? 'Category Code' : 'รหัสหมวดหมู่ (Code)'}</th>
                <th className="p-3">{isEn ? 'Category Name' : 'ชื่อหมวดหมู่ (Category Name)'}</th>
                <th className="p-3">{isEn ? 'Description' : 'คำอธิบาย (Description)'}</th>
                <th className="p-3">{isEn ? 'Status' : 'สถานะ (Status)'}</th>
                <th className="p-3 text-right">{isEn ? 'Actions' : 'จัดการ (Actions)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {safeCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    {isEn ? 'No product categories found' : 'ไม่พบข้อมูลหมวดหมู่สินค้า'}
                  </td>
                </tr>
              ) : (
                safeCategories.map((cat, idx) => (
                  <tr
                    key={cat.id || idx}
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
                        {cat.code || '-'}
                      </span>
                    </td>
                    <td
                      className={`p-3 font-semibold ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      {cat.name}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {cat.description || '-'}
                    </td>
                    <td className="p-3">
                      {cat.isActive !== false ? (
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
                        onClick={() => onOpenEditCategory(cat, true)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'View Category Details' : 'ดูรายละเอียดหมวดหมู่ (View Detail)'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenEditCategory(cat, false)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'Edit Category' : 'แก้ไขหมวดหมู่ (Edit Category)'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCategory(cat)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'Delete Category' : 'ลบหมวดหมู่ (Delete Category)'}
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
    </div>
  );
};
