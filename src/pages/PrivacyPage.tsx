import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';
import { ArrowLeft, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui';
import { LanguageSelector } from '@/components/LanguageSelector';

const THIRD_PARTY_SERVICES = [
  {
    name: 'TIDAL',
    purpose: 'Playlist read/write via OAuth',
    url: 'https://tidal.com/privacy',
  },
  {
    name: 'Spotify',
    purpose: 'Playlist read/write via OAuth',
    url: 'https://www.spotify.com/privacy',
  },
  {
    name: 'Apple Music',
    purpose: 'Playlist read/write via MusicKit JS',
    url: 'https://www.apple.com/privacy/',
  },
  {
    name: 'Deezer',
    purpose: 'Playlist read/write via ARL',
    url: 'https://www.deezer.com/legal/personal-datas',
  },
  {
    name: 'Google Analytics',
    purpose: 'Anonymous usage analytics',
    url: 'https://policies.google.com/privacy',
  },
  {
    name: 'Cloudflare',
    purpose: 'Deezer API proxy (CORS)',
    url: 'https://www.cloudflare.com/privacypolicy/',
  },
];

export function PrivacyPage() {
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
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('privacy.title')}</h1>
          <p className="text-text-muted text-sm">{t('privacy.lastUpdated')}</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">
          {/* Intro */}
          <p className="text-text-muted">{t('privacy.intro')}</p>

          {/* 1. Data Controller */}
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.controller.title')}</h2>
            <div className="bg-surface rounded-lg p-4 space-y-1">
              <p>Music Stream Match</p>
              <p>{t('privacy.controller.email')} <a href="mailto:music-stream-match@mobulum.com" className="text-primary hover:underline">music-stream-match@mobulum.com</a></p>
              <p>{t('privacy.controller.discord')} <a href="https://discord.gg/rwJcE5Zwez" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">discord.gg/rwJcE5Zwez <ExternalLink className="w-3 h-3" /></a></p>
            </div>
          </section>

          {/* 2. What Data We Collect */}
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.whatWeCollect.title')}</h2>

            {/* 2.1 localStorage */}
            <h3 className="text-lg font-medium mb-2">{t('privacy.whatWeCollect.localStorage.title')}</h3>
            <p className="text-text-muted mb-3">{t('privacy.whatWeCollect.localStorage.description')}</p>
            <ul className="list-disc list-inside space-y-1 text-text-muted mb-3 ml-2">
              <li>{t('privacy.whatWeCollect.localStorage.tokens')}</li>
              <li>{t('privacy.whatWeCollect.localStorage.arl')}</li>
              <li>{t('privacy.whatWeCollect.localStorage.invitation')}</li>
              <li>{t('privacy.whatWeCollect.localStorage.language')}</li>
              <li>{t('privacy.whatWeCollect.localStorage.profile')}</li>
            </ul>
            <p className="text-text-muted font-medium">{t('privacy.whatWeCollect.localStorage.noAccess')}</p>

            {/* 2.2 Analytics */}
            <h3 className="text-lg font-medium mt-6 mb-2">{t('privacy.whatWeCollect.analytics.title')}</h3>
            <p className="text-text-muted mb-2">{t('privacy.whatWeCollect.analytics.description')}</p>
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-sm">
              {t('privacy.whatWeCollect.analytics.link')} <ExternalLink className="w-3 h-3" />
            </a>

            {/* 2.3 Proxy */}
            <h3 className="text-lg font-medium mt-6 mb-2">{t('privacy.whatWeCollect.proxy.title')}</h3>
            <p className="text-text-muted mb-2">{t('privacy.whatWeCollect.proxy.description')}</p>
            <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-sm">
              {t('privacy.whatWeCollect.proxy.link')} <ExternalLink className="w-3 h-3" />
            </a>
          </section>

          {/* 3. How We Use Data */}
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.howWeUse.title')}</h2>
            <ul className="list-disc list-inside space-y-2 text-text-muted ml-2">
              <li>{t('privacy.howWeUse.tokens')}</li>
              <li>{t('privacy.howWeUse.analytics')}</li>
            </ul>
            <div className="mt-4 bg-surface rounded-lg p-4 space-y-1 text-text-muted">
              <p>✗ {t('privacy.howWeUse.noSell')}</p>
              <p>✗ {t('privacy.howWeUse.noProfiling')}</p>
              <p>✗ {t('privacy.howWeUse.noStore')}</p>
            </div>
          </section>

          {/* 4. Third-Party Services */}
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.thirdParty.title')}</h2>
            <p className="text-text-muted mb-4">{t('privacy.thirdParty.description')}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4 font-medium">{t('privacy.thirdParty.service')}</th>
                    <th className="py-2 pr-4 font-medium">{t('privacy.thirdParty.purpose')}</th>
                    <th className="py-2 font-medium">{t('privacy.thirdParty.privacyPolicy')}</th>
                  </tr>
                </thead>
                <tbody>
                  {THIRD_PARTY_SERVICES.map(service => (
                    <tr key={service.name} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-text-muted">{service.name}</td>
                      <td className="py-2 pr-4 text-text-muted">{service.purpose}</td>
                      <td className="py-2">
                        <a href={service.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                          Link <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. Data Retention */}
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.retention.title')}</h2>
            <ul className="list-disc list-inside space-y-2 text-text-muted ml-2">
              <li>{t('privacy.retention.browser')}</li>
              <li>{t('privacy.retention.analytics')}</li>
              <li>{t('privacy.retention.cloudflare')}</li>
            </ul>
          </section>

          {/* 6. Your Rights */}
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.rights.title')}</h2>
            <ul className="list-disc list-inside space-y-2 text-text-muted ml-2">
              <li>{t('privacy.rights.access')}</li>
              <li>{t('privacy.rights.delete')}</li>
              <li>{t('privacy.rights.optOut')}</li>
              <li>{t('privacy.rights.revoke')}</li>
            </ul>
          </section>

          {/* 7. Cookies */}
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.cookies.title')}</h2>
            <p className="text-text-muted">{t('privacy.cookies.description')}</p>
          </section>

          {/* 8. Children */}
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.children.title')}</h2>
            <p className="text-text-muted">{t('privacy.children.description')}</p>
          </section>

          {/* 9. Changes */}
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.changes.title')}</h2>
            <p className="text-text-muted">{t('privacy.changes.description')}</p>
          </section>

          {/* 10. Contact */}
          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.contact.title')}</h2>
            <p className="text-text-muted mb-3">{t('privacy.contact.description')}</p>
            <div className="bg-surface rounded-lg p-4 space-y-1">
              <p>{t('privacy.contact.email')} <a href="mailto:music-stream-match@mobulum.com" className="text-primary hover:underline">music-stream-match@mobulum.com</a></p>
              <p>{t('privacy.contact.discord')} <a href="https://discord.gg/rwJcE5Zwez" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">discord.gg/rwJcE5Zwez <ExternalLink className="w-3 h-3" /></a></p>
              <p>{t('privacy.contact.github')} <a href="https://github.com/music-stream-match" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">github.com/music-stream-match <ExternalLink className="w-3 h-3" /></a></p>
            </div>
          </section>
        </div>

        {/* Back button */}
        <div className="mt-12 text-center">
          <Button variant="secondary" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4" />
            {t('privacy.backToHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}
