import { lazy, Suspense } from 'react';
import { Card, SkeletonCard } from '@/components/ui';
import { FaceDiagram } from './FaceDiagram';
import type { AndrogenIntelligence } from '@/lib/androgen/types';
import type { AcneZone } from '@/lib/androgen/types';
import { ChangeIcon } from './HairHealthSection';

const IntelligenceTrendChart = lazy(() =>
  import('./charts/IntelligenceTrendChart').then((m) => ({ default: m.IntelligenceTrendChart })),
);
const ZoneFrequencyChart = lazy(() =>
  import('./charts/ZoneFrequencyChart').then((m) => ({ default: m.ZoneFrequencyChart })),
);

interface SkinHealthSectionProps {
  intelligence: AndrogenIntelligence;
  showTrends: boolean;
  simpleLanguage: boolean;
}

const HORMONAL_LABELS = {
  jawline_cycle: 'Jawline · cycle-linked pattern detected',
  luteal_acne: 'Luteal-phase acne pattern',
  stable: 'No active breakouts in recent logs',
};

export function SkinHealthSection({ intelligence, showTrends, simpleLanguage }: SkinHealthSectionProps) {
  const { skin } = intelligence;
  const heatZones = skin.zoneFrequency
    .filter((z) => z.count > 0)
    .map((z) => z.zone) as AcneZone[];

  return (
    <section aria-labelledby="skin-health-heading">
      <h2 id="skin-health-heading" className="section-label mb-3">
        Skin health
      </h2>
      <div className="space-y-4">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-micro text-ink-muted">Acne tracking</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-caption font-semibold text-ink">
                <ChangeIcon direction={skin.weeklyChange.direction} />
                {skin.weeklyChange.label}
              </p>
            </div>
          </div>

          {showTrends ? (
            <Suspense fallback={<SkeletonCard />}>
              <IntelligenceTrendChart
                data={skin.trendPoints}
                dataKey="acneScore"
                label="Acne severity"
                yDomain={[0, 3]}
                simpleLanguage={simpleLanguage}
                variant="line"
                color="cycle"
              />
            </Suspense>
          ) : (
            <p className="rounded-xl bg-surface-secondary px-4 py-6 text-center text-caption text-ink-secondary">
              Log 3 check-ins to unlock acne severity trends
            </p>
          )}
        </Card>

        <Card>
          <p className="text-overline uppercase text-ink-muted mb-3">Acne location mapping</p>
          <FaceDiagram
            selected={heatZones}
            onToggle={() => {}}
            simpleLanguage={simpleLanguage}
            readOnly
            heatCounts={Object.fromEntries(skin.zoneFrequency.map((z) => [z.zone, z.count]))}
          />
          <Suspense fallback={<SkeletonCard />}>
            <ZoneFrequencyChart
              data={skin.zoneFrequency.map(({ label, count, pct }) => ({ label, count, pct }))}
            />
          </Suspense>
        </Card>

        <Card className="!py-3.5">
          <p className="text-overline uppercase text-ink-muted mb-2">Hormonal acne insights</p>
          <p className="text-caption text-ink-secondary leading-relaxed">
            {skin.hormonalPattern
              ? HORMONAL_LABELS[skin.hormonalPattern]
              : simpleLanguage
                ? 'Keep logging breakouts with face zones — Cyra will detect hormonal patterns over time.'
                : 'Continue zone-mapped logging to identify cycle-correlated breakout patterns.'}
          </p>
          {skin.zoneFrequency[0]?.zone === 'jawline_chin' && skin.zoneFrequency[0].count >= 2 && (
            <p className="mt-2 text-micro text-ink-tertiary">
              Research note: Jawline distribution is commonly associated with androgen-driven sebum changes.
            </p>
          )}
        </Card>
      </div>
    </section>
  );
}
