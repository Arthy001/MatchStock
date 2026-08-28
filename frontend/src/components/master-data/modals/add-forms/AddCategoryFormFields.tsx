import React from 'react';
import { ThemeMode } from '../../../../types';

interface AddCategoryFormFieldsProps {
  theme: ThemeMode;
  addCatCode?: string;
  setAddCatCode?: (val: string) => void;
  addCatName?: string;
  setAddCatName?: (val: string) => void;
  addCatDescription?: string;
  setAddCatDescription?: (val: string) => void;
}

export const AddCategoryFormFields: React.FC<AddCategoryFormFieldsProps> = ({
  theme,
  addCatCode = '',
  setAddCatCode,
  addCatName = '',
  setAddCatName,
  addCatDescription = '',
  setAddCatDescription,
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
          <input
            type="text"
            required
            value={addCatName}
            onChange={(e) => setAddCatName && setAddCatName(e.target.value)}
            placeholder="เช่น เครื่องใช้ไฟฟ้า, รองเท้า, อุปกรณ์ IT"
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
      </div>
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1.5">
          รายละเอียด (Description) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
        </label>
        <textarea
          rows={2}
          value={addCatDescription}
          onChange={(e) => setAddCatDescription && setAddCatDescription(e.target.value)}
          placeholder="ระบุคำอธิบายหมวดหมู่สินค้า..."
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
