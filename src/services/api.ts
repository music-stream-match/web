import type { Provider, Playlist, Track, ProviderAuth, User, AuthTokens } from '@/types';
import { DEEZER_CONFIG, TIDAL_CONFIG } from '@/config/api';

// ============================================
// DEEZER SERVICE
// ============================================

export const deezerService = {
  getAuthUrl(): string {
    const params = new URLSearchParams({
      app_id: DEEZER_CONFIG.clientId,
      redirect_uri: DEEZER_CONFIG.redirectUri,
      perms: DEEZER_CONFIG.scopes.join(','),
    });
    const url = `${DEEZER_CONFIG.authUrl}?${params.toString()}`;
    console.log('[Deezer] Auth URL:', url);
    return url;
  },

  async handleCallback(fragment: string): Promise<ProviderAuth> {
    console.log('[Deezer] Handling callback with fragment:', fragment);
    
    // Deezer returns token in URL fragment: #access_token=...&expires=...
    const params = new URLSearchParams(fragment.replace('#', ''));
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires');

    if (!accessToken) {
      throw new Error('No access token in Deezer callback');
    }

    const expiresAt = Date.now() + (parseInt(expiresIn || '3600') * 1000);
    
    // Fetch user info
    const user = await this.getUser(accessToken);
    
    const auth: ProviderAuth = {
      provider: 'deezer',
      user,
      tokens: {
        accessToken,
        expiresAt,
      },
    };

    console.log('[Deezer] Auth successful:', auth.user.name);
    return auth;
  },

  async getUser(accessToken: string): Promise<User> {
    console.log('[Deezer] Fetching user info...');
    const response = await fetch(`${DEEZER_CONFIG.apiUrl}/user/me?access_token=${accessToken}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return {
      id: data.id.toString(),
      name: data.name,
      email: data.email,
      picture: data.picture_medium,
    };
  },

  async getPlaylists(accessToken: string): Promise<Playlist[]> {
    console.log('[Deezer] Fetching playlists...');
    const response = await fetch(`${DEEZER_CONFIG.apiUrl}/user/me/playlists?access_token=${accessToken}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const playlists: Playlist[] = data.data.map((p: any) => ({
      id: p.id.toString(),
      name: p.title,
      imageUrl: p.picture_medium,
      trackCount: p.nb_tracks,
      createdAt: p.creation_date,
      owner: p.creator?.name,
    }));

    console.log(`[Deezer] Found ${playlists.length} playlists`);
    return playlists;
  },

  async getPlaylistTracks(playlistId: string, accessToken: string): Promise<string[]> {
    console.log(`[Deezer] Fetching tracks for playlist ${playlistId}...`);
    const trackIds: string[] = [];
    let url = `${DEEZER_CONFIG.apiUrl}/playlist/${playlistId}/tracks?access_token=${accessToken}&limit=100`;

    while (url) {
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      for (const track of data.data) {
        trackIds.push(track.id.toString());
      }

      url = data.next || null;
    }

    console.log(`[Deezer] Found ${trackIds.length} tracks in playlist`);
    return trackIds;
  },

  async checkPlaylistExists(name: string, accessToken: string): Promise<Playlist | null> {
    const playlists = await this.getPlaylists(accessToken);
    return playlists.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
  },

  async createPlaylist(name: string, accessToken: string): Promise<string> {
    console.log(`[Deezer] Creating playlist: ${name}`);
    const response = await fetch(
      `${DEEZER_CONFIG.apiUrl}/user/me/playlists?access_token=${accessToken}&title=${encodeURIComponent(name)}`,
      { method: 'POST' }
    );
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    console.log(`[Deezer] Created playlist with ID: ${data.id}`);
    return data.id.toString();
  },

  async addTracksToPlaylist(playlistId: string, trackIds: string[], accessToken: string): Promise<void> {
    console.log(`[Deezer] Adding ${trackIds.length} tracks to playlist ${playlistId}...`);
    
    // Deezer accepts comma-separated track IDs
    const response = await fetch(
      `${DEEZER_CONFIG.apiUrl}/playlist/${playlistId}/tracks?access_token=${accessToken}&songs=${trackIds.join(',')}`,
      { method: 'POST' }
    );
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    console.log('[Deezer] Tracks added successfully');
  },
};

// ============================================
// TIDAL SERVICE
// ============================================

export const tidalService = {
  getAuthUrl(): string {
    const codeVerifier = generateCodeVerifier();
    sessionStorage.setItem('tidal_code_verifier', codeVerifier);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: TIDAL_CONFIG.clientId,
      redirect_uri: TIDAL_CONFIG.redirectUri,
      scope: TIDAL_CONFIG.scopes.join(' '),
      code_challenge: codeVerifier, // Using plain for simplicity
      code_challenge_method: 'plain',
    });
    
    const url = `${TIDAL_CONFIG.authUrl}?${params.toString()}`;
    console.log('[TIDAL] Auth URL:', url);
    return url;
  },

  async handleCallback(code: string): Promise<ProviderAuth> {
    console.log('[TIDAL] Handling callback with code');
    
    const codeVerifier = sessionStorage.getItem('tidal_code_verifier');
    if (!codeVerifier) {
      throw new Error('No code verifier found');
    }

    // Exchange code for tokens
    const response = await fetch(TIDAL_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: TIDAL_CONFIG.clientId,
        code,
        redirect_uri: TIDAL_CONFIG.redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    const tokens: AuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };

    sessionStorage.removeItem('tidal_code_verifier');

    // Fetch user info
    const user = await this.getUser(tokens.accessToken);

    const auth: ProviderAuth = {
      provider: 'tidal',
      user,
      tokens,
    };

    console.log('[TIDAL] Auth successful:', auth.user.name);
    return auth;
  },

  async getUser(accessToken: string): Promise<User> {
    console.log('[TIDAL] Fetching user info...');
    const response = await fetch(`${TIDAL_CONFIG.apiUrl}/users/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch TIDAL user');
    }

    const data = await response.json();

    return {
      id: data.userId,
      name: data.username || data.firstName || 'TIDAL User',
      email: data.email,
      picture: data.picture,
    };
  },

  async getPlaylists(accessToken: string, userId: string): Promise<Playlist[]> {
    console.log('[TIDAL] Fetching playlists...');
    const response = await fetch(`${TIDAL_CONFIG.apiUrl}/users/${userId}/playlists?limit=100`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch TIDAL playlists');
    }

    const data = await response.json();

    const playlists: Playlist[] = data.items.map((p: any) => ({
      id: p.uuid,
      name: p.title,
      description: p.description,
      imageUrl: p.image ? `https://resources.tidal.com/images/${p.image.replace(/-/g, '/')}/320x320.jpg` : undefined,
      trackCount: p.numberOfTracks,
      createdAt: p.created,
      owner: p.creator?.name,
    }));

    console.log(`[TIDAL] Found ${playlists.length} playlists`);
    return playlists;
  },

  async getPlaylistTracks(playlistId: string, accessToken: string): Promise<string[]> {
    console.log(`[TIDAL] Fetching tracks for playlist ${playlistId}...`);
    const trackIds: string[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const response = await fetch(
        `${TIDAL_CONFIG.apiUrl}/playlists/${playlistId}/items?offset=${offset}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch TIDAL playlist tracks');
      }

      const data = await response.json();

      for (const item of data.items) {
        if (item.type === 'track') {
          trackIds.push(item.item.id.toString());
        }
      }

      if (data.items.length < limit) break;
      offset += limit;
    }

    console.log(`[TIDAL] Found ${trackIds.length} tracks in playlist`);
    return trackIds;
  },

  async checkPlaylistExists(name: string, accessToken: string, userId: string): Promise<Playlist | null> {
    const playlists = await this.getPlaylists(accessToken, userId);
    return playlists.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
  },

  async createPlaylist(name: string, accessToken: string, userId: string): Promise<string> {
    console.log(`[TIDAL] Creating playlist: ${name}`);
    const response = await fetch(`${TIDAL_CONFIG.apiUrl}/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: name }),
    });

    if (!response.ok) {
      throw new Error('Failed to create TIDAL playlist');
    }

    const data = await response.json();
    console.log(`[TIDAL] Created playlist with ID: ${data.uuid}`);
    return data.uuid;
  },

  async addTracksToPlaylist(playlistId: string, trackIds: string[], accessToken: string): Promise<void> {
    console.log(`[TIDAL] Adding ${trackIds.length} tracks to playlist ${playlistId}...`);
    
    // TIDAL might have limits on batch size
    const batchSize = 50;
    for (let i = 0; i < trackIds.length; i += batchSize) {
      const batch = trackIds.slice(i, i + batchSize);
      
      const response = await fetch(`${TIDAL_CONFIG.apiUrl}/playlists/${playlistId}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackIds: batch.map(id => parseInt(id)),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add tracks to TIDAL playlist');
      }
    }

    console.log('[TIDAL] Tracks added successfully');
  },
};

// ============================================
// TRACK MAPPING SERVICE (Local JSON files)
// ============================================

export const trackMappingService = {
  async getTrackDetails(provider: Provider, trackId: string): Promise<Track | null> {
    console.log(`[TrackMapping] Fetching track details for ${provider}/${trackId}...`);
    
    try {
      const response = await fetch(`/api/providers/${provider}/tracks/${trackId}.json`);
      
      if (!response.ok) {
        console.log(`[TrackMapping] Track not found: ${provider}/${trackId}`);
        return null;
      }

      const track: Track = await response.json();
      console.log(`[TrackMapping] Found track: ${track.title} by ${track.artist.name}`);
      return track;
    } catch (error) {
      console.error(`[TrackMapping] Error fetching track ${provider}/${trackId}:`, error);
      return null;
    }
  },

  findTargetProviderId(track: Track, targetProvider: Provider): string | null {
    const mapping = track.providers.find(p => p.provider === targetProvider);
    if (mapping) {
      console.log(`[TrackMapping] Found ${targetProvider} ID: ${mapping.providerId} for track ${track.title}`);
      return mapping.providerId;
    }
    console.log(`[TrackMapping] No ${targetProvider} mapping found for track ${track.title}`);
    return null;
  },
};

// ============================================
// UNIFIED PROVIDER SERVICE
// ============================================

export const providerService = {
  getAuthUrl(provider: Provider): string {
    return provider === 'deezer' ? deezerService.getAuthUrl() : tidalService.getAuthUrl();
  },

  async handleCallback(provider: Provider, params: URLSearchParams | string): Promise<ProviderAuth> {
    if (provider === 'deezer') {
      return deezerService.handleCallback(params as string);
    } else {
      const code = (params as URLSearchParams).get('code');
      if (!code) throw new Error('No code in TIDAL callback');
      return tidalService.handleCallback(code);
    }
  },

  async getPlaylists(provider: Provider, auth: ProviderAuth): Promise<Playlist[]> {
    if (provider === 'deezer') {
      return deezerService.getPlaylists(auth.tokens.accessToken);
    } else {
      return tidalService.getPlaylists(auth.tokens.accessToken, auth.user.id);
    }
  },

  async getPlaylistTracks(provider: Provider, playlistId: string, auth: ProviderAuth): Promise<string[]> {
    if (provider === 'deezer') {
      return deezerService.getPlaylistTracks(playlistId, auth.tokens.accessToken);
    } else {
      return tidalService.getPlaylistTracks(playlistId, auth.tokens.accessToken);
    }
  },

  async checkPlaylistExists(provider: Provider, name: string, auth: ProviderAuth): Promise<Playlist | null> {
    if (provider === 'deezer') {
      return deezerService.checkPlaylistExists(name, auth.tokens.accessToken);
    } else {
      return tidalService.checkPlaylistExists(name, auth.tokens.accessToken, auth.user.id);
    }
  },

  async createPlaylist(provider: Provider, name: string, auth: ProviderAuth): Promise<string> {
    if (provider === 'deezer') {
      return deezerService.createPlaylist(name, auth.tokens.accessToken);
    } else {
      return tidalService.createPlaylist(name, auth.tokens.accessToken, auth.user.id);
    }
  },

  async addTracksToPlaylist(provider: Provider, playlistId: string, trackIds: string[], auth: ProviderAuth): Promise<void> {
    if (provider === 'deezer') {
      return deezerService.addTracksToPlaylist(playlistId, trackIds, auth.tokens.accessToken);
    } else {
      return tidalService.addTracksToPlaylist(playlistId, trackIds, auth.tokens.accessToken);
    }
  },

  getPlaylistUrl(provider: Provider, playlistId: string): string {
    if (provider === 'deezer') {
      return `https://www.deezer.com/playlist/${playlistId}`;
    } else {
      return `https://listen.tidal.com/playlist/${playlistId}`;
    }
  },
};

// Helper function
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
