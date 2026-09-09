import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Provider, ProviderAuth, Playlist, ImportProgress, ImportResult, InvitationConfig, ProviderCredentials } from '@/types';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      credentials: {},
      invitationCode: null,
      invitationConfig: null,
      tidalAuth: null,
      deezerAuth: null,
      spotifyAuth: null,
      appleAuth: null,
      deezerArl: null,
      sourceProvider: null,
      targetProvider: null,
      selectedPlaylist: null,
      importProgress: null,
      importResult: null,

      // Credentials actions
      setProviderCredentials: (provider: Provider, credentials: ProviderCredentials | null) => {
        console.log(`[Store] Setting credentials for ${provider}:`, credentials ? 'provided' : 'cleared');
        set(state => {
          const newCredentials = { ...state.credentials };
          if (credentials) {
            newCredentials[provider] = credentials;
          } else {
            delete newCredentials[provider];
          }
          return { credentials: newCredentials };
        });
      },

      clearProviderCredentials: (provider: Provider) => {
        console.log(`[Store] Clearing credentials for ${provider}`);
        set(state => {
          const newCredentials = { ...state.credentials };
          delete newCredentials[provider];
          return { credentials: newCredentials };
        });
      },

      logout: async (provider: Provider) => {
        console.log(`[Store] Logging out from ${provider} and removing saved credentials`);
        const state = get();

        // Clear provider credentials from localStorage
        const newCredentials = { ...state.credentials };
        delete newCredentials[provider];

        const updates: Partial<AppState> = {
          credentials: newCredentials,
        };

        if (provider === 'tidal') {
          updates.tidalAuth = null;
        } else if (provider === 'spotify') {
          updates.spotifyAuth = null;
        } else if (provider === 'deezer') {
          updates.deezerAuth = null;
          updates.deezerArl = null;
        } else if (provider === 'apple') {
          updates.appleAuth = null;
          try {
            const { appleService } = await import('@/services/api');
            const music = await appleService.getMusicKitInstance();
            await music.unauthorize();
            console.log('[Store] Apple Music unauthorize successful');
          } catch (err) {
            console.warn('[Store] Could not unauthorize Apple Music:', err);
          }
        }

        // If logged-out provider was selected as source or target, reset selection
        if (state.sourceProvider === provider) {
          updates.sourceProvider = null;
          updates.selectedPlaylist = null;
        }
        if (state.targetProvider === provider) {
          updates.targetProvider = null;
        }

        set(updates);
      },

      // Actions
      setInvitation: (code: string, config: InvitationConfig) => {
        console.log(`[Store] Setting invitation code: ${code}, config:`, config.name);
        set({ invitationCode: code, invitationConfig: config });
      },

      clearInvitation: () => {
        console.log('[Store] Clearing invitation');
        set({ 
          credentials: {},
          invitationCode: null, 
          invitationConfig: null,
          tidalAuth: null,
          deezerAuth: null,
          spotifyAuth: null,
          appleAuth: null,
          deezerArl: null,
          sourceProvider: null,
          targetProvider: null,
          selectedPlaylist: null,
          importProgress: null,
          importResult: null,
        });
      },

      setAuth: (provider: Provider, auth: ProviderAuth | null) => {
        console.log(`[Store] Setting auth for ${provider}:`, auth ? `User: ${auth.user.name}` : 'null');
        if (provider === 'tidal') {
          set({ tidalAuth: auth });
        } else if (provider === 'spotify') {
          set({ spotifyAuth: auth });
        } else if (provider === 'apple') {
          set({ appleAuth: auth });
        } else {
          set({ deezerAuth: auth });
        }
      },

      setDeezerArl: (arl: string | null) => {
        console.log(`[Store] Setting Deezer ARL:`, arl ? 'provided' : 'null');
        set({ deezerArl: arl });
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
        if (provider === 'apple') return state.appleAuth;
        return state.deezerAuth;
      },

      isLoggedIn: (provider: Provider) => {
        // For Deezer, check if we have ARL stored
        if (provider === 'deezer') {
          return !!get().deezerArl;
        }
        // For Apple Music, check if we have auth with valid token
        if (provider === 'apple') {
          const auth = get().getAuth('apple');
          if (!auth) return false;
          return auth.tokens.expiresAt > Date.now() + 5 * 60 * 1000;
        }
        const auth = get().getAuth(provider);
        if (!auth) return false;
        // Check if token is still valid (with 5 min buffer)
        return auth.tokens.expiresAt > Date.now() + 5 * 60 * 1000;
      },

      isProviderSupported: (provider: Provider) => {
        // Apple Music is disabled for now
        if (provider === 'apple') return false;
        return true;
      },

      getDeezerArl: () => {
        return get().deezerArl;
      },

      getProviderCredentials: (provider: Provider): ProviderCredentials | null => {
        const state = get();
        if (state.credentials && state.credentials[provider]) {
          return state.credentials[provider] || null;
        }
        // Legacy fallback from invitation config if present
        const config = state.invitationConfig;
        if (config) {
          if (provider === 'tidal') return config.tidal || null;
          if (provider === 'spotify') return config.spotify || null;
          if (provider === 'deezer') return config.deezer || null;
          if (provider === 'apple') return config.apple || null;
        }
        return null;
      },
    }),
    {
      name: 'music-stream-match-storage',
      partialize: (state) => ({
        credentials: state.credentials,
        tidalAuth: state.tidalAuth,
        deezerAuth: state.deezerAuth,
        spotifyAuth: state.spotifyAuth,
        appleAuth: state.appleAuth,
        deezerArl: state.deezerArl,
      }),
    }
  )
);
