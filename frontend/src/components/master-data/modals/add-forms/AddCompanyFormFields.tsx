import React from 'react';
import { ThemeMode } from '../../../../types';

interface AddCompanyFormFieldsProps {
  theme: ThemeMode;
  addCompanyCode: string;
  setAddCompanyCode: (val: string) => void;
  addCompanyName: string;
  setAddCompanyName: (val: string) => void;
  addCompanyTaxId: string;
  setAddCompanyTaxId: (val: string) => void;
  addCompanyBranchCode: string;
  setAddCompanyBranchCode: (val: string) => void;
  addCompanyBranchName: string;
  setAddCompanyBranchName: (val: string) => void;
  addCompanyPhone: string;
  setAddCompanyPhone: (val: string) => void;
  addCompanyEmail: string;
  setAddCompanyEmail: (val: string) => void;
  addCompanyAddress: string;
  setAddCompanyAddress: (val: string) => void;
  addCompanyIsHq: boolean;
  setAddCompanyIsHq: (val: boolean) => void;
}

export const AddCompanyFormFields: React.FC<AddCompanyFormFieldsProps> = ({
  theme,
  addCompanyCode,
  setAddCompanyCode,
  addCompanyName,
  setAddCompanyName,
  addCompanyTaxId,
  setAddCompanyTaxId,
  addCompanyBranchCode,
  setAddCompanyBranchCode,
  addCompanyBranchName,
  setAddCompanyBranchName,
  addCompanyPhone,
  setAddCompanyPhone,
  addCompanyEmail,
  setAddCompanyEmail,
  addCompanyAddress,
  setAddCompanyAddress,
  addCompanyIsHq,
  setAddCompanyIsHq,
}) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            รหัสบริษัท (Company Code) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="text"
            value={addCompanyCode}
            onChange={(e) => setAddCompanyCode(e.target.value)}
            placeholder="COMP-001"
            className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            ชื่อบริษัท / นิติบุคคล <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            type="text"
            required
            value={addCompanyName}
            onChange={(e) => setAddCompanyName(e.target.value)}
            placeholder="MatchStock Trading Co., Ltd."
            className={`w-full px-3 py-2 rounded-xl border font-semibold outline-hidden ${
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
            เลขประจำตัวผู้เสียภาษี (Tax ID) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="text"
            value={addCompanyTaxId}
            onChange={(e) => setAddCompanyTaxId(e.target.value)}
            placeholder="0105559012345"
            className={`w-full px-3 py-2 rounded-xl border font-mono font-medium outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            รหัสสาขา (Branch Code) <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            type="text"
            required
            value={addCompanyBranchCode}
            onChange={(e) => setAddCompanyBranchCode(e.target.value)}
            placeholder="00000 (สนง.ใหญ่)"
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
            ชื่อสาขา (Branch Name) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="text"
            value={addCompanyBranchName}
            onChange={(e) => setAddCompanyBranchName(e.target.value)}
            placeholder="สำนักงานใหญ่ (Headquarters)"
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            เบอร์โทรศัพท์ (Phone) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
          </label>
          <input
            type="text"
            value={addCompanyPhone}
            onChange={(e) => setAddCompanyPhone(e.target.value)}
            placeholder="+66 2 555 0100"
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
          อีเมลติดต่อ (Email) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
        </label>
        <input
          type="email"
          value={addCompanyEmail}
          onChange={(e) => setAddCompanyEmail(e.target.value)}
          placeholder="contact@company.com"
          className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>

      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
          ที่อยู่สถานประกอบการ (Legal Address) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
        </label>
        <textarea
          rows={2}
          value={addCompanyAddress}
          onChange={(e) => setAddCompanyAddress(e.target.value)}
          placeholder="เลขที่ อาคาร ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
          className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
        <input
          type="checkbox"
          id="companyIsHqCheckboxModal"
          checked={addCompanyIsHq}
          onChange={(e) => setAddCompanyIsHq(e.target.checked)}
          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <label
          htmlFor="companyIsHqCheckboxModal"
          className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
        >
          กำหนดเป็นสำนักงานใหญ่ (Headquarters Entity)
        </label>
      </div>
    </>
  );
};
