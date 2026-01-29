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

  // Step 1: Get source playlist tracks (now includes title/artist info)
  console.log('[Import] Step 1: Fetching source playlist tracks...');
  const sourceTracks = await providerService.getPlaylistTracks(
    sourceProvider,
    sourcePlaylist.id,
    sourceAuth
  );
  console.log(`[Import] Found ${sourceTracks.length} tracks in source playlist`);

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
      existingTrackIds = new Set(existingTracks.map(t => t.id));
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
    total: sourceTracks.length,
    current: 0,
    imported: 0,
    skipped: 0,
    skippedTracks: [],
    duplicatesSkipped: 0,
  };

  const tracksToAdd: string[] = [];

  for (let i = 0; i < sourceTracks.length; i++) {
    const sourceTrack = sourceTracks[i];
    progress.current = i + 1;
    progress.currentTrack = sourceTrack;

    console.log(`[Import] Processing track ${i + 1}/${sourceTracks.length}: ${sourceTrack.title} - ${sourceTrack.artistName}`);

    // Fetch track mapping from local JSON
    const mappedTrack = await trackMappingService.getTrackDetails(sourceProvider, sourceTrack.id);

    if (!mappedTrack) {
      console.log(`[Import] ⚠ Track ${sourceTrack.id} not found in local database: ${sourceTrack.title} - ${sourceTrack.artistName}`);
      progress.skipped++;
      progress.skippedTracks.push(sourceTrack);
      onProgress({ ...progress });
      continue;
    }

    // Find target provider ID
    const targetTrackId = trackMappingService.findTargetProviderId(mappedTrack, targetProvider);

    if (!targetTrackId) {
      console.log(`[Import] ⚠ No ${targetProvider} mapping for: ${sourceTrack.title} - ${sourceTrack.artistName}`);
      progress.skipped++;
      progress.skippedTracks.push(sourceTrack);
    } else if (!allowDuplicates && existingTrackIds.has(targetTrackId)) {
      console.log(`[Import] ⏭ Duplicate skipped: ${sourceTrack.title} - ${sourceTrack.artistName}`);
      progress.duplicatesSkipped = (progress.duplicatesSkipped || 0) + 1;
    } else {
      console.log(`[Import] ✓ Mapped: ${sourceTrack.title} -> ${targetTrackId}`);
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
