import { cn } from '@/lib/tokens';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ message = 'Loading...', fullScreen = true }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-5 animate-fade-in',
        fullScreen ? 'min-h-screen gradient-hero' : 'py-20',
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="relative">
        <div className="h-14 w-14 rounded-2xl loading-brand" aria-hidden="true" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-lg font-bold text-ink-inverse">C</span>
        </div>
      </div>
      <p className="text-caption font-medium text-ink-secondary">{message}</p>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={cn('spinner-brand', sizes[size])} role="status" aria-label="Loading" />
  );
}
