import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Phone, 
  Factory, 
  Snowflake, 
  Hotel,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompany } from '@/contexts/CompanyContext';

import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const { t } = useLanguage();
  const { companyDetails } = useCompany();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.inoksan'), href: '/inoksan', icon: Factory },
    { name: t('nav.refrigeration'), href: '/refrigeration', icon: Snowflake },
    { name: 'PrepLinq', href: '/kitchen-tools', icon: FileText },
    { name: 'Hotel Hub', href: '/hotel-equipment', icon: Hotel },
    { name: t('nav.special_request'), href: '/special-request', icon: FileText },
    { name: t('nav.contact'), href: '/contact', icon: Phone },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getActiveStyles = (path: string) => {
    if (!isActive(path)) return '';
    
    const pageColors: Record<string, string> = {
      '/': 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 shadow-md border border-gray-200',
      '/inoksan': 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 shadow-md border border-red-200',
      '/refrigeration': 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 shadow-md border border-blue-200',
      '/kitchen-tools': 'bg-gradient-to-r from-green-50 to-green-100 text-green-600 shadow-md border border-green-200',
      '/hotel-equipment': 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-600 shadow-md border border-purple-200',
      '/special-request': 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-600 shadow-md border border-orange-200',
      '/contact': 'bg-gradient-to-r from-teal-50 to-teal-100 text-teal-600 shadow-md border border-teal-200'
    };
    
    return pageColors[path] || 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 shadow-md border border-red-200';
  };

  return (
    <header className="bg-white shadow-lg z-40 border-b border-slate-200 w-full transition-all duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            {companyDetails.logo_url || companyDetails.logo ? (
              <img 
                src={companyDetails.logo_url || companyDetails.logo} 
                alt={`${companyDetails.name} Logo`}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div>
                <span className="text-2xl font-bold text-slate-800">
                  {companyDetails.name}
                </span>
                <p className="text-xs text-slate-500 -mt-1">{t('header.company_tagline')}</p>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1 overflow-hidden">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 min-w-0 flex-shrink-0',
                    isActive(item.href)
                      ? getActiveStyles(item.href)
                      : 'text-slate-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:shadow-sm'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate text-sm uppercase font-semibold">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 mr-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 py-4">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                      isActive(item.href)
                        ? getActiveStyles(item.href)
                        : 'text-slate-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100'
                    )}
                  >
                    <Icon className="h-7 w-7" />
                    <span className="uppercase font-semibold">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;