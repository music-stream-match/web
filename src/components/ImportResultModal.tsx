import type { ImportResult } from '@/types';
import { Modal, Button } from '@/components/ui';
import { CheckCircle, SkipForward, Clock, ExternalLink, Music } from 'lucide-react';
import { formatDuration, getProviderName } from '@/lib/utils';
import { providerService } from '@/services/api';

interface ImportResultModalProps {
  result: ImportResult | null;
  onClose: () => void;
}

export function ImportResultModal({ result, onClose }: ImportResultModalProps) {
  if (!result) return null;

  const sourceUrl = providerService.getPlaylistUrl(result.sourceProvider, result.sourcePlaylist.id);
  const targetUrl = result.targetPlaylistId
    ? providerService.getPlaylistUrl(result.targetProvider, result.targetPlaylistId)
    : '#';

  return (
    <Modal isOpen={!!result} onClose={onClose} title="Import zakończony!">
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
            <p className="text-xs text-text-muted mb-1">Playlista źródłowa ({getProviderName(result.sourceProvider)})</p>
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
            <p className="text-xs text-text-muted mb-1">Playlista docelowa ({getProviderName(result.targetProvider)})</p>
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
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-success/10 rounded-md">
            <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-2xl font-bold text-success">{result.imported}</p>
            <p className="text-xs text-text-muted">Zaimportowane</p>
          </div>

          <div className="text-center p-3 bg-warning/10 rounded-md">
            <SkipForward className="w-5 h-5 text-warning mx-auto mb-1" />
            <p className="text-2xl font-bold text-warning">{result.skipped}</p>
            <p className="text-xs text-text-muted">Pominięte</p>
          </div>

          <div className="text-center p-3 bg-primary/10 rounded-md">
            <Clock className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary">{formatDuration(result.duration)}</p>
            <p className="text-xs text-text-muted">Czas</p>
          </div>
        </div>

        {/* Skipped tracks */}
        {result.skippedTracks.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Pominięte utwory:</p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {result.skippedTracks.map((track, index) => (
                <div
                  key={`${track._id}-${index}`}
                  className="text-sm p-2 bg-surface-hover rounded-md"
                >
                  <span className="font-medium">{track.title}</span>
                  <span className="text-text-muted"> - {track.artist.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Zamknij
          </Button>
          <Button
            variant="primary"
            onClick={() => window.open(targetUrl, '_blank')}
            className="flex-1"
          >
            Otwórz playlistę
          </Button>
        </div>
      </div>
    </Modal>
  );
}
