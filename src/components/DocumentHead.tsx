import { useEffect } from 'react';
import { useTranslation } from '@/i18n/useTranslation';

/**
 * Component that updates document title and meta description based on current language
 */
export function DocumentHead() {
  const { t, language } = useTranslation();

  useEffect(() => {
    // Update document title
    document.title = `${t('app.name')} - ${t('app.tagline')}`;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('app.tagline'));
    }

    // Update HTML lang attribute
    document.documentElement.lang = language;
    
    console.log(`[DocumentHead] Updated document metadata for language: ${language}`);
  }, [language, t]);

  return null;
}
