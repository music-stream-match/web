import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Language, TranslationKeys } from './types';
import { detectBrowserLanguage, getTranslations, translate, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './index';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: TranslationKeys;
}

const I18nContext = createContext<I18nContextType | null>(null);

const LANGUAGE_STORAGE_KEY = 'msm_language';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check if there's a saved language preference
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
      console.log(`[i18n] Using saved language: ${saved}`);
      return saved as Language;
    }
    // Otherwise detect from browser
    return detectBrowserLanguage();
  });

  const setLanguage = (lang: Language) => {
    console.log(`[i18n] Setting language to: ${lang}`);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    setLanguageState(lang);
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    // Update document direction for RTL languages
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  // Set initial HTML attributes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>) => {
    return translate(language, key, params);
  };

  const translations = getTranslations(language);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE };
export type { Language };
