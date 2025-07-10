import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Info, 
  Phone, 
  Factory, 
  Snowflake, 
  ChefHat, 
  Hotel,
  FileText,
  Menu,
  X,
  Shield
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.inoksan'), href: '/inoksan', icon: Factory },
    { name: t('nav.refrigeration'), href: '/refrigeration', icon: Snowflake },
    { name: t('nav.kitchen_tools'), href: '/kitchen-tools', icon: ChefHat },
    { name: t('nav.hotel_equipment'), href: '/hotel-equipment', icon: Hotel },
    { name: t('nav.special_request'), href: '/special-request', icon: FileText },
    { name: t('nav.contact'), href: '/contact', icon: Phone },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-lg sticky top-[40px] z-40 border-b border-slate-200 w-full transition-all duration-300">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {t('header.company_name')}
              </span>
              <p className="text-xs text-slate-500 -mt-1">{t('header.company_tagline')}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 shadow-md border border-red-200'
                      : 'text-slate-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:shadow-sm'
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
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
                        ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-600 shadow-md border border-red-200'
                        : 'text-slate-700 hover:text-red-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100'
                    )}
                  >
                    <Icon className="h-7 w-7" />
                    <span>{item.name}</span>
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