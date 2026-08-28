import React from 'react';
import { ThemeMode } from '../../../../types';

interface AddBrandFormFieldsProps {
  theme: ThemeMode;
  addBrdCode?: string;
  setAddBrdCode?: (val: string) => void;
  addBrdName?: string;
  setAddBrdName?: (val: string) => void;
  addBrdDescription?: string;
  setAddBrdDescription?: (val: string) => void;
}

export const AddBrandFormFields: React.FC<AddBrandFormFieldsProps> = ({
  theme,
  addBrdCode = '',
  setAddBrdCode,
  addBrdName = '',
  setAddBrdName,
  addBrdDescription = '',
  setAddBrdDescription,
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1.5">
            รหัสแบรนด์ (Code) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="text"
            value={addBrdCode}
            onChange={(e) => setAddBrdCode && setAddBrdCode(e.target.value)}
            placeholder="เช่น BRD-NIKE, BRD-APPLE"
            className={`w-full px-3 py-2 rounded-xl border font-mono font-bold outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[13px] mb-1.5">
            ชื่อแบรนด์ (Brand Name) <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            type="text"
            required
            value={addBrdName}
            onChange={(e) => setAddBrdName && setAddBrdName(e.target.value)}
            placeholder="เช่น Nike, Adidas, Sony, Apple"
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
          value={addBrdDescription}
          onChange={(e) => setAddBrdDescription && setAddBrdDescription(e.target.value)}
          placeholder="ระบุคำอธิบายแบรนด์สินค้า..."
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
