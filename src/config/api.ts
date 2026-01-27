import { useAppStore } from '@/store/useAppStore';

// Deezer API Configuration
// To get these credentials:
// 1. Go to https://developers.deezer.com/
// 2. Create an account or log in
// 3. Go to "My Apps" and create a new application
// 4. Set the redirect URI to: https://localhost-vite.mobulum.xyz/callback/deezer
// 5. Copy the Application ID and Secret Key

const DEEZER_DEFAULTS = {
  clientId: 'YOUR_DEEZER_APP_ID', // Replace with your Deezer App ID
  // Note: Deezer uses implicit grant, so no client secret needed on frontend
  redirectUri: import.meta.env.MODE === 'production'
    ? 'https://music-stream-match.space/callback/deezer'
    : 'https://localhost-vite.mobulum.xyz/callback/deezer',
  authUrl: 'https://connect.deezer.com/oauth/auth.php',
  apiUrl: 'https://api.deezer.com',
  scopes: ['basic_access', 'manage_library', 'offline_access'],
};

export const getDeezerConfig = () => {
  const credentials = useAppStore.getState().getProviderCredentials('deezer');
  return {
    ...DEEZER_DEFAULTS,
    clientId: credentials?.clientId || DEEZER_DEFAULTS.clientId,
  };
};

// Legacy export for compatibility
export const DEEZER_CONFIG = DEEZER_DEFAULTS;

// TIDAL API Configuration
// To get these credentials:
// 1. Go to https://developer.tidal.com/
// 2. Create a developer account
// 3. Create a new application in the dashboard
// 4. Set the redirect URI to: https://localhost-vite.mobulum.xyz/callback/tidal
// 5. Copy the Client ID and Client Secret
// Note: TIDAL's API access may require approval for certain endpoints

const TIDAL_DEFAULTS = {
  clientId: 'TIDAL_CLIENT_ID',
  clientSecret: 'TIDAL_CLIENT_SECRET',
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
  clientId: 'SPOTIFY_CLIENT_ID',
  clientSecret: 'SPOTIFY_CLIENT_SECRET',
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
