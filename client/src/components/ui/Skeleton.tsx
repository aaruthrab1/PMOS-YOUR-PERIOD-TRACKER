import { cn } from '@/lib/tokens';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect' | 'card';
}

export function Skeleton({ className, variant = 'rect' }: SkeletonProps) {
  const variants = {
    text: 'h-4 w-full rounded-md',
    circle: 'h-10 w-10 rounded-full',
    rect: 'h-20 w-full rounded-xl',
    card: 'h-32 w-full rounded-2xl',
  };

  return <div className={cn('skeleton', variants[variant], className)} aria-hidden="true" />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-2xl border border-border bg-surface p-5 animate-fade-in', className)}
      aria-busy="true"
      aria-label="Loading"
    >
      <Skeleton variant="text" className="mb-3 w-1/3" />
      <Skeleton variant="text" className="mb-2 w-full" />
      <Skeleton variant="text" className="w-2/3" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rect"
          className={cn('h-16', `stagger-${Math.min(i + 1, 5)}`)}
        />
      ))}
    </div>
  );
}
