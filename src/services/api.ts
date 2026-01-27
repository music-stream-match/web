import type { Provider, Playlist, Track, ProviderAuth, User, AuthTokens } from '@/types';
import { DEEZER_CONFIG, getTidalConfig, getSpotifyConfig } from '@/config/api';
import { useAppStore } from '@/store/useAppStore';

// ============================================
// DEEZER SERVICE (ARL-based authentication)
// ============================================

// Cache for JWT token
let deezerJwtCache: { jwt: string; expiresAt: number } | null = null;

export const deezerService = {
  // Convert ARL to JWT token
  // Note: This function is for future use when we implement proper JWT token exchange
  // Currently, we use the ARL directly in the Authorization header
  async getJwtFromArl(_arl: string): Promise<string> {
    // Check cache first
    if (deezerJwtCache && deezerJwtCache.expiresAt > Date.now() + 60 * 1000) {
      console.log('[Deezer] Using cached JWT');
      return deezerJwtCache.jwt;
    }

    console.log('[Deezer] Converting ARL to JWT...');
    
    // Note: This requires a CORS proxy or backend server to work properly
    // The ARL needs to be sent as a cookie to the renew endpoint
    const response = await fetch(DEEZER_CONFIG.authRenewUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://www.deezer.com',
        'Referer': 'https://www.deezer.com/',
        'Content-Length': '0',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to convert ARL to JWT: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.jwt) {
      throw new Error('No JWT in response');
    }

    // Cache the JWT (typically expires in 6 minutes, but we'll use 5 for safety)
    deezerJwtCache = {
      jwt: data.jwt,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    console.log('[Deezer] Got JWT successfully');
    return data.jwt;
  },

  // Direct JWT fetch with ARL cookie - for browser environments where we need the ARL
  async authenticateWithArl(arl: string): Promise<ProviderAuth> {
    console.log('[Deezer] Authenticating with ARL...');
    
    // Store ARL for later use
    useAppStore.getState().setDeezerArl(arl);
    
    // For the initial auth, we'll extract user info from the JWT we'll get during playlist fetch
    // For now, create a placeholder auth
    const auth: ProviderAuth = {
      provider: 'deezer',
      user: {
        id: 'deezer-user',
        name: 'Deezer User',
      },
      tokens: {
        accessToken: arl, // Store ARL as the token for now
        expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // ARL doesn't expire like OAuth tokens
      },
    };

    console.log('[Deezer] ARL auth stored successfully');
    return auth;
  },

  async getPlaylists(arl: string): Promise<Playlist[]> {
    console.log('[Deezer] Fetching playlists with GraphQL...');
    
    // For now, we'll use a proxy approach or direct fetch
    // The ARL needs to be sent as a cookie to the renew endpoint first to get JWT
    
    // Since browsers block setting cookies for different domains,
    // we'll need to implement a workaround
    
    // Option 1: Use the stored ARL to make a direct GraphQL request
    // This requires the JWT from the renew endpoint
    
    const query = `query SidebarPlaylistsInfo($first: Int!) {
  me {
    id
    playlists(sort: {by: LAST_MODIFICATION_DATE, order: DESC}) {
      edges {
        node {
          lastModificationDate
          ...SidebarPlaylistsInfo
          __typename
        }
        __typename
      }
      __typename
    }
    userFavorites {
      playlists(first: $first) {
        edges {
          favoritedAt
          node {
            ...SidebarPlaylistsInfo
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }
}

fragment SidebarPlaylistsInfo on Playlist {
  isFromFavoriteTracks
  isCollaborative
  id
  title
  owner {
    id
    name
    __typename
  }
  picture {
    ...PictureSmall
    __typename
  }
  __typename
}

fragment PictureSmall on Picture {
  id
  small: urls(pictureRequest: {height: 100, width: 100})
  explicitStatus
  __typename
}`;

    // Try to get JWT using ARL
    // Note: This requires a proxy server to handle CORS and cookie forwarding
    // For local development, you may need to use a browser extension or proxy
    
    const response = await fetch(DEEZER_CONFIG.graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': `Bearer ${arl}`, // This won't work directly - needs JWT
        'Origin': 'https://www.deezer.com',
        'Referer': 'https://www.deezer.com/',
      },
      body: JSON.stringify({
        operationName: 'SidebarPlaylistsInfo',
        variables: { first: 50 },
        query,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Deezer] GraphQL error:', response.status, errorText);
      throw new Error(`Failed to fetch playlists: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Deezer] GraphQL response:', data);

    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'GraphQL error');
    }

    const playlists: Playlist[] = [];
    
    // Parse user's own playlists
    const userPlaylists = data.data?.me?.playlists?.edges || [];
    for (const edge of userPlaylists) {
      const p = edge.node;
      if (p) {
        playlists.push({
          id: p.id,
          name: p.title,
          imageUrl: p.picture?.small?.[0] || undefined,
          trackCount: 0, // Not available in this query
          createdAt: p.lastModificationDate || '',
          owner: p.owner?.name,
        });
      }
    }

    console.log(`[Deezer] Found ${playlists.length} playlists`);
    return playlists;
  },

  async getPlaylistTracks(playlistId: string, arl: string): Promise<string[]> {
    console.log(`[Deezer] Fetching tracks for playlist ${playlistId}...`);
    
    const query = `query PlaylistTracks($playlistId: String!, $first: Int!, $after: String) {
  playlist(playlistId: $playlistId) {
    id
    tracks(first: $first, after: $after) {
      edges {
        node {
          id
          __typename
        }
        __typename
      }
      pageInfo {
        hasNextPage
        endCursor
        __typename
      }
      __typename
    }
    __typename
  }
}`;

    const trackIds: string[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      const response = await fetch(DEEZER_CONFIG.graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${arl}`,
          'Origin': 'https://www.deezer.com',
          'Referer': 'https://www.deezer.com/',
        },
        body: JSON.stringify({
          operationName: 'PlaylistTracks',
          variables: { 
            playlistId,
            first: 100,
            after: cursor,
          },
          query,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch playlist tracks: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      const edges = data.data?.playlist?.tracks?.edges || [];
      for (const edge of edges) {
        if (edge.node?.id) {
          trackIds.push(edge.node.id.toString());
        }
      }

      hasNextPage = data.data?.playlist?.tracks?.pageInfo?.hasNextPage || false;
      cursor = data.data?.playlist?.tracks?.pageInfo?.endCursor || null;
    }

    console.log(`[Deezer] Found ${trackIds.length} tracks in playlist`);
    return trackIds;
  },

  async checkPlaylistExists(name: string, arl: string): Promise<Playlist | null> {
    const playlists = await this.getPlaylists(arl);
    return playlists.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
  },

  async createPlaylist(name: string, arl: string): Promise<string> {
    console.log(`[Deezer] Creating playlist: ${name}`);
    
    const query = `mutation CreatePlaylist($title: String!, $description: String, $isPublic: Boolean) {
  createPlaylist(title: $title, description: $description, isPublic: $isPublic) {
    id
    __typename
  }
}`;

    const response = await fetch(DEEZER_CONFIG.graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': `Bearer ${arl}`,
        'Origin': 'https://www.deezer.com',
        'Referer': 'https://www.deezer.com/',
      },
      body: JSON.stringify({
        operationName: 'CreatePlaylist',
        variables: { 
          title: name,
          description: 'Created by Music Stream Match',
          isPublic: false,
        },
        query,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create playlist: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'GraphQL error');
    }

    const playlistId = data.data?.createPlaylist?.id;
    if (!playlistId) {
      throw new Error('No playlist ID in response');
    }

    console.log(`[Deezer] Created playlist with ID: ${playlistId}`);
    return playlistId.toString();
  },

  async addTracksToPlaylist(playlistId: string, trackIds: string[], arl: string): Promise<void> {
    console.log(`[Deezer] Adding ${trackIds.length} tracks to playlist ${playlistId}...`);
    
    const query = `mutation AddTracksToPlaylist($playlistId: String!, $trackIds: [String!]!) {
  addTracksToPlaylist(playlistId: $playlistId, trackIds: $trackIds) {
    id
    __typename
  }
}`;

    const response = await fetch(DEEZER_CONFIG.graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Authorization': `Bearer ${arl}`,
        'Origin': 'https://www.deezer.com',
        'Referer': 'https://www.deezer.com/',
      },
      body: JSON.stringify({
        operationName: 'AddTracksToPlaylist',
        variables: { 
          playlistId,
          trackIds,
        },
        query,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add tracks: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'GraphQL error');
    }

    console.log('[Deezer] Tracks added successfully');
  },
};

// ============================================
// TIDAL SERVICE
// ============================================

export const tidalService = {
  getAuthUrl(): string {
    const config = getTidalConfig();
    const codeVerifier = generateCodeVerifier();
    sessionStorage.setItem('tidal_code_verifier', codeVerifier);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      code_challenge: codeVerifier, // Using plain for simplicity
      code_challenge_method: 'plain',
    });
    
    const url = `${config.authUrl}?${params.toString()}`;
    console.log('[TIDAL] Auth URL:', url);
    return url;
  },

  async handleCallback(code: string): Promise<ProviderAuth> {
    console.log('[TIDAL] Handling callback with code');
    const config = getTidalConfig();
    
    const codeVerifier = sessionStorage.getItem('tidal_code_verifier');
    if (!codeVerifier) {
      throw new Error('No code verifier found');
    }

    // Exchange code for tokens
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.clientId,
        code,
        redirect_uri: config.redirectUri,
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

    // Extract user info from the token response or JWT
    const user = this.extractUserFromToken(data.access_token, data.user);

    const auth: ProviderAuth = {
      provider: 'tidal',
      user,
      tokens,
    };

    console.log('[TIDAL] Auth successful:', auth.user.name);
    return auth;
  },

  extractUserFromToken(accessToken: string, userData?: any): User {
    console.log('[TIDAL] Extracting user info from token...');
    
    // Try to get user data from token response
    if (userData) {
      return {
        id: userData.userId?.toString() || userData.id?.toString() || 'unknown',
        name: userData.username || userData.fullName || 'TIDAL User',
        email: userData.email,
        picture: userData.picture,
      };
    }

    // Try to decode JWT to get user info
    try {
      const parts = accessToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('[TIDAL] Token payload:', payload);
        return {
          id: payload.uid?.toString() || payload.sub || 'unknown',
          name: payload.username || payload.name || 'TIDAL User',
          email: payload.email,
          picture: undefined,
        };
      }
    } catch (e) {
      console.log('[TIDAL] Could not decode JWT:', e);
    }

    // Fallback
    return {
      id: 'tidal-user',
      name: 'TIDAL User',
    };
  },

  async getUser(accessToken: string): Promise<User> {
    // This method is kept for compatibility but we now extract from token
    return this.extractUserFromToken(accessToken);
  },

  async getPlaylists(accessToken: string, userId: string): Promise<Playlist[]> {
    console.log('[TIDAL] Fetching playlists for user:', userId);
    const config = getTidalConfig();
    
    // Use GET /playlists?filter[owners.id]={userId} to get user's playlists
    // This is simpler and only requires playlists.read scope
    const response = await fetch(
      `${config.apiUrl}/playlists?countryCode=US&filter[owners.id]=${userId}&include=coverArt`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TIDAL] Failed to fetch playlists:', response.status, errorText);
      throw new Error(`Failed to fetch TIDAL playlists: ${response.status}`);
    }

    const data = await response.json();
    console.log('[TIDAL] Playlists response:', data);

    const playlists: Playlist[] = (data.data || []).map((p: any) => ({
      id: p.id,
      name: p.attributes?.name || p.attributes?.title || 'Unknown Playlist',
      description: p.attributes?.description,
      imageUrl: p.attributes?.squareImage ? 
        `https://resources.tidal.com/images/${p.attributes.squareImage.replace(/-/g, '/')}/320x320.jpg` : 
        undefined,
      trackCount: p.attributes?.numberOfItems || 0,
      createdAt: p.attributes?.createdAt,
      owner: p.attributes?.owner?.name,
    }));

    console.log(`[TIDAL] Found ${playlists.length} playlists`);
    return playlists;
  },

  async getPlaylistTracks(playlistId: string, accessToken: string): Promise<string[]> {
    console.log(`[TIDAL] Fetching tracks for playlist ${playlistId}...`);
    const config = getTidalConfig();
    const trackIds: string[] = [];
    let cursor: string | null = null;
    const limit = 100;

    while (true) {
      // TIDAL OpenAPI uses /playlists/{id}/relationships/items
      const url = cursor 
        ? `${config.apiUrl}/playlists/${playlistId}/relationships/items?countryCode=US&limit=${limit}&cursor=${cursor}`
        : `${config.apiUrl}/playlists/${playlistId}/relationships/items?countryCode=US&limit=${limit}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TIDAL] Failed to fetch playlist tracks:', response.status, errorText);
        throw new Error(`Failed to fetch TIDAL playlist tracks: ${response.status}`);
      }

      const data = await response.json();
      console.log('[TIDAL] Playlist items response:', data);

      // JSON:API format - data contains array of resource identifiers
      for (const item of (data.data || [])) {
        if (item.type === 'tracks') {
          trackIds.push(item.id.toString());
        }
      }

      // Check for pagination
      cursor = data.links?.next ? new URL(data.links.next).searchParams.get('cursor') : null;
      if (!cursor || (data.data || []).length < limit) break;
    }

    console.log(`[TIDAL] Found ${trackIds.length} tracks in playlist`);
    return trackIds;
  },

  async checkPlaylistExists(name: string, accessToken: string, userId: string): Promise<Playlist | null> {
    const playlists = await this.getPlaylists(accessToken, userId);
    return playlists.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
  },

  async createPlaylist(name: string, accessToken: string, _userId: string): Promise<string> {
    console.log(`[TIDAL] Creating playlist: ${name}`);
    const config = getTidalConfig();
    
    // TIDAL OpenAPI uses POST /playlists with JSON:API format
    const response = await fetch(`${config.apiUrl}/playlists?countryCode=US`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'playlists',
          attributes: {
            name: name,
            description: 'Created by Music Stream Match',
            privacy: 'PUBLIC',
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TIDAL] Failed to create playlist:', response.status, errorText);
      throw new Error(`Failed to create TIDAL playlist: ${response.status}`);
    }

    const data = await response.json();
    console.log('[TIDAL] Create playlist response:', data);
    const playlistId = data.data?.id;
    console.log(`[TIDAL] Created playlist with ID: ${playlistId}`);
    return playlistId;
  },

  async addTracksToPlaylist(playlistId: string, trackIds: string[], accessToken: string): Promise<void> {
    console.log(`[TIDAL] Adding ${trackIds.length} tracks to playlist ${playlistId}...`);
    const config = getTidalConfig();
    
    // TIDAL might have limits on batch size
    const batchSize = 50;
    for (let i = 0; i < trackIds.length; i += batchSize) {
      const batch = trackIds.slice(i, i + batchSize);
      
      // TIDAL OpenAPI uses POST /playlists/{id}/relationships/items with JSON:API format
      const response = await fetch(
        `${config.apiUrl}/playlists/${playlistId}/relationships/items?countryCode=US`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/vnd.api+json',
            'Accept': 'application/vnd.api+json',
          },
          body: JSON.stringify({
            data: batch.map(id => ({
              type: 'tracks',
              id: id,
            })),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TIDAL] Failed to add tracks:', response.status, errorText);
        throw new Error(`Failed to add tracks to TIDAL playlist: ${response.status}`);
      }
    }

    console.log('[TIDAL] Tracks added successfully');
  },
};

// ============================================
// SPOTIFY SERVICE
// ============================================

export const spotifyService = {
  getAuthUrl(): string {
    const config = getSpotifyConfig();
    const state = generateCodeVerifier();
    sessionStorage.setItem('spotify_state', state);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(' '),
      state,
    });
    
    const url = `${config.authUrl}?${params.toString()}`;
    console.log('[Spotify] Auth URL:', url);
    return url;
  },

  async handleCallback(code: string): Promise<ProviderAuth> {
    console.log('[Spotify] Handling callback with code');
    const config = getSpotifyConfig();
    
    // Exchange code for tokens
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${config.clientId}:${config.clientSecret}`),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirectUri,
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

    sessionStorage.removeItem('spotify_state');

    // Fetch user info
    const user = await this.getUser(tokens.accessToken);

    const auth: ProviderAuth = {
      provider: 'spotify',
      user,
      tokens,
    };

    console.log('[Spotify] Auth successful:', auth.user.name);
    return auth;
  },

  async getUser(accessToken: string): Promise<User> {
    console.log('[Spotify] Fetching user info...');
    const config = getSpotifyConfig();
    const response = await fetch(`${config.apiUrl}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Spotify user');
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.display_name || data.id,
      email: data.email,
      picture: data.images?.[0]?.url,
    };
  },

  async getPlaylists(accessToken: string): Promise<Playlist[]> {
    console.log('[Spotify] Fetching playlists...');
    const config = getSpotifyConfig();
    const playlists: Playlist[] = [];
    let url: string | null = `${config.apiUrl}/me/playlists?limit=50`;

    while (url) {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Spotify playlists');
      }

      const data = await response.json();

      for (const p of data.items) {
        playlists.push({
          id: p.id,
          name: p.name,
          description: p.description,
          imageUrl: p.images?.[0]?.url,
          trackCount: p.tracks?.total || 0,
          createdAt: '', // Spotify doesn't provide creation date
          owner: p.owner?.display_name,
        });
      }

      url = data.next;
    }

    console.log(`[Spotify] Found ${playlists.length} playlists`);
    return playlists;
  },

  async getPlaylistTracks(playlistId: string, accessToken: string): Promise<string[]> {
    console.log(`[Spotify] Fetching tracks for playlist ${playlistId}...`);
    const config = getSpotifyConfig();
    const trackIds: string[] = [];
    let url: string | null = `${config.apiUrl}/playlists/${playlistId}/tracks?limit=100`;

    while (url) {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Spotify playlist tracks');
      }

      const data = await response.json();

      for (const item of data.items) {
        if (item.track?.id) {
          trackIds.push(item.track.id);
        }
      }

      url = data.next;
    }

    console.log(`[Spotify] Found ${trackIds.length} tracks in playlist`);
    return trackIds;
  },

  async checkPlaylistExists(name: string, accessToken: string): Promise<Playlist | null> {
    const playlists = await this.getPlaylists(accessToken);
    return playlists.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
  },

  async createPlaylist(name: string, accessToken: string, userId: string): Promise<string> {
    console.log(`[Spotify] Creating playlist: ${name}`);
    const config = getSpotifyConfig();
    const response = await fetch(`${config.apiUrl}/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        public: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Spotify playlist');
    }

    const data = await response.json();
    console.log(`[Spotify] Created playlist with ID: ${data.id}`);
    return data.id;
  },

  async addTracksToPlaylist(playlistId: string, trackIds: string[], accessToken: string): Promise<void> {
    console.log(`[Spotify] Adding ${trackIds.length} tracks to playlist ${playlistId}...`);
    const config = getSpotifyConfig();
    
    // Spotify accepts max 100 tracks per request
    const batchSize = 100;
    for (let i = 0; i < trackIds.length; i += batchSize) {
      const batch = trackIds.slice(i, i + batchSize);
      const uris = batch.map(id => `spotify:track:${id}`);
      
      const response = await fetch(`${config.apiUrl}/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris }),
      });

      if (!response.ok) {
        throw new Error('Failed to add tracks to Spotify playlist');
      }
    }

    console.log('[Spotify] Tracks added successfully');
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
    // Deezer uses ARL-based auth, no OAuth redirect needed
    if (provider === 'deezer') {
      throw new Error('Deezer uses ARL authentication, not OAuth');
    }
    if (provider === 'spotify') return spotifyService.getAuthUrl();
    return tidalService.getAuthUrl();
  },

  async handleCallback(provider: Provider, params: URLSearchParams | string): Promise<ProviderAuth> {
    // Deezer uses ARL-based auth, no callback handling needed
    if (provider === 'deezer') {
      throw new Error('Deezer uses ARL authentication, not OAuth');
    } else if (provider === 'spotify') {
      const code = (params as URLSearchParams).get('code');
      if (!code) throw new Error('No code in Spotify callback');
      return spotifyService.handleCallback(code);
    } else {
      const code = (params as URLSearchParams).get('code');
      if (!code) throw new Error('No code in TIDAL callback');
      return tidalService.handleCallback(code);
    }
  },

  async getPlaylists(provider: Provider, auth: ProviderAuth | null, arl?: string): Promise<Playlist[]> {
    if (provider === 'deezer') {
      const deezerArl = arl || useAppStore.getState().getDeezerArl();
      if (!deezerArl) throw new Error('No Deezer ARL available');
      return deezerService.getPlaylists(deezerArl);
    } else if (provider === 'spotify') {
      if (!auth) throw new Error('No auth available for Spotify');
      return spotifyService.getPlaylists(auth.tokens.accessToken);
    } else {
      if (!auth) throw new Error('No auth available for TIDAL');
      return tidalService.getPlaylists(auth.tokens.accessToken, auth.user.id);
    }
  },

  async getPlaylistTracks(provider: Provider, playlistId: string, auth: ProviderAuth | null, arl?: string): Promise<string[]> {
    if (provider === 'deezer') {
      const deezerArl = arl || useAppStore.getState().getDeezerArl();
      if (!deezerArl) throw new Error('No Deezer ARL available');
      return deezerService.getPlaylistTracks(playlistId, deezerArl);
    } else if (provider === 'spotify') {
      if (!auth) throw new Error('No auth available for Spotify');
      return spotifyService.getPlaylistTracks(playlistId, auth.tokens.accessToken);
    } else {
      if (!auth) throw new Error('No auth available for TIDAL');
      return tidalService.getPlaylistTracks(playlistId, auth.tokens.accessToken);
    }
  },

  async checkPlaylistExists(provider: Provider, name: string, auth: ProviderAuth | null, arl?: string): Promise<Playlist | null> {
    if (provider === 'deezer') {
      const deezerArl = arl || useAppStore.getState().getDeezerArl();
      if (!deezerArl) throw new Error('No Deezer ARL available');
      return deezerService.checkPlaylistExists(name, deezerArl);
    } else if (provider === 'spotify') {
      if (!auth) throw new Error('No auth available for Spotify');
      return spotifyService.checkPlaylistExists(name, auth.tokens.accessToken);
    } else {
      if (!auth) throw new Error('No auth available for TIDAL');
      return tidalService.checkPlaylistExists(name, auth.tokens.accessToken, auth.user.id);
    }
  },

  async createPlaylist(provider: Provider, name: string, auth: ProviderAuth | null, arl?: string): Promise<string> {
    if (provider === 'deezer') {
      const deezerArl = arl || useAppStore.getState().getDeezerArl();
      if (!deezerArl) throw new Error('No Deezer ARL available');
      return deezerService.createPlaylist(name, deezerArl);
    } else if (provider === 'spotify') {
      if (!auth) throw new Error('No auth available for Spotify');
      return spotifyService.createPlaylist(name, auth.tokens.accessToken, auth.user.id);
    } else {
      if (!auth) throw new Error('No auth available for TIDAL');
      return tidalService.createPlaylist(name, auth.tokens.accessToken, auth.user.id);
    }
  },

  async addTracksToPlaylist(provider: Provider, playlistId: string, trackIds: string[], auth: ProviderAuth | null, arl?: string): Promise<void> {
    if (provider === 'deezer') {
      const deezerArl = arl || useAppStore.getState().getDeezerArl();
      if (!deezerArl) throw new Error('No Deezer ARL available');
      return deezerService.addTracksToPlaylist(playlistId, trackIds, deezerArl);
    } else if (provider === 'spotify') {
      if (!auth) throw new Error('No auth available for Spotify');
      return spotifyService.addTracksToPlaylist(playlistId, trackIds, auth.tokens.accessToken);
    } else {
      if (!auth) throw new Error('No auth available for TIDAL');
      return tidalService.addTracksToPlaylist(playlistId, trackIds, auth.tokens.accessToken);
    }
  },

  getPlaylistUrl(provider: Provider, playlistId: string): string {
    if (provider === 'deezer') {
      return `https://www.deezer.com/playlist/${playlistId}`;
    } else if (provider === 'spotify') {
      return `https://open.spotify.com/playlist/${playlistId}`;
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
