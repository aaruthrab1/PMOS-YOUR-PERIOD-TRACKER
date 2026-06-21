import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/tokens';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn\'t load this content. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('error-state animate-page-enter', className)} role="alert">
      <div className="error-state-icon">
        <AlertCircle className="h-7 w-7 text-risk-high" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3 className="font-display text-title text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-caption text-ink-secondary leading-relaxed">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" className="mt-6" size="sm">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
