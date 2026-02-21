import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SidebarLayout as Layout } from './components/SidebarLayout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Invoices } from './pages/Invoices';
import { Estimates } from './pages/Estimates';
import { Payments } from './pages/Payments';
import { Recurring } from './pages/Recurring';
import { Checkouts } from './pages/Checkouts';
import { Overdue } from './pages/Overdue';
import { Customers } from './pages/Customers';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Companies } from './pages/Companies';
import { Suppliers } from './pages/Suppliers';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { InventoryLogs } from './pages/Inventory/InventoryLogs';
import { Dispatch } from './pages/Dispatch';
import { OrderForm } from './pages/OrderForm';
import { SettingsPage } from './pages/SettingsPage';
import { MenuCustomization } from './pages/settings/MenuCustomization';
import { CompanyProfile } from './pages/settings/company/CompanyProfile';
import { Notifications } from './pages/Notifications';
import { AdvancedAnalyticsPage } from './pages/AdvancedAnalyticsPage';
import { SaaSConfig } from './pages/SaaSConfig';
import { Reports } from './pages/Reports';
import { POS } from './pages/retail/POS';
import { Appointments } from './pages/service/Appointments';
import { BillOfMaterials } from './pages/manufacturing/BillOfMaterials';
import { SuperAdminLayout } from './components/SuperAdminLayout';
import { SuperAdminDashboard } from './pages/super-admin/SuperAdminDashboard';
import { SuperAdminTenants } from './pages/super-admin/SuperAdminTenants';
import { SuperAdminIndustries } from './pages/super-admin/SuperAdminIndustries';
import { SuperAdminPlans } from './pages/super-admin/SuperAdminPlans';
import { SuperAdminRevenue } from './pages/super-admin/SuperAdminRevenue';
import { SuperAdminUsers } from './pages/super-admin/SuperAdminUsers';
import { SuperAdminFeatureFlags } from './pages/super-admin/SuperAdminFeatureFlags';
import { SuperAdminSettings } from './pages/super-admin/SuperAdminSettings';
import { SuperAdminNotifications } from './pages/super-admin/SuperAdminNotifications';
import { SuperAdminAnalytics } from './pages/super-admin/SuperAdminAnalytics';
import { SuperAdminModules } from './pages/super-admin/SuperAdminModules';
import { SuperAdminBranches } from './pages/super-admin/SuperAdminBranches';
import { SuperAdminComms } from './pages/super-admin/SuperAdminComms';
import { SuperAdminGrowth } from './pages/super-admin/SuperAdminGrowth';
import { SuperAdminAutomation } from './pages/super-admin/SuperAdminAutomation';
import { SuperAdminInfra } from './pages/super-admin/SuperAdminInfra';
import { SuperAdminLogs } from './pages/super-admin/SuperAdminLogs';
import { SuperAdminVerification } from './pages/super-admin/SuperAdminVerification';
import { SuperAdminTenantDetail } from './pages/super-admin/SuperAdminTenantDetail';
import { SuperAdminPlaceholder } from './pages/super-admin/SuperAdminPlaceholder';
import { Projects } from './pages/Projects';
import { SuperAdminGuard } from './components/guards/SuperAdminGuard';
import { authService } from './services/authService';
import { User } from './types';
import { DialogProvider } from './context/DialogContext';
import { ShopProvider } from './context/ShopContext';

function App() {
  // Main App Component
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = authService.onAuthStateChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const SUPER_ADMINS = ['muneeswaran@averqon.in', 'whatnew.live@gmail.com'];
      const companyName = SUPER_ADMINS.includes(user.email) ? 'Averqon Platform' : user.name;
      document.title = `${companyName} | Assistant`;
    } else {
      document.title = 'Averqon | Enterprise Login';
    }
  }, [user]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  return (
    <Router>
      <DialogProvider>
        <ShopProvider>
          <Routes>
            <Route
              path="/login"
              element={!user ? <Auth onLogin={handleLogin} /> : <Navigate to="/" replace />}
            />

            <Route path="/order-form/:userId" element={<OrderForm />} />

            <Route
              path="/super/*"
              element={
                <SuperAdminGuard user={user}>
                  <SuperAdminLayout onLogout={handleLogout} user={user}>
                    <Routes>
                      <Route path="dashboard" element={<SuperAdminDashboard />} />
                      <Route path="tenants" element={<SuperAdminTenants />} />
                      <Route path="tenants/:id" element={<SuperAdminTenantDetail />} />
                      <Route path="verification" element={<SuperAdminVerification />} />
                      <Route path="industries" element={<SuperAdminIndustries />} />
                      <Route path="plans" element={<SuperAdminPlans />} />
                      <Route path="revenue" element={<SuperAdminRevenue />} />
                      <Route path="users" element={<SuperAdminUsers />} />
                      <Route path="analytics" element={<SuperAdminAnalytics />} />
                      <Route path="modules" element={<SuperAdminModules />} />
                      <Route path="feature-flags" element={<SuperAdminFeatureFlags />} />
                      <Route path="settings" element={<SuperAdminSettings />} />
                      <Route path="notifications" element={<SuperAdminNotifications />} />
                      <Route path="branches" element={<SuperAdminBranches />} />
                      <Route path="comms" element={<SuperAdminComms />} />
                      <Route path="growth" element={<SuperAdminGrowth />} />
                      <Route path="infra" element={<SuperAdminInfra />} />
                      <Route path="automation" element={<SuperAdminAutomation />} />
                      <Route path="logs" element={<SuperAdminLogs />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </SuperAdminLayout>
                </SuperAdminGuard>
              }
            />

            <Route
              path="/*"
              element={
                user ? (
                  <Layout user={user} onLogout={handleLogout}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/advanced-analytics" element={<AdvancedAnalyticsPage />} />
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/estimates" element={<Estimates />} />
                      <Route path="/payments" element={<Payments />} />
                      <Route path="/recurring" element={<Recurring />} />
                      <Route path="/checkouts" element={<Checkouts />} />
                      <Route path="/overdue" element={<Overdue />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/purchase-orders" element={<PurchaseOrders />} />
                      <Route path="/suppliers" element={<Suppliers />} />
                      <Route path="/inventory-logs" element={<InventoryLogs />} />
                      <Route path="/dispatch" element={<Dispatch />} />
                      <Route path="/companies" element={['muneeswaran@averqon.in', 'whatnew.live@gmail.com'].includes(user?.email || '') ? <Companies /> : <Navigate to="/" replace />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/settings/menu" element={<MenuCustomization />} />
                      <Route path="/settings/company" element={<CompanyProfile />} />
                      <Route path="/saas-config" element={['muneeswaran@averqon.in', 'whatnew.live@gmail.com'].includes(user?.email || '') ? <SaaSConfig /> : <Navigate to="/" replace />} />
                      <Route path="/notifications" element={<Notifications />} />

                      {/* Universal Pages */}
                      <Route path="/reports" element={<Reports />} />

                      {/* Industry-Specific Pages */}
                      <Route path="/pos" element={<POS />} />
                      <Route path="/appointments" element={<Appointments />} />
                      <Route path="/services" element={<Appointments />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/bom" element={<BillOfMaterials />} />
                      <Route path="/manufacturing" element={<BillOfMaterials />} />

                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </ShopProvider>
      </DialogProvider>
    </Router>
  );
}

export default App;