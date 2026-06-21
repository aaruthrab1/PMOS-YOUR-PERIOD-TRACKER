import { lazy, Suspense } from 'react';
import { Card, SkeletonCard } from '@/components/ui';
import type { AndrogenIntelligence } from '@/lib/androgen/types';
import { cn } from '@/lib/tokens';

const ZoneFrequencyChart = lazy(() =>
  import('./charts/ZoneFrequencyChart').then((m) => ({ default: m.ZoneFrequencyChart })),
);

interface DarkPatchesSectionProps {
  intelligence: AndrogenIntelligence;
  simpleLanguage: boolean;
}

const BODY_AREAS = [
  { id: 'neck', label: 'Neck', y: '18%' },
  { id: 'underarms', label: 'Underarms', y: '42%' },
  { id: 'inner_thighs', label: 'Inner thighs', y: '72%' },
] as const;

export function DarkPatchesSection({ intelligence, simpleLanguage }: DarkPatchesSectionProps) {
  const { darkPatches } = intelligence;
  const hasData = darkPatches.reportedWeeks > 0 || darkPatches.locationFrequency.some((l) => l.count > 0);

  return (
    <section aria-labelledby="dark-patches-heading">
      <h2 id="dark-patches-heading" className="section-label mb-3">
        Dark patches (acanthosis)
      </h2>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-micro text-ink-muted">Weeks reported</p>
            <p className="font-display text-title-sm tabular-nums text-ink">{darkPatches.reportedWeeks}</p>
          </div>
          {darkPatches.coOccurrenceNote && (
            <p className="max-w-[12rem] text-right text-micro text-ink-secondary leading-snug">
              {darkPatches.coOccurrenceNote}
            </p>
          )}
        </div>

        <p className="text-overline uppercase text-ink-muted mb-3">Location tracking</p>
        <div className="mb-4 flex gap-4">
          <div className="relative mx-auto h-48 w-24 shrink-0 rounded-2xl border border-border bg-surface-secondary">
            {BODY_AREAS.map(({ id, label, y }) => {
              const freq = darkPatches.locationFrequency.find((l) => l.location === id);
              const active = (freq?.count ?? 0) > 0;
              return (
                <div
                  key={id}
                  className={cn(
                    'absolute left-1/2 h-8 w-16 -translate-x-1/2 rounded-lg border transition-colors',
                    active
                      ? 'border-brand-500/40 bg-brand-500/15'
                      : 'border-border bg-surface-tertiary/50',
                  )}
                  style={{ top: y }}
                  title={label}
                >
                  <span className="sr-only">{label}</span>
                </div>
              );
            })}
          </div>
          <ul className="flex flex-1 flex-col justify-center gap-2">
            {darkPatches.locationFrequency.map(({ location, label, count }) => (
              <li key={location} className="flex items-center justify-between text-caption">
                <span className="text-ink-secondary">{label}</span>
                <span className="tabular-nums font-medium text-ink">
                  {count > 0 ? `${count}×` : '—'}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {hasData ? (
          <Suspense fallback={<SkeletonCard />}>
            <ZoneFrequencyChart
              data={darkPatches.locationFrequency.map(({ label, count, pct }) => ({ label, count, pct }))}
              ariaLabel="Dark patch location frequency"
            />
          </Suspense>
        ) : (
          <p className="rounded-xl bg-surface-secondary px-4 py-6 text-center text-caption text-ink-secondary">
            {simpleLanguage
              ? 'Log dark patches in your weekly check-in to track neck, underarms, and inner thighs.'
              : 'Report acanthosis nigricans locations during weekly check-ins to build location-specific trends.'}
          </p>
        )}

        <p className="mt-4 text-micro text-ink-muted leading-relaxed">
          Velvety hyperpigmentation in skin folds may correlate with insulin resistance and androgen excess — document patterns for clinical review.
        </p>
      </Card>
    </section>
  );
}
