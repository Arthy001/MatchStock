import React from 'react';
import { ThemeMode, Language } from '../../../../types';

interface AddWarehouseFormFieldsProps {
  theme: ThemeMode;
  lang?: Language;
  t: Record<string, string>;
  creationMode: 'sub_bin' | 'new_warehouse';
  setCreationMode: (mode: 'sub_bin' | 'new_warehouse') => void;
  selectedWarehouseId: string;
  setSelectedWarehouseId: (id: string) => void;
  warehousesList: Array<{ id: string; name: string; code?: string }>;
  addWarehouseName: string;
  setAddWarehouseName: (val: string) => void;
  addWarehouseCode: string;
  setAddWarehouseCode: (val: string) => void;
  addZone: string;
  setAddZone: (val: string) => void;
  addRack: string;
  setAddRack: (val: string) => void;
  addShelf: string;
  setAddShelf: (val: string) => void;
  addBinCode: string;
  setAddBinCode: (val: string) => void;
  addCapacityKg: string;
  setAddCapacityKg: (val: string) => void;
}

export const AddWarehouseFormFields: React.FC<AddWarehouseFormFieldsProps> = ({
  theme,
  lang = 'th',
  t,
  creationMode,
  setCreationMode,
  selectedWarehouseId,
  setSelectedWarehouseId,
  warehousesList = [],
  addWarehouseName,
  setAddWarehouseName,
  addWarehouseCode,
  setAddWarehouseCode,
  addZone,
  setAddZone,
  addRack,
  setAddRack,
  addShelf,
  setAddShelf,
  addBinCode,
  setAddBinCode,
  addCapacityKg,
  setAddCapacityKg,
}) => {
  const isEn = lang === 'en';

  // Helper to handle auto-generating Bin Code when Zone, Rack, Shelf, or Warehouse selection changes
  const handlePartChange = (field: 'zone' | 'rack' | 'shelf', value: string) => {
    let nextZone = addZone;
    let nextRack = addRack;
    let nextShelf = addShelf;

    if (field === 'zone') {
      nextZone = value;
      setAddZone(value);
    } else if (field === 'rack') {
      nextRack = value;
      setAddRack(value);
    } else if (field === 'shelf') {
      nextShelf = value;
      setAddShelf(value);
    }

    // Find selected warehouse code
    const selectedWh = warehousesList.find((w) => w.id === selectedWarehouseId);
    const whPrefix = selectedWh?.code ? selectedWh.code.trim().toUpperCase() : 'WH';

    // Auto-generate code if user has filled in parts
    if (nextZone.trim() || nextRack.trim() || nextShelf.trim()) {
      const z = nextZone.trim().toUpperCase() || 'A';
      const r = nextRack.trim() || '01';
      const s = nextShelf.trim() || '01';
      setAddBinCode(`${whPrefix}-${z}-${r}-${s}`);
    }
  };

  return (
    <>
      {/* Tab Switcher: Sub-Bin vs New Warehouse */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4">
        <button
          type="button"
          onClick={() => setCreationMode('sub_bin')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            creationMode === 'sub_bin'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {isEn ? '➕ Add Sub-Bin to Warehouse' : '➕ เพิ่ม Bin ย่อยในคลังที่มีอยู่'}
        </button>
        <button
          type="button"
          onClick={() => setCreationMode('new_warehouse')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            creationMode === 'new_warehouse'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {isEn ? '🏢 Create New Warehouse' : '🏢 สร้างคลังสินค้าหลักใหม่'}
        </button>
      </div>

      {creationMode === 'new_warehouse' ? (
        /* Create New Warehouse Fields */
        <div className="space-y-4">
          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
              {isEn ? 'Warehouse Code' : 'รหัสคลังสินค้า'} <span className="text-slate-400 font-normal text-xs">{isEn ? '(Optional)' : '(ไม่บังคับ - สุ่มถ้าว่าง)'}</span>
            </label>
            <input
              type="text"
              value={addWarehouseCode}
              onChange={(e) => setAddWarehouseCode(e.target.value)}
              placeholder={isEn ? 'e.g. WH-BKK-01' : 'เช่น WH-BKK-01'}
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
              {isEn ? 'Warehouse Name' : 'ชื่อคลังสินค้าหลัก'} <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={addWarehouseName}
              onChange={(e) => setAddWarehouseName(e.target.value)}
              placeholder={isEn ? 'e.g. WH-Bangkok Main Center' : 'เช่น คลังสินค้าหลัก กรุงเทพฯ'}
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>
        </div>
      ) : (
        /* Add Sub-Bin to Existing Warehouse Fields */
        <div className="space-y-4">
          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
              {isEn ? 'Select Warehouse' : 'เลือกคลังสินค้าหลัก'} <span className="text-rose-500 font-bold">*</span>
            </label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="">{isEn ? '-- Select Warehouse --' : '-- เลือกคลังสินค้า --'}</option>
              {warehousesList.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} {wh.code ? `(${wh.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                {isEn ? 'Zone' : 'โซน (Zone)'}{' '}
                <span className="text-slate-400 font-normal text-xs">
                  {isEn ? '(Optional)' : '(ไม่บังคับ)'}
                </span>
              </label>
              <input
                type="text"
                value={addZone}
                onChange={(e) => handlePartChange('zone', e.target.value)}
                placeholder={isEn ? 'e.g. A' : 'เช่น A'}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                {isEn ? 'Rack / Aisle' : 'แร็ค/แถว (Rack)'}{' '}
                <span className="text-slate-400 font-normal text-xs">
                  {isEn ? '(Optional)' : '(ไม่บังคับ)'}
                </span>
              </label>
              <input
                type="text"
                value={addRack}
                onChange={(e) => handlePartChange('rack', e.target.value)}
                placeholder={isEn ? 'e.g. 01' : 'เช่น 01'}
                className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
                {isEn ? 'Shelf / Level' : 'ชั้นวาง (Shelf)'}{' '}
                <span className="text-slate-400 font-normal text-xs">
                  {isEn ? '(Optional)' : '(ไม่บังคับ)'}
                </span>
              </label>
              <input
                type="text"
                value={addShelf}
                onChange={(e) => handlePartChange('shelf', e.target.value)}
                placeholder={isEn ? 'e.g. 02' : 'เช่น 02'}
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
              {isEn ? 'Bin Code' : t.binCode} <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={addBinCode}
              onChange={(e) => setAddBinCode(e.target.value)}
              placeholder={isEn ? 'e.g. WH-A-01-02 (Auto-generated)' : 'เช่น WH-A-01-02 (สร้างให้อัตโนมัติ)'}
              className={`w-full px-3 py-2 rounded-xl border font-mono font-semibold outline-hidden ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-blue-400'
                  : 'bg-slate-50 border-slate-300 text-blue-600 placeholder:text-slate-400'
              }`}
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
              {isEn ? 'Max Capacity' : 'ความจุสูงสุด (Max Capacity)'}{' '}
              <span className="text-slate-400 font-normal text-xs">
                {isEn ? '(Optional / Units)' : '(ไม่บังคับ - จำนวนชิ้น/หน่วย)'}
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
        </div>
      )}
    </>
  );
};


