import React from 'react';
import { Users, ShieldCheck, Key, Lock, CheckCircle2 } from 'lucide-react';
import { DEMO_PLATFORM_ADMINS } from '../../../services/platformAuth.service';

export const PlatformAdminsView: React.FC = () => {
  const admins = Object.values(DEMO_PLATFORM_ADMINS);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            <span>จัดการทีมงานส่วนกลาง (Platform Admin Team)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            บัญชีผู้ดูแลระบบส่วนกลาง กำหนดบทบาทและระดับสิทธิ์การเข้าถึง Control Plane
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {admins.map((adm) => (
          <div
            key={adm.id}
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {adm.role.replace('_', ' ')}
                </span>
                {adm.mfaEnabled ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    MFA Active
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">MFA Inactive</span>
                )}
              </div>

              <h3 className="text-base font-bold text-white">{adm.fullName}</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{adm.email}</p>

              <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-purple-300">ขอบเขตสิทธิ์ (Permission Scope):</p>
                <p className="text-[11px] text-slate-400">
                  {adm.role === 'super_admin' && 'สิทธิ์เต็มทุกระบบ (จัดการผู้เช่า, ปรับแต่งแพ็กเกจ, จัดการทีมงานแอดมิน)'}
                  {adm.role === 'billing' && 'จัดการด้านการเงิน (ปรับโครงสร้างราคาแพ็กเกจ, ตรวจสอบบิลและรอบบิล)'}
                  {adm.role === 'support' && 'ดูแลช่วยเหลือลูกค้า (ตรวจสอบสถานะและสถิติองค์กรผู้เช่า ไม่สามารถแก้ไขราคาได้)'}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>สถานะ: ปกติ</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> ใช้งานอยู่
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
