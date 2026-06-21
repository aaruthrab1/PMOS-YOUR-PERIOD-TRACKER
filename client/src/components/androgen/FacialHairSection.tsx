import { lazy, Suspense } from 'react';
import { Card, SkeletonCard } from '@/components/ui';
import type { AndrogenIntelligence } from '@/lib/androgen/types';
import { ChangeIcon } from './HairHealthSection';

const IntelligenceTrendChart = lazy(() =>
  import('./charts/IntelligenceTrendChart').then((m) => ({ default: m.IntelligenceTrendChart })),
);

interface FacialHairSectionProps {
  intelligence: AndrogenIntelligence;
  showTrends: boolean;
  simpleLanguage: boolean;
}

export function FacialHairSection({ intelligence, showTrends, simpleLanguage }: FacialHairSectionProps) {
  const { facialHair } = intelligence;

  return (
    <section aria-labelledby="facial-hair-heading">
      <h2 id="facial-hair-heading" className="section-label mb-3">
        Facial & body hair
      </h2>
      <Card>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-micro text-ink-muted">Weekly tracking</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-caption font-semibold text-ink">
              <ChangeIcon direction={facialHair.weeklyChange.direction} />
              {facialHair.weeklyChange.label}
            </p>
          </div>
          <div>
            <p className="text-micro text-ink-muted">Progress trend</p>
            <p className="mt-0.5 text-caption font-medium text-ink">{facialHair.progressLabel}</p>
          </div>
        </div>

        {showTrends ? (
          <>
            <p className="text-overline uppercase text-ink-muted mb-2">Growth severity trend</p>
            <Suspense fallback={<SkeletonCard />}>
              <IntelligenceTrendChart
                data={facialHair.trendPoints}
                dataKey="bodyHairScore"
                label="Hair growth change"
                yDomain={[0, 2]}
                simpleLanguage={simpleLanguage}
                variant="area"
                color="neutral"
              />
            </Suspense>
            <p className="mt-3 text-micro text-ink-tertiary">
              0 = no change · 2 = noticeable increase
            </p>
          </>
        ) : (
          <p className="rounded-xl bg-surface-secondary px-4 py-6 text-center text-caption text-ink-secondary">
            Weekly logs unlock facial hair progress trends
          </p>
        )}
      </Card>
    </section>
  );
}
