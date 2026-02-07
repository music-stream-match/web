import { useAppStore } from '@/store/useAppStore';

// Deezer API Configuration
// Uses ARL (Authentication Reference Link) cookie for auth
// Requests go through Cloudflare Worker proxy to bypass CORS

export const DEEZER_CONFIG = {
  proxyUrl: 'https://deezer.music-stream-match.space',
};

// TIDAL API Configuration
// To get these credentials:
// 1. Go to https://developer.tidal.com/
// 2. Create a developer account
// 3. Create a new application in the dashboard
// 4. Set the redirect URI to: https://localhost-vite.mobulum.xyz/callback/tidal
// 5. Copy the Client ID and Client Secret
// Note: TIDAL's API access may require approval for certain endpoints

const TIDAL_DEFAULTS = {
  clientId: '',
  clientSecret: '',
  redirectUri: import.meta.env.MODE === 'production'
    ? 'https://music-stream-match.space/callback/tidal'
    : 'https://localhost-vite.mobulum.xyz/callback/tidal',
  authUrl: 'https://login.tidal.com/authorize',
  tokenUrl: 'https://auth.tidal.com/v1/oauth2/token',
  apiUrl: 'https://openapi.tidal.com/v2',
  scopes: ['user.read', 'playlists.read', 'playlists.write'],
};

export const getTidalConfig = () => {
  const credentials = useAppStore.getState().getProviderCredentials('tidal');
  return {
    ...TIDAL_DEFAULTS,
    clientId: credentials?.clientId || TIDAL_DEFAULTS.clientId,
    clientSecret: credentials?.clientSecret || TIDAL_DEFAULTS.clientSecret,
  };
};

// Legacy export for compatibility
export const TIDAL_CONFIG = TIDAL_DEFAULTS;

// Spotify API Configuration
// To get these credentials:
// 1. Go to https://developer.spotify.com/dashboard
// 2. Create an account or log in
// 3. Create a new application
// 4. Set the redirect URI in app settings
// 5. Copy the Client ID and Client Secret

const SPOTIFY_DEFAULTS = {
  clientId: '',
  clientSecret: '',
  redirectUri: import.meta.env.MODE === 'production'
    ? 'https://music-stream-match.space/callback/spotify'
    : 'https://localhost-vite.mobulum.xyz/callback/spotify',
  authUrl: 'https://accounts.spotify.com/authorize',
  tokenUrl: 'https://accounts.spotify.com/api/token',
  apiUrl: 'https://api.spotify.com/v1',
  scopes: ['user-read-private', 'user-read-email', 'playlist-read-private', 'playlist-modify-public', 'playlist-modify-private'],
};

export const getSpotifyConfig = () => {
  const credentials = useAppStore.getState().getProviderCredentials('spotify');

  return {
    ...SPOTIFY_DEFAULTS,
    clientId: credentials?.clientId || SPOTIFY_DEFAULTS.clientId,
    clientSecret: credentials?.clientSecret || SPOTIFY_DEFAULTS.clientSecret,
  };
};

// Legacy export for compatibility
export const SPOTIFY_CONFIG = SPOTIFY_DEFAULTS;

// Apple Music API Configuration
// Apple Music uses MusicKit JS for authentication
// To get these credentials:
// 1. Go to https://developer.apple.com/account
// 2. Create a MusicKit identifier
// 3. Generate a private key for MusicKit
// 4. Use the key to generate a developer token (JWT)
// 5. The developer token is used server-side; on the client MusicKit JS handles user auth

const APPLE_DEFAULTS = {
  developerToken: '', // invitation
  redirectUri: import.meta.env.MODE === 'production'
    ? 'https://music-stream-match.space/callback/apple'
    : 'https://localhost-vite.mobulum.xyz/callback/apple',
  apiUrl: 'https://api.music.apple.com/v1',
  appName: 'Music Stream Match',
  appBuild: '1.0.0',
};

export const getAppleConfig = () => {
  const credentials = useAppStore.getState().getProviderCredentials('apple');
  return {
    ...APPLE_DEFAULTS,
    developerToken: credentials?.clientId || APPLE_DEFAULTS.developerToken,
  };
};

// Legacy export for compatibility
export const APPLE_CONFIG = APPLE_DEFAULTS;
