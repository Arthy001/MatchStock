import React, { useState } from 'react';
import {
  LayoutDashboard,
  Database,
  Boxes,
  ShoppingCart,
  ShoppingBag,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Package,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { Language, ThemeMode, User, SubscriptionFeatures } from '../types';
import { getTranslation } from '../i18n';

interface SidebarProps {
  lang: Language;
  theme: ThemeMode;
  user: User;
  features?: SubscriptionFeatures;
  activeTab: string;
  activeSubTab?: string;
  onTabChange: (tab: string) => void;
  onSubTabChange?: (subTab: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  lang,
  theme,
  user,
  features = {
    masterData: true,
    inventory: true,
    sales: true,
    purchases: true,
    reports: true,
    settings: true,
  },
  activeTab,
  activeSubTab = 'products',
  onTabChange,
  onSubTabChange,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const t = getTranslation(lang);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(true);
  const [isInventoryOpen, setIsInventoryOpen] = useState(true);

  const handleMenuItemClick = (tabKey: string) => {
    onTabChange(tabKey);
    if (onMobileClose) onMobileClose();
  };

  const renderSidebarContent = (collapsed: boolean) => (
    <>
      {/* Brand & Collapse Toggle Header */}
      <div>
        <div
          className={`h-14 border-b border-slate-800 flex items-center ${
            collapsed ? 'justify-center px-1' : 'justify-between px-4'
          }`}
        >
          {collapsed ? (
            /* When Collapsed: Clean Centered Toggle Button */
            <button
              onClick={onToggleCollapse}
              className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition shadow-xs border border-blue-500/30"
              title="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          ) : (
            /* When Expanded: Full Brand Logo + Text + Collapse Icon */
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <h2 className="font-extrabold text-base text-white tracking-wide truncate">
                    {t.appName}
                  </h2>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase truncate">
                      Multi-Tenant
                    </span>
                  </div>
                </div>
              </div>

              {onMobileClose ? (
                <button
                  onClick={onMobileClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition md:hidden shrink-0"
                  title="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : null}

              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition hidden md:block shrink-0"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Section */}
        <div className={`space-y-6 ${collapsed ? 'p-1.5' : 'p-3'}`}>
          <div>
            {!collapsed ? (
              <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-3 px-3">
                {t.menuMain}
              </p>
            ) : (
              <div className="h-2 border-b border-slate-800 mb-2" />
            )}

            <nav className="space-y-1">
              {/* Dashboard */}
              <button
                onClick={() => handleMenuItemClick('dashboard')}
                title={t.dashboard}
                className={`flex items-center ${
                  collapsed ? 'w-10 h-10 mx-auto justify-center' : 'w-full gap-3 px-3 py-1.5'
                } rounded-xl text-sm font-medium transition ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{t.dashboard}</span>}
              </button>

              {/* Master Data Management */}
              {features.masterData && (
                <div>
                  <button
                    onClick={() => {
                      handleMenuItemClick('masterData');
                      if (!collapsed) setIsMasterDataOpen(!isMasterDataOpen);
                    }}
                    title={t.masterData}
                    className={`flex items-center ${
                      collapsed ? 'w-10 h-10 mx-auto justify-center' : 'w-full justify-between px-3 py-1.5'
                    } rounded-xl text-sm font-medium transition ${
                      activeTab === 'masterData'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                      <Database className="w-5 h-5 shrink-0" />
                      {!collapsed && <span className="truncate">{t.masterData}</span>}
                    </div>
                    {!collapsed &&
                      (isMasterDataOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                      ))}
                  </button>

                  {/* Expanded Sub-items */}
                  {!collapsed && isMasterDataOpen && (
                    <div className="ml-7 mt-1 space-y-0.5 border-l border-slate-800 pl-3">
                      {[
                        { key: 'companies', label: t.tabCompanies },
                        { key: 'products', label: t.tabProducts },
                        { key: 'units', label: t.tabUnits },
                        { key: 'warehouses', label: t.tabWarehouses },
                        { key: 'suppliers', label: t.tabSuppliers },
                        { key: 'barcodes', label: t.tabBarcodes },
                        { key: 'rbac', label: t.tabUserAccess },
                      ].map((item) => {
                        const isSubActive = activeTab === 'masterData' && activeSubTab === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => {
                              onTabChange('masterData');
                              if (onSubTabChange) onSubTabChange(item.key);
                              if (onMobileClose) onMobileClose();
                            }}
                            className={`w-full text-left text-xs py-1 px-2.5 rounded-lg transition truncate block ${
                              isSubActive
                                ? 'text-blue-400 font-bold bg-blue-500/10'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Inventory / Core Stock Transactions */}
              {features.inventory && (
                <div>
                  <button
                    onClick={() => {
                      handleMenuItemClick('inventory');
                      if (!collapsed) setIsInventoryOpen(!isInventoryOpen);
                    }}
                    title={t.inventory}
                    className={`flex items-center ${
                      collapsed ? 'w-10 h-10 mx-auto justify-center' : 'w-full justify-between px-3 py-1.5'
                    } rounded-xl text-sm font-medium transition ${
                      activeTab === 'inventory'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                      <Boxes className="w-5 h-5 shrink-0" />
                      {!collapsed && <span className="truncate">{t.inventory}</span>}
                    </div>
                    {!collapsed &&
                      (isInventoryOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                      ))}
                  </button>

                  {/* Expanded Sub-items */}
                  {!collapsed && isInventoryOpen && (
                    <div className="ml-7 mt-1 space-y-0.5 border-l border-slate-800 pl-3">
                      {[
                        { key: 'all', label: t.tabAllTransactions },
                        { key: 'receive', label: t.tabGoodsReceive },
                        { key: 'issue', label: t.tabGoodsIssue },
                        { key: 'transfer', label: t.tabStockTransfer },
                        { key: 'adjustment', label: t.tabStockAdjustment },
                        { key: 'scanner', label: t.tabMobileScanner },
                        { key: 'cycleCount', label: t.tabCycleCount },
                      ].map((item) => {
                        const isSubActive = activeTab === 'inventory' && activeSubTab === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => {
                              onTabChange('inventory');
                              if (onSubTabChange) onSubTabChange(item.key);
                              if (onMobileClose) onMobileClose();
                            }}
                            className={`w-full text-left text-xs py-1 px-2.5 rounded-lg transition truncate block ${
                              isSubActive
                                ? 'text-blue-400 font-bold bg-blue-500/10'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Sales */}
              {features.sales && (
                <button
                  onClick={() => handleMenuItemClick('sales')}
                  title={t.sales}
                  className={`flex items-center ${
                    collapsed ? 'w-10 h-10 mx-auto justify-center' : 'w-full gap-3 px-3 py-1.5'
                  } rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition`}
                >
                  <ShoppingCart className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="truncate">{t.sales}</span>}
                </button>
              )}

              {/* Purchases */}
              {features.purchases && (
                <button
                  onClick={() => handleMenuItemClick('purchases')}
                  title={t.purchases}
                  className={`flex items-center ${
                    collapsed ? 'w-10 h-10 mx-auto justify-center' : 'w-full gap-3 px-3 py-1.5'
                  } rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition`}
                >
                  <ShoppingBag className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="truncate">{t.purchases}</span>}
                </button>
              )}

              {/* Reports */}
              {features.reports && (
                <button
                  onClick={() => handleMenuItemClick('reports')}
                  title={t.reports}
                  className={`flex items-center ${
                    collapsed ? 'w-10 h-10 mx-auto justify-center' : 'w-full gap-3 px-3 py-1.5'
                  } rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition`}
                >
                  <BarChart3 className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="truncate">{t.reports}</span>}
                </button>
              )}

              {/* Settings */}
              {features.settings && (
                <button
                  onClick={() => handleMenuItemClick('settings')}
                  title={t.settings}
                  className={`flex items-center ${
                    collapsed ? 'w-10 h-10 mx-auto justify-center' : 'w-full gap-3 px-3 py-1.5'
                  } rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition`}
                >
                  <Settings className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="truncate">{t.settings}</span>}
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className={`border-t border-slate-800 ${collapsed ? 'p-1.5' : 'p-3'}`}>
        <div
          className={`rounded-xl bg-slate-800/60 flex items-center ${
            collapsed ? 'p-1.5 justify-center' : 'p-2.5 justify-between'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow text-xs">
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -bottom-0.5 -right-0.5" />
            </div>

            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-blue-400 shrink-0" />
                  <p className="text-[10px] text-slate-400 truncate">{user.role.toUpperCase()}</p>
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition shrink-0"
              title={t.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex shrink-0 border-r flex-col justify-between transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${
          theme === 'dark'
            ? 'bg-slate-900 border-slate-800 text-slate-200'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {renderSidebarContent(isCollapsed)}
      </aside>

      {/* 2. Mobile Slide-Over Drawer with Backdrop */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onMobileClose}
          />
          <aside className="relative w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col justify-between h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {renderSidebarContent(false)}
          </aside>
        </div>
      )}
    </>
  );
};
