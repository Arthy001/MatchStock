import React from 'react';
import { ThemeMode, UserRole } from '../../../../types';

interface AddRbacFormFieldsProps {
  theme: ThemeMode;
  addName: string;
  setAddName: (val: string) => void;
  addEmail: string;
  setAddEmail: (val: string) => void;
  addRole: UserRole;
  setAddRole: (val: UserRole) => void;
}

export const AddRbacFormFields: React.FC<AddRbacFormFieldsProps> = ({
  theme,
  addName,
  setAddName,
  addEmail,
  setAddEmail,
  addRole,
  setAddRole,
}) => {
  return (
    <>
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
          ชื่อ-นามสกุล ผู้ใช้ <span className="text-rose-500 font-bold">*</span>
        </label>
        <input
          type="text"
          required
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
          placeholder="เช่น สมชาย ใจดี"
          className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>
      <div>
        <label className="block text-slate-700 dark:text-slate-200 font-semibold text-[14px] mb-1.5">
          อีเมลผู้ใช้งาน <span className="text-rose-500 font-bold">*</span>
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
          บทบาทสิทธิ์ใช้งาน (Role) <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
        </label>
        <select
          value={addRole}
          onChange={(e) => setAddRole(e.target.value as UserRole)}
          className={`w-full px-3 py-2 rounded-xl border font-medium outline-hidden ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
          }`}
        >
          <option value="admin">Admin (ผู้ดูแลระบบสูงสุด)</option>
          <option value="manager">Manager (ผู้จัดการคลังสินค้า)</option>
          <option value="warehouse_staff">Warehouse Staff (เจ้าหน้าที่คลัง)</option>
          <option value="purchasing_staff">Purchasing Staff (เจ้าหน้าที่จัดซื้อ)</option>
        </select>
      </div>
    </>
  );
};
