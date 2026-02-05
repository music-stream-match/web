import type { Language, TranslationKeys } from './types';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './types';

// Import all translation files
import en from './translations/en.json';
import zh from './translations/zh.json';
import es from './translations/es.json';
import hi from './translations/hi.json';
import ar from './translations/ar.json';
import pt from './translations/pt.json';
import bn from './translations/bn.json';
import ru from './translations/ru.json';
import ja from './translations/ja.json';
import de from './translations/de.json';
import ko from './translations/ko.json';
import fr from './translations/fr.json';
import vi from './translations/vi.json';
import it from './translations/it.json';
import tr from './translations/tr.json';
import pl from './translations/pl.json';

const translations: Record<Language, TranslationKeys> = {
  en,
  zh,
  es,
  hi,
  ar,
  pt,
  bn,
  ru,
  ja,
  de,
  ko,
  fr,
  vi,
  it,
  tr,
  pl,
};

/**
 * Detect the user's preferred language from browser settings
 */
export function detectBrowserLanguage(): Language {
  // Get browser languages (ordered by preference)
  const browserLanguages = navigator.languages || [navigator.language];
  
  console.log('[i18n] Browser languages:', browserLanguages);
  
  for (const lang of browserLanguages) {
    // Get the primary language code (e.g., 'en' from 'en-US')
    const primaryLang = lang.split('-')[0].toLowerCase() as Language;
    
    // Check if we support this language
    if (SUPPORTED_LANGUAGES.some(l => l.code === primaryLang)) {
      console.log(`[i18n] Detected language: ${primaryLang}`);
      return primaryLang;
    }
  }
  
  console.log(`[i18n] No supported language found, using default: ${DEFAULT_LANGUAGE}`);
  return DEFAULT_LANGUAGE;
}

/**
 * Get translations for a specific language
 */
export function getTranslations(language: Language): TranslationKeys {
  return translations[language] || translations[DEFAULT_LANGUAGE];
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return typeof current === 'string' ? current : undefined;
}

/**
 * Translate a key with optional interpolation
 */
export function translate(
  language: Language,
  key: string,
  params?: Record<string, string | number>
): string {
  const translationData = getTranslations(language);
  let text = getNestedValue(translationData as unknown as Record<string, unknown>, key);
  
  if (!text) {
    // Fallback to English if key not found
    text = getNestedValue(translations[DEFAULT_LANGUAGE] as unknown as Record<string, unknown>, key);
  }
  
  if (!text) {
    console.warn(`[i18n] Missing translation for key: ${key}`);
    return key;
  }
  
  // Replace interpolation variables {{variable}}
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text!.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
    });
  }
  
  return text;
}

export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE };
export type { Language, TranslationKeys };
