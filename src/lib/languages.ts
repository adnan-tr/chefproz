import { Language } from '@/types';

// 🌐 Language List
export const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    country: 'USA',
    flagUrl: 'https://flagcdn.com/us.svg',
    dir: 'ltr',
    active: true,
  },
  {
    code: 'ar',
    name: 'العربية',
    nativeName: 'العربية',
    country: 'Saudi Arabia',
    flagUrl: 'https://flagcdn.com/sa.svg',
    dir: 'rtl',
    active: true,
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    country: 'Turkey',
    flagUrl: 'https://flagcdn.com/tr.svg',
    dir: 'ltr',
    active: true,
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    country: 'Spain',
    flagUrl: 'https://flagcdn.com/es.svg',
    dir: 'ltr',
    active: true,
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    country: 'Russia',
    flagUrl: 'https://flagcdn.com/ru.svg',
    dir: 'ltr',
    active: true,
  },
];

// ✅ Named export
export const defaultLanguage = 'en';
