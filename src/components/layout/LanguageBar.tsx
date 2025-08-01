import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { languages } from '@/lib/languages';

export const LanguageBar: React.FC = () => {
  const { currentLanguage, setCurrentLanguage, t } = useLanguage();

  return (
    <div className="language-bar z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-2 lg:py-3 w-full relative overflow-hidden">
      {/* Background Pattern - matching Footer */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="relative px-2 sm:px-4 lg:px-6">
        {/* Mobile Layout: Two rows */}
        <div className="flex flex-col items-center justify-center gap-2 sm:hidden">
          <span className="font-semibold text-white flex-shrink-0 text-xs tracking-tight">{t('language.select')}:</span>
          
          {/* First row: en, ar, tr */}
          <div className="flex items-center gap-1 justify-center">
            {languages.slice(0, 3).map((language) => (
              <button
                key={language.code}
                onClick={() => setCurrentLanguage(language.code)}
                className={`group relative flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-300 font-medium text-xs ${
                  currentLanguage === language.code
                    ? 'bg-red-600 text-white font-semibold shadow-lg'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-red-600/80 hover:text-white border border-slate-600/50 hover:border-red-500/50'
                }`}
              >
                <img src={language.flagUrl} alt={language.country} className="w-4 h-3 object-cover rounded-sm" />
                <span className="text-xs font-medium">{language.name}</span>
              </button>
            ))}
          </div>
          
          {/* Second row: ru, es */}
          <div className="flex items-center gap-1 justify-center">
            {languages.slice(3, 5).map((language) => (
              <button
                key={language.code}
                onClick={() => setCurrentLanguage(language.code)}
                className={`group relative flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-300 font-medium text-xs ${
                  currentLanguage === language.code
                    ? 'bg-red-600 text-white font-semibold shadow-lg'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-red-600/80 hover:text-white border border-slate-600/50 hover:border-red-500/50'
                }`}
              >
                <img src={language.flagUrl} alt={language.country} className="w-4 h-3 object-cover rounded-sm" />
                <span className="text-xs font-medium">{language.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop/Laptop Layout: Single row */}
        <div className="hidden sm:flex items-center justify-center gap-2">
          <span className="font-semibold text-white flex-shrink-0 text-sm tracking-tight">{t('language.select')}:</span>
          
          {/* All languages in one row */}
          <div className="flex items-center gap-2 justify-center">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => setCurrentLanguage(language.code)}
                className={`group relative flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 font-medium text-sm ${
                  currentLanguage === language.code
                    ? 'bg-red-600 text-white font-semibold shadow-lg'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-red-600/80 hover:text-white border border-slate-600/50 hover:border-red-500/50'
                }`}
              >
                <img src={language.flagUrl} alt={language.country} className="w-4 h-3 object-cover rounded-sm" />
                <span className="text-sm font-medium">{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};