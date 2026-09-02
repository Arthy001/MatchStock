import React from 'react';
import { Building2 } from 'lucide-react';
import { ThemeMode, Language } from '../../../../types';
import { FieldErrorTooltip } from '../../../common/FieldErrorTooltip';

interface AddCompanyFormFieldsProps {
  theme: ThemeMode;
  lang?: Language;
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
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

export const AddCompanyFormFields: React.FC<AddCompanyFormFieldsProps> = ({
  theme,
  lang = 'th',
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
  errors,
  clearError,
}) => {
  const isEn = lang === 'en';

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            {isEn ? 'Company Code' : 'รหัสบริษัท (Company Code)'} <span className="text-slate-400 font-normal text-xs">{isEn ? '(Optional)' : '(ไม่บังคับ)'}</span>
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
            {isEn ? 'Company / Entity Name' : 'ชื่อบริษัท / นิติบุคคล'} <span className="text-rose-500 font-bold">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={addCompanyName}
              onChange={(e) => {
                setAddCompanyName(e.target.value);
                if (clearError) clearError('companyName');
              }}
              placeholder={isEn ? 'MatchStock Trading Co., Ltd.' : 'บริษัท แมทช์สต็อก เทรดดิ้ง จำกัด'}
              className={`w-full px-3 py-2 rounded-xl border font-semibold outline-hidden transition-colors ${
                errors?.companyName
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5 text-slate-900 dark:text-white'
                  : theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            <FieldErrorTooltip message={errors?.companyName} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            {isEn ? 'Tax ID' : 'เลขประจำตัวผู้เสียภาษี (Tax ID)'} <span className="text-slate-400 font-normal text-xs">{isEn ? '(Optional)' : '(ไม่บังคับ)'}</span>
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
            {isEn ? 'Branch Code' : 'รหัสสาขา (Branch Code)'} <span className="text-slate-400 font-normal text-xs">{isEn ? '(Optional - Default 00000)' : '(ไม่บังคับ - ค่าเริ่มต้น 00000)'}</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={addCompanyBranchCode}
              onChange={(e) => {
                setAddCompanyBranchCode(e.target.value);
                if (clearError) clearError('branchCode');
              }}
              placeholder={isEn ? '00000 (Headquarters)' : '00000 (สนง.ใหญ่)'}
              className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden transition-colors ${
                errors?.branchCode
                  ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5 text-slate-900 dark:text-white'
                  : theme === 'dark'
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            <FieldErrorTooltip message={errors?.branchCode} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            {isEn ? 'Branch Name' : 'ชื่อสาขา (Branch Name)'} <span className="text-slate-400 font-normal text-xs">{isEn ? '(Optional)' : '(ไม่บังคับ)'}</span>
          </label>
          <input
            type="text"
            value={addCompanyBranchName}
            onChange={(e) => setAddCompanyBranchName(e.target.value)}
            placeholder={isEn ? 'Headquarters' : 'สำนักงานใหญ่ (Headquarters)'}
            className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
        <div>
          <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
            {isEn ? 'Phone Number' : 'เบอร์โทรศัพท์ (Phone)'} <span className="text-slate-400 font-normal text-xs">{isEn ? '(Optional)' : '(ไม่บังคับ)'}</span>
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
          {isEn ? 'Email Address' : 'อีเมลติดต่อ (Email)'} <span className="text-slate-400 font-normal text-xs">{isEn ? '(Optional)' : '(ไม่บังคับ)'}</span>
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
          {isEn ? 'Legal Address' : 'ที่อยู่สถานประกอบการ (Legal Address)'} <span className="text-slate-400 font-normal text-xs">{isEn ? '(Optional)' : '(ไม่บังคับ)'}</span>
        </label>
        <textarea
          rows={2}
          value={addCompanyAddress}
          onChange={(e) => setAddCompanyAddress(e.target.value)}
          placeholder={isEn ? 'Building, Street, District, Province, Postal Code' : 'เลขที่ อาคาร ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์'}
          className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>

      {/* Headquarters Toggle Card */}
      <div
        onClick={() => setAddCompanyIsHq(!addCompanyIsHq)}
        className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-between gap-3 ${
          addCompanyIsHq
            ? theme === 'dark'
              ? 'bg-blue-950/40 border-blue-500/60 shadow-xs shadow-blue-500/10'
              : 'bg-blue-50/80 border-blue-400 shadow-xs shadow-blue-500/10'
            : theme === 'dark'
            ? 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/70 hover:border-slate-600'
            : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition ${
              addCompanyIsHq
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                : theme === 'dark'
                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span
              className={`block text-xs font-bold leading-tight ${
                addCompanyIsHq
                  ? theme === 'dark' ? 'text-blue-300' : 'text-blue-900'
                  : theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              {isEn ? 'Headquarters Entity (HQ)' : 'กำหนดเป็นสำนักงานใหญ่ (Headquarters Entity)'}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5 truncate">
              {isEn
                ? 'Primary corporate parent entity for consolidated reports'
                : 'กำหนดให้เป็นนิติบุคคลหลักของกลุ่มบริษัทสำหรับงบการเงินรวม'}
            </span>
          </div>
        </div>

        {/* Smooth Toggle Switch Knob */}
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 p-0.5 shrink-0 flex items-center ${
            addCompanyIsHq ? 'bg-blue-600' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
              addCompanyIsHq ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </div>
      </div>
    </>
  );
};
