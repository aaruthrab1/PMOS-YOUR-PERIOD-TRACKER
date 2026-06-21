import { lazy, Suspense } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, SkeletonCard } from '@/components/ui';
import type { AndrogenIntelligence } from '@/lib/androgen/types';

const IntelligenceTrendChart = lazy(() =>
  import('./charts/IntelligenceTrendChart').then((m) => ({ default: m.IntelligenceTrendChart })),
);

interface HairHealthSectionProps {
  intelligence: AndrogenIntelligence;
  showTrends: boolean;
  simpleLanguage: boolean;
}

export function HairHealthSection({ intelligence, showTrends, simpleLanguage }: HairHealthSectionProps) {
  const { hair } = intelligence;
  const change = hair.weeklyChange;

  return (
    <section aria-labelledby="hair-health-heading">
      <h2 id="hair-health-heading" className="section-label mb-3">
        Hair health
      </h2>
      <Card>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-micro text-ink-muted">Weekly change</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-caption font-semibold text-ink">
              <ChangeIcon direction={change.direction} />
              {change.label}
            </p>
          </div>
          {hair.peakPhase && (
            <div className="text-right">
              <p className="text-micro text-ink-muted">Peak shedding phase</p>
              <p className="text-caption font-medium text-ink">{hair.peakPhase}</p>
            </div>
          )}
        </div>

        {showTrends ? (
          <>
            <p className="text-overline uppercase text-ink-muted mb-2">Severity trend</p>
            <Suspense fallback={<SkeletonCard />}>
              <IntelligenceTrendChart
                data={hair.trendPoints}
                dataKey="hairScore"
                label="Shedding severity"
                yDomain={[0, 3]}
                simpleLanguage={simpleLanguage}
                variant="area"
              />
            </Suspense>
            <p className="mt-3 text-micro text-ink-tertiary">
              0 = none · 3 = significant · Dots colored by cycle phase
            </p>
          </>
        ) : (
          <LockedTrendMessage />
        )}
      </Card>
    </section>
  );
}

function ChangeIcon({ direction }: { direction: 'up' | 'down' | 'stable' }) {
  if (direction === 'up') return <TrendingUp className="h-4 w-4 text-risk-moderate" aria-hidden="true" />;
  if (direction === 'down') return <TrendingDown className="h-4 w-4 text-risk-low" aria-hidden="true" />;
  return <Minus className="h-4 w-4 text-ink-muted" aria-hidden="true" />;
}

function LockedTrendMessage() {
  return (
    <p className="rounded-xl bg-surface-secondary px-4 py-6 text-center text-caption text-ink-secondary">
      Complete 3 weekly check-ins to unlock hair fall and severity trends
    </p>
  );
}

export { ChangeIcon };
