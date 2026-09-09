import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  Edit3,
  Check,
  Zap,
  Crown,
  Sparkles,
  Users,
  Warehouse,
  Boxes,
  Building,
  Radio,
  X,
} from 'lucide-react';
import { platformAdminService } from '../../../services/platformAdmin.service';
import { PlatformSubscriptionPlan, PlatformAdminRole, PlatformPermissions } from '../../../types/platform';

interface PlatformPlansViewProps {
  currentAdminRole: PlatformAdminRole;
}

export const PlatformPlansView: React.FC<PlatformPlansViewProps> = ({ currentAdminRole }) => {
  const [plans, setPlans] = useState<PlatformSubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<PlatformSubscriptionPlan | null>(null);
  const [editPriceThb, setEditPriceThb] = useState<number>(0);
  const [editMaxUsers, setEditMaxUsers] = useState<number>(0);
  const [editMaxWarehouses, setEditMaxWarehouses] = useState<number>(0);
  const [editMaxProducts, setEditMaxProducts] = useState<number>(0);
  const [editMaxCompanies, setEditMaxCompanies] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await platformAdminService.getSubscriptionPlans();
      setPlans(data);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (plan: PlatformSubscriptionPlan) => {
    setEditingPlan(plan);
    setEditPriceThb(plan.priceMinor / 100);
    setEditMaxUsers(plan.maxUsers ?? 9999);
    setEditMaxWarehouses(plan.maxWarehouses ?? 9999);
    setEditMaxProducts(plan.maxProducts ?? 999999);
    setEditMaxCompanies(plan.maxCompanies ?? 9999);
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;
    setSaving(true);
    try {
      await platformAdminService.updateSubscriptionPlan(editingPlan.id, {
        priceMinor: editPriceThb * 100,
        maxUsers: editMaxUsers,
        maxWarehouses: editMaxWarehouses,
        maxProducts: editMaxProducts,
        maxCompanies: editMaxCompanies,
      });
      await fetchPlans();
      setEditingPlan(null);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (minor: number) => {
    const thb = minor / 100;
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(thb);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-purple-400" />
            <span>จัดการแพ็กเกจสมาชิก (Subscription Plans Configurator)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            กำหนดราคา, ตั้งขีดจำกัดโควตา (Quotas) และสิทธิ์การใช้งานฟังก์ชัน (Feature Flags) ประจำแต่ละแพ็กเกจ
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs">กำลังโหลดข้อมูลแพ็กเกจ...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isUltra = plan.code.includes('ULTRA');
            const isPro = plan.code.includes('PRO');
            const isFree = plan.code.includes('FREE');

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 border transition flex flex-col justify-between relative ${
                  isUltra
                    ? 'bg-gradient-to-b from-purple-950/60 to-slate-900 border-purple-600/60 shadow-2xl shadow-purple-950/50'
                    : isPro
                    ? 'bg-slate-900/90 border-indigo-700/50 shadow-xl'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                {isUltra && (
                  <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                    ENTERPRISE RFID
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                        isUltra
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : isPro
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {plan.code}
                    </span>

                    {PlatformPermissions.canManagePlans(currentAdminRole) && (
                      <button
                        onClick={() => openEditModal(plan)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition text-xs font-semibold cursor-pointer border border-slate-700"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>แก้ไขโควตา</span>
                      </button>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mt-3">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{plan.description}</p>

                  {/* Pricing Box */}
                  <div className="mt-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ราคาค่าบริการ</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-white">{formatCurrency(plan.priceMinor)}</span>
                      <span className="text-xs text-slate-400">/ เดือน</span>
                    </div>
                  </div>

                  {/* Quotas Breakdown */}
                  <div className="mt-5 space-y-2.5 text-xs">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ขีดจำกัดโควตา (Quotas)</p>

                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <span>จำนวนผู้ใช้งาน (Users)</span>
                      </span>
                      <span className="font-bold text-white">
                        {plan.maxUsers && plan.maxUsers < 9000 ? `${plan.maxUsers} คน` : 'ไม่จำกัด'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Warehouse className="w-3.5 h-3.5 text-emerald-400" />
                        <span>จำนวนคลังสินค้า</span>
                      </span>
                      <span className="font-bold text-white">
                        {plan.maxWarehouses && plan.maxWarehouses < 9000 ? `${plan.maxWarehouses} คลัง` : 'ไม่จำกัด'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-amber-400" />
                        <span>จำนวนสินค้า (SKUs)</span>
                      </span>
                      <span className="font-bold text-white">
                        {plan.maxProducts && plan.maxProducts < 900000 ? `${plan.maxProducts.toLocaleString()} SKUs` : 'ไม่จำกัด'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-purple-400" />
                        <span>บริษัท/สาขาในเครือ</span>
                      </span>
                      <span className="font-bold text-white">
                        {plan.maxCompanies && plan.maxCompanies < 9000 ? `${plan.maxCompanies} สาขา` : 'ไม่จำกัด'}
                      </span>
                    </div>
                  </div>

                  {/* Feature Flags Preview */}
                  <div className="mt-5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      ฟีเจอร์สำคัญในแพ็กเกจ ({plan.features?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.features?.slice(0, 8).map((f) => (
                        <span
                          key={f}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800/90 text-slate-300 border border-slate-700/60"
                        >
                          {f}
                        </span>
                      ))}
                      {(plan.features?.length || 0) > 8 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-300">
                          +{(plan.features?.length || 0) - 8} ฟีเจอร์เพิ่มเติม
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-purple-800/60 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white">แก้ไขเงื่อนไข & โควตาแพ็กเกจ</h3>
                <p className="text-[11px] text-purple-400 font-bold">{editingPlan.name} ({editingPlan.code})</p>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ราคาต่อเดือน (บาท THB)
                </label>
                <input
                  type="number"
                  value={editPriceThb}
                  onChange={(e) => setEditPriceThb(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ผู้ใช้งานสูงสุด (Users)
                  </label>
                  <input
                    type="number"
                    value={editMaxUsers}
                    onChange={(e) => setEditMaxUsers(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-500">9999 = ไม่จำกัด</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    คลังสินค้าสูงสุด (Warehouses)
                  </label>
                  <input
                    type="number"
                    value={editMaxWarehouses}
                    onChange={(e) => setEditMaxWarehouses(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-slate-500">9999 = ไม่จำกัด</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    จำนวน SKUs สูงสุด
                  </label>
                  <input
                    type="number"
                    value={editMaxProducts}
                    onChange={(e) => setEditMaxProducts(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    สาขา/บริษัทย่อย (Branches)
                  </label>
                  <input
                    type="number"
                    value={editMaxCompanies}
                    onChange={(e) => setEditMaxCompanies(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingPlan(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                disabled={saving}
                onClick={handleSavePlan}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition cursor-pointer"
              >
                {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
