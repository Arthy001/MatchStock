import React, { useState } from 'react';
import { Package, ShieldCheck, Lock, User as UserIcon, Sun, Moon, AlertCircle, ArrowRight } from 'lucide-react';
import { Language, ThemeMode, Tenant, User } from '../types';
import { getTranslation } from '../i18n';

interface LoginViewProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  tenants: Tenant[];
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  lang,
  onLanguageChange,
  theme,
  onThemeToggle,
  tenants,
  onLoginSuccess,
}) => {
  const t = getTranslation(lang);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === '123') {
      setErrorMsg('');
      const defaultTenant = tenants[0];
      const mockUser: User = {
        id: 'usr-001',
        name: 'Kittisak Prasertkul (Admin)',
        email: 'admin@matchstock.com',
        role: 'admin',
        tenantId: defaultTenant.id,
        tenantName: defaultTenant.name,
      };
      onLoginSuccess(mockUser);
    } else {
      setErrorMsg(t.invalidCreds);
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
            <p className="text-xs text-sky-600 font-medium leading-normal">{t.appSubtitle}</p>
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
          className={`w-full max-w-md p-8 rounded-2xl border shadow-xl backdrop-blur-md transition ${
            theme === 'dark'
              ? 'bg-slate-900/90 border-slate-800 text-slate-50 shadow-sky-950/40'
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50'
          }`}
        >
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-sky-500/10 text-sky-600 mb-3 border border-sky-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">{t.loginTitle}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.welcome}</p>
          </div>

          {/* Demo Hint Banner */}
          <div className="mb-6 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-sky-600" />
            <span>{t.loginHint}</span>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                {t.username}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="123"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-sky-500/50 focus:outline-none transition ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold text-sm shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 transition transform active:scale-95 focus:ring-2 focus:ring-sky-500/50"
            >
              <span>{t.loginBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">{t.copyright}</div>
    </div>
  );
};
