import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Scale, X, CheckCircle2, Hash, FileText } from 'lucide-react';
import { ThemeMode, Language } from '../../../types';
import { masterDataService } from '../../common/services/masterData.service';
import { masterDataCache } from '../../common/cache/useMasterDataCache';

interface CreateUnitModalProps {
  theme: ThemeMode;
  lang?: Language;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUnit: any) => void;
  showToast?: (msg: string) => void;
}

export const CreateUnitModal: React.FC<CreateUnitModalProps> = ({
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
  const [type, setType] = useState('count');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError(isEn ? 'Please enter unit code and name' : 'กรุณากรอกรหัสและชื่อหน่วยนับ');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await masterDataService.createUnit({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        type: type || undefined,
        description: description.trim() || undefined,
      });

      // Strict backend validation
      if (!created || !created.id) {
        throw new Error(isEn ? 'Failed to obtain persisted unit ID from server.' : 'เซิร์ฟเวอร์ไม่ได้ส่ง ID ของหน่วยนับกลับมา');
      }

      masterDataCache.invalidate('units_list');
      showToast?.(isEn ? `Unit "${name}" created successfully` : `สร้างหน่วยนับ "${name}" สำเร็จ`);
      onSuccess(created);
      onClose();

      // Reset
      setName('');
      setCode('');
      setType('count');
      setDescription('');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการสร้างหน่วยนับ';
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {isEn ? 'Create New Unit of Measure' : 'สร้างหน่วยนับสินค้าใหม่'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? 'Configure base UoM, package types, and counting standards' : 'กำหนดหน่วยนับพื้นฐาน กล่อง แพ็ค หรือหน่วยชั่งตวงวัด'}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Unit Code *' : 'รหัสหน่วยนับ *'}</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={isEn ? 'e.g. PCS, BOX, KG' : 'เช่น PCS, BOX, KG'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Unit Name *' : 'ชื่อหน่วยนับ *'}</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isEn ? 'e.g. ชิ้น, กล่อง, กิโลกรัม' : 'เช่น ชิ้น, กล่อง, กิโลกรัม'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {isEn ? 'Unit Type' : 'ประเภทหน่วยนับ'}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden transition cursor-pointer"
            >
              <option value="count">{isEn ? 'Count / Quantity (e.g. Pcs, Pack)' : 'นับจำนวนชิ้น (ชิ้น, แพ็ค, กล่อง)'}</option>
              <option value="weight">{isEn ? 'Weight (e.g. Kg, Gram)' : 'น้ำหนัก (กิโลกรัม, กรัม)'}</option>
              <option value="volume">{isEn ? 'Volume (e.g. Liter, ML)' : 'ปริมาตร (ลิตร, มิลลิลิตร)'}</option>
              <option value="length">{isEn ? 'Length (e.g. Meter, CM)' : 'ความยาว (เมตร, เซนติเมตร)'}</option>
              <option value="area">{isEn ? 'Area (e.g. Sqm)' : 'พื้นที่ (ตารางเมตร)'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? 'Description' : 'คำอธิบายเพิ่มเติม'}</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isEn ? 'Optional description' : 'รายละเอียดเพิ่มเติม'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden transition resize-none"
            />
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
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs shadow-amber-600/30"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? (isEn ? 'Creating...' : 'กำลังสร้าง...') : (isEn ? 'Create Unit' : 'บันทึกสร้างหน่วยนับ')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
