import React, { useRef, useEffect, useState } from 'react';
import { Search, Bell, Sun, Moon, Building2, Command, Menu } from 'lucide-react';
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
  onMobileMenuToggle?: () => void;
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
  onMobileMenuToggle,
}) => {
  const t = getTranslation(lang);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform));
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept Ctrl+F or ⌘+F (รองรับทั้งแป้นพิมพ์ภาษาอังกฤษ และภาษาไทย 'ด'/'โ')
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.code === 'KeyF' || e.key?.toLowerCase() === 'f' || e.key === 'ด' || e.key === 'โ')
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      className={`h-14 px-4 md:px-6 border-b flex items-center justify-between sticky top-0 z-30 transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800 text-slate-50'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* 1. Mobile Hamburger & User Greeting */}
      <div className="flex items-center gap-2.5">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className={`p-1.5 rounded-lg border md:hidden transition ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title="Open Mobile Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        <h1
          className={`text-sm md:text-base font-extrabold tracking-tight truncate max-w-[140px] sm:max-w-[220px] md:max-w-none ${
            theme === 'dark' ? 'text-slate-50' : 'text-slate-900'
          }`}
        >
          {lang === 'th' ? `สวัสดี, ${user.name.split(' ')[0]}!` : `Hello, ${user.name.split(' ')[0]}!`}
        </h1>
      </div>

      {/* Center Search Input */}
      <div className="hidden md:flex items-center w-72 lg:w-96 relative">
        <Search className={`w-4 h-4 absolute left-3 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.searchPlaceholder}
          className={`w-full pl-9 pr-16 py-1.5 rounded-lg text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400'
              : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500'
          }`}
        />
        <div
          onClick={() => {
            searchInputRef.current?.focus();
            searchInputRef.current?.select();
          }}
          className={`absolute right-2.5 flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded border font-mono cursor-pointer select-none ${
            theme === 'dark' ? 'text-slate-400 bg-slate-700/80 border-slate-600' : 'text-slate-600 bg-slate-200/80 border-slate-300'
          }`}
          title={isMac ? 'Command + F' : 'Ctrl + F'}
        >
          {isMac ? <Command className="w-3 h-3 inline" /> : <span>Ctrl</span>}
          <span>F</span>
        </div>
      </div>

      {/* Right Controls & Tools */}
      <div className="flex items-center gap-2.5">
        {/* Tenant Selector */}
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${
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
          className={`flex items-center p-0.5 rounded-lg border text-xs font-bold transition ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
          }`}
        >
          <button
            onClick={() => onLanguageChange('th')}
            className={`px-2 py-0.5 rounded-md transition ${
              lang === 'th'
                ? 'bg-blue-600 text-white shadow-xs font-black'
                : theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            TH
          </button>
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-2 py-0.5 rounded-md transition ${
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
          className={`p-1.5 rounded-lg border text-xs font-medium transition ${
            theme === 'dark'
              ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
              : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
          }`}
          title={theme === 'dark' ? t.lightMode : t.darkMode}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-slate-800" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            className={`p-1.5 rounded-lg border transition relative ${
              theme === 'dark'
                ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
