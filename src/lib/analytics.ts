// Google Analytics integration
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const trackPageView = (path: string) => {
  if (window.gtag) {
    window.gtag('config', 'G-ZFZJ9E2Q9D', {
      page_path: path,
    });
  }
};

export const trackEvent = (eventName: string, eventData?: Record<string, unknown>) => {
  if (window.gtag) {
    window.gtag('event', eventName, eventData);
  }
};

// Event tracking helpers
export const analytics = {
  // Invitation events
  invitationCodeSaved: (codeLength: number) => {
    trackEvent('invitation_code_saved', {
      code_length: codeLength,
    });
  },

  // Authentication events
  loginAttempted: (provider: string) => {
    trackEvent('login_attempted', {
      provider,
    });
  },

  loginSuccessful: (provider: string) => {
    trackEvent('login_successful', {
      provider,
    });
  },

  loginFailed: (provider: string, error?: string) => {
    trackEvent('login_failed', {
      provider,
      error,
    });
  },

  // Provider selection events
  sourceProviderSelected: (provider: string) => {
    trackEvent('source_provider_selected', {
      provider,
    });
  },

  targetProviderSelected: (provider: string) => {
    trackEvent('target_provider_selected', {
      provider,
    });
  },

  // Playlist selection
  playlistSelected: (provider: string, playlistId: string, trackCount: number) => {
    trackEvent('playlist_selected', {
      source_provider: provider,
      playlist_id: playlistId,
      track_count: trackCount,
    });
  },

  // Import events
  importStarted: (sourceProvider: string, targetProvider: string, trackCount: number) => {
    trackEvent('import_started', {
      source_provider: sourceProvider,
      target_provider: targetProvider,
      track_count: trackCount,
    });
  },

  importCompleted: (sourceProvider: string, targetProvider: string, imported: number, skipped: number, duplicates: number, durationMs: number) => {
    trackEvent('import_completed', {
      source_provider: sourceProvider,
      target_provider: targetProvider,
      imported,
      skipped,
      duplicates,
      duration_ms: durationMs,
      duration_s: Math.round(durationMs / 1000),
    });
  },

  importFailed: (sourceProvider: string, targetProvider: string, error?: string, durationMs?: number) => {
    trackEvent('import_failed', {
      source_provider: sourceProvider,
      target_provider: targetProvider,
      error,
      duration_ms: durationMs,
    });
  },

  // Support events
  supportModalOpened: () => {
    trackEvent('support_modal_opened');
  },

  supportLinkClicked: (platform: string) => {
    trackEvent('support_link_clicked', {
      platform,
    });
  },
};
