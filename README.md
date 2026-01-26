# Music Stream Match

Aplikacja do przenoszenia playlist między serwisami streamingowymi TIDAL i Deezer.

## 🎵 Funkcjonalności

- Logowanie OAuth do TIDAL i Deezer
- Przeglądanie playlist z wybranego serwisu
- Przenoszenie utworów między serwisami
- Mapowanie utworów za pomocą lokalnej bazy danych
- Podgląd postępu importu w czasie rzeczywistym
- Podsumowanie importu z listą pominiętych utworów

## 🚀 Szybki start

### Wymagania

- Node.js 18+
- npm 9+

### Instalacja

```bash
npm install
```

### Uruchomienie (dev)

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:5173`

### Build produkcyjny

```bash
npm run build
```

## 📁 Struktura projektu

```
src/
├── components/       # Komponenty React
│   ├── ui/          # Bazowe komponenty UI
│   └── ...          # Feature components
├── config/          # Konfiguracja API
├── lib/             # Utility functions
├── pages/           # Strony aplikacji
├── services/        # Serwisy API
├── store/           # Zustand store
└── types/           # TypeScript types
```

## 🗂️ Baza mapowań utworów

Mapowania utworów są przechowywane lokalnie w plikach JSON:

```
public/api/providers/{provider}/tracks/{trackId}.json
```

## 🌐 Deploy

Projekt jest automatycznie deployowany na GitHub Pages przez GitHub Actions.

## 🛠️ Technologie

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- React Router 7
- Zustand

## 📝 Licencja

MIT