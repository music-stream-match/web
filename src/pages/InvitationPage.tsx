import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Button, Input } from '@/components/ui';
import { Music2, KeyRound, AlertCircle } from 'lucide-react';
import type { InvitationConfig } from '@/types';

export function InvitationPage() {
  const navigate = useNavigate();
  const { setInvitation } = useAppStore();

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError('Proszę wprowadzić kod zaproszenia');
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log(`[InvitationPage] Validating invitation code: ${trimmedCode}`);

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}${trimmedCode}.json`);
      
      if (!response.ok) {
        console.log(`[InvitationPage] Invalid invitation code: ${trimmedCode}, status: ${response.status}`);
        setError('Nieprawidłowy kod zaproszenia. Sprawdź kod i spróbuj ponownie.');
        setIsLoading(false);
        return;
      }

      const config: InvitationConfig = await response.json();
      console.log(`[InvitationPage] Valid invitation code: ${trimmedCode}, config:`, config.name);
      
      setInvitation(trimmedCode, config);
      navigate('/');
    } catch (err) {
      console.error('[InvitationPage] Error validating invitation code:', err);
      setError('Nieprawidłowy kod zaproszenia. Sprawdź kod i spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Music2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Music Stream Match</h1>
          <p className="text-text-muted">
            Przenoś swoje playlisty między serwisami streamingowymi
          </p>
        </div>

        {/* Invitation Form */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Kod zaproszenia</h2>
              <p className="text-sm text-text-muted">
                Wprowadź kod, aby uzyskać dostęp
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Kod zaproszenia"
              placeholder="Wprowadź swój kod"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
              error={error || undefined}
              disabled={isLoading}
              autoFocus
            />

            {error && (
              <div className="flex items-center gap-2 text-error text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !code.trim()}
            >
              {isLoading ? 'Sprawdzanie...' : 'Kontynuuj'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          Nie masz kodu zaproszenia? Skontaktuj się z administratorem.
        </p>
      </div>
    </div>
  );
}
