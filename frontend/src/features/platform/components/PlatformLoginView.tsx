import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, ArrowRight, ArrowLeft, Crown, Sparkles, CheckCircle2 } from 'lucide-react';
import { platformAuthService, DEMO_PLATFORM_ADMINS } from '../../../services/platformAuth.service';
import { PlatformAdminRole, PlatformAdminUser } from '../../../types/platform';

interface PlatformLoginViewProps {
  onLoginSuccess: (admin: PlatformAdminUser) => void;
  onBackToTenant: () => void;
}

export const PlatformLoginView: React.FC<PlatformLoginViewProps> = ({
  onLoginSuccess,
  onBackToTenant,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await platformAuthService.login({ email, password });
      if (res.success && res.admin) {
        onLoginSuccess(res.admin);
      } else {
        setErrorMsg(res.message || 'เข้าสู่ระบบล้มเหลว');
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role: PlatformAdminRole) => {
    if (role === 'super_admin') {
      setEmail('superadmin@matchstock.internal');
      setPassword('SmyeQPTmCRmvb2RpUFzMVmtOAa1!');
    } else if (role === 'billing') {
      setEmail('billing@matchstock.com');
      setPassword('Passw0rd!');
    } else if (role === 'support') {
      setEmail('support@matchstock.com');
      setPassword('Passw0rd!');
    }
    const admin = platformAuthService.quickLoginAs(role);
    onLoginSuccess(admin);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Return to Tenant App Link */}
      <div className="absolute top-6 left-6">
        <button
          onClick={onBackToTenant}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับไปหน้าเข้าระบบลูกค้า (Tenant App)</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-slate-900/90 border border-purple-800/40 rounded-3xl p-8 shadow-2xl shadow-purple-950/50 backdrop-blur-xl relative z-10">
        {/* Brand Icon Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 shadow-xl shadow-purple-600/30 mb-3">
            <ShieldAlert className="w-9 h-9 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-bold mb-2">
            <Crown className="w-3 h-3 text-amber-400" />
            <span>PLATFORM CONTROL PLANE</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            SuperAdmin Sign-in
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            พอร์ทัลจัดการระบบส่วนกลาง MatchStock
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              อีเมลเจ้าหน้าที่ (Platform Admin Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@matchstock.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบส่วนกลาง'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            หรือทดสอบด่วน (Quick Demo Roles)
          </span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Quick Demo Role Switcher */}
        <div className="space-y-2">
          <button
            onClick={() => handleQuickLogin('super_admin')}
            className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                S
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition">
                  {DEMO_PLATFORM_ADMINS.super_admin.fullName}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">superadmin@matchstock.internal</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              SuperAdmin
            </span>
          </button>

          <button
            onClick={() => handleQuickLogin('billing')}
            className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                B
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition">
                  {DEMO_PLATFORM_ADMINS.billing.fullName}
                </p>
                <p className="text-[10px] text-slate-400">สิทธิ์การเงิน (ปรับราคาแผน, ตรวจสอบบิลทุกลูกค้า)</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Billing
            </span>
          </button>

          <button
            onClick={() => handleQuickLogin('support')}
            className="w-full text-left p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 transition flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs">
                U
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition">
                  {DEMO_PLATFORM_ADMINS.support.fullName}
                </p>
                <p className="text-[10px] text-slate-400">สิทธิ์ซัพพอร์ต (ตรวจสอบสถานะและข้อมูล Tenant)</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
              Support
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
