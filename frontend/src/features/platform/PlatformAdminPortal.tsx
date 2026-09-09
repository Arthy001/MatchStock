import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { platformAuthService } from '../../services/platformAuth.service';
import { PlatformAdminUser, PlatformTabKey, PlatformPermissions } from '../../types/platform';
import { PlatformLayout } from './components/PlatformLayout';
import { PlatformLoginView } from './components/PlatformLoginView';
import { PlatformDashboardView } from './components/PlatformDashboardView';
import { PlatformTenantsView } from './components/PlatformTenantsView';
import { PlatformPlansView } from './components/PlatformPlansView';
import { PlatformBillingView } from './components/PlatformBillingView';
import { PlatformAdminsView } from './components/PlatformAdminsView';

export const PlatformAdminPortal: React.FC = () => {
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState<PlatformAdminUser | null>(() =>
    platformAuthService.getCurrentAdmin()
  );
  const [activeTab, setActiveTab] = useState<PlatformTabKey>('dashboard');

  useEffect(() => {
    const admin = platformAuthService.getCurrentAdmin();
    setCurrentAdmin(admin);
  }, []);

  // Validate that current admin role is allowed to view the active tab
  useEffect(() => {
    if (!currentAdmin) return;
    if (activeTab === 'admins' && !PlatformPermissions.canManageAdmins(currentAdmin.role)) {
      setActiveTab('dashboard');
    } else if (activeTab === 'tenants' && !PlatformPermissions.canViewTenants(currentAdmin.role)) {
      setActiveTab('dashboard');
    } else if (activeTab === 'plans' && !PlatformPermissions.canManagePlans(currentAdmin.role)) {
      setActiveTab('dashboard');
    } else if (activeTab === 'billing' && !PlatformPermissions.canViewBilling(currentAdmin.role)) {
      setActiveTab('dashboard');
    }
  }, [currentAdmin, activeTab]);

  const handleLoginSuccess = (admin: PlatformAdminUser) => {
    setCurrentAdmin(admin);
    setActiveTab('dashboard');
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
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      onSwitchToTenantApp={handleSwitchToTenantApp}
    >
      {activeTab === 'dashboard' && (
        <PlatformDashboardView currentAdminRole={currentAdmin.role} onNavigate={setActiveTab} />
      )}
      {activeTab === 'tenants' && <PlatformTenantsView currentAdminRole={currentAdmin.role} />}
      {activeTab === 'plans' && <PlatformPlansView currentAdminRole={currentAdmin.role} />}
      {activeTab === 'billing' && <PlatformBillingView />}
      {activeTab === 'admins' && <PlatformAdminsView />}
    </PlatformLayout>
  );
};
