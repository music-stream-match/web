import type { Provider, Playlist, ImportProgress, ImportResult, ProviderAuth } from '@/types';
import { providerService, trackMappingService } from './api';

export async function importPlaylist(
  sourceProvider: Provider,
  targetProvider: Provider,
  sourcePlaylist: Playlist,
  targetPlaylistName: string,
  sourceAuth: ProviderAuth | null,
  targetAuth: ProviderAuth | null,
  onProgress: (progress: ImportProgress) => void,
  allowDuplicates: boolean = false
): Promise<ImportResult> {
  const startTime = Date.now();
  
  console.log('='.repeat(60));
  console.log('[Import] Starting playlist import');
  console.log(`[Import] Source: ${sourceProvider} - "${sourcePlaylist.name}"`);
  console.log(`[Import] Target: ${targetProvider} - "${targetPlaylistName}"`);
  console.log(`[Import] Allow duplicates: ${allowDuplicates}`);
  console.log('='.repeat(60));

  // Step 1: Get source playlist tracks
  console.log('[Import] Step 1: Fetching source playlist tracks...');
  const sourceTrackIds = await providerService.getPlaylistTracks(
    sourceProvider,
    sourcePlaylist.id,
    sourceAuth
  );
  console.log(`[Import] Found ${sourceTrackIds.length} tracks in source playlist`);

  // Step 2: Check if target playlist exists or create new one
  console.log('[Import] Step 2: Checking/creating target playlist...');
  let targetPlaylistId: string;
  const existingPlaylist = await providerService.checkPlaylistExists(
    targetProvider,
    targetPlaylistName,
    targetAuth
  );

  let existingTrackIds: Set<string> = new Set();
  
  if (existingPlaylist) {
    console.log(`[Import] Using existing playlist: ${existingPlaylist.id}`);
    targetPlaylistId = existingPlaylist.id;
    
    // If duplicates are not allowed, fetch existing tracks from target playlist
    if (!allowDuplicates) {
      console.log('[Import] Fetching existing tracks from target playlist to check for duplicates...');
      const existingTracks = await providerService.getPlaylistTracks(
        targetProvider,
        targetPlaylistId,
        targetAuth
      );
      existingTrackIds = new Set(existingTracks);
      console.log(`[Import] Found ${existingTrackIds.size} existing tracks in target playlist`);
    }
  } else {
    targetPlaylistId = await providerService.createPlaylist(
      targetProvider,
      targetPlaylistName,
      targetAuth
    );
    console.log(`[Import] Created new playlist: ${targetPlaylistId}`);
  }

  // Step 3: Process tracks
  console.log('[Import] Step 3: Processing tracks...');
  const progress: ImportProgress = {
    total: sourceTrackIds.length,
    current: 0,
    imported: 0,
    skipped: 0,
    skippedTracks: [],
    duplicatesSkipped: 0,
  };

  const tracksToAdd: string[] = [];

  for (let i = 0; i < sourceTrackIds.length; i++) {
    const trackId = sourceTrackIds[i];
    progress.current = i + 1;

    console.log(`[Import] Processing track ${i + 1}/${sourceTrackIds.length}: ${trackId}`);

    // Fetch track details from local JSON
    const track = await trackMappingService.getTrackDetails(sourceProvider, trackId);

    if (!track) {
      console.log(`[Import] ⚠ Track ${trackId} not found in local database`);
      progress.skipped++;
      progress.skippedTracks.push({
        _id: trackId,
        title: `Unknown Track (${trackId})`,
        artist: { id: 0, name: 'Unknown' },
        album: { id: 0, title: 'Unknown' },
        providers: [],
      });
      onProgress({ ...progress, currentTrack: undefined });
      continue;
    }

    progress.currentTrack = track;

    // Find target provider ID
    const targetTrackId = trackMappingService.findTargetProviderId(track, targetProvider);

    if (!targetTrackId) {
      console.log(`[Import] ⚠ No ${targetProvider} mapping for: ${track.title} - ${track.artist.name}`);
      progress.skipped++;
      progress.skippedTracks.push(track);
    } else if (!allowDuplicates && existingTrackIds.has(targetTrackId)) {
      console.log(`[Import] ⏭ Duplicate skipped: ${track.title} - ${track.artist.name}`);
      progress.duplicatesSkipped = (progress.duplicatesSkipped || 0) + 1;
    } else {
      console.log(`[Import] ✓ Mapped: ${track.title} -> ${targetTrackId}`);
      tracksToAdd.push(targetTrackId);
      progress.imported++;
    }

    onProgress({ ...progress });

    // Small delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Step 4: Add tracks to target playlist
  if (tracksToAdd.length > 0) {
    console.log(`[Import] Step 4: Adding ${tracksToAdd.length} tracks to target playlist...`);
    await providerService.addTracksToPlaylist(
      targetProvider,
      targetPlaylistId,
      tracksToAdd,
      targetAuth
    );
  }

  const duration = Date.now() - startTime;

  const result: ImportResult = {
    sourcePlaylist,
    targetPlaylistName,
    targetPlaylistId,
    imported: progress.imported,
    skipped: progress.skipped,
    skippedTracks: progress.skippedTracks,
    duplicatesSkipped: progress.duplicatesSkipped,
    duration,
    sourceProvider,
    targetProvider,
  };

  console.log('='.repeat(60));
  console.log('[Import] Import complete!');
  console.log(`[Import] Imported: ${result.imported}`);
  console.log(`[Import] Skipped: ${result.skipped}`);
  console.log(`[Import] Duplicates skipped: ${result.duplicatesSkipped || 0}`);
  console.log(`[Import] Duration: ${duration}ms`);
  console.log('='.repeat(60));

  return result;
}
