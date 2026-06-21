import { cn } from '@/lib/tokens';

interface OptionGroupProps<T extends string> {
  options: { value: T; label: string; simpleLabel: string }[];
  value: T;
  onChange: (v: T) => void;
  simpleLanguage?: boolean;
  name: string;
}

export function OptionGroup<T extends string>({
  options,
  value,
  onChange,
  simpleLanguage,
  name,
}: OptionGroupProps<T>) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label={name}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all',
            value === opt.value
              ? 'bg-surface-tertiary ring-2 ring-brand-500'
              : 'bg-surface-secondary ring-1 ring-border hover:bg-surface-tertiary',
          )}
        >
          <span
            className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
              value === opt.value ? 'border-brand-500 bg-brand-500' : 'border-ink-muted',
            )}
            aria-hidden="true"
          >
            {value === opt.value && <span className="h-2 w-2 rounded-full bg-white" />}
          </span>
          <span className="text-caption font-medium text-ink">
            {simpleLanguage ? opt.simpleLabel : opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}
