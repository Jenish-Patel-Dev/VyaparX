import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { PwaProvider } from './context/PwaContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { InstallAppModal } from './components/common/InstallAppModal';
import { UpdateAppModal } from './components/common/UpdateAppModal';
import { DisclaimerTermsModal } from './components/common/DisclaimerTermsModal';
import { ScrollToTop } from './components/common/ScrollToTop';
import { MaintenanceGuard } from './components/common/MaintenanceGuard';

// Client Auth Pages
import { EmailLoginPage } from './pages/auth/EmailLoginPage';
import { OtpVerificationPage } from './pages/auth/OtpVerificationPage';
import { SetupPinPage } from './pages/auth/SetupPinPage';

// Client Application Pages
import { SplashPage } from './pages/SplashPage';
import { HomePage } from './pages/HomePage';
import { ItemsListPage } from './pages/items/ItemsListPage';
import { AddEditItemPage } from './pages/items/AddEditItemPage';
import { PartiesListPage } from './pages/parties/PartiesListPage';
import { AddEditPartyPage } from './pages/parties/AddEditPartyPage';
import { CompaniesListPage } from './pages/companies/CompaniesListPage';
import { AddEditCompanyPage } from './pages/companies/AddEditCompanyPage';
import { SaudaListPage } from './pages/sauda/SaudaListPage';
import { CreateSaudaPage } from './pages/sauda/CreateSaudaPage';
import { EditSaudaPage } from './pages/sauda/EditSaudaPage';
import { SaudaBillsPage } from './pages/sauda/SaudaBillsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ReportsPage } from './pages/profile/ReportsPage';
import { QuickValuesPage } from './pages/profile/QuickValuesPage';
import { PinSecurityPage } from './pages/profile/PinSecurityPage';
import { ReferralsPage } from './pages/profile/ReferralsPage';
import { LegalPages } from './pages/legal/LegalPages';

// Admin Architecture
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage';
import { AdminSaudaOrdersPage } from './pages/admin/AdminSaudaOrdersPage';
import { AdminPartiesPage } from './pages/admin/AdminPartiesPage';
import { AdminItemsPage } from './pages/admin/AdminItemsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Global Secret Admin Hotkey Listener (Ctrl + Alt + A)
const AdminHotkeyListener: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Alt + A (or Cmd + Alt + A on Mac)
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        navigate('/admin/login');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
};

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AdminHotkeyListener />
      <ThemeProvider>
        <LanguageProvider>
          <PwaProvider>
            <AdminAuthProvider>
              <AuthProvider>
                <AppProvider>
                  <ToastProvider>
                    <InstallAppModal />
                    <UpdateAppModal />
                    <DisclaimerTermsModal />

                    <Routes>
                      {/* =========================================
                          ADMIN PORTAL (COMPLETELY SEPARATE)
                          ========================================= */}
                      <Route path="/admin/login" element={<AdminLoginPage />} />

                      {/* Protected Admin Module */}
                      <Route path="/admin" element={<AdminProtectedRoute />}>
                        <Route element={<AdminLayout />}>
                          <Route index element={<Navigate to="/admin/dashboard" replace />} />
                          <Route path="dashboard" element={<AdminDashboardPage />} />
                          <Route path="users" element={<AdminUsersPage />} />
                          <Route path="companies" element={<AdminCompaniesPage />} />
                          <Route path="sauda" element={<AdminSaudaOrdersPage />} />
                          <Route path="parties" element={<AdminPartiesPage />} />
                          <Route path="items" element={<AdminItemsPage />} />
                          <Route path="analytics" element={<AdminAnalyticsPage />} />
                          <Route path="settings" element={<AdminSettingsPage />} />
                        </Route>
                      </Route>

                      {/* =========================================
                          REGULAR USER PORTAL (PROTECTED BY REALTIME MAINTENANCE GUARD)
                          ========================================= */}
                      <Route element={<MaintenanceGuard />}>
                        {/* Public Auth Routes */}
                        <Route element={<AppShell />}>
                          <Route path="/login" element={<EmailLoginPage />} />
                          <Route path="/verify-otp" element={<OtpVerificationPage />} />
                        </Route>

                        {/* Protected Application Routes */}
                        <Route element={<ProtectedRoute />}>
                          <Route element={<AppShell />}>
                            <Route path="/setup-pin" element={<SetupPinPage />} />
                            <Route path="/create-first-company" element={<AddEditCompanyPage />} />
                            <Route path="/" element={<SplashPage />} />
                            <Route path="/splash" element={<SplashPage />} />
                            <Route path="/home" element={<HomePage />} />

                            {/* Items */}
                            <Route path="/items" element={<ItemsListPage />} />
                            <Route path="/items/new" element={<AddEditItemPage />} />
                            <Route path="/items/edit/:id" element={<AddEditItemPage />} />

                            {/* Parties */}
                            <Route path="/parties" element={<PartiesListPage />} />
                            <Route path="/parties/new" element={<AddEditPartyPage />} />
                            <Route path="/parties/edit/:id" element={<AddEditPartyPage />} />

                            {/* Companies */}
                            <Route path="/companies" element={<CompaniesListPage />} />
                            <Route path="/companies/new" element={<AddEditCompanyPage />} />
                            <Route path="/companies/edit/:id" element={<AddEditCompanyPage />} />

                            {/* Vyapar Orders (with backward-compatible /sauda aliases) */}
                            <Route path="/vyapar" element={<SaudaListPage />} />
                            <Route path="/vyapar/create" element={<CreateSaudaPage />} />
                            <Route path="/vyapar/edit/:id" element={<EditSaudaPage />} />
                            <Route path="/vyapar/bills" element={<SaudaBillsPage />} />

                            <Route path="/sauda" element={<Navigate to="/vyapar" replace />} />
                            <Route path="/sauda/create" element={<Navigate to="/vyapar/create" replace />} />
                            <Route path="/sauda/edit/:id" element={<EditSaudaPage />} />
                            <Route path="/sauda/bills" element={<Navigate to="/vyapar/bills" replace />} />

                            {/* Profile & Utilities */}
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/profile/reports" element={<ReportsPage />} />
                            <Route path="/profile/quick-values" element={<QuickValuesPage />} />
                            <Route path="/profile/security" element={<PinSecurityPage />} />
                            <Route path="/profile/referrals" element={<ReferralsPage />} />

                            {/* Legal & Support */}
                            <Route path="/legal/terms" element={<LegalPages />} />
                            <Route path="/legal/privacy" element={<LegalPages />} />
                            <Route path="/legal/how-to-use" element={<LegalPages />} />

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/home" replace />} />
                          </Route>
                        </Route>
                      </Route>

                      {/* Root Fallback */}
                      <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                  </ToastProvider>
                </AppProvider>
              </AuthProvider>
            </AdminAuthProvider>
          </PwaProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
