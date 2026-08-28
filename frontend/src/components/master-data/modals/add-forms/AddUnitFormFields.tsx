import React from 'react';
import { ThemeMode } from '../../../../types';

interface AddUnitFormFieldsProps {
  theme: ThemeMode;
  addCode: string;
  setAddCode: (val: string) => void;
  addName: string;
  setAddName: (val: string) => void;
}

export const AddUnitFormFields: React.FC<AddUnitFormFieldsProps> = ({
  theme,
  addCode,
  setAddCode,
  addName,
  setAddName,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
          รหัสหน่วยนับ (UOM Code) <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          type="text"
          required
          value={addCode}
          onChange={(e) => setAddCode(e.target.value)}
          placeholder="เช่น PCS, BOX, DRUM, KG"
          className={`w-full px-3 py-2 rounded-xl border font-mono font-bold outline-hidden ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
          ชื่อหน่วยนับภาษาไทย/อังกฤษ <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          type="text"
          required
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
          placeholder="เช่น ชิ้น, กล่อง, ถัง, กิโลกรัม"
          className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>
    </div>
  );
};
