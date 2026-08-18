import React, { useState, useEffect } from 'react';
import { Language, ThemeMode, Tenant, User } from './types';
import { LoginView } from './components/LoginView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MasterDataManagement } from './components/MasterDataManagement';
import { getTranslation } from './i18n';
import { LayoutDashboard, Boxes, ShoppingCart, ShoppingBag, BarChart3, Settings } from 'lucide-react';

const MOCK_TENANTS: Tenant[] = [
  {
    id: 'tenant-bkk',
    name: 'WH-Bangkok Center',
    code: 'WH-BKK-01',
    plan: 'Enterprise Multi-Tenant',
    features: { masterData: true, inventory: true, sales: true, purchases: true, reports: true, settings: true },
  },
  {
    id: 'tenant-cnx',
    name: 'WH-Chiangmai Branch',
    code: 'WH-CNX-02',
    plan: 'Standard Plan',
    features: { masterData: true, inventory: true, sales: false, purchases: true, reports: true, settings: false },
  },
  {
    id: 'tenant-pkt',
    name: 'WH-Phuket Distribution',
    code: 'WH-PKT-03',
    plan: 'Standard Plan',
    features: { masterData: true, inventory: true, sales: true, purchases: false, reports: false, settings: false },
  },
];

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lang, setLang] = useState<Language>('th');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('tenant-bkk');
  const [activeTab, setActiveTab] = useState<string>('masterData');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [user, setUser] = useState<User>({
    id: 'usr-001',
    name: 'Kittisak Prasertkul (Admin)',
    email: 'admin@matchstock.com',
    role: 'admin',
    tenantId: 'tenant-bkk',
    tenantName: 'WH-Bangkok Center',
  });

  const t = getTranslation(lang);

  // Sync theme class with document root to ensure 100% cross-browser consistency (Chrome, Edge, Firefox, Safari)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // If not logged in, show Clean Login Screen (Username & Password only)
  if (!isLoggedIn) {
    return (
      <div className={theme === 'dark' ? 'dark bg-slate-950 text-slate-50' : 'bg-slate-100 text-slate-900'}>
        <LoginView
          lang={lang}
          onLanguageChange={setLang}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          tenants={MOCK_TENANTS}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // Once logged in, show main StockMind Blue-White Layout with high contrast Light/Dark mode
  return (
    <div className={theme === 'dark' ? 'dark bg-slate-950 text-slate-50' : 'bg-slate-100 text-slate-900'}>
      <div
        className={`min-h-screen flex font-sans transition-colors duration-300 ${
          theme === 'dark' ? 'bg-slate-950 text-slate-50' : 'bg-slate-100 text-slate-900'
        }`}
      >
        {/* Left Sidebar */}
        <Sidebar
          lang={lang}
          theme={theme}
          user={user}
          features={MOCK_TENANTS.find((t) => t.id === selectedTenantId)?.features}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebarCollapse}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <Header
            lang={lang}
            onLanguageChange={setLang}
            theme={theme}
            onThemeToggle={handleThemeToggle}
            user={user}
            tenants={MOCK_TENANTS}
            selectedTenantId={selectedTenantId}
            onTenantSelect={setSelectedTenantId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Content Body Container */}
          <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto space-y-6">
            {activeTab === 'masterData' && (
              <MasterDataManagement lang={lang} theme={theme} searchQuery={searchQuery} />
            )}

            {activeTab !== 'masterData' && (
              <div
                className={`p-12 text-center rounded-2xl border ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'dashboard' && <LayoutDashboard className="w-8 h-8" />}
                  {activeTab === 'inventory' && <Boxes className="w-8 h-8" />}
                  {activeTab === 'sales' && <ShoppingCart className="w-8 h-8" />}
                  {activeTab === 'purchases' && <ShoppingBag className="w-8 h-8" />}
                  {activeTab === 'reports' && <BarChart3 className="w-8 h-8" />}
                  {activeTab === 'settings' && <Settings className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-black capitalize text-slate-900 dark:text-slate-50">{activeTab} Module</h3>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
                  โมดูลนี้พร้อมสำหรับการเชื่อมต่อ API ใน Sprint ถัดไป ท่านสามารถดูหน้าแรก **Master Data Management** ได้โดยกดปุ่มเลือกเมนูทางซ้ายมือ
                </p>
                <button
                  onClick={() => setActiveTab('masterData')}
                  className="mt-6 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                >
                  สลับกลับไปหน้า Master Data Management
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
