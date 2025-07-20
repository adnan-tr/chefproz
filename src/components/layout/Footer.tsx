import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer-gradient text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="col-span-1 sm:col-span-2 md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">{t('header.company_name')}</span>
                <p className="text-sm text-slate-300">{t('header.company_tagline')}</p>
              </div>
            </Link>
            <p className="text-slate-300 mb-6 max-w-md leading-relaxed">
              {t('company.description')}
            </p>
            <div className="flex space-x-3">
              <a href="#" className="p-3 bg-slate-700/50 rounded-xl text-slate-300 hover:text-white hover:bg-red-600 transition-all duration-300 hover:scale-105">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 bg-slate-700/50 rounded-xl text-slate-300 hover:text-white hover:bg-red-600 transition-all duration-300 hover:scale-105">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 bg-slate-700/50 rounded-xl text-slate-300 hover:text-white hover:bg-red-600 transition-all duration-300 hover:scale-105">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-3 bg-slate-700/50 rounded-xl text-slate-300 hover:text-white hover:bg-red-600 transition-all duration-300 hover:scale-105">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contact Info - Email */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">{t('footer.contact_info')}</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <div className="p-2 bg-slate-700/50 rounded-lg group-hover:bg-red-600 transition-colors duration-300">
                  <Mail className="h-5 w-5 text-red-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">{t('footer.email')}</p>
                  <p className="text-slate-300 text-sm">{t('footer.email_address', 'info@chefgear.com')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info - Phone & Address */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">&nbsp;</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <div className="p-2 bg-slate-700/50 rounded-lg group-hover:bg-red-600 transition-colors duration-300">
                  <Phone className="h-5 w-5 text-red-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">{t('footer.phone')}</p>
                  <p className="text-slate-300 text-sm">{t('footer.phone_number', '+90 (212) 555-1234')}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 group">
                <div className="p-2 bg-slate-700/50 rounded-lg group-hover:bg-red-600 transition-colors duration-300">
                  <MapPin className="h-5 w-5 text-red-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">{t('footer.address')}</p>
                  <p className="text-slate-300 text-sm">
                    {t('footer.address_line1', 'Atatürk Mah. Ertuğrul Gazi Sok.')}<br />
                    {t('footer.address_line2', 'No: 25, Kat: 3')}<br />
                    {t('footer.address_line3', '34758 Ataşehir/İstanbul')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-600 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              &copy; {t('footer.copyright_year')}. {t('footer.rights')}
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-slate-400 hover:text-red-400 text-sm transition-colors duration-300">{t('footer.privacy_policy')}</a>
              <a href="#" className="text-slate-400 hover:text-red-400 text-sm transition-colors duration-300">{t('footer.terms_of_service')}</a>
              <a href="#" className="text-slate-400 hover:text-red-400 text-sm transition-colors duration-300">{t('footer.cookie_policy')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;