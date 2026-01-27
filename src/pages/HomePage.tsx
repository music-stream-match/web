import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Provider } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { ProviderCard } from '@/components/ProviderCard';
import { DeezerArlModal } from '@/components/DeezerArlModal';
import { Button } from '@/components/ui';
import { providerService } from '@/services/api';
import { ArrowRight, Music2, RefreshCw } from 'lucide-react';
import { getProviderName } from '@/lib/utils';

export function HomePage() {
  const navigate = useNavigate();
  const {
    sourceProvider,
    targetProvider,
    selectedPlaylist,
    setSourceProvider,
    setTargetProvider,
    isLoggedIn,
    reset,
  } = useAppStore();

  const [step, setStep] = useState<'source' | 'target' | 'ready'>(
    sourceProvider && selectedPlaylist
      ? targetProvider
        ? 'ready'
        : 'target'
      : 'source'
  );

  // Deezer ARL modal state
  const [showDeezerArlModal, setShowDeezerArlModal] = useState(false);
  const [pendingDeezerMode, setPendingDeezerMode] = useState<'source' | 'target' | null>(null);

  const handleProviderClick = (provider: Provider, mode: 'source' | 'target') => {
    console.log(`[HomePage] Provider ${provider} clicked for ${mode}`);

    if (!isLoggedIn(provider)) {
      // Deezer uses ARL-based auth, not OAuth
      if (provider === 'deezer') {
        console.log('[HomePage] Showing Deezer ARL modal');
        setPendingDeezerMode(mode);
        setShowDeezerArlModal(true);
        return;
      }

      // Store what we're trying to do
      sessionStorage.setItem('auth_mode', mode);
      sessionStorage.setItem('auth_provider', provider);

      // Redirect to provider auth
      const authUrl = providerService.getAuthUrl(provider);
      console.log(`[HomePage] Redirecting to auth: ${authUrl}`);
      window.location.href = authUrl;
      return;
    }

    if (mode === 'source') {
      setSourceProvider(provider);
      // Navigate to playlist selection
      navigate('/playlists');
    } else {
      setTargetProvider(provider);
      setStep('ready');
    }
  };

  const handleDeezerArlSuccess = () => {
    console.log('[HomePage] Deezer ARL auth successful');
    setShowDeezerArlModal(false);
    
    if (pendingDeezerMode === 'source') {
      setSourceProvider('deezer');
      navigate('/playlists');
    } else if (pendingDeezerMode === 'target') {
      setTargetProvider('deezer');
      setStep('ready');
    }
    
    setPendingDeezerMode(null);
  };

  const handleDeezerArlClose = () => {
    setShowDeezerArlModal(false);
    setPendingDeezerMode(null);
  };

  const handleStartImport = () => {
    console.log('[HomePage] Starting import process');
    navigate('/import');
  };

  const handleReset = () => {
    console.log('[HomePage] Resetting selection');
    reset();
    setStep('source');
  };

  const providers: Provider[] = ['tidal', 'spotify', 'deezer'];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Music2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Music Stream Match</h1>
          <p className="text-text-muted">
            Przenoś playlisty między serwisami streamingowymi
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <StepIndicator
            number={1}
            label="Źródło"
            active={step === 'source'}
            completed={!!sourceProvider && !!selectedPlaylist}
          />
          <div className="w-8 h-px bg-border" />
          <StepIndicator
            number={2}
            label="Cel"
            active={step === 'target'}
            completed={!!targetProvider}
          />
          <div className="w-8 h-px bg-border" />
          <StepIndicator
            number={3}
            label="Import"
            active={step === 'ready'}
            completed={false}
          />
        </div>

        {/* Source selection */}
        {step === 'source' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-6">
              Wybierz serwis źródłowy
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {providers.map(provider => (
                <ProviderCard
                  key={provider}
                  provider={provider}
                  mode="source"
                  selected={sourceProvider === provider}
                  onClick={() => handleProviderClick(provider, 'source')}
                />
              ))}
            </div>
          </div>
        )}

        {/* Target selection */}
        {step === 'target' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-2">
              Wybierz serwis docelowy
            </h2>
            {selectedPlaylist && (
              <p className="text-center text-text-muted mb-6">
                Wybrana playlista: <strong>{selectedPlaylist.name}</strong> z {getProviderName(sourceProvider!)}
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-3">
              {providers.map(provider => (
                <ProviderCard
                  key={provider}
                  provider={provider}
                  mode="target"
                  disabled={provider === sourceProvider}
                  selected={targetProvider === provider}
                  onClick={() => handleProviderClick(provider, 'target')}
                />
              ))}
            </div>
          </div>
        )}

        {/* Ready to import */}
        {step === 'ready' && selectedPlaylist && sourceProvider && targetProvider && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center mb-6">
              Gotowy do importu
            </h2>

            {/* Summary */}
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-sm text-text-muted mb-1">Z</p>
                <div className="px-4 py-2 bg-surface rounded-md">
                  <p className="font-medium">{getProviderName(sourceProvider)}</p>
                </div>
              </div>

              <ArrowRight className="w-6 h-6 text-primary" />

              <div className="text-center">
                <p className="text-sm text-text-muted mb-1">Do</p>
                <div className="px-4 py-2 bg-surface rounded-md">
                  <p className="font-medium">{getProviderName(targetProvider)}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-surface rounded-md text-center">
              <p className="text-text-muted mb-1">Playlista</p>
              <p className="text-lg font-semibold">{selectedPlaylist.name}</p>
              <p className="text-sm text-text-muted">{selectedPlaylist.trackCount} utworów</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleReset} className="flex-1">
                <RefreshCw className="w-4 h-4" />
                Zacznij od nowa
              </Button>
              <Button variant="primary" onClick={handleStartImport} className="flex-1">
                Rozpocznij import
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Deezer ARL Modal */}
      <DeezerArlModal
        isOpen={showDeezerArlModal}
        onClose={handleDeezerArlClose}
        onSuccess={handleDeezerArlSuccess}
      />
    </div>
  );
}

interface StepIndicatorProps {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}

function StepIndicator({ number, label, active, completed }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
          completed
            ? 'bg-success text-white'
            : active
            ? 'bg-primary text-white'
            : 'bg-surface text-text-muted'
        }`}
      >
        {completed ? '✓' : number}
      </div>
      <span className={`text-xs ${active ? 'text-primary' : 'text-text-muted'}`}>
        {label}
      </span>
    </div>
  );
}
