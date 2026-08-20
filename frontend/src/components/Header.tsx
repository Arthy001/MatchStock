import React from 'react';
import { Search, Bell, Sun, Moon, Building2, Command } from 'lucide-react';
import { Language, ThemeMode, Tenant, User } from '../types';
import { getTranslation } from '../i18n';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  user: User;
  tenants: Tenant[];
  selectedTenantId: string;
  onTenantSelect: (tenantId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  theme,
  onThemeToggle,
  user,
  tenants,
  selectedTenantId,
  onTenantSelect,
  searchQuery,
  onSearchChange,
}) => {
  const t = getTranslation(lang);

  return (
    <header
      className={`h-16 px-6 border-b flex items-center justify-between sticky top-0 z-30 transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800 text-slate-50'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* 1. Explicit text-slate-900 in Light mode */}
      <div>
        <h1
          className={`text-base font-extrabold tracking-tight ${
            theme === 'dark' ? 'text-slate-50' : 'text-slate-900'
          }`}
        >
          {lang === 'th' ? `สวัสดี, ${user.name}!` : `Hello, ${user.name}!`}
        </h1>
      </div>

      {/* Center Search Input */}
      <div className="hidden md:flex items-center w-72 lg:w-96 relative">
        <Search className={`w-4 h-4 absolute left-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.searchPlaceholder}
          className={`w-full pl-9 pr-14 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400'
              : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500'
          }`}
        />
        <div className={`absolute right-2.5 flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-mono ${
          theme === 'dark' ? 'text-slate-400 bg-slate-700/80 border-slate-600' : 'text-slate-600 bg-slate-200/80 border-slate-300'
        }`}>
          <Command className="w-3 h-3" /> F
        </div>
      </div>

      {/* Right Controls & Tools */}
      <div className="flex items-center gap-3">
        {/* Tenant Selector */}
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-100 border-slate-300 text-slate-900'
        }`}>
          <Building2 className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          <select
            value={selectedTenantId}
            onChange={(e) => onTenantSelect(e.target.value)}
            className={`bg-transparent border-none focus:outline-none font-bold cursor-pointer text-xs ${
              theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
            }`}
          >
            {tenants.map((ten) => (
              <option key={ten.id} value={ten.id} className={theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}>
                {ten.name}
              </option>
            ))}
          </select>
        </div>

        {/* ISO Segmented Language Control [ TH | EN ] */}
        <div
          className={`flex items-center p-0.5 rounded-xl border text-xs font-bold transition ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
          }`}
        >
          <button
            onClick={() => onLanguageChange('th')}
            className={`px-2.5 py-1 rounded-lg transition ${
              lang === 'th'
                ? 'bg-blue-600 text-white shadow-xs font-black'
                : theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            TH
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-2.5 py-1 rounded-lg transition ${
              lang === 'en'
                ? 'bg-blue-600 text-white shadow-xs font-black'
                : theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            EN
          </button>
        </div>

        {/* Theme Toggle (Sun/Moon) */}
        <button
          onClick={onThemeToggle}
          className={`p-2 rounded-xl border text-xs font-medium transition ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
              : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
          }`}
          title={theme === 'dark' ? t.lightMode : t.darkMode}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-800" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            className={`p-2 rounded-xl border transition relative ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
