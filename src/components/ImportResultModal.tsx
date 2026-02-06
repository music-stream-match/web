import { useState } from 'react';
import type { ImportResult } from '@/types';
import { Modal, Button } from '@/components/ui';
import { CheckCircle, SkipForward, Clock, ExternalLink, Music, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDuration, getProviderName } from '@/lib/utils';
import { providerService } from '@/services/api';
import { useTranslation } from '@/i18n/useTranslation';

interface ImportResultModalProps {
  result: ImportResult | null;
  onClose: () => void;
}

export function ImportResultModal({ result, onClose }: ImportResultModalProps) {
  const { t } = useTranslation();
  const [showImported, setShowImported] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);

  if (!result) return null;

  const sourceUrl = providerService.getPlaylistUrl(result.sourceProvider, result.sourcePlaylist.id);
  const targetUrl = result.targetPlaylistId
    ? providerService.getPlaylistUrl(result.targetProvider, result.targetPlaylistId)
    : '#';

  return (
    <Modal isOpen={!!result} onClose={onClose} title={t('result.title')}>
      <div className="space-y-6">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
        </div>

        {/* Playlists info */}
        <div className="space-y-3">
          <div className="p-3 bg-surface-hover rounded-md">
            <p className="text-xs text-text-muted mb-1">{t('result.sourcePlaylist', { provider: getProviderName(result.sourceProvider) })}</p>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Music className="w-4 h-4" />
              <span className="font-medium">{result.sourcePlaylist.name}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-3 bg-surface-hover rounded-md">
            <p className="text-xs text-text-muted mb-1">{t('result.targetPlaylist', { provider: getProviderName(result.targetProvider) })}</p>
            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Music className="w-4 h-4" />
              <span className="font-medium">{result.targetPlaylistName}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className={`grid gap-3 ${result.duplicatesSkipped ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <button
            onClick={() => result.imported > 0 && setShowImported(!showImported)}
            disabled={result.imported === 0}
            className="text-center p-3 bg-success/10 rounded-md hover:bg-success/20 transition-colors disabled:cursor-default disabled:hover:bg-success/10"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="w-5 h-5 text-success" />
              {result.imported > 0 && (
                showImported ? <ChevronUp className="w-4 h-4 text-success" /> : <ChevronDown className="w-4 h-4 text-success" />
              )}
            </div>
            <p className="text-2xl font-bold text-success">{result.imported}</p>
            <p className="text-xs text-text-muted">{t('import.imported')}</p>
          </button>

          <button
            onClick={() => result.skipped > 0 && setShowSkipped(!showSkipped)}
            disabled={result.skipped === 0}
            className="text-center p-3 bg-warning/10 rounded-md hover:bg-warning/20 transition-colors disabled:cursor-default disabled:hover:bg-warning/10"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <SkipForward className="w-5 h-5 text-warning" />
              {result.skipped > 0 && (
                showSkipped ? <ChevronUp className="w-4 h-4 text-warning" /> : <ChevronDown className="w-4 h-4 text-warning" />
              )}
            </div>
            <p className="text-2xl font-bold text-warning">{result.skipped}</p>
            <p className="text-xs text-text-muted">{t('import.skipped')}</p>
          </button>

          {result.duplicatesSkipped ? (
            <div className="text-center p-3 bg-text-muted/10 rounded-md">
              <Copy className="w-5 h-5 text-text-muted mx-auto mb-1" />
              <p className="text-2xl font-bold text-text-muted">{result.duplicatesSkipped}</p>
              <p className="text-xs text-text-muted">{t('import.duplicates')}</p>
            </div>
          ) : null}

          <div className="text-center p-3 bg-primary/10 rounded-md">
            <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary">{formatDuration(result.duration)}</p>
            <p className="text-xs text-text-muted">{t('import.time')}</p>
          </div>
        </div>

        {/* Imported tracks list */}
        {showImported && result.importedTracks.length > 0 && (
          <div className="border border-success/30 rounded-md overflow-hidden">
            <div className="bg-success/10 px-3 py-2 text-sm font-medium text-success flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {t('import.recentlyImported')} ({result.importedTracks.length})
            </div>
            <div className="max-h-48 overflow-y-auto">
              {result.importedTracks.map((track, index) => (
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
        {showSkipped && result.skippedTracks.length > 0 && (
          <div className="border border-warning/30 rounded-md overflow-hidden">
            <div className="bg-warning/10 px-3 py-2 text-sm font-medium text-warning flex items-center gap-2">
              <SkipForward className="w-4 h-4" />
              {t('import.recentlySkipped')} ({result.skippedTracks.length})
            </div>
            <div className="max-h-48 overflow-y-auto">
              {result.skippedTracks.map((track, index) => (
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

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {t('common.close')}
          </Button>
          <Button
            variant="primary"
            onClick={() => window.open(targetUrl, '_blank')}
            className="flex-1"
          >
            {t('result.openPlaylist')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
