import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompany } from '@/contexts/CompanyContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const { companyDetails } = useCompany();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="relative px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
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
                <h2 className="text-3xl font-bold text-white tracking-tight">{companyDetails.name}</h2>
                <p className="text-slate-300 font-medium">{t('header.company_tagline')}</p>
              </div>
            </Link>
            
            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-lg">
              {companyDetails.description}
            </p>
            

          </div>

          {/* Social Media Section */}
          <div className="lg:col-span-7">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
              <h3 className="text-2xl font-bold text-white mb-8">Follow Us</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {companyDetails.social_media.facebook && (
                  <div className="group">
                    <a href={companyDetails.social_media.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-4">
                      <div className="relative p-6 bg-slate-700/50 rounded-xl text-slate-300 group-hover:text-white transition-colors duration-300 group-hover:bg-red-600/20 border border-slate-600 group-hover:border-red-400">
                        <Facebook className="h-10 w-10" />
                      </div>
                      <span className="text-slate-300 font-medium">Facebook</span>
                    </a>
                  </div>
                )}
                
                {companyDetails.social_media.twitter && (
                  <div className="group">
                    <a href={companyDetails.social_media.twitter} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-4">
                      <div className="relative p-6 bg-slate-700/50 rounded-xl text-slate-300 group-hover:text-white transition-colors duration-300 group-hover:bg-red-600/20 border border-slate-600 group-hover:border-red-400">
                        <Twitter className="h-10 w-10" />
                      </div>
                      <span className="text-slate-300 font-medium">Twitter</span>
                    </a>
                  </div>
                )}
                
                {companyDetails.social_media.instagram && (
                  <div className="group">
                    <a href={companyDetails.social_media.instagram} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-4">
                      <div className="relative p-6 bg-slate-700/50 rounded-xl text-slate-300 group-hover:text-white transition-colors duration-300 group-hover:bg-red-600/20 border border-slate-600 group-hover:border-red-400">
                        <Instagram className="h-10 w-10" />
                      </div>
                      <span className="text-slate-300 font-medium">Instagram</span>
                    </a>
                  </div>
                )}
                
                {companyDetails.social_media.linkedin && (
                  <div className="group">
                    <a href={companyDetails.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-4">
                      <div className="relative p-6 bg-slate-700/50 rounded-xl text-slate-300 group-hover:text-white transition-colors duration-300 group-hover:bg-red-600/20 border border-slate-600 group-hover:border-red-400">
                        <Linkedin className="h-10 w-10" />
                      </div>
                      <span className="text-slate-300 font-medium">LinkedIn</span>
                    </a>
                  </div>
                )}
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