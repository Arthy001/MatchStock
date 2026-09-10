import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { platformAuthService } from '../../services/platformAuth.service';
import { PlatformAdminUser, PlatformTabKey, PlatformPermissions } from '../../types/platform';
import { PlatformLayout } from './components/PlatformLayout';
import { PlatformLoginView } from './components/PlatformLoginView';
import { PlatformDashboardView } from './components/PlatformDashboardView';
import { PlatformTenantsView } from './components/PlatformTenantsView';
import { PlatformPlansView } from './components/PlatformPlansView';
import { PlatformBillingView } from './components/PlatformBillingView';
import { PlatformAdminsView } from './components/PlatformAdminsView';

const getTabFromPath = (pathname: string): PlatformTabKey => {
  const path = pathname.toLowerCase();
  if (path.startsWith('/platform/tenants')) return 'tenants';
  if (path.startsWith('/platform/plans')) return 'plans';
  if (path.startsWith('/platform/billing')) return 'billing';
  if (path.startsWith('/platform/admins')) return 'admins';
  return 'dashboard';
};

export const PlatformAdminPortal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentAdmin, setCurrentAdmin] = useState<PlatformAdminUser | null>(() =>
    platformAuthService.getCurrentAdmin()
  );
  const [activeTab, setActiveTab] = useState<PlatformTabKey>(() =>
    getTabFromPath(location.pathname)
  );

  useEffect(() => {
    const admin = platformAuthService.getCurrentAdmin();
    setCurrentAdmin(admin);
  }, []);

  // Sync activeTab state when URL changes (e.g. browser back/forward or direct navigation)
  useEffect(() => {
    const tabFromUrl = getTabFromPath(location.pathname);
    setActiveTab(tabFromUrl);
  }, [location.pathname]);

  const handleTabChange = (tab: PlatformTabKey) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      navigate('/platform');
    } else {
      navigate(`/platform/${tab}`);
    }
  };

  // Validate that current admin role is allowed to view the active tab
  useEffect(() => {
    if (!currentAdmin) return;
    if (activeTab === 'admins' && !PlatformPermissions.canManageAdmins(currentAdmin.role)) {
      handleTabChange('dashboard');
    } else if (activeTab === 'tenants' && !PlatformPermissions.canViewTenants(currentAdmin.role)) {
      handleTabChange('dashboard');
    } else if (activeTab === 'plans' && !PlatformPermissions.canManagePlans(currentAdmin.role)) {
      handleTabChange('dashboard');
    } else if (activeTab === 'billing' && !PlatformPermissions.canViewBilling(currentAdmin.role)) {
      handleTabChange('dashboard');
    }
  }, [currentAdmin, activeTab]);

  const handleLoginSuccess = (admin: PlatformAdminUser) => {
    setCurrentAdmin(admin);
    handleTabChange('dashboard');
  };

  const handleLogout = () => {
    platformAuthService.logout();
    setCurrentAdmin(null);
  };

  const handleSwitchToTenantApp = () => {
    navigate('/');
  };

  // If not logged in as Platform Admin -> Show Platform Login Screen
  if (!currentAdmin) {
    return (
      <PlatformLoginView
        onLoginSuccess={handleLoginSuccess}
        onBackToTenant={handleSwitchToTenantApp}
      />
    );
  }

  // If logged in -> Render Platform Layout & View
  return (
    <PlatformLayout
      currentAdmin={currentAdmin}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onLogout={handleLogout}
      onSwitchToTenantApp={handleSwitchToTenantApp}
    >
      {activeTab === 'dashboard' && (
        <PlatformDashboardView currentAdminRole={currentAdmin.role} onNavigate={handleTabChange} />
      )}
      {activeTab === 'tenants' && <PlatformTenantsView currentAdminRole={currentAdmin.role} />}
      {activeTab === 'plans' && <PlatformPlansView currentAdminRole={currentAdmin.role} />}
      {activeTab === 'billing' && <PlatformBillingView />}
      {activeTab === 'admins' && <PlatformAdminsView />}
    </PlatformLayout>
  );
};
