import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle2, AlertCircle, ArrowUpRight, Filter, Search, Building2 } from 'lucide-react';
import { platformAdminService } from '../../../services/platformAdmin.service';
import { PlatformSubscription } from '../../../types/platform';

export const PlatformBillingView: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<PlatformSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await platformAdminService.getSubscriptions();
      setSubscriptions(data);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (minor: number) => {
    const thb = minor / 100;
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(thb);
  };

  const filtered = subscriptions.filter(
    (s) =>
      (s.tenantName || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.planCode || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <span>การเงินและรอบบิลข้ามระบบ (Cross-Tenant Subscriptions & Billing)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ภาพรวมการชำระเงิน, สถานะรอบบิล (Billing Cycles), และวันหมดอายุของทุกองค์กรลูกค้า
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อองค์กร หรือรหัสแพ็กเกจ..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold">
                <th className="p-4">องค์กรลูกค้า (Tenant)</th>
                <th className="p-4">แพ็กเกจ (Plan)</th>
                <th className="p-4">รอบการคิดเงิน</th>
                <th className="p-4">ราคาต่อรอบบิล</th>
                <th className="p-4">วันสิ้นสุดรอบบิลปัจจุบัน</th>
                <th className="p-4">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    กำลังโหลดข้อมูลการเรียกเก็บเงิน...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    ไม่พบข้อมูลการเรียกเก็บเงิน
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>{sub.tenantName || 'องค์กรไม่ระบุชื่อ'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        {sub.planCode || 'CUSTOM'}
                      </span>
                    </td>
                    <td className="p-4 capitalize text-slate-300">{sub.billingCycle}</td>
                    <td className="p-4 font-bold text-emerald-300">{formatCurrency(sub.unitPriceMinor)}</td>
                    <td className="p-4 text-slate-300">
                      {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('th-TH') : '-'}
                    </td>
                    <td className="p-4">
                      {sub.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Suspended</span>
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
    </div>
  );
};
