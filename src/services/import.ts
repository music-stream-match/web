import type { Provider, Playlist, ImportProgress, ImportResult, ProviderAuth, SourceTrack } from '@/types';
import { providerService, trackMappingService } from './api';

// Configuration for large playlist handling
const IMPORT_CONFIG = {
  // How many tracks to map in parallel
  mappingConcurrency: 10,
  // How many tracks to add to playlist at once (for progress updates)
  addBatchSize: 100,
  // How often to update progress during mapping phase (every N tracks)
  mappingProgressInterval: 10,
};

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
  console.log(`[Import] Config: concurrency=${IMPORT_CONFIG.mappingConcurrency}, batchSize=${IMPORT_CONFIG.addBatchSize}`);
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
      try {
        const existingTracks = await providerService.getPlaylistTracks(
          targetProvider,
          targetPlaylistId,
          targetAuth
        );
        existingTrackIds = new Set(existingTracks.map(t => t.id));
        console.log(`[Import] Found ${existingTrackIds.size} existing tracks in target playlist`);
      } catch (error) {
        // If we can't fetch existing tracks (e.g., empty playlist, permission issue),
        // proceed without duplicate checking for existing tracks
        console.warn('[Import] ⚠ Could not fetch existing tracks from target playlist:', error);
        console.log('[Import] Proceeding without duplicate checking for existing tracks');
        existingTrackIds = new Set();
      }
    }
  } else {
    targetPlaylistId = await providerService.createPlaylist(
      targetProvider,
      targetPlaylistName,
      targetAuth
    );
    console.log(`[Import] Created new playlist: ${targetPlaylistId}`);
  }

  // Step 3: Process tracks using batch mapping for better performance
  console.log('[Import] Step 3: Mapping tracks (batch mode for large playlists)...');
  const progress: ImportProgress = {
    total: sourceTracks.length,
    current: 0,
    imported: 0,
    skipped: 0,
    skippedTracks: [],
    duplicatesSkipped: 0,
  };

  // Create a map for quick source track lookup
  const sourceTrackMap = new Map<string, SourceTrack>();
  const trackIds = sourceTracks.map(t => {
    sourceTrackMap.set(t.id, t);
    return t.id;
  });

  // Batch fetch all track mappings with progress
  console.log(`[Import] Fetching mappings for ${trackIds.length} tracks...`);
  const mappedTracks = await trackMappingService.getTrackDetailsBatch(
    sourceProvider,
    trackIds,
    IMPORT_CONFIG.mappingConcurrency,
    (completed, total) => {
      progress.current = completed;
      // Only update UI every N tracks to avoid excessive re-renders
      if (completed % IMPORT_CONFIG.mappingProgressInterval === 0 || completed === total) {
        onProgress({ ...progress });
      }
    }
  );

  // Get target provider IDs
  const targetIdMap = trackMappingService.findTargetProviderIdsBatch(mappedTracks, targetProvider);

  // Process results and collect tracks to add
  console.log('[Import] Processing mapping results...');
  const tracksToAdd: string[] = [];

  for (const sourceTrack of sourceTracks) {
    const mappedTrack = mappedTracks.get(sourceTrack.id);
    progress.currentTrack = sourceTrack;

    if (!mappedTrack) {
      console.log(`[Import] ⚠ Track ${sourceTrack.id} not found in local database: ${sourceTrack.title} - ${sourceTrack.artistName}`);
      progress.skipped++;
      progress.skippedTracks.push(sourceTrack);
      continue;
    }

    const targetTrackId = targetIdMap.get(sourceTrack.id);

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
  }

  // Final progress update after mapping
  progress.current = sourceTracks.length;
  onProgress({ ...progress });

  // Step 4: Add tracks to target playlist (in batches for large playlists)
  if (tracksToAdd.length > 0) {
    console.log(`[Import] Step 4: Adding ${tracksToAdd.length} tracks to target playlist...`);
    
    // For very large playlists, log progress
    if (tracksToAdd.length > IMPORT_CONFIG.addBatchSize) {
      console.log(`[Import] Large playlist detected, will add in batches...`);
    }
    
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
