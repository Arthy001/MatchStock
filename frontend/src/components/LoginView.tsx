import React, { useState } from 'react';
import { Package, ShieldCheck, Lock, Eye, EyeOff, Mail, Sun, Moon, AlertCircle, ArrowRight, Loader2, Sparkles, Check } from 'lucide-react';
import { Language, ThemeMode, Tenant, User } from '../types';
import { getTranslation } from '../i18n';
import { authService } from '../services/auth.service';

interface LoginViewProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  tenants: Tenant[];
  onLoginSuccess: (user: User) => void;
}

interface DemoAccount {
  tenantName: string;
  email: string;
  role: string;
  badge: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    tenantName: 'MatchStock Demo (Enterprise)',
    email: 'admin@matchstock.com',
    role: 'Admin',
    badge: 'Enterprise',
  },
  {
    tenantName: 'MatchStock Demo (Enterprise)',
    email: 'manager@matchstock.com',
    role: 'Manager',
    badge: 'Operations',
  },
  {
    tenantName: 'MatchStock Demo (Enterprise)',
    email: 'whstaff@matchstock.com',
    role: 'Warehouse Staff',
    badge: 'Inventory',
  },
  {
    tenantName: 'MatchStock Demo (Enterprise)',
    email: 'purchasing@matchstock.com',
    role: 'Purchasing Staff',
    badge: 'Procurement',
  },
  {
    tenantName: 'Acme Demo (Growth)',
    email: 'owner@acme-demo.test',
    role: 'Owner',
    badge: 'Growth Plan',
  },
];

