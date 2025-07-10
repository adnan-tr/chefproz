import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import Layout from './components/layout/Layout';
import AdminLayout from './pages/admin/AdminLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
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
              <Route index element={<HomePage />} />
              <Route path="inoksan" element={<InoksanPage />} />
              <Route path="refrigeration" element={<RefrigerationPage />} />
              <Route path="kitchen-tools" element={<KitchenToolsPage />} />
              <Route path="hotel-equipment" element={<HotelEquipmentPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="special-request" element={<SpecialRequestPage />} />
            </Route>

            {/* Admin Routes - Secure Path */}
            <Route path="/secure-mgmt-portal-x7f9q2" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="requests" element={<ClientRequestsPage />} />
              <Route path="clients" element={<ClientDashboardPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/edit/:orderId" element={<OrderEditPage />} />
              <Route path="translations" element={<TranslationsPage />} />
              <Route path="images" element={<ImageManagerPage />} />
              <Route path="products" element={<ProductManagerPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="quotations" element={<QuotationBuilderPage />} />
              <Route path="quotations/edit/:id" element={<QuotationEditPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="setup-services" element={<SetupServicesPage />} />
            </Route>
      </Routes>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  );
}

export default App;