import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Building, X, CheckCircle2, MapPin, Hash, ShieldCheck, Boxes, Crown } from 'lucide-react';
import { ThemeMode, Language } from '../../../types';
import { warehouseService } from '../../../services/warehouse.service';

interface CreateWarehouseModalProps {
  theme: ThemeMode;
  lang?: Language;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newWh: any) => void;
  showToast?: (msg: string) => void;
}

export const CreateWarehouseModal: React.FC<CreateWarehouseModalProps> = ({
  theme,
  lang = 'th',
  isOpen,
  onClose,
  onSuccess,
  showToast,
}) => {
  if (!isOpen) return null;
  const isEn = lang === 'en';

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [outboundWorkflowMode, setOutboundWorkflowMode] = useState<'1-Step' | '2-Step' | '3-Step' | '4-Step'>('1-Step');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isEn ? 'Please enter warehouse name' : 'กรุณากรอกชื่อคลังสินค้า');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await warehouseService.createWarehouse({
        name: name.trim(),
        code: code.trim() || undefined,
        address: address.trim() || undefined,
        isDefault: false,
        outboundWorkflowMode,
      });

      showToast?.(isEn ? `Warehouse "${name}" created successfully` : `สร้างคลังสินค้า "${name}" สำเร็จ`);
      onSuccess(created);
      onClose();
      // Reset form
      setName('');
      setCode('');
      setAddress('');
      setMaxCapacity('0');
      setIsActive(true);
      setOutboundWorkflowMode('1-Step');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการสร้างคลังสินค้า';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {isEn ? 'Create New Warehouse' : 'สร้างคลังสินค้าหลักใหม่'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? 'Add a new main physical storage facility' : 'เพิ่มอาคาร/คลังสินค้าหลักแห่งใหม่ในระบบ'}
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

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? 'Warehouse Name *' : 'ชื่อคลังสินค้าหลัก *'}</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isEn ? 'e.g. Khon Kaen Distribution Center' : 'เช่น คลังสินค้าขอนแก่น'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Warehouse Code' : 'รหัสคลังสินค้า'}</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={isEn ? 'e.g. KK or WH02' : 'เช่น KK หรือ WH02'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Max Capacity (Items)' : 'ความจุสูงสุด (ชิ้น)'}</span>
              </label>
              <input
                type="number"
                min="0"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? 'Location / Address' : 'ที่ตั้ง / ที่อยู่คลังสินค้า'}</span>
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={isEn ? 'e.g. 123 Mittraphap Rd, Khon Kaen' : 'เช่น เลขที่ 123 ถ.มิตรภาพ อ.เมือง จ.ขอนแก่น'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-hidden transition resize-none"
            />
          </div>

          {/* Outbound Fulfillment Workflow Mode Switcher */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-indigo-500" />
                <span>{isEn ? 'Outbound Fulfillment Workflow Mode' : 'กระบวนการเบิกจ่ายสินค้าประจำคลัง (Outbound Mode)'}</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {isEn ? 'Process complexity' : 'ขั้นตอนการเบิกจ่าย'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* 1-Step Direct */}
              <div
                onClick={() => setOutboundWorkflowMode('1-Step')}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  outboundWorkflowMode === '1-Step'
                    ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      1-Step Direct
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Free & All
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {isEn ? 'Scan once to deduct & dispatch.' : 'สแกน 1 ครั้ง ➔ ตัดสต็อกและส่งมอบทันที'}
                  </p>
                </div>
                <div className="mt-1.5 text-[10px] font-mono text-slate-400">Scan ➔ Ship</div>
              </div>

              {/* 2-Step */}
              <div
                onClick={() => setOutboundWorkflowMode('2-Step')}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  outboundWorkflowMode === '2-Step'
                    ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      2-Step (Pick ➔ Ship)
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Pro
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {isEn ? 'Pick at bin ➔ confirm dispatch.' : 'เดินหยิบตาม Bin ➔ ยืนยันปล่อยของ'}
                  </p>
                </div>
                <div className="mt-1.5 text-[10px] font-mono text-slate-400">Pick ➔ Ship</div>
              </div>

              {/* 3-Step */}
              <div
                onClick={() => setOutboundWorkflowMode('3-Step')}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  outboundWorkflowMode === '3-Step'
                    ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/30'
                    : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      3-Step (Standard)
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {isEn ? 'Pick ➔ Pack & QC ➔ Dispatch.' : 'หยิบตาม Bin ➔ บรรจุกล่อง QC ➔ จัดส่ง'}
                  </p>
                </div>
                <div className="mt-1.5 text-[10px] font-mono text-slate-400">Pick ➔ Pack ➔ Ship</div>
              </div>

              {/* 4-Step Enterprise */}
              <div
                onClick={() => setOutboundWorkflowMode('4-Step')}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                  outboundWorkflowMode === '4-Step'
                    ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500/30'
                    : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-500" />
                      4-Step Enterprise
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                      Ultra
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {isEn ? 'Full cycle with Staging Dock validation.' : 'ครบวงจร มีจุดพักสินค้าหน้า Dock ประตู'}
                  </p>
                </div>
                <div className="mt-1.5 text-[10px] font-mono text-slate-400">Pick ➔ Pack ➔ Stage ➔ Ship</div>
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? 'Active & Ready for Storage Operations' : 'เปิดใช้งานคลังสินค้านี้ทันที'}
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
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs shadow-indigo-600/30"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? (isEn ? 'Creating...' : 'กำลังสร้าง...') : (isEn ? 'Create Warehouse' : 'บันทึกสร้างคลังสินค้า')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
