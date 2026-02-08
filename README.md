# Music Stream Match

## What

Music Stream Match is a free, open-source web application that lets you transfer playlists between TIDAL, Spotify, Deezer, and Apple Music. Simply log in to your source and target services, pick a playlist, and transfer it — all from your browser, with no server storing your data.

## Why

Switching between music streaming services shouldn't mean losing your carefully curated playlists. Commercial playlist transfer tools are often paid, limited, or require you to hand over your credentials to a third-party server. Music Stream Match was built as a free, open-source alternative that runs entirely in your browser — your tokens never leave your device.

## How

1. Enter an invitation code to access the app
2. Select a **source** streaming service and log in via OAuth (or ARL for Deezer)
3. Choose a playlist to transfer
4. Select a **target** streaming service and log in
5. Start the import — tracks are matched across services using a local mapping database and added to a new (or existing) playlist on the target service

All authentication happens directly with the streaming provider. Tokens are stored only in your browser's localStorage and are never sent to any backend.

---

## 🎵 Features

- **OAuth authentication** for TIDAL, Spotify, and Apple Music
- **Deezer ARL Cookie** authentication
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

### Demo

The application currently requires invitations - if you want to try the service, you can use the invitation code "demo".

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

Live: [music-stream-match.space](https://music-stream-match.space)

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