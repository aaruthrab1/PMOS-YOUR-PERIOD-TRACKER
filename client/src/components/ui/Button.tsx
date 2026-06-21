import { forwardRef } from 'react';
import { cn } from '@/lib/tokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'cycle' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading,
    fullWidth,
    className,
    children,
    disabled,
    ...props
  },
  ref,
) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    cycle: 'btn-cycle',
    danger: 'btn-danger',
  };

  const sizes = {
    sm: '!px-4 !py-2.5 text-caption min-h-[40px]',
    md: 'min-h-[44px]',
    lg: '!px-8 !py-4 text-title min-h-[48px]',
  };

  return (
    <button
      ref={ref}
      className={cn(
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        loading && 'btn-loading',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span className="spinner-brand h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      <span className={cn('inline-flex items-center gap-2', loading && 'opacity-80')}>
        {loading ? <span className="sr-only">Loading</span> : null}
        {children}
      </span>
    </button>
  );
});
