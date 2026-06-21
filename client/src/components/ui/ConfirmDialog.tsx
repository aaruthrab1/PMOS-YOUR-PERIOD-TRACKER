import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/tokens';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onCancel, loading]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-overlay animate-fade-in"
        aria-label="Close dialog"
        onClick={loading ? undefined : onCancel}
        disabled={loading}
      />
      <div className={cn(
        'relative w-full max-w-sm rounded-3xl border border-border-strong bg-surface-elevated p-6 shadow-4 animate-slide-up',
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
            variant === 'danger' ? 'bg-risk-high-bg text-risk-high' : 'bg-surface-tertiary text-brand-500',
          )}>
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="confirm-dialog-title" className="font-display text-title text-ink">{title}</h2>
            <p id="confirm-dialog-desc" className="mt-1.5 text-caption text-ink-secondary leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <Button ref={cancelRef} variant="secondary" fullWidth onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            fullWidth
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
