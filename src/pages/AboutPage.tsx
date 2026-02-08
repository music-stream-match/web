import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { ArrowLeft, Music2, Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui';
import { LanguageSelector } from '@/components/LanguageSelector';
import { analytics } from '@/lib/analytics';

export function AboutPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen p-6 relative">
      {/* Language selector */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Music2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('about.title')}</h1>
        </div>

        <div className="space-y-8">
          {/* What */}
          <section className="card p-6">
            <h2 className="text-xl font-semibold mb-3">{t('about.what.title')}</h2>
            <p className="text-text-muted leading-relaxed">{t('about.what.description')}</p>
          </section>

          {/* Why */}
          <section className="card p-6">
            <h2 className="text-xl font-semibold mb-3">{t('about.why.title')}</h2>
            <p className="text-text-muted leading-relaxed">{t('about.why.description')}</p>
          </section>

          {/* How */}
          <section className="card p-6">
            <h2 className="text-xl font-semibold mb-3">{t('about.how.title')}</h2>
            <p className="text-text-muted leading-relaxed mb-4">{t('about.how.description')}</p>
            <ol className="list-decimal list-inside space-y-2 text-text-muted ml-2">
              <li>{t('about.how.step1')}</li>
              <li>{t('about.how.step2')}</li>
              <li>{t('about.how.step3')}</li>
              <li>{t('about.how.step4')}</li>
              <li>{t('about.how.step5')}</li>
            </ol>
          </section>

          {/* Free forever */}
          <section className="card p-6 border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">{t('about.free.title')}</h2>
            </div>
            <p className="text-text-muted leading-relaxed mb-4">{t('about.free.description')}</p>
            <div className="flex flex-wrap gap-3">
              <a href="https://paypal.me/zenedithPL" target="_blank" rel="noopener noreferrer" onClick={() => analytics.externalLinkClicked('PayPal', 'https://paypal.me/zenedithPL', 'about_page')} className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
                PayPal <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://ko-fi.com/K3K11ABGW5" target="_blank" rel="noopener noreferrer" onClick={() => analytics.externalLinkClicked('Ko-fi', 'https://ko-fi.com/K3K11ABGW5', 'about_page')} className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
                Ko-fi <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://patreon.com/Zenedith" target="_blank" rel="noopener noreferrer" onClick={() => analytics.externalLinkClicked('Patreon', 'https://patreon.com/Zenedith', 'about_page')} className="inline-flex items-center gap-1 text-primary hover:underline text-sm">
                Patreon <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </section>
        </div>

        {/* Back button */}
        <div className="mt-12 text-center">
          <Button variant="secondary" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
            {t('about.backToHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}
