import { cn } from '@/lib/tokens';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'cycle' | 'risk-low' | 'risk-moderate' | 'risk-high';
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const variantMap = {
  default: 'card',
  elevated: 'card-elevated',
  cycle: 'card-cycle',
  'risk-low': 'card-risk-low',
  'risk-moderate': 'card-risk-moderate',
  'risk-high': 'card-risk-high',
};

export function Card({
  children,
  className,
  variant = 'default',
  interactive,
  padding = 'md',
  onClick,
}: CardProps) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      className={cn(
        variantMap[variant],
        paddingMap[padding],
        interactive && 'card-interactive cursor-pointer text-left !p-5',
        onClick && !interactive && 'card-interactive cursor-pointer text-left',
        className,
      )}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('font-display text-title text-ink', className)}>{children}</h3>
  );
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('mt-1 text-caption text-ink-secondary', className)}>{children}</p>
  );
}
