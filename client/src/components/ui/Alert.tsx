import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/tokens';

type AlertVariant = 'error' | 'success' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const VARIANTS: Record<AlertVariant, { icon: typeof AlertCircle; className: string }> = {
  error: {
    icon: AlertCircle,
    className: 'alert-error',
  },
  success: {
    icon: CheckCircle2,
    className: 'alert-success',
  },
  info: {
    icon: Info,
    className: 'alert-info',
  },
};

export function Alert({ variant = 'error', title, children, className }: AlertProps) {
  const { icon: Icon, className: variantClass } = VARIANTS[variant];

  return (
    <div
      className={cn(variantClass, 'animate-scale-in', className)}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <Icon className="alert-icon shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="alert-title">{title}</p>}
        <div className={cn('alert-body', title && 'mt-0.5')}>{children}</div>
      </div>
    </div>
  );
}
