import { ChevronLeft } from 'lucide-react';
import { ProgressBar } from '@/components/ui';
import { cn } from '@/lib/tokens';
import { ONBOARDING_STEP_COUNT } from '@/lib/onboarding/types';

interface OnboardingLayoutProps {
  step: number;
  progress: number;
  totalSteps?: number;
  onBack?: () => void;
  showBack?: boolean;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function OnboardingLayout({
  step,
  progress,
  totalSteps = ONBOARDING_STEP_COUNT,
  onBack,
  showBack = true,
  children,
  footer,
}: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col gradient-hero">
      <div className="px-page-x pt-6">
        <div className="mb-2 flex items-center justify-between">
          {showBack && step > 0 ? (
            <button
              type="button"
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-ink-secondary transition-colors hover:bg-surface-tertiary"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-10" />
          )}
          <span className="text-caption font-medium text-ink-secondary">
            {step + 1} of {totalSteps}
          </span>
          <div className="w-10" />
        </div>
        <ProgressBar value={progress} color="brand" className="mb-6" aria-label="Onboarding progress" />
      </div>

      <div className="flex flex-1 flex-col px-page-x">
        <div key={step} className="animate-slide-up flex-1">
          {children}
        </div>
      </div>

      <div className="px-page-x pb-10 pt-4">{footer}</div>
    </div>
  );
}

interface OptionButtonProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  multi?: boolean;
}

export function OptionButton({ selected, onClick, children, multi }: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      className={cn(
        'flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left text-caption font-medium transition-all duration-200',
        selected
          ? 'border-brand-500 bg-surface-tertiary text-ink'
          : 'border-border bg-surface text-ink-secondary hover:border-border-strong'
      )}
    >
      {children}
      <div
        className={cn(
          'h-5 w-5 flex-shrink-0 rounded-full border-2 transition-all',
          selected ? 'border-brand-500 bg-brand-500' : 'border-ink-muted',
          multi && 'rounded-md'
        )}
      >
        {selected && !multi && (
          <div className="flex h-full items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-white" />
          </div>
        )}
        {selected && multi && (
          <svg className="h-full w-full p-0.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </button>
  );
}

export function RegionGrid({
  value,
  onChange,
}: {
  value: string;
  onChange: (region: string) => void;
}) {
  const regions = [
    { value: 'north', label: 'North' },
    { value: 'south', label: 'South' },
    { value: 'east', label: 'East' },
    { value: 'west', label: 'West' },
    { value: 'central', label: 'Central' },
    { value: 'northeast', label: 'Northeast' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Select your region">
      {regions.map(({ value: v, label }) => (
        <OptionButton key={v} selected={value === v} onClick={() => onChange(v)}>
          {label}
        </OptionButton>
      ))}
    </div>
  );
}
