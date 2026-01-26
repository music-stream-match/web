import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Modal({ isOpen, onClose, children, title, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className={cn(
          'relative z-10 w-full max-w-lg mx-4 bg-surface border border-border rounded-lg shadow-xl',
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
