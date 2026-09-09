import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Tag, X, CheckCircle2, Hash, FileText } from 'lucide-react';
import { ThemeMode, Language } from '../../../types';
import { masterDataService } from '../../common/services/masterData.service';
import { masterDataCache } from '../../common/cache/useMasterDataCache';

interface CreateBrandModalProps {
  theme: ThemeMode;
  lang?: Language;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBrand: any) => void;
  showToast?: (msg: string) => void;
}

export const CreateBrandModal: React.FC<CreateBrandModalProps> = ({
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
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isEn ? 'Please enter brand name' : 'กรุณากรอกชื่อแบรนด์/ผู้ผลิต');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await masterDataService.createBrand({
        name: name.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
      });

      // Strict backend validation
      if (!created || !created.id) {
        throw new Error(isEn ? 'Failed to obtain persisted brand ID from server.' : 'เซิร์ฟเวอร์ไม่ได้ส่ง ID ของแบรนด์กลับมา');
      }

      masterDataCache.invalidate('brands_list');
      showToast?.(isEn ? `Brand "${name}" created successfully` : `สร้างแบรนด์ "${name}" สำเร็จ`);
      onSuccess(created);
      onClose();

      // Reset
      setName('');
      setCode('');
      setDescription('');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการสร้างแบรนด์';
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
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {isEn ? 'Create New Brand' : 'สร้างแบรนด์/ผู้ผลิตใหม่'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? 'Define trademark, brand identities and manufacturers' : 'กำหนดตราสินค้า เครื่องหมายการค้า และผู้ผลิต'}
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
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? 'Brand Name *' : 'ชื่อแบรนด์/ตราสินค้า *'}</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isEn ? 'e.g. Sony, Apple, Samsung' : 'เช่น Sony, Apple, Samsung'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? 'Brand Code' : 'รหัสแบรนด์'}</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={isEn ? 'e.g. BRD-SONY' : 'เช่น BRD-SONY'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? 'Description' : 'คำอธิบายเพิ่มเติม'}</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isEn ? 'Brief description about this brand' : 'รายละเอียดเพิ่มเติมเกี่ยวกับแบรนด์นี้'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden transition resize-none"
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
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs shadow-purple-600/30"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? (isEn ? 'Creating...' : 'กำลังสร้าง...') : (isEn ? 'Create Brand' : 'บันทึกสร้างแบรนด์')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