export const LoginView: React.FC<LoginViewProps> = ({
  lang,
  onLanguageChange,
  theme,
  onThemeToggle,
  tenants,
  onLoginSuccess,
}) => {
  const t = getTranslation(lang);
  const [email, setEmail] = useState('admin@matchstock.com');
  const [password, setPassword] = useState('Passw0rd!');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number>(0);

  const handleSelectDemo = (account: DemoAccount, index: number) => {
    setSelectedDemoIndex(index);
    setEmail(account.email);
    setPassword('Passw0rd!');
    setErrorMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // 1. ยิง Login ไปยัง Live Backend API (Strict Mode)
      const res = await authService.login({
        email: email.trim(),
        password: password,
      });

      if (res && res.success) {
        const userObj = res.user || res.data?.user;
        const tenantObj = res.tenant || res.data?.tenant;

        if (userObj) {
          const loggedUser: User = {
            id: userObj.id,
            name: userObj.fullName || userObj.email.split('@')[0],
            email: userObj.email,
            role: (userObj.role as any) || 'admin',
            tenantId: userObj.tenantId || tenantObj?.id || 'f97fe2dc-486e-4054-931c-aadf92823e69',
            tenantName: tenantObj?.name || (userObj.email.includes('acme') ? 'Acme Industrial Supplies' : 'WH-Bangkok Center (Enterprise)'),
          };
          onLoginSuccess(loggedUser);
          return;
        }
      }
      setErrorMsg(res?.message || (lang === 'en' ? 'Authentication failed. Please check credentials.' : 'เข้าสู่ระบบไม่สำเร็จ ข้อมูลไม่ถูกต้อง'));
    } catch (err: any) {
      console.error('Strict Login Error from Backend API:', err.response?.data || err.message);
      const status = err.response?.status;
      const apiErrMsg = err.response?.data?.message || err.response?.data?.error || err.response?.data?.errors?.[0];

      if (status === 400) {
        setErrorMsg(apiErrMsg || (lang === 'en'
          ? 'Invalid request (400): Missing required fields or invalid format.'
          : 'ข้อมูลคำขอไม่ถูกต้อง (400 Bad Request): กรุณาตรวจสอบข้อมูลที่กรอก'));
      } else if (status === 500) {
        setErrorMsg(lang === 'en' 
          ? 'Backend Server Error (500): Database connection or internal server failure.' 
          : 'เซิร์ฟเวอร์หลังบ้านขัดข้อง (500 Internal Server Error): ฐานข้อมูลหรือระบบ Backend มีปัญหา');
      } else if (status === 401 || status === 403) {
        setErrorMsg(lang === 'en'
          ? 'Invalid email or password (401 Unauthorized).'
          : 'อีเมลหรือรหัสผ่านไม่ถูกต้อง (401 Unauthorized)');
      } else if (status === 404) {
        setErrorMsg(lang === 'en'
          ? 'Tenant or User not found (404).'
          : 'ไม่พบบัญชีผู้ใช้หรือ Tenant นี้ในระบบ (404)');
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setErrorMsg(lang === 'en'
          ? 'Network Error: Cannot connect to Backend Server (match-stock.ddns.net).'
          : 'ข้อผิดพลาดเครือข่าย: ไม่สามารถเชื่อมต่อไปยังเซิร์ฟเวอร์หลังบ้านได้ (Server ออฟไลน์)');
      } else {
        setErrorMsg(apiErrMsg || (lang === 'en' ? 'Authentication failed.' : 'เข้าสู่ระบบไม่สำเร็จ'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between transition-colors duration-300 leading-relaxed ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-slate-50'
          : 'bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-100 text-slate-900'
      }`}
    >
      {/* Top Bar Controls */}
      <div className="p-4 md:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              {t.appName}
            </h1>
            <p className="text-xs text-sky-600 font-medium leading-normal">
              {lang === 'en' ? 'Live API & Multi-Tenant Inventory' : 'ระบบจัดการคลังสินค้าอัจฉริยะ (Live API)'}
            </p>
          </div>
        </div>

        {/* ISO Segmented Language & Theme Switchers */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* ISO Segmented Language Control [ TH | EN ] */}
          <div
            className={`flex items-center p-0.5 rounded-xl border text-xs font-bold transition ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <button
              onClick={() => onLanguageChange('th')}
              className={`px-2.5 py-1 rounded-lg transition ${
                lang === 'th'
                  ? 'bg-sky-600 text-white shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              TH
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-lg transition ${
                lang === 'en'
                  ? 'bg-sky-600 text-white shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className={`p-2 rounded-xl border text-xs font-medium transition focus:ring-2 focus:ring-sky-500/50 ${
              theme === 'dark'
                ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-white border-slate-200 text-sky-600 hover:bg-slate-50 shadow-sm'
            }`}
            title={theme === 'dark' ? t.lightMode : t.darkMode}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Login Form Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className={`w-full max-w-lg p-6 sm:p-8 rounded-2xl border shadow-xl backdrop-blur-md transition ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800 text-slate-50 shadow-sky-950/40'
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50'
          }`}
        >
          <div className="text-center mb-5">
            <div className="inline-flex p-3 rounded-2xl bg-sky-500/10 text-sky-600 mb-2 border border-sky-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">{t.loginTitle}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'en' ? 'Live Swagger & Cloud Backend Connected' : 'เชื่อมต่อเซิร์ฟเวอร์จริง (Live Swagger API)'}
            </p>
          </div>

          {/* Quick Select Demo Accounts */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {lang === 'en' ? 'Quick 1-Click Test Accounts' : 'เลือกบัญชีทดสอบด่วน (1-Click Fill)'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc, idx) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleSelectDemo(acc, idx)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    selectedDemoIndex === idx
                      ? 'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold truncate">{acc.role}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold shrink-0">
                        {acc.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{acc.email}</p>
                  </div>
                  {selectedDemoIndex === idx && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                {lang === 'en' ? 'Email Address' : 'อีเมลผู้ใช้งาน (Email)'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@matchstock.com"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-sky-500/50 focus:outline-none transition ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passw0rd!"
                  required
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-sky-500/50 focus:outline-none transition ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition focus:outline-none"
                  title={showPassword ? (lang === 'en' ? 'Hide Password' : 'ซ่อนรหัสผ่าน') : (lang === 'en' ? 'Show Password' : 'แสดงรหัสผ่าน')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold text-sm shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 transition transform active:scale-95 focus:ring-2 focus:ring-sky-500/50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === 'en' ? 'Authenticating with Swagger...' : 'กำลังเข้าสู่ระบบผ่าน Live API...'}</span>
                </>
              ) : (
                <>
                  <span>{t.loginBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
        MatchStock © 2026 — Live API: <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono">https://match-stock.ddns.net/api/v1</code>
      </div>
    </div>
  );
};
