import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { DashboardOverview } from './components/DashboardOverview';
import { SettingsView } from './components/SettingsView';
import { getTranslation } from './i18n';
import { LayoutDashboard, Boxes, ShoppingCart, ShoppingBag, BarChart3, Settings, Database, Menu, QrCode } from 'lucide-react';

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

const getInitialNavState = (pathname: string) => {
  const path = pathname.toLowerCase();
  let tab = 'masterData';
  let masterSub: 'rbac' | 'products' | 'companies' | 'units' | 'barcodes' | 'warehouses' | 'suppliers' = 'products';
  let inventorySub: 'all' | 'receive' | 'issue' | 'transfer' | 'adjustment' | 'scanner' | 'cycleCount' = 'all';

  if (path.startsWith('/companies')) {
    tab = 'masterData';
    masterSub = 'companies';
  } else if (path.startsWith('/units')) {
    tab = 'masterData';
    masterSub = 'units';
  } else if (path.startsWith('/warehouses')) {
    tab = 'masterData';
    masterSub = 'warehouses';
  } else if (path.startsWith('/suppliers')) {
    tab = 'masterData';
    masterSub = 'suppliers';
  } else if (path.startsWith('/rbac') || path.startsWith('/users')) {
    tab = 'masterData';
    masterSub = 'rbac';
  } else if (path.startsWith('/barcodes')) {
    tab = 'masterData';
    masterSub = 'barcodes';
  } else if (path.startsWith('/products')) {
    tab = 'masterData';
    masterSub = 'products';
  } else if (path.startsWith('/master-data')) {
    tab = 'masterData';
    if (path.includes('/companies')) masterSub = 'companies';
    else if (path.includes('/units')) masterSub = 'units';
    else if (path.includes('/warehouses')) masterSub = 'warehouses';
    else if (path.includes('/suppliers')) masterSub = 'suppliers';
    else if (path.includes('/rbac')) masterSub = 'rbac';
    else if (path.includes('/barcodes')) masterSub = 'barcodes';
    else masterSub = 'products';
  } else if (path.startsWith('/inventory')) {
    tab = 'inventory';
    if (path.includes('/receive')) inventorySub = 'receive';
    else if (path.includes('/issue')) inventorySub = 'issue';
    else if (path.includes('/transfer')) inventorySub = 'transfer';
    else if (path.includes('/adjustment')) inventorySub = 'adjustment';
    else if (path.includes('/scanner')) inventorySub = 'scanner';
    else if (path.includes('/cycle-count')) inventorySub = 'cycleCount';
  } else if (path.startsWith('/orders') || path.startsWith('/sales')) {
    tab = 'sales';
  } else if (path.startsWith('/purchases')) {
    tab = 'purchases';
  } else if (path.startsWith('/reports')) {
    tab = 'reports';
  } else if (path.startsWith('/settings')) {
    tab = 'settings';
  } else if (path.startsWith('/dashboard')) {
    tab = 'dashboard';
  }

  return { tab, masterSub, inventorySub };
};

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const token = localStorage.getItem('matchstock_token');
    const user = localStorage.getItem('matchstock_user');
    return Boolean(token || user);
  });
  const [lang, setLang] = useState<Language>('th');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('f97fe2dc-486e-4054-931c-aadf92823e69');

  const [activeTab, setActiveTab] = useState<string>(() => getInitialNavState(location.pathname).tab);
  const [activeMasterSubTab, setActiveMasterSubTab] = useState<'rbac' | 'products' | 'companies' | 'units' | 'barcodes' | 'warehouses' | 'suppliers'>(() => getInitialNavState(location.pathname).masterSub);
  const [activeInventorySubTab, setActiveInventorySubTab] = useState<'all' | 'receive' | 'issue' | 'transfer' | 'adjustment' | 'scanner' | 'cycleCount'>(() => getInitialNavState(location.pathname).inventorySub);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const [user, setUser] = useState<User>({
    id: '836da6be-afef-410b-9d2f-36d58e4c4109',
    name: 'Kittisak Prasertkul (Admin)',
    email: 'admin@matchstock.com',
    role: 'admin',
    tenantId: 'f97fe2dc-486e-4054-931c-aadf92823e69',
    tenantName: 'WH-Bangkok Center (MatchStock Demo)',
  });

  const t = getTranslation(lang);

  // Synchronize Active Tab & Subtab from browser URL path on URL changes
  useEffect(() => {
    const nav = getInitialNavState(location.pathname);
    setActiveTab(nav.tab);
    setActiveMasterSubTab(nav.masterSub);
    setActiveInventorySubTab(nav.inventorySub);
  }, [location.pathname]);

  // Navigate when Tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'masterData') navigate(`/${activeMasterSubTab}`);
    else if (tab === 'inventory') {
      const invPath = activeInventorySubTab === 'all' ? '' : `/${activeInventorySubTab === 'cycleCount' ? 'cycle-count' : activeInventorySubTab}`;
      navigate(`/inventory${invPath}`);
    } else if (tab === 'sales') navigate('/orders');
    else if (tab === 'purchases') navigate('/purchases');
    else if (tab === 'reports') navigate('/reports');
    else if (tab === 'settings') navigate('/settings');
    else if (tab === 'dashboard') navigate('/dashboard');
  };

  // Navigate when Master Data Subtab changes
  const handleMasterSubTabChange = (subTab: 'rbac' | 'products' | 'companies' | 'units' | 'barcodes' | 'warehouses' | 'suppliers') => {
    setActiveMasterSubTab(subTab);
    navigate(`/${subTab}`);
  };

  // Navigate when Inventory Subtab changes
  const handleInventorySubTabChange = (subTab: 'all' | 'receive' | 'issue' | 'transfer' | 'adjustment' | 'scanner' | 'cycleCount') => {
    setActiveInventorySubTab(subTab);
    const subPath = subTab === 'all' ? '' : `/${subTab === 'cycleCount' ? 'cycle-count' : subTab}`;
    navigate(`/inventory${subPath}`);
  };

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

  // Auto-redirect to login screen on 401 Unauthorized (Expired / Invalid Token)
  useEffect(() => {
    const handleUnauthorized = () => {
      authService.logout();
      setIsLoggedIn(false);
      navigate('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate]);

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
    navigate('/products');
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    navigate('/login');
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
          onTabChange={handleTabChange}
          onSubTabChange={(sub) => {
            if (activeTab === 'inventory') {
              handleInventorySubTabChange(sub as any);
            } else {
              handleMasterSubTabChange(sub as any);
            }
          }}
          onLogout={handleLogout}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebarCollapse}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
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
            onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          />

          {/* Content Body Container */}
          <main className="flex-1 p-3.5 sm:p-5 md:p-8 max-w-[1600px] w-full mx-auto space-y-4 sm:space-y-6 pb-24 md:pb-8">
            {activeTab === 'masterData' && (
              <MasterDataManagement
                lang={lang}
                theme={theme}
                searchQuery={searchQuery}
                activeSubTab={activeMasterSubTab}
                onSubTabChange={handleMasterSubTabChange}
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
                  handleInventorySubTabChange('adjustment');
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
                  onSubTabChange={(sub) => handleInventorySubTabChange(sub as any)}
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

            {activeTab === 'dashboard' && (
              <DashboardOverview
                lang={lang}
                theme={theme}
                searchQuery={searchQuery}
                onNavigateTab={(tab, sub) => {
                  setActiveTab(tab);
                  if (sub) {
                    if (tab === 'masterData') setActiveMasterSubTab(sub as any);
                    else if (tab === 'inventory') setActiveInventorySubTab(sub as any);
                  }
                }}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsAnalytics
                lang={lang}
                theme={theme}
                searchQuery={searchQuery}
                onNavigateToPO={() => {
                  setActiveTab('purchases');
                }}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                lang={lang}
                theme={theme}
                searchQuery={searchQuery}
              />
            )}

            {activeTab !== 'masterData' &&
              activeTab !== 'inventory' &&
              activeTab !== 'sales' &&
              activeTab !== 'purchases' &&
              activeTab !== 'reports' &&
              activeTab !== 'dashboard' &&
              activeTab !== 'settings' && (
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

        {/* 📱 Mobile Bottom Navigation Bar (App Bar) */}
        <nav
          className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md flex items-center justify-around py-1.5 px-2 transition-colors duration-300 ${
            theme === 'dark'
              ? 'bg-slate-900/95 border-slate-800 text-slate-400'
              : 'bg-white/95 border-slate-200 text-slate-500 shadow-lg shadow-slate-900/10'
          }`}
        >
          {/* 1. Dashboard */}
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
              activeTab === 'dashboard'
                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px]">{lang === 'th' ? 'แดชบอร์ด' : 'Home'}</span>
          </button>

          {/* 2. Master Data */}
          <button
            onClick={() => handleTabChange('masterData')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
              activeTab === 'masterData'
                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span className="text-[10px]">{lang === 'th' ? 'ข้อมูลหลัก' : 'Master'}</span>
          </button>

          {/* 3. Central Barcode Quick Scanner */}
          <button
            onClick={() => {
              setActiveTab('inventory');
              setActiveInventorySubTab('scanner');
            }}
            title="Scan Barcode"
            className="flex flex-col items-center justify-center -mt-6 bg-gradient-to-tr from-blue-600 to-sky-500 text-white w-12 h-12 rounded-full shadow-lg shadow-blue-600/40 border-2 border-white dark:border-slate-900 active:scale-95 transition"
          >
            <QrCode className="w-5 h-5" />
          </button>

          {/* 4. Inventory / Stock */}
          <button
            onClick={() => handleTabChange('inventory')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition ${
              activeTab === 'inventory' && activeInventorySubTab !== 'scanner'
                ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
                : 'hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span className="text-[10px]">{lang === 'th' ? 'สต็อก' : 'Stock'}</span>
          </button>

          {/* 5. Mobile Drawer Menu Toggle */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg transition hover:text-slate-900 dark:hover:text-slate-200"
          >
            <Menu className="w-4 h-4" />
            <span className="text-[10px]">{lang === 'th' ? 'เมนู' : 'Menu'}</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
