import React, { useState } from 'react';
import { CheckCircle2, Trash2, Eye, ShieldCheck, UserPlus, Lock, X } from 'lucide-react';
import { ThemeMode, Language, UserRole } from '../../../types';

export interface RbacUser {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  status: string;
}

interface RbacAccessTabProps {
  theme: ThemeMode;
  lang?: Language;
  t: any;
  usersList: RbacUser[];
  currentUserRole?: UserRole;
  onChangeUserRole: (user: RbacUser, newRole: UserRole) => void;
  onDeleteUser: (user: RbacUser) => void;
  onAddUser?: (newUser: { name: string; email: string; role: UserRole; department: string }) => void;
  onSwitchRole?: (role: UserRole) => void;
}

export const RbacAccessTab: React.FC<RbacAccessTabProps> = ({
  theme,
  lang = 'th',
  t,
  usersList = [],
  currentUserRole = 'admin',
  onChangeUserRole,
  onDeleteUser,
  onAddUser,
  onSwitchRole,
}) => {
  const isEn = lang === 'en';
  const safeUsers = Array.isArray(usersList) ? usersList : [];
  const isAdmin = currentUserRole === 'admin';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('warehouse_staff');

  return (
    <div className="space-y-6">
      <div
        className={`p-6 rounded-2xl border transition-colors ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              className={`font-semibold text-base flex items-center gap-2 ${
                theme === 'dark' ? 'text-slate-50' : 'text-slate-900'
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-rose-600" />
              {t.rbacTitle} ({safeUsers.length})
            </h3>
            <p
              className={`text-xs font-normal mt-1 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {t.rbacSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isAdmin && (
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                  theme === 'dark'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>โหมดดูอย่างเดียว (สิทธิ์เฉพาะ Admin ในการแก้ไข)</span>
              </span>
            )}
            {isAdmin && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isEn ? '+ Invite User' : '+ เชิญผู้ใช้งานใหม่'}</span>
              </button>
            )}
          </div>
        </div>

        {onSwitchRole && (
          <div
            className={`mb-5 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition ${
              theme === 'dark'
                ? 'bg-slate-800/40 border-slate-700/60'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
              <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                {isEn
                  ? 'QA Role Simulator (Test SEC-02 Action Guards):'
                  : 'สลับบทบาทเพื่อทดสอบสิทธิ์ (QA Role Simulator - SEC-02):'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(
                [
                  { role: 'admin', label: isEn ? 'Admin' : 'ผู้ดูแลระบบ (Admin)' },
                  { role: 'manager', label: isEn ? 'Manager' : 'ผู้จัดการ (Manager)' },
                  { role: 'warehouse_staff', label: isEn ? 'Warehouse Staff' : 'เจ้าหน้าที่คลัง (Staff)' },
                  { role: 'purchasing_staff', label: isEn ? 'Purchasing Staff' : 'จัดซื้อ (Purchaser)' },
                ] as const
              ).map(({ role, label }) => {
                const isActive = currentUserRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => onSwitchRole(role)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                        : theme === 'dark'
                        ? 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div
            className={`p-4 rounded-xl border ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-800/50'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p
              className={`text-xs font-medium ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {t.roleAdmin}
            </p>
            <p
              className={`text-lg font-bold mt-1 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
              }`}
            >
              Full Access
            </p>
            <p
              className={`text-xs font-normal mt-1 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {isEn ? 'Manage all systems & user permissions' : 'จัดการทุกระบบ & สิทธิ์การใช้'}
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-800/50'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p
              className={`text-xs font-medium ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {t.roleManager}
            </p>
            <p
              className={`text-lg font-bold mt-1 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-700'
              }`}
            >
              Approval & Reports
            </p>
            <p
              className={`text-xs font-normal mt-1 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {isEn ? 'Document approvals & business reports' : 'อนุมัติเอกสารและดูรายงาน'}
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-800/50'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p
              className={`text-xs font-medium ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {t.roleWarehouse}
            </p>
            <p
              className={`text-lg font-bold mt-1 ${
                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'
              }`}
            >
              Stock Ops & Scan
            </p>
            <p
              className={`text-xs font-normal mt-1 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {isEn ? 'Receiving, dispatching & barcode scan' : 'รับ/จ่าย สแกนบาร์โค้ด'}
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-800/50'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p
              className={`text-xs font-medium ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {t.rolePurchasing}
            </p>
            <p
              className={`text-lg font-bold mt-1 ${
                theme === 'dark' ? 'text-amber-400' : 'text-amber-700'
              }`}
            >
              PO & Suppliers
            </p>
            <p
              className={`text-xs font-normal mt-1 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {isEn ? 'Issue purchase orders & vendor management' : 'ออกใบสั่งซื้อและจัดการผู้จัดจำหน่าย'}
            </p>
          </div>
        </div>

        {/* Users List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                className={`border-b font-semibold ${
                  theme === 'dark'
                    ? 'border-slate-800 text-slate-200 bg-slate-800'
                    : 'border-slate-200 text-slate-700 bg-slate-100'
                }`}
              >
                <th className="p-3">{isEn ? 'User Name' : 'ชื่อผู้ใช้ (Name)'}</th>
                <th className="p-3">{isEn ? 'Email' : 'อีเมล (Email)'}</th>
                <th className="p-3">{isEn ? 'Department' : 'แผนก (Department)'}</th>
                <th className="p-3">{t.role}</th>
                <th className="p-3">{t.status}</th>
                <th className="p-3 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                theme === 'dark' ? 'divide-slate-800' : 'divide-slate-200'
              }`}
            >
              {safeUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {isEn ? 'No users found' : 'ไม่พบข้อมูลผู้ใช้งาน'}
                  </td>
                </tr>
              ) : (
                safeUsers.map((usr) => (
                  <tr
                    key={usr.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td
                      className={`p-3 font-semibold ${
                        theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                      }`}
                    >
                      {usr.name}
                    </td>
                    <td
                      className={`p-3 font-normal ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {usr.email}
                    </td>
                    <td className="p-3 font-medium">{usr.department}</td>
                    <td className="p-3">
                      {isAdmin ? (
                        <select
                          value={usr.role}
                          onChange={(e) =>
                            onChangeUserRole(usr, e.target.value as UserRole)
                          }
                          className={`px-2 py-1 rounded text-xs font-semibold border outline-hidden ${
                            theme === 'dark'
                              ? 'bg-slate-800 border-slate-700 text-white'
                              : 'bg-slate-50 border-slate-300 text-slate-900'
                          }`}
                        >
                          <option value="admin">ADMIN</option>
                          <option value="manager">MANAGER</option>
                          <option value="warehouse_staff">WAREHOUSE STAFF</option>
                          <option value="purchasing_staff">PURCHASING</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            usr.role === 'admin'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : usr.role === 'manager'
                              ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                              : usr.role === 'warehouse_staff'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {usr.role.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-medium inline-flex items-center gap-1 ${
                          theme === 'dark'
                            ? 'text-emerald-400'
                            : 'text-emerald-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => alert(`ข้อมูลผู้ใช้งาน:\nชื่อ: ${usr.name}\nอีเมล: ${usr.email}\nแผนก: ${usr.department}\nบทบาท: ${usr.role.toUpperCase()}\nสถานะ: ${usr.status}`)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          theme === 'dark'
                            ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-800'
                            : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
                        }`}
                        title={isEn ? 'View User Details' : 'ดูรายละเอียดผู้ใช้งาน (View Detail)'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {isAdmin ? (
                        <button
                          onClick={() => onDeleteUser(usr)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            theme === 'dark'
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                              : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                          }`}
                          title={isEn ? 'Delete User' : 'ลบผู้ใช้งาน (Delete)'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="p-1.5 text-slate-500 opacity-30 cursor-not-allowed inline-block" title="สิทธิ์เฉพาะ Admin ในการลบ">
                          <Trash2 className="w-4 h-4" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4 ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-500" />
                <span>{isEn ? 'Invite New User' : 'เชิญ / เพิ่มผู้ใช้งานใหม่'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">ชื่อ-นามสกุล (Full Name)</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="เช่น กานดา ปฏิบัติการ"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">อีเมล (Email Address)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@siamfoods.co.th"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">แผนก (Department)</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="เช่น ฝ่ายคลังสินค้าและจัดส่ง"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-300">บทบาทสิทธิ์ (Role)</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 font-bold ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                >
                  <option value="warehouse_staff">WAREHOUSE STAFF (ปฏิบัติการคลัง/สแกน)</option>
                  <option value="purchasing_staff">PURCHASING STAFF (จัดซื้อ/ผู้จัดจำหน่าย)</option>
                  <option value="manager">MANAGER (ผู้จัดการ/อนุมัติ)</option>
                  <option value="admin">ADMIN (ผู้ดูแลระบบ)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-700/50">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (!newName || !newEmail) return alert('กรุณาระบุชื่อและอีเมล');
                  if (onAddUser) {
                    onAddUser({ name: newName, email: newEmail, role: newRole, department: newDepartment });
                  }
                  setIsAddModalOpen(false);
                  setNewName('');
                  setNewEmail('');
                  setNewDepartment('');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition cursor-pointer"
              >
                บันทึกและส่งคำเชิญ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
