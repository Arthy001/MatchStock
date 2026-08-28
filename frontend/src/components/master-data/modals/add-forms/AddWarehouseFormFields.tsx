import React from 'react';
import { ThemeMode } from '../../../../types';

interface AddWarehouseFormFieldsProps {
  theme: ThemeMode;
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
  return (
    <>
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
          {t.warehouseName} <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          type="text"
          required
          value={addWarehouseName}
          onChange={(e) => setAddWarehouseName(e.target.value)}
          placeholder="WH-Bangkok Main Center"
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
            {t.zone} <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="text"
            value={addZone}
            onChange={(e) => setAddZone(e.target.value)}
            placeholder="Zone-A"
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            {t.rack} <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="text"
            value={addRack}
            onChange={(e) => setAddRack(e.target.value)}
            placeholder="R-01"
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            {t.binCode} <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            type="text"
            required
            value={addBinCode}
            onChange={(e) => setAddBinCode(e.target.value)}
            placeholder="BIN-A-01-01 (สุ่มถ้าว่าง)"
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
          ความจุสูงสุด ({t.capacityKg}) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
        </label>
        <input
          type="number"
          value={addCapacityKg}
          onChange={(e) => setAddCapacityKg(e.target.value)}
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
