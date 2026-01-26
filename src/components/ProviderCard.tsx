import type { Provider } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui';
import { Music, Check, LogOut } from 'lucide-react';
import { cn, getProviderName } from '@/lib/utils';

interface ProviderCardProps {
  provider: Provider;
  mode: 'source' | 'target';
  disabled?: boolean;
  selected?: boolean;
  onClick: () => void;
}

export function ProviderCard({ provider, mode, disabled, selected, onClick }: ProviderCardProps) {
  const auth = useAppStore(state => state.getAuth(provider));
  const setAuth = useAppStore(state => state.setAuth);
  const isLoggedIn = auth !== null;

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`[ProviderCard] Logging out from ${provider}`);
    setAuth(provider, null);
  };

  return (
    <Card
      hover={!disabled}
      onClick={disabled ? undefined : onClick}
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        disabled && 'opacity-40 cursor-not-allowed',
        selected && 'ring-2 ring-primary border-primary',
        !disabled && !selected && 'hover:shadow-lg'
      )}
    >
      {/* Provider gradient background */}
      <div
        className={cn(
          'absolute inset-0 opacity-10',
          provider === 'tidal' && 'bg-gradient-to-br from-tidal to-transparent',
          provider === 'deezer' && 'bg-gradient-to-br from-deezer to-transparent',
          provider === 'spotify' && 'bg-gradient-to-br from-spotify to-transparent'
        )}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                provider === 'tidal' && 'bg-tidal',
                provider === 'deezer' && 'bg-deezer',
                provider === 'spotify' && 'bg-spotify'
              )}
            >
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{getProviderName(provider)}</h3>
              <p className="text-sm text-text-muted">
                {mode === 'source' ? 'Serwis źródłowy' : 'Serwis docelowy'}
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
        {isLoggedIn ? (
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
                  <span className="text-sm font-medium">{auth?.user.name[0]}</span>
                </div>
              )}
              <span className="text-sm font-medium">{auth?.user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md hover:bg-surface transition-colors text-text-muted hover:text-error"
              title="Wyloguj"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-3 bg-surface-hover rounded-md text-center">
            <p className="text-sm text-text-muted">
              Kliknij aby się zalogować
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
