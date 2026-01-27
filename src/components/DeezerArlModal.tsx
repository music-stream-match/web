import { useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import { deezerService } from '@/services/api';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface DeezerArlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeezerArlModal({ isOpen, onClose, onSuccess }: DeezerArlModalProps) {
  const [arl, setArl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const setDeezerArl = useAppStore(state => state.setDeezerArl);
  const setAuth = useAppStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!arl.trim()) {
      setError('Proszę wprowadzić ARL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[DeezerArlModal] Authenticating with ARL...');
      
      // Store the ARL
      setDeezerArl(arl.trim());
      
      // Create auth object for Deezer
      const auth = await deezerService.authenticateWithArl(arl.trim());
      setAuth('deezer', auth);
      
      console.log('[DeezerArlModal] ARL saved successfully');
      onSuccess();
    } catch (err) {
      console.error('[DeezerArlModal] Error:', err);
      setError(err instanceof Error ? err.message : 'Nie udało się zalogować');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setArl('');
    setError(null);
    setShowHelp(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Zaloguj się do Deezer">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">ARL (Authentication Reference Link)</label>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-text-muted hover:text-primary transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          
          {showHelp && (
            <div className="p-3 bg-surface-hover rounded-md text-sm text-text-muted space-y-2">
              <p className="font-medium text-text">Jak uzyskać ARL:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Zaloguj się na <a href="https://www.deezer.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">deezer.com</a></li>
                <li>Otwórz narzędzia deweloperskie (F12)</li>
                <li>Przejdź do zakładki Application → Cookies</li>
                <li>Znajdź cookie o nazwie "arl"</li>
                <li>Skopiuj jego wartość</li>
              </ol>
            </div>
          )}
          
          <Input
            type="password"
            value={arl}
            onChange={(e) => setArl(e.target.value)}
            placeholder="Wprowadź wartość cookie ARL..."
            className="font-mono text-sm"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-md text-error text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || !arl.trim()}
            className="flex-1"
          >
            {isLoading ? 'Logowanie...' : 'Zaloguj'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
