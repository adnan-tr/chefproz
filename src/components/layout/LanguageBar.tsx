import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { languages } from '@/lib/languages';

export const LanguageBar: React.FC = () => {
  const { currentLanguage, setCurrentLanguage, t } = useLanguage();

  return (
    <div className="language-bar sticky top-0 z-50 bg-red-600 text-white py-2 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-1">
          <span className="mr-4 font-medium">{t('language.select')}:</span>
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => setCurrentLanguage(language.code)}
              className={`flex items-center space-x-1 px-3 py-1 rounded transition-all ${
                currentLanguage === language.code
                  ? 'bg-white/20 font-semibold'
                  : 'hover:bg-white/10'
              }`}
            >
              <span className="text-sm">{language.flag}</span>
              <span className="text-sm">{language.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};