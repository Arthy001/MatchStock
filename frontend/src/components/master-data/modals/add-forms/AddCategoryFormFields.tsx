import React from 'react';
import { ThemeMode } from '../../../../types';
import { FieldErrorTooltip } from '../../../common/FieldErrorTooltip';

interface AddCategoryFormFieldsProps {
  theme: ThemeMode;
  addCatCode?: string;
  setAddCatCode?: (val: string) => void;
  addCatName?: string;
  setAddCatName?: (val: string) => void;
  addCatDescription?: string;
  setAddCatDescription?: (val: string) => void;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

export const AddCategoryFormFields: React.FC<AddCategoryFormFieldsProps> = ({
  theme,
  addCatCode = '',
  setAddCatCode,
  addCatName = '',
  setAddCatName,
  addCatDescription = '',
  setAddCatDescription,
  errors,
  clearError,
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1.5">
            รหัสหมวดหมู่ (Code) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="text"
            value={addCatCode}
            onChange={(e) => setAddCatCode && setAddCatCode(e.target.value)}
            placeholder="เช่น CAT-ELEC, CAT-APP"
            className={`w-full px-3 py-2 rounded-xl border font-mono font-bold outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1.5">
            ชื่อหมวดหมู่ (Category Name) <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={addCatName}
              onChange={(e) => {
                if (setAddCatName) setAddCatName(e.target.value);
                if (clearError) clearError('categoryName');
              }}
              placeholder="เช่น เครื่องใช้ไฟฟ้า, รองเท้า, อุปกรณ์ IT"
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition-colors ${
                errors?.categoryName
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5 text-slate-900 dark:text-white'
                  : theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            <FieldErrorTooltip message={errors?.categoryName} />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1.5">
          คำอธิบาย / รายละเอียดเพิ่มเติม <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
        </label>
        <textarea
          rows={3}
          value={addCatDescription}
          onChange={(e) => setAddCatDescription && setAddCatDescription(e.target.value)}
          placeholder="ระบุคำอธิบายเกี่ยวกับประเภทสินค้าในหมวดหมู่นี้..."
          className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>
    </>
  );
};
