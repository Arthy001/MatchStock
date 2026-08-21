import React, { useState, useEffect } from 'react';
import { Language, ThemeMode, Tenant, User } from './types';
import { LoginView } from './components/LoginView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MasterDataManagement } from './components/MasterDataManagement';
import { StockTransactions } from './components/StockTransactions';
import { MobileBarcodeScanner } from './components/MobileBarcodeScanner';
import { CycleCountManagement } from './components/CycleCountManagement';
import { OrdersManagement } from './components/OrdersManagement';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { getTranslation } from './i18n';
import { LayoutDashboard, Boxes, ShoppingCart, ShoppingBag, BarChart3, Settings } from 'lucide-react';

import { authService } from './services/auth.service';

const LIVE_TENANTS: Tenant[] = [
  {
    id: 'f97fe2dc-486e-4054-931c-aadf92823e69',
    name: 'WH-Bangkok Center (MatchStock Demo)',
    code: 'WH-BKK-01',
    plan: 'Enterprise Multi-Tenant',
    features: { masterData: true, inventory: true, sales: true, purchases: true, reports: true, settings: true },
  },
  {
    id: '35213af2-d412-4be7-bcc0-a972ed233e73',
    name: 'Acme Industrial Supplies (Growth)',
    code: 'ACME-01',
    plan: 'Growth Plan',
    features: { masterData: true, inventory: true, sales: true, purchases: true, reports: true, settings: true },
  },
];

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lang, setLang] = useState<Language>('th');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('f97fe2dc-486e-4054-931c-aadf92823e69');
  const [activeTab, setActiveTab] = useState<string>('masterData');
  const [activeMasterSubTab, setActiveMasterSubTab] = useState<'rbac' | 'products' | 'units' | 'barcodes' | 'warehouses' | 'suppliers'>('products');
  const [activeInventorySubTab, setActiveInventorySubTab] = useState<'all' | 'receive' | 'issue' | 'transfer' | 'adjustment' | 'scanner' | 'cycleCount'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [user, setUser] = useState<User>({
    id: '836da6be-afef-410b-9d2f-36d58e4c4109',
    name: 'Kittisak Prasertkul (Admin)',
    email: 'admin@matchstock.com',
    role: 'admin',
    tenantId: 'f97fe2dc-486e-4054-931c-aadf92823e69',
    tenantName: 'WH-Bangkok Center (MatchStock Demo)',
  });

  const t = getTranslation(lang);

  // Restore live session from localStorage on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem('matchstock_token');
    const savedUser = localStorage.getItem('matchstock_user');
    const savedTenantId = localStorage.getItem('matchstock_tenant_id');

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser({
          id: parsed.id || 'usr-001',
          name: parsed.fullName || parsed.name || parsed.email?.split('@')[0] || 'User',
          email: parsed.email || '',
          role: parsed.role || 'admin',
          tenantId: savedTenantId || parsed.tenantId || 'f97fe2dc-486e-4054-931c-aadf92823e69',
          tenantName: (savedTenantId === '35213af2-d412-4be7-bcc0-a972ed233e73')
            ? 'Acme Industrial Supplies'
            : 'WH-Bangkok Center (MatchStock Demo)',
        });
        if (savedTenantId) setSelectedTenantId(savedTenantId);
        setIsLoggedIn(true);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
  }, []);

  // Sync theme class with document root
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
    setSelectedTenantId(loggedInUser.tenantId);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // If not logged in, show Clean Login Screen
  if (!isLoggedIn) {
    return (
      <div className={theme === 'dark' ? 'dark bg-slate-950 text-slate-50' : 'bg-slate-100 text-slate-900'}>
        <LoginView
          lang={lang}
          onLanguageChange={setLang}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          tenants={LIVE_TENANTS}
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
          features={LIVE_TENANTS.find((t) => t.id === selectedTenantId)?.features}
          activeTab={activeTab}
          activeSubTab={activeTab === 'inventory' ? activeInventorySubTab : activeMasterSubTab}
          onTabChange={setActiveTab}
          onSubTabChange={(sub) => {
            if (activeTab === 'inventory') {
              setActiveInventorySubTab(sub as any);
            } else {
              setActiveMasterSubTab(sub as any);
            }
          }}
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
            tenants={LIVE_TENANTS}
            selectedTenantId={selectedTenantId}
            onTenantSelect={setSelectedTenantId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Content Body Container */}
          <main className="flex-1 p-6 md:p-8 max-w-[1600px] w-full mx-auto space-y-6">
            {activeTab === 'masterData' && (
              <MasterDataManagement
                lang={lang}
                theme={theme}
                searchQuery={searchQuery}
                activeSubTab={activeMasterSubTab}
                onSubTabChange={(sub) => setActiveMasterSubTab(sub)}
              />
            )}

            {activeTab === 'inventory' && activeInventorySubTab === 'scanner' && (
              <MobileBarcodeScanner
                lang={lang}
                theme={theme}
                searchQuery={searchQuery}
                onSelectAction={(actionType, product) => {
                  if (actionType === 'RECEIVE') setActiveInventorySubTab('receive');
                  else if (actionType === 'ISSUE') setActiveInventorySubTab('issue');
                  else if (actionType === 'TRANSFER') setActiveInventorySubTab('transfer');
                  else if (actionType === 'ADJUSTMENT') setActiveInventorySubTab('adjustment');
                }}
              />
            )}

            {activeTab === 'inventory' && activeInventorySubTab === 'cycleCount' && (
              <CycleCountManagement
                lang={lang}
                theme={theme}
                searchQuery={searchQuery}
                onNavigateToAdjustment={() => {
                  setActiveInventorySubTab('adjustment');
                }}
              />
            )}

            {activeTab === 'inventory' &&
              activeInventorySubTab !== 'scanner' &&
              activeInventorySubTab !== 'cycleCount' && (
                <StockTransactions
                  lang={lang}
                  theme={theme}
                  searchQuery={searchQuery}
                  activeSubTab={activeInventorySubTab as any}
                  onSubTabChange={(sub) => setActiveInventorySubTab(sub as any)}
                />
              )}

            {activeTab === 'sales' && (
              <OrdersManagement
                type="SALES"
                lang={lang}
                theme={theme}
                searchQuery={searchQuery}
                onNavigateToStockAction={(actionType, order) => {
                  setActiveTab('inventory');
                  setActiveInventorySubTab('issue');
                }}
              />
            )}

            {activeTab === 'purchases' && (
              <OrdersManagement
                type="PURCHASE"
                lang={lang}
                theme={theme}
                searchQuery={searchQuery}
                onNavigateToStockAction={(actionType, order) => {
                  setActiveTab('inventory');
                  setActiveInventorySubTab('receive');
                }}
              />
            )}

            {(activeTab === 'reports' || activeTab === 'dashboard') && (
              <ReportsAnalytics
                lang={lang}
                theme={theme}
                searchQuery={searchQuery}
                onNavigateToPO={() => {
                  setActiveTab('purchases');
                }}
              />
            )}

            {activeTab !== 'masterData' &&
              activeTab !== 'inventory' &&
              activeTab !== 'sales' &&
              activeTab !== 'purchases' &&
              activeTab !== 'reports' &&
              activeTab !== 'dashboard' && (
                <div
                  className={`p-12 text-center rounded-2xl border ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-4">
                    <Settings className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black capitalize text-slate-900 dark:text-slate-50">{activeTab} Module</h3>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
                    โมดูลนี้พร้อมสำหรับการเชื่อมต่อ API ใน Sprint ถัดไป ท่านสามารถดูหน้าอื่น ๆ ได้จากเมนูซ้ายมือ
                  </p>
                </div>
              )}
          </main>
        </div>
      </div>
    </div>
  );
}
