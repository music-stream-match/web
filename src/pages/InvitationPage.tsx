import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { analytics } from '@/lib/analytics';
import { Button, Input } from '@/components/ui';
import { Music2, KeyRound, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { LanguageSelector } from '@/components/LanguageSelector';
import { OnboardingModal, useOnboarding } from '@/components/OnboardingModal';
import type { InvitationConfig } from '@/types';

export function InvitationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setInvitation } = useAppStore();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError(t('invitation.error'));
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log(`[InvitationPage] Validating invitation code: ${trimmedCode}`);

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}${trimmedCode}.json`);
      
      if (!response.ok) {
        console.log(`[InvitationPage] Invalid invitation code: ${trimmedCode}, status: ${response.status}`);
        setError(t('invitation.invalid'));
        setIsLoading(false);
        return;
      }

      const config: InvitationConfig = await response.json();
      console.log(`[InvitationPage] Valid invitation code: ${trimmedCode}, config:`, config.name);
      
      analytics.invitationCodeSaved(trimmedCode.length);
      setInvitation(trimmedCode, config);
      navigate('/');
    } catch (err) {
      console.error('[InvitationPage] Error validating invitation code:', err);
      setError(t('invitation.invalid'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 flex items-center justify-center relative">
      {/* Language selector */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Music2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('app.name')}</h1>
          <p className="text-text-muted">
            {t('invitation.tagline')}
          </p>
        </div>

        {/* Invitation Form */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{t('invitation.title')}</h2>
              <p className="text-sm text-text-muted">
                {t('invitation.description')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('invitation.label')}
              placeholder={t('invitation.placeholder')}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
              error={error || undefined}
              disabled={isLoading}
              autoFocus
            />

            {error && (
              <div className="flex items-center gap-2 text-error text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !code.trim()}
            >
              {isLoading ? t('common.checking') : t('common.continue')}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          {t('invitation.noCode')}
        </p>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal 
        isOpen={showOnboarding} 
        onClose={completeOnboarding} 
      />
    </div>
  );
}
