import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Building2, X, CheckCircle2, Hash, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { ThemeMode, Language } from '../../../types';
import { masterDataService } from '../../common/services/masterData.service';
import { masterDataCache } from '../../common/cache/useMasterDataCache';

interface CreateCompanyModalProps {
  theme: ThemeMode;
  lang?: Language;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newComp: any) => void;
  showToast?: (msg: string) => void;
}

export const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({
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
  const [taxId, setTaxId] = useState('');
  const [branchCode, setBranchCode] = useState('00000');
  const [branchName, setBranchName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isHeadquarter, setIsHeadquarter] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isEn ? 'Please enter company name' : 'กรุณากรอกชื่อบริษัท/สาขา');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await masterDataService.createCompany({
        name: name.trim(),
        code: code.trim() || undefined,
        taxId: taxId.trim() || undefined,
        branchCode: branchCode.trim() || '00000',
        branchName: branchName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        isHeadquarter,
      });

      // Strict backend validation
      if (!created || !created.id) {
        throw new Error(isEn ? 'Failed to obtain persisted company ID from server.' : 'เซิร์ฟเวอร์ไม่ได้ส่ง ID ของบริษัทกลับมา');
      }

      masterDataCache.invalidate('companies_list');
      showToast?.(isEn ? `Company "${name}" created successfully` : `สร้างบริษัท/สาขา "${name}" สำเร็จ`);
      onSuccess(created);
      onClose();

      // Reset
      setName('');
      setCode('');
      setTaxId('');
      setBranchCode('00000');
      setBranchName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setIsHeadquarter(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาดในการสร้างบริษัท/สาขา';
      setError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {isEn ? 'Create New Company / Branch' : 'สร้างบริษัทในเครือ / สาขาใหม่'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEn ? 'Manage legal entities, tax IDs, and branch locations' : 'กำหนดนิติบุคคล เลขประจำตัวผู้เสียภาษี และสาขา'}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? 'Company Name *' : 'ชื่อบริษัท / นิติบุคคล *'}</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isEn ? 'e.g. Matchpoint Co., Ltd.' : 'เช่น บริษัท แมทช์พอยท์ จำกัด'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Company Code' : 'รหัสบริษัท'}</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={isEn ? 'e.g. COMP-01' : 'เช่น COMP-01'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Tax ID' : 'เลขประจำตัวผู้เสียภาษี'}</span>
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="0105550000000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isEn ? 'Branch Code' : 'รหัสสาขา'}
              </label>
              <input
                type="text"
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                placeholder="00000 (สำนักงานใหญ่)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isEn ? 'Branch Name' : 'ชื่อสาขา'}
              </label>
              <input
                type="text"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder={isEn ? 'e.g. Silom Branch' : 'เช่น สาขาสีลม'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Phone' : 'เบอร์โทรศัพท์'}</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="02-123-4567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{isEn ? 'Email' : 'อีเมลติดต่อ'}</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@matchpoint.co.th"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? 'Address' : 'ที่อยู่ตามทะเบียนภาษี'}</span>
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={isEn ? 'e.g. 123 Sukhumvit Rd, Bangkok' : 'เช่น เลขที่ 123 ถ.สุขุมวิท กรุงเทพฯ'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isHeadquarter}
                onChange={(e) => setIsHeadquarter(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {isEn ? 'Headquarter (HQ)' : 'ตั้งเป็นสำนักงานใหญ่ (Headquarter)'}
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
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
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs shadow-emerald-600/30"
            >
              {isSubmitting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? (isEn ? 'Creating...' : 'กำลังสร้าง...') : (isEn ? 'Create Company' : 'บันทึกสร้างบริษัท')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
