import React from 'react';
import { ThemeMode } from '../../../../types';

interface AddSupplierFormFieldsProps {
  theme: ThemeMode;
  t: Record<string, string>;
  addSupplierName: string;
  setAddSupplierName: (val: string) => void;
  addContactPerson: string;
  setAddContactPerson: (val: string) => void;
  addPhone: string;
  setAddPhone: (val: string) => void;
  addEmail: string;
  setAddEmail: (val: string) => void;
  addTaxId: string;
  setAddTaxId: (val: string) => void;
}

export const AddSupplierFormFields: React.FC<AddSupplierFormFieldsProps> = ({
  theme,
  t,
  addSupplierName,
  setAddSupplierName,
  addContactPerson,
  setAddContactPerson,
  addPhone,
  setAddPhone,
  addEmail,
  setAddEmail,
  addTaxId,
  setAddTaxId,
}) => {
  return (
    <>
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
          {t.supplierName} <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          type="text"
          required
          value={addSupplierName}
          onChange={(e) => setAddSupplierName(e.target.value)}
          placeholder="เช่น Siam Logistics & Supply Co., Ltd."
          className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            ผู้ติดต่อ (Contact Person) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="text"
            value={addContactPerson}
            onChange={(e) => setAddContactPerson(e.target.value)}
            placeholder="คุณวิชัย ฝ่ายขาย"
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            เบอร์โทรศัพท์ <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="text"
            value={addPhone}
            onChange={(e) => setAddPhone(e.target.value)}
            placeholder="+66 2 123 4567"
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            อีเมลติดต่อ <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            placeholder="contact@supplier.co.th"
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            เลขประจำตัวผู้เสียภาษี (Tax ID) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="text"
            value={addTaxId}
            onChange={(e) => setAddTaxId(e.target.value)}
            placeholder="0105562099887"
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
      </div>
    </>
  );
};
