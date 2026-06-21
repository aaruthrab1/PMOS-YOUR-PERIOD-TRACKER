import { cn } from '@/lib/tokens';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, hint, error, icon, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'input-field',
            icon ? 'pl-11' : undefined,
            error && 'input-field-error',
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
      </div>
      {hint && !error && (
        <p id={`${inputId}-hint`} className="input-hint">{hint}</p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="input-error-text" role="alert">{error}</p>
      )}
    </div>
  );
}
