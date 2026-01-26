// Deezer API Configuration
// To get these credentials:
// 1. Go to https://developers.deezer.com/
// 2. Create an account or log in
// 3. Go to "My Apps" and create a new application
// 4. Set the redirect URI to: https://localhost-vite.mobulum.xyz/callback/deezer
// 5. Copy the Application ID and Secret Key

export const DEEZER_CONFIG = {
  clientId: 'YOUR_DEEZER_APP_ID', // Replace with your Deezer App ID
  // Note: Deezer uses implicit grant, so no client secret needed on frontend
  redirectUri: import.meta.env.PROD 
    ? 'https://localhost-vite.mobulum.xyz/callback/deezer'
    : 'https://localhost-vite.mobulum.xyz/callback/deezer',
  authUrl: 'https://connect.deezer.com/oauth/auth.php',
  apiUrl: 'https://api.deezer.com',
  scopes: ['basic_access', 'manage_library', 'offline_access'],
};

// TIDAL API Configuration
// To get these credentials:
// 1. Go to https://developer.tidal.com/
// 2. Create a developer account
// 3. Create a new application in the dashboard
// 4. Set the redirect URI to: https://localhost-vite.mobulum.xyz/callback/tidal
// 5. Copy the Client ID and Client Secret
// Note: TIDAL's API access may require approval for certain endpoints

export const TIDAL_CONFIG = {
  clientId: 'ZlAcmYg4dODn9GP8',
  clientSecret: 'mIDPPmhQAMwFfmydCKsvnyyk1TWmWp0JjdLuElMmmCM=',
  redirectUri: import.meta.env.PROD
    ? 'https://localhost-vite.mobulum.xyz/callback/tidal'
    : 'https://localhost-vite.mobulum.xyz/callback/tidal',
  authUrl: 'https://login.tidal.com/authorize',
  tokenUrl: 'https://auth.tidal.com/v1/oauth2/token',
  apiUrl: 'https://openapi.tidal.com/v2',
  scopes: ['user.read', 'playlists.read', 'playlists.write'],
};

// Spotify API Configuration
// To get these credentials:
// 1. Go to https://developer.spotify.com/dashboard
// 2. Create an account or log in
// 3. Create a new application
// 4. Set the redirect URI in app settings
// 5. Copy the Client ID and Client Secret

export const SPOTIFY_CONFIG = {
  clientId: '0e76963b0dce4667b238dd0dbb20b4e3',
  clientSecret: 'dc1aa409c33e41c7bbf0656fa78aa7d2',
  redirectUri: import.meta.env.PROD
    ? 'https://localhost-vite.mobulum.xyz/callback/spotify'
    : 'https://localhost-vite.mobulum.xyz/callback/spotify',
  authUrl: 'https://accounts.spotify.com/authorize',
  tokenUrl: 'https://accounts.spotify.com/api/token',
  apiUrl: 'https://api.spotify.com/v1',
  scopes: ['user-read-private', 'user-read-email', 'playlist-read-private', 'playlist-modify-public', 'playlist-modify-private'],
};
