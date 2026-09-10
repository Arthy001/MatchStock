import React, { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  Boxes,
  TrendingUp,
  ShieldCheck,
  Server,
  Activity,
  AlertCircle,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { platformAdminService } from '../../../services/platformAdmin.service';
import { PlatformDashboardMetrics, PlatformTabKey, PlatformAdminRole, PlatformPermissions } from '../../../types/platform';

interface PlatformDashboardViewProps {
  currentAdminRole: PlatformAdminRole;
  onNavigate: (tab: PlatformTabKey) => void;
}

export const PlatformDashboardView: React.FC<PlatformDashboardViewProps> = ({ currentAdminRole, onNavigate }) => {
  const [metrics, setMetrics] = useState<PlatformDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await platformAdminService.getDashboardMetrics();
      setMetrics(data);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (minor: number) => {
    const thb = minor / 100;
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(thb);
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-400 text-sm">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 animate-spin text-purple-400" />
          <span>กำลังโหลดข้อมูลภาพรวมระบบ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-800/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              PLATFORM OVERVIEW
            </span>
            {metrics.isMock ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-400" />
                <span>Mockup Data (ข้อมูลจำลอง)</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400">อัปเดตข้อมูลแบบ Real-time</span>
            )}
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            แดชบอร์ดผู้ดูแลระบบส่วนกลาง (Platform Dashboard)
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            ติดตามและบริหารจัดการสถิติองค์กรลูกค้า, ยอดรายได้ประจำเดือน (MRR), ปริมาณการใช้งานฐานข้อมูล และความพร้อมของระบบ
          </p>
        </div>

        <div className="flex gap-2">
          {PlatformPermissions.canViewTenants(currentAdminRole) ? (
            <button
              onClick={() => onNavigate('tenants')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>จัดการผู้เช่า (Tenants)</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('plans')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>จัดการแพ็กเกจ (Plans)</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Mockup Notice Banner */}
      {metrics.isMock && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start sm:items-center gap-3 text-xs text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <span className="font-bold text-amber-300">หมายเหตุ (Notice): </span>
            <span>ตัวเลขสถิติและกราฟภาพรวมในหน้านี้เป็น<strong>ข้อมูลจำลอง (Mockup Data)</strong> ชั่วคราว เนื่องจาก Backend API เส้นสรุปภาพรวม (<code className="px-1.5 py-0.5 rounded bg-amber-950/60 font-mono text-[11px] text-amber-300">GET /api/v1/platform/dashboard/metrics</code>) ยังอยู่ระหว่างการพัฒนาจากทีมงาน Backend</span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tenants */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">องค์กรลูกค้าทั้งหมด (Tenants)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-2">{metrics.totalTenants}</p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-emerald-400 font-semibold">{metrics.activeTenants} ใช้งานปกติ</span>
            <span className="text-slate-600">•</span>
            <span className="text-rose-400 font-semibold">{metrics.suspendedTenants} ถูกระงับ</span>
          </div>
        </div>

        {/* MRR */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">รายได้รายเดือน (MRR)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          {PlatformPermissions.canViewFinancialMetrics(currentAdminRole) ? (
            <>
              <p className="text-3xl font-black text-emerald-300 mt-2">
                {formatCurrency(metrics.mrrMinor)}
              </p>
              <p className="mt-2 text-xs text-slate-400">จากแพ็กเกจ Pro & Ultra รวมกัน</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-black text-slate-600 mt-2 tracking-widest">
                ฿ ••••••••
              </p>
              <p className="mt-2 text-[10px] text-slate-500">จำกัดสิทธิ์เฉพาะ Billing & SuperAdmin</p>
            </>
          )}
        </div>

        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">ผู้ใช้งานทั้งระบบ (Total Users)</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-2">{metrics.totalUsers}</p>
          <p className="mt-2 text-xs text-slate-400">พนักงานทุกองค์กรรวมกัน</p>
        </div>

        {/* Total SKUs */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">สินค้าในระบบ (Total SKUs)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-2">
            {metrics.totalProducts.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-slate-400">ใน {metrics.totalWarehouses} คลังสินค้า</p>
        </div>
      </div>

      {/* Grid: System Health & Recent Tenants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Infrastructure Health */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 mb-4">
            <Server className="w-4 h-4 text-purple-400" />
            <span>สถานะระบบส่วนกลาง (Infrastructure)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-200">PostgreSQL Cloud Database</p>
                <p className="text-[11px] text-slate-400">Supabase Dev / Cloud SQL Pool</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                HEALTHY
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-200">API Server (Cloud Run)</p>
                <p className="text-[11px] text-slate-400">Auto-scale Serverless Container</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-200">MQTT Hardware Gateway</p>
                <p className="text-[11px] text-slate-400">RFID Handheld & Fixed Readers</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                READY
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-200">Payment Gateway (Omise)</p>
                <p className="text-[11px] text-slate-400">Credit Card & PromptPay Webhooks</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">
                SANDBOX
              </span>
            </div>
          </div>
        </div>

        {/* Recent Tenants Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>องค์กรที่ลงทะเบียนล่าสุด (Recent Tenants)</span>
            </h3>
            <button
              onClick={() => onNavigate('tenants')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
            >
              ดูทั้งหมด →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-3">ชื่อองค์กร / รหัส</th>
                  <th className="pb-3">แพ็กเกจ</th>
                  <th className="pb-3">Users</th>
                  <th className="pb-3">คลัง</th>
                  <th className="pb-3">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {metrics.recentTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3">
                      <p className="font-bold text-white">{tenant.name}</p>
                      <p className="text-[11px] text-slate-500">{tenant.slug}</p>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-purple-300">
                        {tenant.planCode || 'PRO_MONTHLY'}
                      </span>
                    </td>
                    <td className="py-3 font-semibold">{tenant.userCount ?? 0} คน</td>
                    <td className="py-3 font-semibold">{tenant.warehouseCount ?? 0} คลัง</td>
                    <td className="py-3">
                      {tenant.status === 'active' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Suspended
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
