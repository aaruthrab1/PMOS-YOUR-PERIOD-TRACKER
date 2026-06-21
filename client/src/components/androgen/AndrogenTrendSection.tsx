import { lazy, Suspense } from 'react';
import { Card } from '@/components/ui';
import { SkeletonCard } from '@/components/ui';
import type { AndrogenAnalytics } from '@/lib/androgen/analytics';

const PhaseTrendChart = lazy(() =>
  import('./charts/PhaseTrendChart').then((m) => ({ default: m.PhaseTrendChart })),
);
const AcneFrequencyChart = lazy(() =>
  import('./charts/PhaseTrendChart').then((m) => ({ default: m.AcneFrequencyChart })),
);

interface AndrogenTrendSectionProps {
  analytics: AndrogenAnalytics;
  simpleLanguage: boolean;
}

export function AndrogenTrendSection({ analytics, simpleLanguage }: AndrogenTrendSectionProps) {
  if (!analytics.showTrends) {
    return (
      <Card className="text-center py-8">
        <p className="text-caption text-ink-secondary">
          Complete {3 - analytics.checkInCount} more weekly check-in
          {3 - analytics.checkInCount === 1 ? '' : 's'} to unlock trend charts with cycle phase overlays.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-2 w-10 rounded-full ${n <= analytics.checkInCount ? 'bg-brand-500' : 'bg-surface-tertiary'}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </Card>
    );
  }

  const { trendPoints } = analytics;

  return (
    <div className="space-y-6">
      <Card>
        <p className="section-label mb-3">Hair shedding trend</p>
        <Suspense fallback={<SkeletonCard />}>
          <PhaseTrendChart
            data={trendPoints}
            dataKey="hairScore"
            label="Shedding level"
            yDomain={[0, 3]}
            simpleLanguage={simpleLanguage}
          />
        </Suspense>
      </Card>

      <Card>
        <p className="section-label mb-3">Acne frequency</p>
        <Suspense fallback={<SkeletonCard />}>
          <AcneFrequencyChart data={trendPoints} simpleLanguage={simpleLanguage} />
        </Suspense>
      </Card>

      <Card>
        <p className="section-label mb-3">Scalp oiliness</p>
        <Suspense fallback={<SkeletonCard />}>
          <PhaseTrendChart
            data={trendPoints}
            dataKey="scalpOiliness"
            label="Oiliness"
            yDomain={[1, 5]}
            simpleLanguage={simpleLanguage}
          />
        </Suspense>
      </Card>
    </div>
  );
}
