import type { Playlist } from '@/types';
import { Card } from '@/components/ui';
import { Music, Calendar, Check } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

interface PlaylistCardProps {
  playlist: Playlist;
  selected?: boolean;
  onClick: () => void;
}

export function PlaylistCard({ playlist, selected, onClick }: PlaylistCardProps) {
  return (
    <Card
      hover
      onClick={onClick}
      className={cn(
        'transition-all duration-200',
        selected && 'ring-2 ring-primary border-primary'
      )}
    >
      <div className="flex gap-4">
        {/* Playlist image */}
        <div className="flex-shrink-0">
          {playlist.imageUrl ? (
            <img
              src={playlist.imageUrl}
              alt={playlist.name}
              className="w-20 h-20 rounded-md object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-md bg-surface-hover flex items-center justify-center">
              <Music className="w-8 h-8 text-text-muted" />
            </div>
          )}
        </div>

        {/* Playlist info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold truncate">{playlist.name}</h3>
            {selected && (
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          <div className="mt-1 space-y-1">
            <p className="text-sm text-text-muted">
              {playlist.trackCount} utworów
            </p>

            {playlist.createdAt && (
              <div className="flex items-center gap-1 text-xs text-text-muted">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(playlist.createdAt)}</span>
              </div>
            )}

            {playlist.owner && (
              <p className="text-xs text-text-muted">
                Autor: {playlist.owner}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
