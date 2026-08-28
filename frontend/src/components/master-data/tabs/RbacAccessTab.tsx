import React from 'react';
import { CheckCircle2, Trash2, Eye } from 'lucide-react';
import { ThemeMode, UserRole } from '../../../types';

interface RbacUser {
  id: string;
  name: string;
  email: string;
  department: string;
  role: UserRole;
  status: string;
}

interface RbacAccessTabProps {
  theme: ThemeMode;
  t: any;
  usersList: RbacUser[];
  onChangeUserRole: (user: RbacUser, newRole: UserRole) => void;
  onDeleteUser: (user: RbacUser) => void;
}

export const RbacAccessTab: React.FC<RbacAccessTabProps> = ({
  theme,
  t,
  usersList,
  onChangeUserRole,
  onDeleteUser,
}) => {
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
              className={`font-semibold text-base ${
                theme === 'dark' ? 'text-slate-50' : 'text-slate-900'
              }`}
            >
              {t.rbacTitle}
            </h3>
            <p
              className={`text-xs font-normal mt-1 ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {t.rbacSubtitle}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              theme === 'dark'
                ? 'bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            Multi-Tenant Context
          </span>
        </div>

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
              จัดการทุกระบบ & สิทธิ์การใช้
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
              อนุมัติเอกสารและดูรายงาน
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
              รับ/จ่าย สแกนบาร์โค้ด
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
              ออกใบสั่งซื้อและจัดการผู้จัดจำหน่าย
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
                <th className="p-3">User Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Department</th>
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
              {usersList.map((usr) => (
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
                      title="ดูรายละเอียดผู้ใช้งาน (View Detail)"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteUser(usr)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        theme === 'dark'
                          ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                          : 'text-slate-500 hover:text-rose-600 hover:bg-slate-100'
                      }`}
                      title="ลบผู้ใช้งาน (Delete)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
