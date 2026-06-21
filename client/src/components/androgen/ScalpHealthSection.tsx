import { lazy, Suspense } from 'react';
import { Card, SkeletonCard } from '@/components/ui';
import type { AndrogenIntelligence } from '@/lib/androgen/types';
import { ChangeIcon } from './HairHealthSection';

const ScalpDualChart = lazy(() =>
  import('./charts/ScalpDualChart').then((m) => ({ default: m.ScalpDualChart })),
);

interface ScalpHealthSectionProps {
  intelligence: AndrogenIntelligence;
  showTrends: boolean;
  simpleLanguage: boolean;
}

export function ScalpHealthSection({ intelligence, showTrends, simpleLanguage }: ScalpHealthSectionProps) {
  const { scalp } = intelligence;

  return (
    <section aria-labelledby="scalp-health-heading">
      <h2 id="scalp-health-heading" className="section-label mb-3">
        Scalp health
      </h2>
      <Card>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-micro text-ink-muted">Oiliness tracking</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-caption font-semibold text-ink">
              <ChangeIcon direction={scalp.oilinessChange.direction} />
              {scalp.oilinessChange.label}
            </p>
          </div>
          <div>
            <p className="text-micro text-ink-muted">Dryness tracking</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-caption font-semibold text-ink">
              <ChangeIcon direction={scalp.drynessChange.direction} />
              {scalp.drynessChange.label}
            </p>
          </div>
        </div>

        {showTrends ? (
          <>
            <p className="text-overline uppercase text-ink-muted mb-2">Dual-axis trends</p>
            <Suspense fallback={<SkeletonCard />}>
              <ScalpDualChart data={scalp.oilinessPoints} simpleLanguage={simpleLanguage} />
            </Suspense>
            <p className="mt-3 text-micro text-ink-tertiary">
              Oiliness and dryness tracked independently — both can coexist in androgen-related scalp changes.
            </p>
          </>
        ) : (
          <p className="rounded-xl bg-surface-secondary px-4 py-6 text-center text-caption text-ink-secondary">
            Log scalp ratings for 3 weeks to unlock oiliness & dryness charts
          </p>
        )}
      </Card>
    </section>
  );
}
