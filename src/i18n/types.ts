import type en from './translations/en.json';

export type TranslationKeys = typeof en;

export type Language = 
  | 'en' // English
  | 'zh' // Chinese
  | 'es' // Spanish
  | 'hi' // Hindi
  | 'ar' // Arabic
  | 'pt' // Portuguese
  | 'bn' // Bengali
  | 'ru' // Russian
  | 'ja' // Japanese
  | 'de' // German
  | 'ko' // Korean
  | 'fr' // French
  | 'vi' // Vietnamese
  | 'it' // Italian
  | 'tr' // Turkish
  | 'pl'; // Polish

export const SUPPORTED_LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
];

export const DEFAULT_LANGUAGE: Language = 'en';
