import { useState, useRef, useEffect } from 'react';
import { useTranslation, SUPPORTED_LANGUAGES } from '@/i18n/useTranslation';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === language);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-surface hover:bg-surface-hover border border-border',
          'text-sm font-medium transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary/50'
        )}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4 text-text-muted" />
        <span>{currentLanguage?.nativeName || language.toUpperCase()}</span>
        <ChevronDown className={cn(
          'w-4 h-4 text-text-muted transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto',
            'bg-surface border border-border rounded-lg shadow-lg',
            'z-50 py-1'
          )}
          role="listbox"
          aria-label="Available languages"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
                console.log(`[LanguageSelector] Language changed to: ${lang.code}`);
              }}
              className={cn(
                'w-full px-4 py-2 text-left text-sm',
                'flex items-center justify-between gap-2',
                'hover:bg-surface-hover transition-colors',
                language === lang.code && 'bg-primary/10 text-primary'
              )}
              role="option"
              aria-selected={language === lang.code}
            >
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-text-muted">{lang.name}</span>
              </div>
              {language === lang.code && (
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
