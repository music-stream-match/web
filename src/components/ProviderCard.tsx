import type { Provider } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui';
import { Music, Check, LogOut, Ban } from 'lucide-react';
import { cn, getProviderName } from '@/lib/utils';
import { useTranslation } from '@/i18n/useTranslation';
import { analytics } from '@/lib/analytics';

interface ProviderCardProps {
  provider: Provider;
  mode: 'source' | 'target';
  disabled?: boolean;
  selected?: boolean;
  onClick: () => void;
}

export function ProviderCard({ provider, mode, disabled, selected, onClick }: ProviderCardProps) {
  const { t } = useTranslation();
  const auth = useAppStore(state => state.getAuth(provider));
  const isLoggedIn = useAppStore(state => state.isLoggedIn(provider));
  const isSupported = useAppStore(state => state.isProviderSupported(provider));
  const logout = useAppStore(state => state.logout);

  const isApple = provider === 'apple';
  const isUnsupported = !isSupported && !isApple;
  const isCardDisabled = disabled || isApple || isUnsupported;

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`[ProviderCard] Logging out from ${provider}`);
    analytics.logoutClicked(provider);
    await logout(provider);
  };

  return (
    <Card
      hover={!isCardDisabled}
      onClick={isCardDisabled ? undefined : onClick}
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        isCardDisabled && 'opacity-40 cursor-not-allowed',
        selected && 'ring-2 ring-primary border-primary',
        !isCardDisabled && !selected && 'hover:shadow-lg'
      )}
    >
      {/* Provider gradient background */}
      <div
        className={cn(
          'absolute inset-0 opacity-10',
          provider === 'tidal' && 'bg-gradient-to-br from-tidal to-transparent',
          provider === 'deezer' && 'bg-gradient-to-br from-deezer to-transparent',
          provider === 'spotify' && 'bg-gradient-to-br from-spotify to-transparent',
          provider === 'apple' && 'bg-gradient-to-br from-apple to-transparent'
        )}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                provider === 'tidal' && 'bg-tidal border border-white/30',
                provider === 'deezer' && 'bg-deezer',
                provider === 'spotify' && 'bg-spotify',
                provider === 'apple' && 'bg-apple'
              )}
            >
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{getProviderName(provider)}</h3>
              <p className="text-sm text-text-muted">
                {mode === 'source' ? t('provider.sourceService') : t('provider.targetService')}
              </p>
            </div>
          </div>

          {selected && (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* User info */}
        {isApple ? (
          <div className="p-3 bg-surface-hover/50 rounded-md text-center border border-border/40">
            <p className="text-sm text-text-muted font-medium">
              {t('provider.disabled')}
            </p>
          </div>
        ) : isUnsupported ? (
          <div className="flex items-center gap-2 p-3 bg-error/10 rounded-md text-center">
            <Ban className="w-4 h-4 text-error flex-shrink-0" />
            <p className="text-sm text-error">
              {t('provider.unsupported')}
            </p>
          </div>
        ) : isLoggedIn ? (
          <div className="flex items-center justify-between p-3 bg-surface-hover rounded-md">
            <div className="flex items-center gap-3">
              {auth?.user.picture ? (
                <img
                  src={auth.user.picture}
                  alt={auth.user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {auth?.user.name?.[0] || (provider === 'deezer' ? 'D' : '?')}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium">
                {auth?.user.name || (provider === 'deezer' ? 'Deezer (ARL)' : t('provider.loggedIn'))}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md hover:bg-surface transition-colors text-text-muted hover:text-error"
              title={t('provider.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-3 bg-surface-hover rounded-md text-center">
            <p className="text-sm text-text-muted">
              {t('provider.clickToLogin')}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
