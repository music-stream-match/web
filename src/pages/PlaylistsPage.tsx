import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Playlist } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { providerService } from '@/services/api';
import { PlaylistCard } from '@/components/PlaylistCard';
import { Button } from '@/components/ui';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import { getProviderName } from '@/lib/utils';

export function PlaylistsPage() {
  const navigate = useNavigate();
  const { sourceProvider, getAuth, setSelectedPlaylist, selectedPlaylist } = useAppStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!sourceProvider) {
      console.log('[PlaylistsPage] No source provider, redirecting to home');
      navigate('/');
      return;
    }

    const auth = getAuth(sourceProvider);
    if (!auth) {
      console.log('[PlaylistsPage] Not logged in, redirecting to home');
      navigate('/');
      return;
    }

    fetchPlaylists();
  }, [sourceProvider]);

  const fetchPlaylists = async () => {
    if (!sourceProvider) return;

    const auth = getAuth(sourceProvider);
    if (!auth) return;

    try {
      setLoading(true);
      setError(null);
      console.log(`[PlaylistsPage] Fetching playlists from ${sourceProvider}...`);

      const fetchedPlaylists = await providerService.getPlaylists(sourceProvider, auth);
      setPlaylists(fetchedPlaylists);
      console.log(`[PlaylistsPage] Loaded ${fetchedPlaylists.length} playlists`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch playlists';
      console.error('[PlaylistsPage] Error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    console.log(`[PlaylistsPage] Selected playlist: ${playlist.name}`);
    setSelectedPlaylist(playlist);
    navigate('/');
  };

  const filteredPlaylists = playlists.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-text-muted">Ładowanie playlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="w-4 h-4" />
            Powrót
          </Button>

          <h1 className="text-2xl font-bold">
            Wybierz playlistę z {sourceProvider && getProviderName(sourceProvider)}
          </h1>
          <p className="text-text-muted mt-1">
            Znaleziono {playlists.length} playlist
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Szukaj playlisty..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-error/10 border border-error rounded-md mb-6">
            <p className="text-error">{error}</p>
            <Button variant="secondary" onClick={fetchPlaylists} className="mt-2">
              Spróbuj ponownie
            </Button>
          </div>
        )}

        {/* Playlists */}
        <div className="space-y-3">
          {filteredPlaylists.map(playlist => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              selected={selectedPlaylist?.id === playlist.id}
              onClick={() => handlePlaylistSelect(playlist)}
            />
          ))}

          {filteredPlaylists.length === 0 && !loading && (
            <div className="text-center py-12 text-text-muted">
              <p>Nie znaleziono żadnych playlist</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
