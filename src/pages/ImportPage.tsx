import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { providerService } from '@/services/api';
import { importPlaylist } from '@/services/import';
import { analytics } from '@/lib/analytics';
import { ImportProgress } from '@/components/ImportProgress';
import { ImportResultModal } from '@/components/ImportResultModal';
import { Button, Input, Card } from '@/components/ui';
import { ArrowLeft, AlertCircle, Play } from 'lucide-react';
import { getProviderName } from '@/lib/utils';
import type { Playlist } from '@/types';

export function ImportPage() {
  const navigate = useNavigate();
  const {
    sourceProvider,
    targetProvider,
    selectedPlaylist,
    getAuth,
    isLoggedIn,
    importProgress,
    setImportProgress,
    importResult,
    setImportResult,
    reset,
  } = useAppStore();

  const [targetPlaylistName, setTargetPlaylistName] = useState(selectedPlaylist?.name || '');
  const [existingPlaylist, setExistingPlaylist] = useState<Playlist | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [allowDuplicates, setAllowDuplicates] = useState(false);

  useEffect(() => {
    if (!sourceProvider || !targetProvider || !selectedPlaylist) {
      console.log('[ImportPage] Missing required data, redirecting to home');
      navigate('/');
      return;
    }

    // Check if playlist with same name exists in target
    checkExistingPlaylist(selectedPlaylist.name);
  }, [sourceProvider, targetProvider, selectedPlaylist]);

  const checkExistingPlaylist = async (name: string) => {
    if (!targetProvider) return;

    // For non-Deezer providers, check auth
    const auth = getAuth(targetProvider);
    if (targetProvider !== 'deezer' && !auth) return;

    try {
      setCheckingExisting(true);
      console.log(`[ImportPage] Checking if playlist "${name}" exists in ${targetProvider}...`);

      const existing = await providerService.checkPlaylistExists(targetProvider, name, auth);
      setExistingPlaylist(existing);

      if (existing) {
        console.log(`[ImportPage] Found existing playlist: ${existing.id}`);
      } else {
        console.log('[ImportPage] No existing playlist found');
      }
    } catch (error) {
      console.error('[ImportPage] Error checking existing playlist:', error);
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleNameChange = (name: string) => {
    setTargetPlaylistName(name);
    // Debounce check for existing playlist
    const timeoutId = setTimeout(() => checkExistingPlaylist(name), 500);
    return () => clearTimeout(timeoutId);
  };

  const handleStartImport = async () => {
    if (!sourceProvider || !targetProvider || !selectedPlaylist) return;

    const sourceAuth = getAuth(sourceProvider);
    const targetAuth = getAuth(targetProvider);

    // For Deezer, auth might be null but isLoggedIn should be true
    if (!isLoggedIn(sourceProvider) || !isLoggedIn(targetProvider)) {
      console.error('[ImportPage] Not logged in to providers');
      return;
    }

    const startTime = Date.now();

    try {
      setIsImporting(true);
      console.log('[ImportPage] Starting import...');
      
      analytics.importStarted(sourceProvider, targetProvider, selectedPlaylist.trackCount);

      const result = await importPlaylist(
        sourceProvider,
        targetProvider,
        selectedPlaylist,
        targetPlaylistName,
        sourceAuth,
        targetAuth,
        (progress) => setImportProgress(progress),
        allowDuplicates
      );

      const durationMs = Date.now() - startTime;
      analytics.importCompleted(
        sourceProvider,
        targetProvider,
        result.imported,
        result.skipped,
        result.duplicatesSkipped || 0,
        durationMs
      );

      setImportResult(result);
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[ImportPage] Import failed:', error);
      analytics.importFailed(sourceProvider, targetProvider, errorMsg, durationMs);
      // TODO: Show error modal
    } finally {
      setIsImporting(false);
      setImportProgress(null);
    }
  };

  const handleCloseResult = () => {
    setImportResult(null);
    reset();
    navigate('/');
  };

  if (!sourceProvider || !targetProvider || !selectedPlaylist) {
    return null;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            disabled={isImporting}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Powrót
          </Button>

          <h1 className="text-2xl font-bold">Import playlisty</h1>
          <p className="text-text-muted mt-1">
            {getProviderName(sourceProvider)} → {getProviderName(targetProvider)}
          </p>
        </div>

        {/* Import in progress */}
        {isImporting && importProgress && (
          <ImportProgress progress={importProgress} />
        )}

        {/* Configuration */}
        {!isImporting && (
          <div className="space-y-6">
            {/* Source playlist info */}
            <Card>
              <h3 className="font-semibold mb-2">Playlista źródłowa</h3>
              <div className="flex items-center gap-4">
                {selectedPlaylist.imageUrl && (
                  <img
                    src={selectedPlaylist.imageUrl}
                    alt={selectedPlaylist.name}
                    className="w-16 h-16 rounded-md"
                  />
                )}
                <div>
                  <p className="font-medium">{selectedPlaylist.name}</p>
                  <p className="text-sm text-text-muted">{selectedPlaylist.trackCount} utworów</p>
                </div>
              </div>
            </Card>

            {/* Target playlist name */}
            <Card>
              <h3 className="font-semibold mb-4">Playlista docelowa</h3>

              <Input
                label="Nazwa playlisty"
                value={targetPlaylistName}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="Wprowadź nazwę playlisty..."
              />

              {checkingExisting && (
                <p className="text-sm text-text-muted mt-2">Sprawdzanie...</p>
              )}

              {existingPlaylist && !checkingExisting && (
                <div className="mt-3 p-3 bg-warning/10 border border-warning rounded-md flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-warning">
                      Playlista o tej nazwie już istnieje
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Utwory zostaną dodane do istniejącej playlisty ({existingPlaylist.trackCount} utworów)
                    </p>
                  </div>
                </div>
              )}

              {/* Allow duplicates checkbox */}
              <label className="mt-4 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDuplicates}
                  onChange={e => setAllowDuplicates(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-sm">Pozwól na duplikaty utworów</span>
              </label>
            </Card>

            {/* Start button */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartImport}
              disabled={!targetPlaylistName.trim()}
              className="w-full"
            >
              <Play className="w-5 h-5" />
              Rozpocznij import
            </Button>
          </div>
        )}

        {/* Result modal */}
        <ImportResultModal result={importResult} onClose={handleCloseResult} />
      </div>
    </div>
  );
}
