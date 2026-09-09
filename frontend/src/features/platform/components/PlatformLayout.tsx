import React from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  Building2,
  PackageCheck,
  CreditCard,
  Users,
  LogOut,
  ExternalLink,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { PlatformAdminUser, PlatformTabKey, PlatformPermissions } from '../../../types/platform';

interface PlatformLayoutProps {
  currentAdmin: PlatformAdminUser;
  activeTab: PlatformTabKey;
  onTabChange: (tab: PlatformTabKey) => void;
  onLogout: () => void;
  onSwitchToTenantApp: () => void;
  children: React.ReactNode;
}

export const PlatformLayout: React.FC<PlatformLayoutProps> = ({
  currentAdmin,
  activeTab,
  onTabChange,
  onLogout,
  onSwitchToTenantApp,
  children,
}) => {
  const navItems: Array<{
    key: PlatformTabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isAllowed: boolean;
  }> = [
    { key: 'dashboard', label: 'ภาพรวมระบบ (Overview)', icon: LayoutDashboard, isAllowed: true },
    {
      key: 'tenants',
      label: 'จัดการผู้เช่า (Tenants)',
      icon: Building2,
      isAllowed: PlatformPermissions.canViewTenants(currentAdmin.role),
    },
    {
      key: 'plans',
      label: 'แพ็กเกจสมาชิก (Plans)',
      icon: PackageCheck,
      isAllowed: PlatformPermissions.canManagePlans(currentAdmin.role),
    },
    {
      key: 'billing',
      label: 'การเงิน & บิล (Billing)',
      icon: CreditCard,
      isAllowed: PlatformPermissions.canViewBilling(currentAdmin.role),
    },
    {
      key: 'admins',
      label: 'ทีมงานแอดมิน (Admins)',
      icon: Users,
      isAllowed: PlatformPermissions.canManageAdmins(currentAdmin.role),
    },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">SUPER ADMIN</span>;
      case 'billing':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">BILLING LEAD</span>;
      case 'support':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">SUPPORT</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300">{role.toUpperCase()}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Banner: Control Plane Notice */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 px-4 py-2 border-b border-purple-800/50 flex flex-wrap items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white">
            <Crown className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold tracking-wider text-purple-200 uppercase">
            MatchStock Platform Control Plane
          </span>
          <span className="hidden sm:inline-block text-purple-400/80">•</span>
          <span className="hidden sm:inline-block text-slate-300">
            ระบบควบคุมส่วนกลางระดับ SuperAdmin
          </span>
        </div>

        <div className="flex items-center gap-3 mt-1 sm:mt-0">
          <button
            onClick={onSwitchToTenantApp}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-purple-800/60 hover:bg-purple-700 text-purple-200 transition text-[11px] font-semibold border border-purple-600/40 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>กลับไประบบคลังสินค้า (Tenant App)</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* SuperAdmin Sidebar (Dark Indigo/Purple Theme) */}
        <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0">
          <div>
            {/* SuperAdmin Brand Header */}
            <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-600/30">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm text-white tracking-wide flex items-center gap-1">
                  MatchStock <span className="text-purple-400 font-black">PLATFORM</span>
                </h1>
                <p className="text-[11px] text-slate-400">SuperAdmin Portal</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="p-3 space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Platform Navigation
              </p>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;

                if (!item.isAllowed) return null;

                return (
                  <button
                    key={item.key}
                    onClick={() => onTabChange(item.key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-purple-200" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Logout Box */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
            <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between mb-2">
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-slate-200 truncate">{currentAdmin.fullName}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentAdmin.email}</p>
                <div className="mt-1">{getRoleBadge(currentAdmin.role)}</div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-600/20 border border-rose-500/20 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ (Logout)</span>
            </button>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
