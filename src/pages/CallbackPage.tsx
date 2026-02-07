import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { providerService } from '@/services/api';
import { analytics } from '@/lib/analytics';
import type { Provider } from '@/types';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function CallbackPage() {
  const navigate = useNavigate();
  const { provider } = useParams<{ provider: string }>();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const { setAuth, setSourceProvider, setTargetProvider } = useAppStore();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    console.log(`[Callback] Processing callback for ${provider}`);
    console.log(`[Callback] URL hash: ${window.location.hash}`);
    console.log(`[Callback] URL search: ${window.location.search}`);

    if (provider !== 'tidal' && provider !== 'deezer' && provider !== 'spotify' && provider !== 'apple') {
      setError('Invalid provider');
      setStatus('error');
      return;
    }

    // Deezer now uses ARL-based auth, not OAuth callbacks
    if (provider === 'deezer') {
      console.log('[Callback] Deezer uses ARL-based auth, redirecting to home');
      navigate('/');
      return;
    }

    // Apple Music uses MusicKit JS inline auth, not OAuth callbacks
    if (provider === 'apple') {
      console.log('[Callback] Apple Music uses MusicKit JS, redirecting to home');
      navigate('/');
      return;
    }

    try {
      let auth;

      // TIDAL and Spotify use query params (authorization code)
      const code = searchParams.get('code');
      if (!code) {
        const errorDesc = searchParams.get('error_description');
        throw new Error(errorDesc || 'No authorization code received');
      }
      auth = await providerService.handleCallback(provider, searchParams);

      // Save auth
      setAuth(provider as Provider, auth);
      analytics.loginSuccessful(provider);

      // Check what we were doing
      const mode = sessionStorage.getItem('auth_mode') as 'source' | 'target' | null;
      sessionStorage.removeItem('auth_mode');
      sessionStorage.removeItem('auth_provider');

      if (mode === 'source') {
        setSourceProvider(provider as Provider);
        analytics.sourceProviderSelected(provider);
        setStatus('success');
        // Navigate to playlist selection
        setTimeout(() => navigate('/playlists'), 1500);
      } else if (mode === 'target') {
        setTargetProvider(provider as Provider);
        analytics.targetProviderSelected(provider);
        setStatus('success');
        // Navigate back to home
        setTimeout(() => navigate('/'), 1500);
      } else {
        setStatus('success');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      console.error('[Callback] Error:', message);
      analytics.loginFailed(provider || 'unknown', message);
      setError(message);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Logowanie...</h2>
            <p className="text-text-muted">Trwa przetwarzanie autoryzacji</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Zalogowano pomyślnie!</h2>
            <p className="text-text-muted">Przekierowywanie...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-error" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Błąd logowania</h2>
            <p className="text-error mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary"
            >
              Powrót do strony głównej
            </button>
          </>
        )}
      </div>
    </div>
  );
}
