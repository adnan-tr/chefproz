import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultLanguage } from '@/lib/languages';
import { supabase } from '@/lib/supabase';

interface LanguageContextType {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Empty initial translations - will be populated from database only
const emptyTranslations: Record<string, Record<string, string>> = {
  en: {},
  ar: {},
  es: {},
  tr: {},
  ru: {}
};
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || defaultLanguage;
  });
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>(emptyTranslations);
  const [isLoading, setIsLoading] = useState(true);
  // Load translations from database
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        // First check if translations table exists by trying a simple count query
        const { error: tableError } = await supabase
          .from('translations')
          .select('count', { count: 'exact', head: true })
          .limit(1);
        if (tableError) {
          console.warn('Translations table not accessible:', tableError.message);
          setIsLoading(false);
          return;
        }
        // Fetch translations from the column-based table structure (key, en, ar, tr, es, ru)
        const { data: translationsData, error } = await supabase
          .from('translations')
          .select('key, en, ar, tr, es, ru');
        if (error) {
          console.warn('Error fetching translations:', error.message);
          setIsLoading(false);
          return;
        }
        // Transform the data into the expected format
        const transformedTranslations: Record<string, Record<string, string>> = {
          en: {},
          ar: {},
          es: {},
          tr: {},
          ru: {}
        };
        translationsData?.forEach((item: any) => {
          if (item.key) {
            transformedTranslations.en[item.key] = item.en || item.key;
            transformedTranslations.ar[item.key] = item.ar || item.key;
            transformedTranslations.tr[item.key] = item.tr || item.key;
            transformedTranslations.es[item.key] = item.es || item.key;
            transformedTranslations.ru[item.key] = item.ru || item.key;
          }
        });
        // Log for debugging
        console.log('Loaded translations:', transformedTranslations);
        
        setTranslations(transformedTranslations);
      } catch (error) {
        console.warn('Error loading translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, []);
  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);
  const t = (key: string, fallback?: string) => {
    // First try the current language
    const currentLangTranslation = translations[currentLanguage]?.[key];
    if (currentLangTranslation) {
      return currentLangTranslation;
    }
    
    // If not found, fallback to English
    const englishTranslation = translations['en']?.[key];
    if (englishTranslation) {
      return englishTranslation;
    }
    
    // If still not found, use provided fallback or the key itself
    return fallback || key;
  };
  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};