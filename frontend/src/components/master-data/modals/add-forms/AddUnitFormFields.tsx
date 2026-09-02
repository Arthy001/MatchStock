import React from 'react';
import { ThemeMode, Language } from '../../../../types';

interface AddUnitFormFieldsProps {
  theme: ThemeMode;
  lang?: Language;
  addCode: string;
  setAddCode: (val: string) => void;
  addName: string;
  setAddName: (val: string) => void;
}

export const AddUnitFormFields: React.FC<AddUnitFormFieldsProps> = ({
  theme,
  lang = 'th',
  addCode,
  setAddCode,
  addName,
  setAddName,
}) => {
  const isEn = lang === 'en';

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
          {isEn ? 'UOM Code' : 'รหัสหน่วยนับ (UOM Code)'} <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          type="text"
          required
          value={addCode}
          onChange={(e) => setAddCode(e.target.value)}
          placeholder={isEn ? 'e.g. PCS, BOX, DRUM, KG' : 'เช่น PCS, BOX, DRUM, KG'}
          className={`w-full px-3 py-2 rounded-xl border font-mono font-bold outline-hidden ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
          {isEn ? 'Unit Name' : 'ชื่อหน่วยนับ'} <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          type="text"
          required
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
          placeholder={isEn ? 'e.g. Piece, Box, Drum, Kilogram' : 'เช่น ชิ้น, กล่อง, ถัง, กิโลกรัม'}
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
