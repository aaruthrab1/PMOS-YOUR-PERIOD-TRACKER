import { cn } from '@/lib/tokens';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'brand' | 'cycle' | 'outline' | 'risk-low' | 'risk-moderate' | 'risk-high' | 'primary' | 'wellness' | 'lavender' | 'coral';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const variants = {
    default: 'bg-surface-tertiary text-ink-secondary',
    brand: 'badge-brand',
    cycle: 'badge-cycle',
    outline: 'border border-border bg-surface text-ink-secondary',
    'risk-low': 'badge-risk-low',
    'risk-moderate': 'badge-risk-moderate',
    'risk-high': 'badge-risk-high',
    /* Legacy aliases */
    primary: 'badge-brand',
    wellness: 'badge-risk-low',
    lavender: 'badge-brand',
    coral: 'badge-cycle',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-micro',
    md: 'px-3 py-1.5 text-caption',
  };

  return (
    <span className={cn('inline-flex items-center rounded-full font-medium', variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}
