import type { ImportProgress as ImportProgressType } from '@/types';
import { ProgressBar, Card } from '@/components/ui';
import { Music, SkipForward, CheckCircle } from 'lucide-react';

interface ImportProgressProps {
  progress: ImportProgressType;
}

export function ImportProgress({ progress }: ImportProgressProps) {
  return (
    <Card className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Importowanie playlisty...</h3>
        <p className="text-text-muted">
          Przenoszenie utworów do docelowego serwisu
        </p>
      </div>

      {/* Progress bar */}
      <ProgressBar value={progress.current} max={progress.total} />

      {/* Current track */}
      {progress.currentTrack && (
        <div className="flex items-center gap-3 p-3 bg-surface-hover rounded-md">
          <Music className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-medium truncate">{progress.currentTrack.title}</p>
            <p className="text-sm text-text-muted truncate">
              {progress.currentTrack.artist.name} • {progress.currentTrack.album.title}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 p-3 bg-success/10 rounded-md">
          <CheckCircle className="w-5 h-5 text-success" />
          <div>
            <p className="text-sm text-text-muted">Zaimportowane</p>
            <p className="font-bold text-success">{progress.imported}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-md">
          <SkipForward className="w-5 h-5 text-warning" />
          <div>
            <p className="text-sm text-text-muted">Pominięte</p>
            <p className="font-bold text-warning">{progress.skipped}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
