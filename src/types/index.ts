export type Provider = 'tidal' | 'deezer' | 'spotify';

export interface User {
  id: string;
  name: string;
  email?: string;
  picture?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface ProviderAuth {
  provider: Provider;
  user: User;
  tokens: AuthTokens;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  trackCount: number;
  createdAt: string;
  owner?: string;
}

export interface Artist {
  id: string | number;
  name: string;
}

export interface Album {
  id: string | number;
  title: string;
}

// Track info from source playlist API (before mapping)
export interface SourceTrack {
  id: string;
  title: string;
  artistName: string;
  albumTitle?: string;
}

export interface TrackProviders {
  deezerTrackId?: string;
  tidalTrackId?: string;
  spotifyTrackId?: string;
}

export interface Track {
  id: string;
  providers: TrackProviders;
}

export interface PlaylistLoadingProgress {
  phase: 'loading' | 'preparing';
  current: number;
  total: number;
}

export interface ImportProgress {
  total: number;
  current: number;
  currentTrack?: SourceTrack;
  imported: number;
  skipped: number;
  skippedTracks: SourceTrack[];
  duplicatesSkipped?: number;
}

export interface ImportResult {
  sourcePlaylist: Playlist;
  targetPlaylistName: string;
  targetPlaylistId?: string;
  imported: number;
  skipped: number;
  skippedTracks: SourceTrack[];
  duplicatesSkipped?: number;
  duration: number;
  sourceProvider: Provider;
  targetProvider: Provider;
}

export interface ProviderCredentials {
  clientId: string;
  clientSecret?: string;
}

export interface InvitationConfig {
  name: string;
  deezer?: ProviderCredentials;
  tidal?: ProviderCredentials;
  spotify?: ProviderCredentials;
}

export interface AppState {
  // Invitation state
  invitationCode: string | null;
  invitationConfig: InvitationConfig | null;
  
  // Auth state
  tidalAuth: ProviderAuth | null;
  deezerAuth: ProviderAuth | null;
  spotifyAuth: ProviderAuth | null;
  
  // Deezer ARL state
  deezerArl: string | null;
  
  // Selection state
  sourceProvider: Provider | null;
  targetProvider: Provider | null;
  selectedPlaylist: Playlist | null;
  
  // Import state
  importProgress: ImportProgress | null;
  importResult: ImportResult | null;
  
  // Actions
  setInvitation: (code: string, config: InvitationConfig) => void;
  clearInvitation: () => void;
  setAuth: (provider: Provider, auth: ProviderAuth | null) => void;
  setDeezerArl: (arl: string | null) => void;
  setSourceProvider: (provider: Provider | null) => void;
  setTargetProvider: (provider: Provider | null) => void;
  setSelectedPlaylist: (playlist: Playlist | null) => void;
  setImportProgress: (progress: ImportProgress | null) => void;
  setImportResult: (result: ImportResult | null) => void;
  reset: () => void;
  getAuth: (provider: Provider) => ProviderAuth | null;
  isLoggedIn: (provider: Provider) => boolean;
  getDeezerArl: () => string | null;
  getProviderCredentials: (provider: Provider) => ProviderCredentials | null;
}
