import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCompany } from '@/contexts/CompanyContext';

// Custom X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

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
        {/* Main Footer Content - Two Equal Divisions */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* First Division - Company Info */}
            <div className="flex flex-col justify-center h-full">
              <div className="text-center">
                <Link to="/" className="inline-flex items-center justify-center space-x-4 mb-8 group">
                  {companyDetails.logo_url || companyDetails.logo ? (
                    <img 
                      src={companyDetails.logo_url || companyDetails.logo} 
                      alt={`${companyDetails.name} Logo`}
                      className="h-12 w-auto object-contain"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-white">
                      {companyDetails.name}
                    </div>
                  )}
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{companyDetails.name}</h2>
                    <p className="text-slate-300 font-medium">{t('header.company_tagline')}</p>
                  </div>
                </Link>
                
                <p className="text-slate-300 text-lg leading-relaxed">
                  {companyDetails.description}
                </p>
              </div>
            </div>

            {/* Second Division - Social Media Only */}
            <div className="flex flex-col justify-center h-full">
              <div>
                <h3 className="text-xl font-bold text-white mb-6 text-center">Follow Us</h3>
                <div className="flex justify-center space-x-6">
                  {companyDetails.social_media.facebook && (
                    <div className="group text-center">
                      <a href={companyDetails.social_media.facebook} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="relative p-4 bg-slate-700/50 rounded-xl text-slate-300 group-hover:text-white transition-colors duration-300 group-hover:bg-red-600/20 border border-slate-600 group-hover:border-red-400 mb-2">
                          <Facebook className="h-8 w-8" />
                        </div>
                        <span className="text-slate-400 text-sm font-medium">Facebook</span>
                      </a>
                    </div>
                  )}
                  
                  {companyDetails.social_media.twitter && (
                    <div className="group text-center">
                      <a href={companyDetails.social_media.twitter} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="relative p-4 bg-slate-700/50 rounded-xl text-slate-300 group-hover:text-white transition-colors duration-300 group-hover:bg-red-600/20 border border-slate-600 group-hover:border-red-400 mb-2">
                          <XIcon className="h-8 w-8" />
                        </div>
                        <span className="text-slate-400 text-sm font-medium">X</span>
                      </a>
                    </div>
                  )}
                  
                  {companyDetails.social_media.instagram && (
                    <div className="group text-center">
                      <a href={companyDetails.social_media.instagram} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="relative p-4 bg-slate-700/50 rounded-xl text-slate-300 group-hover:text-white transition-colors duration-300 group-hover:bg-red-600/20 border border-slate-600 group-hover:border-red-400 mb-2">
                          <Instagram className="h-8 w-8" />
                        </div>
                        <span className="text-slate-400 text-sm font-medium">Instagram</span>
                      </a>
                    </div>
                  )}
                  
                  {companyDetails.social_media.linkedin && (
                    <div className="group text-center">
                      <a href={companyDetails.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="relative p-4 bg-slate-700/50 rounded-xl text-slate-300 group-hover:text-white transition-colors duration-300 group-hover:bg-red-600/20 border border-slate-600 group-hover:border-red-400 mb-2">
                          <Linkedin className="h-8 w-8" />
                        </div>
                        <span className="text-slate-400 text-sm font-medium">LinkedIn</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="border-t border-slate-700/50 mt-16 pt-8">
          <div className="text-center">
            <div className="mb-4">
              <p className="text-slate-400 font-medium">
                &copy; {new Date().getFullYear()} {t('header.company_name')}. {t('footer.rights')}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Crafted with excellence for industrial kitchen solutions
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-6">
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