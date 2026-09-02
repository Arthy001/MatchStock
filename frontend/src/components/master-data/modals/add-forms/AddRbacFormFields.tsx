import React from 'react';
import { ThemeMode, UserRole, Language } from '../../../../types';
import { CustomSelect } from '../../../common/CustomSelect';

interface AddRbacFormFieldsProps {
  theme: ThemeMode;
  lang?: Language;
  addName: string;
  setAddName: (val: string) => void;
  addEmail: string;
  setAddEmail: (val: string) => void;
  addRole: UserRole;
  setAddRole: (val: UserRole) => void;
}

export const AddRbacFormFields: React.FC<AddRbacFormFieldsProps> = ({
  theme,
  lang = 'th',
  addName,
  setAddName,
  addEmail,
  setAddEmail,
  addRole,
  setAddRole,
}) => {
  const isEn = lang === 'en';

  return (
    <>
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
          {isEn ? 'User Full Name' : 'ชื่อ-นามสกุล ผู้ใช้'} <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          type="text"
          required
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
          placeholder={isEn ? 'e.g. John Doe' : 'เช่น สมชาย ใจดี'}
          className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
          {isEn ? 'User Email Address' : 'อีเมลผู้ใช้งาน'} <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          type="email"
          required
          value={addEmail}
          onChange={(e) => setAddEmail(e.target.value)}
          placeholder="user@matchstock.com"
          className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
          {isEn ? 'User Role & Permissions (Role)' : 'บทบาทสิทธิ์ใช้งาน (Role)'}{' '}
          <span className="text-slate-400 font-normal text-xs">
            {isEn ? '(Optional)' : '(ไม่บังคับ)'}
          </span>
        </label>
        <CustomSelect
          theme={theme}
          value={addRole}
          onChange={(val) => setAddRole(val as UserRole)}
          options={[
            {
              value: 'admin',
              label: isEn ? 'Admin (Full System Administrator)' : 'Admin (ผู้ดูแลระบบสูงสุด)',
            },
            {
              value: 'manager',
              label: isEn ? 'Manager (Warehouse Operations Manager)' : 'Manager (ผู้จัดการคลังสินค้า)',
            },
            {
              value: 'warehouse_staff',
              label: isEn ? 'Warehouse Staff (Inventory & Picking Staff)' : 'Warehouse Staff (เจ้าหน้าที่คลัง)',
            },
            {
              value: 'purchasing_staff',
              label: isEn ? 'Purchasing Staff (Procurement Officer)' : 'Purchasing Staff (เจ้าหน้าที่จัดซื้อ)',
            },
          ]}
        />
      </div>
    </>
  );
};
