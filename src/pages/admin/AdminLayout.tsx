import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  MessageSquare,
  Globe,
  Image,
  Package,
  Users,
  FileText,
  Menu,
  X,
  ChefHat,
  LogOut,
  Settings,
  UserCheck,
  ShoppingCart,
  Utensils,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import CompanyDetailsPopup from '@/components/admin/CompanyDetailsPopup';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/secure-mgmt-portal-x7f9q2/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/secure-mgmt-portal-x7f9q2', icon: LayoutDashboard },
    { name: 'Client Requests', href: '/secure-mgmt-portal-x7f9q2/requests', icon: MessageSquare },
    { name: 'Client Dashboard', href: '/secure-mgmt-portal-x7f9q2/clients', icon: UserCheck },
    { name: 'Orders', href: '/secure-mgmt-portal-x7f9q2/orders', icon: ShoppingCart },
    { name: 'Translations', href: '/secure-mgmt-portal-x7f9q2/translations', icon: Globe },
    { name: 'Image Manager', href: '/secure-mgmt-portal-x7f9q2/images', icon: Image },
    { name: 'Product Manager', href: '/secure-mgmt-portal-x7f9q2/products', icon: Package },
    { name: 'Services', href: '/secure-mgmt-portal-x7f9q2/services', icon: Utensils },
    { name: 'Page Management', href: '/secure-mgmt-portal-x7f9q2/page-management', icon: Settings },
    { name: 'Portal Users', href: '/secure-mgmt-portal-x7f9q2/users', icon: Users },
    { name: 'Quotation Builder', href: '/secure-mgmt-portal-x7f9q2/quotations', icon: FileText },
    { name: 'Reports', href: '/secure-mgmt-portal-x7f9q2/reports', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === '/secure-mgmt-portal-x7f9q2') {
      return location.pathname === '/secure-mgmt-portal-x7f9q2';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-white flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-slate-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Fixed Header */}
        <div className="h-16 px-6 border-b border-slate-200 bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-between flex-shrink-0">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-white/20 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">ChefGear Management</span>
              <p className="text-xs text-red-100 -mt-1">Secure Portal</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 overflow-y-auto">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300',
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 shadow-md border border-red-200'
                      : 'text-slate-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:shadow-sm'
                  )}
                >
                  <Icon className={cn(
                    "mr-3 h-5 w-5 transition-colors",
                    isActive(item.href) ? 'text-red-600' : 'text-slate-500 group-hover:text-red-500'
                  )} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Admin Profile & Logout */}
        <div className="p-4 space-y-2 border-t border-slate-200 flex-shrink-0 mb-4">
          <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.name || 'Portal User'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || 'portal@chefgear.com'}
                </p>
                <p className="text-xs text-blue-600 font-medium capitalize">
                  {user?.role || 'viewer'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="group flex items-center px-4 py-3 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 rounded-xl transition-all duration-300 w-full"
          >
            <LogOut className="mr-3 h-5 w-5 text-slate-500 group-hover:text-red-500" />
            Logout
          </button>
          <Link
            to="/"
            className="group flex items-center px-4 py-3 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 rounded-xl transition-all duration-300"
          >
            <LogOut className="mr-3 h-5 w-5 text-slate-500 group-hover:text-red-500" />
            Back to Website
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200 h-16 flex-shrink-0">
          <div className="flex items-center justify-between h-full px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  Welcome, {user?.name || 'Manager'}
                </div>
              </div>
              <CompanyDetailsPopup 
                trigger={
                  <button className="p-2 rounded-xl text-slate-400 hover:text-red-600 transition-colors">
                    <Settings className="h-5 w-5" />
                  </button>
                }
              />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-full mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;