import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-5">
            <Link to="/" className="inline-flex items-center space-x-4 mb-8 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                <div className="relative p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl">
                  <ChefHat className="h-10 w-10 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">{t('header.company_name')}</h2>
                <p className="text-slate-300 font-medium">{t('header.company_tagline')}</p>
              </div>
            </Link>
            
            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-lg">
              {t('company.description')}
            </p>
            
            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <span className="text-slate-400 font-medium text-sm uppercase tracking-wider">Follow Us</span>
              <div className="flex space-x-3">
                <a href="#" className="group relative">
                  <div className="absolute inset-0 bg-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-3 bg-slate-700/50 rounded-xl text-slate-300 group-hover:text-white transition-colors duration-300">
                    <Facebook className="h-5 w-5" />
                  </div>
                </a>
                <a href="#" className="group relative">
                  <div className="absolute inset-0 bg-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-3 bg-slate-700/50 rounded-xl text-slate-300 group-hover:text-white transition-colors duration-300">
                    <Twitter className="h-5 w-5" />
                  </div>
                </a>
                <a href="#" className="group relative">
                  <div className="absolute inset-0 bg-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-3 bg-slate-700/50 rounded-xl text-slate-300 group-hover:text-white transition-colors duration-300">
                    <Instagram className="h-5 w-5" />
                  </div>
                </a>
                <a href="#" className="group relative">
                  <div className="absolute inset-0 bg-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-3 bg-slate-700/50 rounded-xl text-slate-300 group-hover:text-white transition-colors duration-300">
                    <Linkedin className="h-5 w-5" />
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-7">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h3 className="text-2xl font-bold text-white mb-8">{t('footer.contact_info')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Email */}
                <div className="group">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl border border-red-500/30 group-hover:border-red-400 transition-colors duration-300">
                        <Mail className="h-6 w-6 text-red-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-white mb-2">{t('footer.email')}</h4>
                      <p className="text-slate-300">{t('footer.email_address', 'info@chefgear.com')}</p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="group">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl border border-red-500/30 group-hover:border-red-400 transition-colors duration-300">
                        <Phone className="h-6 w-6 text-red-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-white mb-2">{t('footer.phone')}</h4>
                      <p className="text-slate-300">{t('footer.phone_number', '+90 (212) 555-1234')}</p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2 group">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl border border-red-500/30 group-hover:border-red-400 transition-colors duration-300">
                        <MapPin className="h-6 w-6 text-red-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-white mb-2">{t('footer.address')}</h4>
                      <p className="text-slate-300">
                        {t('footer.address_line1', 'Atatürk Mah. Ertuğrul Gazi Sok.')} {t('footer.address_line2', 'No: 25, Kat: 3')} {t('footer.address_line3', '34758 Ataşehir/İstanbul')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        {/* Bottom Section */}
        <div className="border-t border-slate-700/50 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left">
              <p className="text-slate-400 font-medium">
                &copy; {new Date().getFullYear()} {t('header.company_name')}. {t('footer.rights')}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Crafted with excellence for industrial kitchen solutions
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-end items-center gap-6">
              <a href="#" className="text-slate-400 hover:text-red-400 font-medium text-sm transition-colors duration-300 hover:underline">
                {t('footer.privacy_policy')}
              </a>
              <a href="#" className="text-slate-400 hover:text-red-400 font-medium text-sm transition-colors duration-300 hover:underline">
                {t('footer.terms_of_service')}
              </a>
              <a href="#" className="text-slate-400 hover:text-red-400 font-medium text-sm transition-colors duration-300 hover:underline">
                {t('footer.cookie_policy')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;