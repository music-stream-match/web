import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Provider, ProviderAuth, Playlist, ImportProgress, ImportResult } from '@/types';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      tidalAuth: null,
      deezerAuth: null,
      spotifyAuth: null,
      sourceProvider: null,
      targetProvider: null,
      selectedPlaylist: null,
      importProgress: null,
      importResult: null,

      // Actions
      setAuth: (provider: Provider, auth: ProviderAuth | null) => {
        console.log(`[Store] Setting auth for ${provider}:`, auth ? `User: ${auth.user.name}` : 'null');
        if (provider === 'tidal') {
          set({ tidalAuth: auth });
        } else if (provider === 'spotify') {
          set({ spotifyAuth: auth });
        } else {
          set({ deezerAuth: auth });
        }
      },

      setSourceProvider: (provider: Provider | null) => {
        console.log(`[Store] Setting source provider:`, provider);
        set({ sourceProvider: provider });
      },

      setTargetProvider: (provider: Provider | null) => {
        console.log(`[Store] Setting target provider:`, provider);
        set({ targetProvider: provider });
      },

      setSelectedPlaylist: (playlist: Playlist | null) => {
        console.log(`[Store] Setting selected playlist:`, playlist?.name ?? 'null');
        set({ selectedPlaylist: playlist });
      },

      setImportProgress: (progress: ImportProgress | null) => {
        if (progress) {
          console.log(`[Store] Import progress: ${progress.current}/${progress.total} (imported: ${progress.imported}, skipped: ${progress.skipped})`);
        }
        set({ importProgress: progress });
      },

      setImportResult: (result: ImportResult | null) => {
        if (result) {
          console.log(`[Store] Import result:`, result);
        }
        set({ importResult: result });
      },

      reset: () => {
        console.log('[Store] Resetting app state (keeping auth)');
        set({
          sourceProvider: null,
          targetProvider: null,
          selectedPlaylist: null,
          importProgress: null,
          importResult: null,
        });
      },

      getAuth: (provider: Provider) => {
        const state = get();
        if (provider === 'tidal') return state.tidalAuth;
        if (provider === 'spotify') return state.spotifyAuth;
        return state.deezerAuth;
      },

      isLoggedIn: (provider: Provider) => {
        const auth = get().getAuth(provider);
        if (!auth) return false;
        // Check if token is still valid (with 5 min buffer)
        return auth.tokens.expiresAt > Date.now() + 5 * 60 * 1000;
      },
    }),
    {
      name: 'music-stream-match-storage',
      partialize: (state) => ({
        tidalAuth: state.tidalAuth,
        deezerAuth: state.deezerAuth,
        spotifyAuth: state.spotifyAuth,
      }),
    }
  )
);
