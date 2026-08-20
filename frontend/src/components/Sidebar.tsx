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
}) => {
  const t = getTranslation(lang);
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(true);

  return (
    <aside
      className={`shrink-0 border-r flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${
        theme === 'dark'
          ? 'bg-slate-900 border-slate-800 text-slate-200'
          : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}
    >
      {/* Brand & Collapse Toggle Header */}
      <div>
        <div
          className={`h-16 border-b border-slate-800 flex items-center px-4 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          {isCollapsed ? (
            /* When Collapsed: Clean Centered Toggle Button */
            <button
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white flex items-center justify-center transition shadow-xs border border-blue-500/30"
              title="Expand Sidebar"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          ) : (
            /* When Expanded: Full Brand Logo + Text + Collapse Icon */
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 shrink-0">
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

              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-6">
          <div>
            {!isCollapsed ? (
              <p className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-3 px-3">
                {t.menuMain}
              </p>
            ) : (
              <div className="h-4 border-b border-slate-800 mb-3" />
            )}

            <nav className="space-y-1.5">
              {/* Dashboard */}
              <button
                onClick={() => onTabChange('dashboard')}
                title={t.dashboard}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
                } rounded-xl text-sm font-medium transition ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <LayoutDashboard className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="truncate">{t.dashboard}</span>}
              </button>

              {/* Master Data Management */}
              {features.masterData && (
                <div>
                  <button
                    onClick={() => {
                      onTabChange('masterData');
                      if (!isCollapsed) setIsMasterDataOpen(!isMasterDataOpen);
                    }}
                    title={t.masterData}
                    className={`w-full flex items-center ${
                      isCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3 py-2.5'
                    } rounded-xl text-sm font-medium transition ${
                      activeTab === 'masterData'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                      <Database className="w-5 h-5 shrink-0" />
                      {!isCollapsed && <span className="truncate">{t.masterData}</span>}
                    </div>
                    {!isCollapsed &&
                      (isMasterDataOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-300 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                      ))}
                  </button>

                  {/* Expanded Sub-items */}
                  {!isCollapsed && isMasterDataOpen && (
                    <div className="ml-7 mt-1.5 space-y-1 border-l border-slate-800 pl-3">
                      {[
                        { key: 'rbac', label: t.tabUserAccess },
                        { key: 'products', label: t.tabProducts },
                        { key: 'units', label: t.tabUnits },
                        { key: 'barcodes', label: t.tabBarcodes },
                        { key: 'warehouses', label: t.tabWarehouses },
                        { key: 'suppliers', label: t.tabSuppliers },
                      ].map((item) => {
                        const isSubActive = activeTab === 'masterData' && activeSubTab === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => {
                              onTabChange('masterData');
                              if (onSubTabChange) onSubTabChange(item.key);
                            }}
                            className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition truncate block ${
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

              {/* Inventory */}
              {features.inventory && (
                <button
                  onClick={() => onTabChange('inventory')}
                  title={t.inventory}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
                  } rounded-xl text-sm font-medium transition ${
                    activeTab === 'inventory'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Boxes className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{t.inventory}</span>}
                </button>
              )}

              {/* Sales */}
              {features.sales && (
                <button
                  onClick={() => onTabChange('sales')}
                  title={t.sales}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
                  } rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition`}
                >
                  <ShoppingCart className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{t.sales}</span>}
                </button>
              )}

              {/* Purchases */}
              {features.purchases && (
                <button
                  onClick={() => onTabChange('purchases')}
                  title={t.purchases}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
                  } rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition`}
                >
                  <ShoppingBag className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{t.purchases}</span>}
                </button>
              )}

              {/* Reports */}
              {features.reports && (
                <button
                  onClick={() => onTabChange('reports')}
                  title={t.reports}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
                  } rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition`}
                >
                  <BarChart3 className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{t.reports}</span>}
                </button>
              )}

              {/* Settings */}
              {features.settings && (
                <button
                  onClick={() => onTabChange('settings')}
                  title={t.settings}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'
                  } rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition`}
                >
                  <Settings className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{t.settings}</span>}
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800">
        <div
          className={`p-2.5 rounded-xl bg-slate-800/60 flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow text-xs">
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -bottom-0.5 -right-0.5" />
            </div>

            {!isCollapsed && (
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-blue-400 shrink-0" />
                  <p className="text-[10px] text-slate-400 truncate">{user.role.toUpperCase()}</p>
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
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
    </aside>
  );
};
