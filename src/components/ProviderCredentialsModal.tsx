import { useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { providerService } from '@/services/api';
import { getSpotifyConfig, getTidalConfig } from '@/config/api';
import { analytics } from '@/lib/analytics';
import { getProviderName } from '@/lib/utils';
import { ShieldCheck, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

interface ProviderCredentialsModalProps {
  isOpen: boolean;
  provider: 'spotify' | 'tidal' | null;
  mode: 'source' | 'target' | null;
  onClose: () => void;
}

export function ProviderCredentialsModal({
  isOpen,
  provider,
  mode,
  onClose,
}: ProviderCredentialsModalProps) {
  const { t } = useTranslation();
  const setProviderCredentials = useAppStore(state => state.setProviderCredentials);
  const getProviderCredentials = useAppStore(state => state.getProviderCredentials);

  const existing = provider ? getProviderCredentials(provider) : null;

  const [clientId, setClientId] = useState(existing?.clientId || '');
  const [clientSecret, setClientSecret] = useState(existing?.clientSecret || '');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!provider) return null;

  const providerName = getProviderName(provider);
  const redirectUri = provider === 'spotify'
    ? getSpotifyConfig().redirectUri
    : getTidalConfig().redirectUri;

  const dashboardUrl = provider === 'spotify'
    ? 'https://developer.spotify.com/dashboard'
    : 'https://developer.tidal.com/';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(redirectUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy redirect URI:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedClientId = clientId.trim();
    const trimmedClientSecret = clientSecret.trim();

    if (!trimmedClientId || !trimmedClientSecret) {
      setError(t('credentials.errorMissing'));
      return;
    }

    setError(null);

    // Save credentials to browser store (persisted in localStorage)
    setProviderCredentials(provider, {
      clientId: trimmedClientId,
      clientSecret: trimmedClientSecret,
    });

    analytics.credentialsSaved(provider);

    if (mode) {
      sessionStorage.setItem('auth_mode', mode);
      sessionStorage.setItem('auth_provider', provider);
    }

    analytics.loginAttempted(provider);

    try {
      const authUrl = providerService.getAuthUrl(provider);
      console.log(`[ProviderCredentialsModal] Redirecting to auth: ${authUrl}`);
      window.location.href = authUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate auth URL';
      console.error('[ProviderCredentialsModal] Auth error:', message);
      setError(message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('credentials.title', { provider: providerName })}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Privacy Notice Banner */}
        <div className="flex items-start gap-3 p-3.5 bg-primary/10 border border-primary/20 rounded-lg text-sm">
          <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="font-medium text-text">
            {t('credentials.privacyNotice')}
          </p>
        </div>

        <p className="text-sm text-text-muted">
          {t('credentials.description', { provider: providerName })}
        </p>

        {/* Inputs */}
        <div className="space-y-3">
          <Input
            label={t('credentials.clientId')}
            placeholder={t('credentials.clientIdPlaceholder')}
            value={clientId}
            onChange={(e) => {
              setClientId(e.target.value);
              setError(null);
            }}
            className="font-mono text-sm"
            autoFocus
          />

          <Input
            label={t('credentials.clientSecret')}
            placeholder={t('credentials.clientSecretPlaceholder')}
            type="password"
            value={clientSecret}
            onChange={(e) => {
              setClientSecret(e.target.value);
              setError(null);
            }}
            className="font-mono text-sm"
          />
        </div>

        {/* Redirect URI Info Box */}
        <div className="p-3 bg-surface-hover rounded-lg border border-border space-y-2 text-xs">
          <p className="text-text-muted font-medium">
            {t('credentials.redirectUriLabel')}
          </p>
          <div className="flex items-center gap-2 bg-background p-2 rounded border border-border">
            <code className="flex-1 font-mono text-xs text-text break-all">
              {redirectUri}
            </code>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="flex-shrink-0"
              title={copied ? t('credentials.copied') : t('credentials.copy')}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>

          <div className="pt-1 flex items-center justify-between">
            <a
              href={dashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
            >
              {t('credentials.openDashboard', { provider: providerName })}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-md text-error text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!clientId.trim() || !clientSecret.trim()}
            className="flex-1"
          >
            {t('credentials.saveAndConnect')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
