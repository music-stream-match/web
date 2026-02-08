# Privacy Policy

**Last updated:** February 8, 2026

Music Stream Match ("the App") is a free, open-source web application that helps users transfer playlists between streaming music services. This Privacy Policy explains what data we collect, how we use it, and your rights.

## 1. Data Controller

Music Stream Match  
Email: music-stream-match@mobulum.com  
Discord: [https://discord.gg/rwJcE5Zwez](https://discord.gg/rwJcE5Zwez)

## 2. What Data We Collect

### 2.1 Data Stored in Your Browser (localStorage)

When you use the App, the following data is stored **exclusively in your browser's localStorage** and is never transmitted to our servers:

- **OAuth tokens** — access tokens and refresh tokens issued by TIDAL, Spotify, and Apple Music to authorize playlist operations on your behalf.
- **Deezer ARL cookie** — an authentication reference link you provide manually.
- **Invitation code and configuration** — the code used to access the App.
- **Language preference** — your chosen display language.
- **Basic profile info** — your username and user ID as returned by the streaming providers (used only for display purposes within the App).

**We do not have access to this data.** It stays on your device and is never sent to any backend server we operate.

### 2.2 Google Analytics

We use Google Analytics (measurement ID: `G-ZFZJ9E2Q9D`) to collect anonymous usage statistics such as:

- Pages visited and navigation paths
- General interaction events (e.g., import started, provider selected)
- Browser type, screen size, and general geographic region (country-level)

Google Analytics uses cookies to distinguish unique visitors. No personally identifiable information (name, email, IP address) is deliberately collected through Analytics. Google's data processing is governed by [Google's Privacy Policy](https://policies.google.com/privacy).

### 2.3 Cloudflare Worker Proxy (Deezer Only)

Deezer API requests are routed through a Cloudflare Worker proxy (`deezer.music-stream-match.space`) to handle CORS restrictions. This proxy may log standard HTTP request metadata (IP addresses, timestamps, user agents) as part of Cloudflare's default infrastructure. We do not actively collect or store this data, but Cloudflare's infrastructure may retain logs temporarily in accordance with [Cloudflare's Privacy Policy](https://www.cloudflare.com/privacypolicy/).

## 3. How We Use Data

- **Streaming service tokens** — used solely to read your playlists from the source service and create/add tracks to playlists on the target service.
- **Analytics data** — used to understand how the App is used, identify issues, and improve the user experience.

We do **not**:
- Sell or share your data with third parties for marketing purposes
- Use your data for profiling or targeted advertising
- Store your streaming credentials on any server

## 4. Third-Party Services

The App interacts with the following third-party services. Each has its own privacy policy:

| Service | Purpose | Privacy Policy |
|---------|---------|---------------|
| TIDAL | Playlist read/write via OAuth | [tidal.com/privacy](https://tidal.com/privacy) |
| Spotify | Playlist read/write via OAuth | [spotify.com/privacy](https://www.spotify.com/privacy) |
| Apple Music | Playlist read/write via MusicKit JS | [apple.com/privacy](https://www.apple.com/privacy/) |
| Deezer | Playlist read/write via ARL | [deezer.com/legal/personal-datas](https://www.deezer.com/legal/personal-datas) |
| Google Analytics | Anonymous usage analytics | [policies.google.com/privacy](https://policies.google.com/privacy) |
| Cloudflare | Deezer API proxy (CORS) | [cloudflare.com/privacypolicy](https://www.cloudflare.com/privacypolicy/) |

## 5. Data Retention

- **Browser localStorage data** — persists until you clear your browser data, log out of individual services, or clear the App's storage. You are in full control.
- **Google Analytics data** — retained according to Google Analytics default retention settings (14 months).
- **Cloudflare logs** — retained according to Cloudflare's standard log retention policy.

## 6. Your Rights

You have the right to:

- **Access** — view all data stored by the App in your browser's developer tools (Application → localStorage → `music-stream-match-storage`).
- **Delete** — clear all locally stored data at any time by clearing your browser's localStorage or using the App's log-out functionality.
- **Opt out of analytics** — use browser extensions such as [Google Analytics Opt-out](https://tools.google.com/dlpage/gaoptout) or enable "Do Not Track" in your browser settings.
- **Revoke access** — remove the App's OAuth permissions from your streaming service account settings at any time.

## 7. Cookies

The App uses the following cookies:

| Cookie | Provider | Purpose | Duration |
|--------|----------|---------|----------|
| `_ga`, `_ga_*` | Google Analytics | Distinguish unique visitors | 2 years |

No other cookies are set by the App itself. localStorage is used instead of cookies for application state.

## 8. Children's Privacy

The App is not directed at children under 16. We do not knowingly collect any personal information from children.

## 9. Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be reflected by updating the "Last updated" date at the top of this page and committed to the project's public repository.

## 10. Contact

If you have questions about this Privacy Policy, please contact us:

- **Email:** music-stream-match@mobulum.com
- **Discord:** [https://discord.gg/rwJcE5Zwez](https://discord.gg/rwJcE5Zwez)
- **GitHub:** [https://github.com/music-stream-match](https://github.com/music-stream-match)
