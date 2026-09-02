import React from 'react';
import { ThemeMode, Language } from '../../../../types';

interface AddWarehouseFormFieldsProps {
  theme: ThemeMode;
  lang?: Language;
  t: Record<string, string>;
  addWarehouseName: string;
  setAddWarehouseName: (val: string) => void;
  addZone: string;
  setAddZone: (val: string) => void;
  addRack: string;
  setAddRack: (val: string) => void;
  addBinCode: string;
  setAddBinCode: (val: string) => void;
  addCapacityKg: string;
  setAddCapacityKg: (val: string) => void;
}

export const AddWarehouseFormFields: React.FC<AddWarehouseFormFieldsProps> = ({
  theme,
  lang = 'th',
  t,
  addWarehouseName,
  setAddWarehouseName,
  addZone,
  setAddZone,
  addRack,
  setAddRack,
  addBinCode,
  setAddBinCode,
  addCapacityKg,
  setAddCapacityKg,
}) => {
  const isEn = lang === 'en';

  return (
    <>
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
          {isEn ? 'Warehouse Name' : t.warehouseName} <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          type="text"
          required
          value={addWarehouseName}
          onChange={(e) => setAddWarehouseName(e.target.value)}
          placeholder={isEn ? 'e.g. WH-Bangkok Main Center' : 'WH-Bangkok Main Center'}
          className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            {isEn ? 'Zone' : t.zone}{' '}
            <span className="text-slate-400 font-normal text-xs">
              {isEn ? '(Optional)' : '(ไม่บังคับ)'}
            </span>
          </label>
          <input
            type="text"
            value={addZone}
            onChange={(e) => setAddZone(e.target.value)}
            placeholder={isEn ? 'e.g. Zone-A' : 'Zone-A'}
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            {isEn ? 'Rack / Shelf' : t.rack}{' '}
            <span className="text-slate-400 font-normal text-xs">
              {isEn ? '(Optional)' : '(ไม่บังคับ)'}
            </span>
          </label>
          <input
            type="text"
            value={addRack}
            onChange={(e) => setAddRack(e.target.value)}
            placeholder={isEn ? 'e.g. R-01' : 'R-01'}
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            {isEn ? 'Bin Code' : t.binCode} <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            type="text"
            required
            value={addBinCode}
            onChange={(e) => setAddBinCode(e.target.value)}
            placeholder={isEn ? 'BIN-A-01-01 (Auto if empty)' : 'BIN-A-01-01 (สุ่มถ้าว่าง)'}
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
      </div>
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
          {isEn ? 'Max Capacity (kg)' : `ความจุสูงสุด (${t.capacityKg})`}{' '}
          <span className="text-slate-400 font-normal text-xs">
            {isEn ? '(Optional)' : '(ไม่บังคับ)'}
          </span>
        </label>
        <input
          type="number"
          value={addCapacityKg}
          onChange={(e) => setAddCapacityKg(e.target.value)}
          placeholder={isEn ? 'e.g. 500' : 'เช่น 500'}
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
