import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { languages } from '@/lib/languages';
import { cn } from '@/lib/utils';

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-1 px-3 py-1 rounded transition-all ${
          isOpen
            ? 'bg-red-600 font-semibold'
            : 'bg-white/5'
        }`}
      >
        <span className="text-sm">{currentLang?.flag}</span>
        <span className="text-sm">{currentLang?.name}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  setCurrentLanguage(language.code);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center space-x-3 px-4 py-3 text-sm text-left transition-all',
                  currentLanguage === language.code
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-slate-700 hover:bg-red-600/80 hover:text-white'
                )}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};