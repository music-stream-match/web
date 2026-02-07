# Music Stream Match - Copilot Instructions

## Project Overview

This is a React + TypeScript SPA for transferring playlists between TIDAL, Deezer, Spotify, and Apple Music streaming services. Deployed on GitHub Pages at `music-stream-match.github.io`.

## Architecture

### Tech Stack
- **React 19** with **TypeScript** (strict mode)
- **Vite 7** for bundling
- **Tailwind CSS 4** with custom theme in `src/index.css`
- **Zustand** for state management (`src/store/useAppStore.ts`)
- **React Router 7** for routing

### Key Directories
- `src/components/ui/` - Reusable UI primitives (Button, Card, Modal, Input, ProgressBar)
- `src/components/` - Feature components (ProviderCard, PlaylistCard, ImportProgress)
- `src/pages/` - Route pages (HomePage, PlaylistsPage, ImportPage, CallbackPage)
- `src/services/` - API services for Deezer, TIDAL, Spotify, Apple Music, and track mapping
- `src/config/api.ts` - OAuth configuration for all providers
- `public/api/providers/{provider}/tracks/{id}.json` - Local track mapping database

### Data Flow
1. User selects source provider → OAuth redirect → callback saves auth to Zustand (persisted in localStorage)
2. User selects playlist → stored in Zustand
3. User selects target provider → OAuth if needed
4. Import process: fetch source tracks → map via local JSON → add to target playlist

## Coding Conventions

### TypeScript
- Use `type` imports: `import type { Provider } from '@/types'`
- Define interfaces in `src/types/index.ts`
- Use path alias `@/` for imports from `src/`

### Components
- Functional components with explicit prop types
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Console.log all significant actions with `[ComponentName]` prefix

### Styling
- Use Tailwind utility classes
- Custom colors defined in CSS: `primary`, `surface`, `border`, `text`, `text-muted`, `tidal`, `deezer`, `spotify`, `apple`
- Component classes: `.btn`, `.btn-primary`, `.card`, `.input`

### State Management
- All app state in single Zustand store
- Auth tokens persisted automatically via zustand/persist
- Use `getAuth(provider)` and `isLoggedIn(provider)` helpers

## OAuth Implementation

### Deezer
- Uses implicit grant (token in URL fragment)
- Callback extracts `access_token` from `window.location.hash`

### TIDAL
- Uses Authorization Code with PKCE
- Code verifier stored in `sessionStorage`
- Callback exchanges code for tokens

### Spotify
- Uses Authorization Code flow
- State parameter stored in `sessionStorage`
- Callback exchanges code for tokens using client credentials

### Apple Music
- Uses MusicKit JS for authentication
- Developer token (JWT) required server-side
- Music User Token obtained via MusicKit JS authorization

## Track Mapping

Track details are fetched from local JSON files, not external APIs:
```
GET /api/providers/{provider}/tracks/{trackId}.json
```

The `providers` array in each track JSON maps IDs across services.

## Commands

```bash
npm run dev      # Start dev server on :5173
npm run build    # TypeScript check + production build
npm run preview  # Preview production build
```

## GitHub Pages SPA Handling

- `public/404.html` redirects to `/` with path in sessionStorage
- `App.tsx` has `RedirectHandler` component to restore route after redirect
