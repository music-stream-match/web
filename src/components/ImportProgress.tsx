import { useState } from 'react';
import type { ImportProgress as ImportProgressType } from '@/types';
import { ProgressBar, Card } from '@/components/ui';
import { Music, SkipForward, CheckCircle, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

interface ImportProgressProps {
  progress: ImportProgressType;
}

export function ImportProgress({ progress }: ImportProgressProps) {
  const { t } = useTranslation();
  const [showImported, setShowImported] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);

  // Get last N tracks for display (most recent first)
  const recentImported = [...progress.importedTracks].reverse().slice(0, 50);
  const recentSkipped = [...progress.skippedTracks].reverse().slice(0, 50);

  return (
    <Card className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{t('import.importing')}</h3>
        <p className="text-text-muted">
          {t('import.transferringTracks')}
        </p>
      </div>

      {/* Progress bar */}
      <ProgressBar value={progress.current} max={progress.total} />

      {/* Current track */}
      {progress.currentTrack && (
        <div className="flex items-center gap-3 p-3 bg-surface-hover rounded-md">
          <Music className="w-5 h-5 text-primary flex-shrink-0 animate-pulse" />
          <div className="min-w-0">
            <p className="font-medium truncate">{progress.currentTrack.title}</p>
            <p className="text-sm text-text-muted truncate">
              {progress.currentTrack.artistName}{progress.currentTrack.albumTitle ? ` • ${progress.currentTrack.albumTitle}` : ''}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className={`grid gap-4 ${progress.duplicatesSkipped ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <button
          onClick={() => setShowImported(!showImported)}
          className="flex items-center gap-2 p-3 bg-success/10 rounded-md hover:bg-success/20 transition-colors text-left"
        >
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-muted">{t('import.imported')}</p>
            <p className="font-bold text-success">{progress.imported}</p>
          </div>
          {progress.imported > 0 && (
            showImported ? <ChevronUp className="w-4 h-4 text-success" /> : <ChevronDown className="w-4 h-4 text-success" />
          )}
        </button>

        <button
          onClick={() => setShowSkipped(!showSkipped)}
          className="flex items-center gap-2 p-3 bg-warning/10 rounded-md hover:bg-warning/20 transition-colors text-left"
        >
          <SkipForward className="w-5 h-5 text-warning flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-muted">{t('import.skipped')}</p>
            <p className="font-bold text-warning">{progress.skipped}</p>
          </div>
          {progress.skipped > 0 && (
            showSkipped ? <ChevronUp className="w-4 h-4 text-warning" /> : <ChevronDown className="w-4 h-4 text-warning" />
          )}
        </button>

        {progress.duplicatesSkipped ? (
          <div className="flex items-center gap-2 p-3 bg-text-muted/10 rounded-md">
            <Copy className="w-5 h-5 text-text-muted" />
            <div>
              <p className="text-sm text-text-muted">{t('import.duplicates')}</p>
              <p className="font-bold text-text-muted">{progress.duplicatesSkipped}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Imported tracks list */}
      {showImported && recentImported.length > 0 && (
        <div className="border border-success/30 rounded-md overflow-hidden">
          <div className="bg-success/10 px-3 py-2 text-sm font-medium text-success flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {t('import.recentlyImported')}
          </div>
          <div className="max-h-48 overflow-y-auto">
            {recentImported.map((track, index) => (
              <div 
                key={`${track.id}-${index}`}
                className="px-3 py-2 border-t border-success/10 first:border-t-0 text-sm"
              >
                <p className="truncate font-medium">{track.title}</p>
                <p className="truncate text-text-muted text-xs">{track.artistName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skipped tracks list */}
      {showSkipped && recentSkipped.length > 0 && (
        <div className="border border-warning/30 rounded-md overflow-hidden">
          <div className="bg-warning/10 px-3 py-2 text-sm font-medium text-warning flex items-center gap-2">
            <SkipForward className="w-4 h-4" />
            {t('import.recentlySkipped')}
          </div>
          <div className="max-h-48 overflow-y-auto">
            {recentSkipped.map((track, index) => (
              <div 
                key={`${track.id}-${index}`}
                className="px-3 py-2 border-t border-warning/10 first:border-t-0 text-sm"
              >
                <p className="truncate font-medium">{track.title}</p>
                <p className="truncate text-text-muted text-xs">{track.artistName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
