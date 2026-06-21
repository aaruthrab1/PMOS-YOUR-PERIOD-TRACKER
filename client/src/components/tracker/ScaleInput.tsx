import { cn } from '@/lib/tokens';

interface ScaleInputProps {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function ScaleInput({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
  disabled,
}: ScaleInputProps) {
  const levels = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <fieldset disabled={disabled} className="space-y-2">
      <legend className="text-caption font-medium text-ink-secondary">{label}</legend>
      <div className="flex gap-2">
        {levels.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            aria-pressed={value === level}
            aria-label={`${label} ${level}`}
            className={cn(
              'flex h-11 flex-1 items-center justify-center rounded-xl text-caption font-semibold transition-all',
              value === level
                ? 'bg-brand-500 text-ink-inverse'
                : 'bg-surface-secondary text-ink-secondary ring-1 ring-border hover:bg-surface-tertiary',
            )}
          >
            {level}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
