import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Box, X, CheckCircle2, Building, Layers, Hash, ShieldCheck, Sparkles } from 'lucide-react';
import { ThemeMode, Language } from '../../../types';
import { warehouseService } from '../../../services/warehouse.service';

interface CreateBinModalProps {
  theme: ThemeMode;
  lang?: Language;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBin: any) => void;
  warehousesList: Array<{ id: string; name: string; code?: string }>;
  defaultWarehouseId?: string;
  showToast?: (msg: string) => void;
}

export const CreateBinModal: React.FC<CreateBinModalProps> = ({
  theme,
  lang = 'th',
  isOpen,
  onClose,
  onSuccess,
  warehousesList,
  defaultWarehouseId,
  showToast,
}) => {
  if (!isOpen) return null;
  const isEn = lang === 'en';

  const [warehouseId, setWarehouseId] = useState<string>(() => {
    if (defaultWarehouseId && warehousesList.some((w) => w.id === defaultWarehouseId)) {
      return defaultWarehouseId;
    }
    return warehousesList.length > 0 ? warehousesList[0].id : '';
  });

  const [zone, setZone] = useState('A');
  const [rack, setRack] = useState('01');
  const [shelf, setShelf] = useState('01');
  const [binCode, setBinCode] = useState('');
  const [isManualCode, setIsManualCode] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState('500');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync defaultWarehouseId if changed
  useEffect(() => {
    if (defaultWarehouseId && warehousesList.some((w) => w.id === defaultWarehouseId)) {
      setWarehouseId(defaultWarehouseId);
    } else if (!warehouseId && warehousesList.length > 0) {
      setWarehouseId(warehousesList[0].id);
    }
  }, [defaultWarehouseId, warehousesList]);

  // Auto-generate binCode when warehouse, zone, rack, shelf change (unless manually edited)
  useEffect(() => {
    if (isManualCode) return;
    const selectedWh = warehousesList.find((w) => w.id === warehouseId);
    let whPrefix = 'WH';
    if (selectedWh) {
      if (selectedWh.code && selectedWh.code.trim() !== '') {
        whPrefix = selectedWh.code.trim().toUpperCase();
      } else if (selectedWh.name) {
        const cleanName = selectedWh.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        whPrefix = cleanName ? cleanName.slice(0, 4) : 'WH';
      }
    }
    const z = (zone || 'A').trim().toUpperCase();
    const r = (rack || '01').trim().padStart(2, '0');
    const s = (shelf || '01').trim().padStart(2, '0');
    setBinCode(`${whPrefix}-${z}-${r}-${s}`);
  }, [warehouseId, zone, rack, shelf, warehousesList, isManualCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId) {
      setError(isEn ? 'Please select a parent warehouse' : 'กรุณาเลือกคลังสินค้าหลัก');
      return;
    }
    if (!binCode.trim()) {
      setError(isEn ? 'Please enter a bin location code' : 'กรุณากรอกรหัสตำแหน่ง Bin');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await warehouseService.createBin(warehouseId, {
        code: binCode.trim().toUpperCase(),
        zoneName: zone.trim() || undefined,
        rack: rack.trim() || undefined,
        shelf: shelf.trim() || undefined,
        capacityKg: 0,
        maxCapacity: parseInt(maxCapacity) || 0,
        isActive,
      });

      showToast?.(
        isEn
          ? `Bin location "${binCode.trim().toUpperCase()}" created successfully`
          : `สร้างตำแหน่งจัดเก็บ Bin "${binCode.trim().toUpperCase()}" สำเร็จ`
      );
      onSuccess(created);
      onClose();

      // Reset
      setIsManualCode(false);
      setZone('A');
      setRack('01');
      setShelf('01');
      setMaxCapacity('500');
      setIsActive(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการสร้างตำแหน่ง Bin';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedWh = warehousesList.find((w) => w.id === warehouseId);

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {isEn ? 'Add New Bin Location' : 'เพิ่มตำแหน่งจัดเก็บสินค้า (Bin)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? 'Define a physical slot, rack shelf, and capacity'
                  : 'กำหนดรหัสช่องจัดเก็บ แร็ค ชั้น และความจุในคลังสินค้า'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Parent Warehouse Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? 'Target Warehouse *' : 'คลังสินค้าหลักที่สังกัด *'}</span>
            </label>
            {warehousesList.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-medium">
                {isEn
                  ? 'No warehouses available. Please create a warehouse first.'
                  : 'ยังไม่มีคลังสินค้าในระบบ กรุณาสร้างคลังสินค้าก่อนเพิ่ม Bin'}
              </div>
            ) : (
              <select
                required
                value={warehouseId}
                onChange={(e) => {
                  setWarehouseId(e.target.value);
                  setIsManualCode(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition cursor-pointer"
              >
                {warehousesList.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} {wh.code ? `(${wh.code})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Zone / Rack / Shelf */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Zone' : 'โซน (Zone)'}</span>
              </label>
              <input
                type="text"
                value={zone}
                onChange={(e) => {
                  setZone(e.target.value.toUpperCase());
                  setIsManualCode(false);
                }}
                placeholder="A, B, North"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-center uppercase focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Rack' : 'แร็ค (Rack)'}</span>
              </label>
              <input
                type="text"
                value={rack}
                onChange={(e) => {
                  setRack(e.target.value);
                  setIsManualCode(false);
                }}
                placeholder="01, 02"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-center focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Shelf' : 'ชั้น (Shelf)'}</span>
              </label>
              <input
                type="text"
                value={shelf}
                onChange={(e) => {
                  setShelf(e.target.value);
                  setIsManualCode(false);
                }}
                placeholder="01, 02"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-center focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
              />
            </div>
          </div>

          {/* Generated Bin Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Bin Location Code *' : 'รหัสตำแหน่ง Bin *'}</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsManualCode(false);
                  const selected = warehousesList.find((w) => w.id === warehouseId);
                  const p = selected?.code || 'WH';
                  setBinCode(`${p}-${zone || 'A'}-${(rack || '01').padStart(2, '0')}-${(shelf || '01').padStart(2, '0')}`);
                }}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isEn ? 'Auto Format' : 'คำนวณรหัสอัตโนมัติ'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              value={binCode}
              onChange={(e) => {
                setBinCode(e.target.value.toUpperCase());
                setIsManualCode(true);
              }}
              placeholder="e.g. KK-A-01-01"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {isEn
                ? `Format: [WarehouseCode]-[Zone]-[Rack]-[Shelf]`
                : `รูปแบบ: [รหัสคลัง]-[โซน]-[แร็ค]-[ชั้น] (คลัง: ${selectedWh?.name || '-'})`}
            </p>
          </div>

          {/* Max Capacity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? 'Max Capacity (Items)' : 'ความจุสูงสุด (ชิ้น/Items)'}</span>
            </label>
            <input
              type="number"
              min="0"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              placeholder="500"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden transition"
            />
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? 'Active & Ready for Storage' : 'เปิดใช้งานและพร้อมจัดเก็บสินค้าทันที'}
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isEn ? 'Cancel' : 'ยกเลิก'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || warehousesList.length === 0}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs shadow-blue-600/30"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? (isEn ? 'Creating...' : 'กำลังสร้าง...') : (isEn ? 'Create Bin Location' : 'บันทึกสร้างตำแหน่ง Bin')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
