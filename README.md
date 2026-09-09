# Musica

## What

Musica is a free, open-source web application that lets you transfer playlists between TIDAL, Spotify, and Deezer (Apple Music is temporarily disabled). Simply connect your source and target services, pick a playlist, and transfer it — all from your browser, with no server storing your data.

## Why

Switching between music streaming services shouldn't mean losing your carefully curated playlists. Commercial playlist transfer tools are often paid, limited, or require you to hand over your credentials to a third-party server. Musica was built as a free, open-source alternative that runs entirely in your browser — your tokens and credentials never leave your device.

## How

1. Select a **source** streaming service and connect:
   - For **Spotify** and **TIDAL**: enter your `Client ID` and `Client Secret` from their developer dashboards.
   - For **Deezer**: enter your `ARL` cookie.
   - *(Apple Music is temporarily disabled)*
2. Choose a playlist to transfer
3. Select a **target** streaming service and connect
4. Start the import — tracks are matched across services using a local mapping database and added to a new (or existing) playlist on the target service

> **Security & Privacy:**
> **These credentials and tokens are stored only in your browser and nowhere else.**
> Logging out immediately removes all saved credentials and tokens from your browser's `localStorage`.

---

## 🎵 Features

- **Direct API & OAuth authentication** for TIDAL and Spotify
- **Deezer ARL Cookie** authentication
- **Client-only security** — credentials are stored exclusively in your browser and erased upon logout
- **Apple Music temporarily disabled**
- **Playlist transfer** between supported streaming services
- **Real-time progress tracking** during import
- **Import summary** with skipped tracks list and duration
- **Multi-language support** - 16 languages with automatic browser detection
- **Onboarding wizard** for new users
- **Persistent settings** - language preference saved locally

## 🌍 Supported Languages

English, Spanish, Chinese, Hindi, Arabic, Portuguese, Bengali, Russian, Japanese, German, Korean, French, Vietnamese, Italian, Turkish, Polish

## 🚀 Quick Start

### Requirements

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 🔑 Setting Up Credentials

Musica connects directly to streaming platforms using client-side APIs. To use Spotify or TIDAL, you can create a free developer app:

#### Spotify
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in.
2. Create an application.
3. In App Settings, add the Redirect URI:
   - Production: `https://musica.mobulum.com/callback/spotify`
   - Local development: `https://localhost-vite.mobulum.xyz/callback/spotify`
4. Copy your **Client ID** and **Client Secret** and enter them when clicking Spotify in Musica.

#### TIDAL
1. Go to the [TIDAL Developer Portal](https://developer.tidal.com/) and log in.
2. Create an application.
3. Set the Redirect URI to:
   - Production: `https://musica.mobulum.com/callback/tidal`
   - Local development: `https://localhost-vite.mobulum.xyz/callback/tidal`
4. Copy your **Client ID** and **Client Secret** and enter them when clicking TIDAL in Musica.

#### Deezer
1. Log in to [deezer.com](https://www.deezer.com) in your browser.
2. Open Developer Tools (`F12`) → Application → Cookies.
3. Copy the value of the cookie named `arl`.

### Production Build

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/       # React components
│   ├── ui/          # Base UI components (Button, Card, Modal, Input, ProgressBar)
│   └── ...          # Feature components (ProviderCard, PlaylistCard, etc.)
├── config/          # API configuration (OAuth settings)
├── hooks/           # Custom React hooks
├── i18n/            # Internationalization
│   └── translations/  # 16 language JSON files
├── lib/             # Utility functions
├── pages/           # Application pages
├── services/        # API services
├── store/           # Zustand store
└── types/           # TypeScript types
```

## 🌐 Deployment

The project is automatically deployed to GitHub Pages via GitHub Actions.

Live: [musica.mobulum.com](https://musica.mobulum.com)

## 🛠️ Technologies

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- React Router 7
- Zustand (state management)

# Free, forever

Feel free to use however you like but please do not sell it. It is FREE for everyone! FOREVER. You can buy me a coffee
if you like to thank me.

- [PayPal](https://paypal.me/zenedithPL)
- [Ko-Fi](https://ko-fi.com/K3K11ABGW5)
- [Patreon](https://patreon.com/Zenedith)

## 📝 License

MIT