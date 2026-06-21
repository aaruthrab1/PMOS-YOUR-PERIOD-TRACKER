import { cn } from '@/lib/tokens';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  /** brand = general · cycle = menstrual · risk-* = health assessments */
  color?: 'brand' | 'cycle' | 'risk-low' | 'risk-moderate' | 'risk-high' | 'primary' | 'wellness' | 'lavender';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue,
  color = 'brand',
  className,
}: ProgressBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100);

  const colors = {
    brand: 'bg-brand-500',
    cycle: 'bg-cycle-500',
    'risk-low': 'bg-risk-low',
    'risk-moderate': 'bg-risk-moderate',
    'risk-high': 'bg-risk-high',
    primary: 'bg-brand-500',
    wellness: 'bg-risk-low',
    lavender: 'bg-brand-400',
  };

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between">
          {label && <span className="text-caption font-medium text-ink">{label}</span>}
          {showValue && <span className="text-caption text-ink-secondary">{pct}%</span>}
        </div>
      )}
      <div
        className="h-2 overflow-hidden rounded-full bg-surface-tertiary"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-slow ease-smooth', colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
