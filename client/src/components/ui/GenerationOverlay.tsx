import { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/tokens';

interface GenerationOverlayProps {
  open: boolean;
  title: string;
  subtitle?: string;
  steps: string[];
  /** Estimated ms per step for visual progress */
  stepDurationMs?: number;
}

export function GenerationOverlay({
  open,
  title,
  subtitle = 'This usually takes 15–30 seconds',
  steps,
  stepDurationMs = 2200,
}: GenerationOverlayProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      return;
    }
    if (activeStep >= steps.length - 1) return;
    const t = setTimeout(() => setActiveStep((s) => Math.min(s + 1, steps.length - 1)), stepDurationMs);
    return () => clearTimeout(t);
  }, [open, activeStep, steps.length, stepDurationMs]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-surface/80 backdrop-blur-md px-6 animate-fade-in"
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border-strong bg-surface-elevated p-8 shadow-4 animate-scale-in">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500">
            <Sparkles className="h-8 w-8 text-ink-inverse" aria-hidden="true" />
          </div>
          <h2 className="font-display text-title text-ink">{title}</h2>
          <p className="mt-1 text-micro text-ink-tertiary">{subtitle}</p>
        </div>

        <ol className="space-y-3">
          {steps.map((step, i) => {
            const done = i < activeStep;
            const current = i === activeStep;
            return (
              <li
                key={step}
                className={cn(
                  'flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-300',
                  current && 'bg-surface-tertiary ring-1 ring-border',
                  done && 'opacity-70',
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-wellness-500" aria-hidden="true" />
                ) : (
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                      current ? 'border-brand-500 border-t-transparent animate-spin' : 'border-border',
                    )}
                    aria-hidden="true"
                  />
                )}
                <span className={cn(
                  'text-caption',
                  current ? 'font-medium text-ink' : 'text-ink-secondary',
                )}>
                  {step}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
