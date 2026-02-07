import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, locale?: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale || navigator.language || 'en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}

export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const codeVerifier = base64UrlEncode(array);
  
  // For simplicity, we'll use plain method (S256 requires async)
  return {
    codeVerifier,
    codeChallenge: codeVerifier,
  };
}

function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function getProviderColor(provider: 'tidal' | 'deezer' | 'spotify' | 'apple'): string {
  if (provider === 'tidal') return 'tidal';
  if (provider === 'spotify') return 'spotify';
  if (provider === 'apple') return 'apple';
  return 'deezer';
}

export function getProviderName(provider: 'tidal' | 'deezer' | 'spotify' | 'apple'): string {
  if (provider === 'tidal') return 'TIDAL';
  if (provider === 'spotify') return 'Spotify';
  if (provider === 'apple') return 'Apple Music';
  return 'Deezer';
}
