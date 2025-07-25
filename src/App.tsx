import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { PageConfigProvider } from './contexts/PageConfigContext';
import { AuthProvider } from './contexts/AuthContext';
import { CompanyProvider } from './contexts/CompanyContext';
import Layout from './components/layout/Layout';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import OrderLayout from './components/layout/OrderLayout';
import HomePage from './pages/HomePage';
import PageWrapper from './components/PageWrapper';

import InoksanPage from './pages/InoksanPage';
import RefrigerationPage from './pages/RefrigerationPage';
import KitchenToolsPage from './pages/KitchenToolsPage';
import HotelEquipmentPage from './pages/HotelEquipmentPage';
import ContactPage from './pages/ContactPage';
import SpecialRequestPage from './pages/SpecialRequestPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClientRequestsPage from './pages/admin/ClientRequestsPage';
import ClientDashboardPage from './pages/admin/ClientDashboardPage';
import OrdersPage from './pages/admin/OrdersPage';
import OrderEditPage from './pages/admin/OrderEditPage';
import TranslationsPage from './pages/admin/TranslationsPage';
import ProductManagerPage from './pages/admin/ProductManagerPage';
import ImageManagerPage from './pages/admin/ImageManagerPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import QuotationBuilderPage from './pages/admin/QuotationBuilderPage';
import QuotationEditPage from './pages/admin/QuotationEditPage';
import ServicesPage from './pages/admin/ServicesPage';
import SetupServicesPage from './pages/admin/SetupServicesPage';
import PageManagementPage from './pages/admin/PageManagementPage';
import ReportsPage from './pages/admin/ReportsPage';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const AppContent: React.FC = () => {
  const { isLoading } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading translations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<PageWrapper pageId="home"><HomePage /></PageWrapper>} />
              <Route path="inoksan" element={<PageWrapper pageId="inoksan"><InoksanPage /></PageWrapper>} />
              <Route path="refrigeration" element={<PageWrapper pageId="refrigeration"><RefrigerationPage /></PageWrapper>} />
              <Route path="kitchen-tools" element={<PageWrapper pageId="kitchen-tools"><KitchenToolsPage /></PageWrapper>} />
              <Route path="hotel-equipment" element={<PageWrapper pageId="hotel-equipment"><HotelEquipmentPage /></PageWrapper>} />
              <Route path="contact" element={<PageWrapper pageId="contact"><ContactPage /></PageWrapper>} />
              <Route path="special-request" element={<PageWrapper pageId="special-request"><SpecialRequestPage /></PageWrapper>} />
            </Route>

            {/* Admin Routes - Secure Path */}
            <Route path="/secure-mgmt-portal-x7f9q2/login" element={<AdminLogin />} />
            <Route path="/secure-mgmt-portal-x7f9q2" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="requests" element={<ClientRequestsPage />} />
              <Route path="clients" element={<ClientDashboardPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="translations" element={<TranslationsPage />} />
              <Route path="images" element={<ImageManagerPage />} />
              <Route path="products" element={<ProductManagerPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="quotations" element={<QuotationBuilderPage />} />
              <Route path="quotations/edit/:id" element={<QuotationEditPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="setup-services" element={<SetupServicesPage />} />
              <Route path="page-management" element={<PageManagementPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>

            {/* Order Management Routes - No Sidebar */}
            <Route path="/secure-mgmt-portal-x7f9q2/orders" element={<OrderLayout />}>
              <Route path="edit/:orderId" element={<OrderEditPage />} />
            </Route>
      </Routes>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <PageConfigProvider>
        <LanguageProvider>
          <AuthProvider>
            <CompanyProvider>
              <Router>
                <AppContent />
              </Router>
            </CompanyProvider>
          </AuthProvider>
        </LanguageProvider>
      </PageConfigProvider>
    </ErrorBoundary>
  );
}

export default App;