import type { PlaylistLoadingProgress } from '@/types';
import { ProgressBar, Card } from '@/components/ui';
import { Loader2, Music, ListMusic } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';
import { getProviderName } from '@/lib/utils';
import type { Provider } from '@/types';

interface PlaylistLoadingProps {
  progress: PlaylistLoadingProgress;
  provider: Provider;
  playlistName: string;
}

export function PlaylistLoading({ progress, provider, playlistName }: PlaylistLoadingProps) {
  const { t } = useTranslation();
  const providerName = getProviderName(provider);

  return (
    <Card className="space-y-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <ListMusic className="w-12 h-12 text-primary" />
            <Loader2 className="w-6 h-6 text-primary absolute -bottom-1 -right-1 animate-spin" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">{t('import.loadingPlaylist')}</h3>
        <p className="text-text-muted">
          {t('import.loadingPlaylistHint', { provider: providerName })}
        </p>
      </div>

      {/* Playlist info */}
      <div className="flex items-center gap-3 p-3 bg-surface-hover rounded-md">
        <Music className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{playlistName}</p>
          <p className="text-sm text-text-muted">
            {progress.phase === 'loading' && progress.total > 0 
              ? t('import.loadedTracks', { count: progress.current, total: progress.total })
              : progress.phase === 'preparing'
                ? t('import.preparingImport')
                : t('import.loadingTracks')
            }
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {progress.total > 0 && (
        <ProgressBar value={progress.current} max={progress.total} />
      )}

      {/* Loading indicator for unknown total */}
      {progress.total === 0 && (
        <div className="flex justify-center py-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>
      )}
    </Card>
  );
}
