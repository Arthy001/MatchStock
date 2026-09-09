import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Eye,
  ShieldAlert,
  Boxes,
  Users,
  Warehouse,
  Calendar,
  X,
} from 'lucide-react';
import { platformAdminService } from '../../../services/platformAdmin.service';
import { PlatformTenant, TenantStatus, PlatformAdminRole, PlatformPermissions } from '../../../types/platform';

interface PlatformTenantsViewProps {
  currentAdminRole: PlatformAdminRole;
}

export const PlatformTenantsView: React.FC<PlatformTenantsViewProps> = ({ currentAdminRole }) => {
  const [tenants, setTenants] = useState<PlatformTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState<PlatformTenant | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, [search, statusFilter, planFilter]);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const data = await platformAdminService.getTenants({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        planCode: planFilter !== 'all' ? planFilter : undefined,
      });
      setTenants(data);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (tenant: PlatformTenant) => {
    const newStatus: TenantStatus = tenant.status === 'active' ? 'suspended' : 'active';
    const confirmMsg =
      newStatus === 'suspended'
        ? `ยืนยันการ "ระงับการใช้งาน (Suspend)" ขององค์กร ${tenant.name} หรือไม่? ผู้ใช้ขององค์กรนี้จะไม่สามารถล็อกอินเข้าสู่ระบบได้`
        : `ยืนยันการ "เปิดใช้งาน (Activate)" ขององค์กร ${tenant.name} อีกครั้งหรือไม่?`;

    if (!window.confirm(confirmMsg)) return;

    setIsUpdating(true);
    try {
      await platformAdminService.updateTenantStatus(tenant.id, newStatus);
      await fetchTenants();
      if (selectedTenant && selectedTenant.id === tenant.id) {
        setSelectedTenant({ ...selectedTenant, status: newStatus });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            <span>จัดการองค์กรผู้เช่า (Tenant Management)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            รายชื่อบริษัทลูกค้าทั้งหมด ตรวจสอบการใช้งานโควตา และควบคุมสถานะเปิด/ระงับบัญชี
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อองค์กร, slug, หรืออีเมล..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">ทุกสถานะ (All Status)</option>
            <option value="active">Active (ใช้งานปกติ)</option>
            <option value="suspended">Suspended (ระงับชั่วคราว)</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          >
            <option value="all">ทุกแพ็กเกจ (All Plans)</option>
            <option value="FREE">Free Tier</option>
            <option value="PRO_MONTHLY">Pro Monthly</option>
            <option value="ULTRA_MONTHLY">Ultra (RFID Automation)</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold">
                <th className="p-4">ชื่อองค์กร / ลูกค้า</th>
                <th className="p-4">แพ็กเกจ</th>
                <th className="p-4">พนักงาน (Users)</th>
                <th className="p-4">คลังสินค้า</th>
                <th className="p-4">รายการสินค้า</th>
                <th className="p-4">สถานะ</th>
                <th className="p-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    กำลังโหลดข้อมูลองค์กร...
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    ไม่พบข้อมูลองค์กรที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4">
                      <p className="font-bold text-white text-sm">{t.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        slug: <span className="text-purple-400 font-mono">{t.slug}</span>
                        {t.contactEmail && ` • ${t.contactEmail}`}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        {t.planCode}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <span>{t.userCount} คน</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Warehouse className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t.warehouseCount} คลัง</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-amber-400" />
                        <span>{t.productCount.toLocaleString()} SKUs</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {t.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Suspended</span>
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedTenant(t)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-200 border border-slate-700 transition cursor-pointer"
                        title="ดูรายละเอียดโควตา"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {PlatformPermissions.canSuspendTenants(currentAdminRole) ? (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleToggleStatus(t)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                            t.status === 'active'
                              ? 'bg-rose-500/15 hover:bg-rose-600 text-rose-300 hover:text-white border-rose-500/30'
                              : 'bg-emerald-500/15 hover:bg-emerald-600 text-emerald-300 hover:text-white border-emerald-500/30'
                          }`}
                        >
                          {t.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic px-2 py-1 bg-slate-800/40 rounded border border-slate-700/50">
                          View Only
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

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-800/60 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedTenant.name}</h3>
                  <p className="text-[11px] text-slate-400">ID: {selectedTenant.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-slate-400">สถานะปัจจุบัน</p>
                  <p className="font-bold text-white mt-1 capitalize">{selectedTenant.status}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <p className="text-slate-400">แพ็กเกจที่สมัคร</p>
                  <p className="font-bold text-purple-300 mt-1">{selectedTenant.planCode}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2">
                <h4 className="font-bold text-slate-300">สถิติการใช้งานโควตา (Usage Breakdown)</h4>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">จำนวนพนักงาน (Users)</span>
                  <span className="font-bold text-white">{selectedTenant.userCount} บัญชี</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">จำนวนคลังสินค้า (Warehouses)</span>
                  <span className="font-bold text-white">{selectedTenant.warehouseCount} คลัง</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">รายการสินค้า (SKUs)</span>
                  <span className="font-bold text-white">{selectedTenant.productCount.toLocaleString()} SKUs</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">วันที่ลงทะเบียนเข้าระบบ</span>
                  <span className="text-slate-300">{new Date(selectedTenant.createdAt).toLocaleDateString('th-TH')}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedTenant(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
              {PlatformPermissions.canSuspendTenants(currentAdminRole) && (
                <button
                  onClick={() => handleToggleStatus(selectedTenant)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedTenant.status === 'active'
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                  }`}
                >
                  {selectedTenant.status === 'active' ? 'ระงับบัญชี (Suspend)' : 'เปิดใช้งานบัญชี (Activate)'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
