import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ProgressBar } from '@/components/ui';
import { usePersonalization } from '@/contexts/PersonalizationContext';

interface JourneyProgressHeroProps {
  progressPercent: number;
  completedCount: number;
  encouragement: string;
  currentStepId: string | null;
}

export function JourneyProgressHero({
  progressPercent,
  completedCount,
  encouragement,
  currentStepId,
}: JourneyProgressHeroProps) {
  const { t } = usePersonalization();

  return (
    <section className="home-insight-card mb-2" aria-labelledby="journey-progress-heading">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-overline uppercase text-brand-500">{t('care.journey')}</p>
          <h2 id="journey-progress-heading" className="mt-1 font-display text-title-sm text-ink">
            {encouragement}
          </h2>
          <p className="mt-1 text-caption text-ink-secondary">
            {completedCount} of 6 milestones complete
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-title-lg tabular-nums text-brand-500">{progressPercent}%</p>
        </div>
      </div>
      <ProgressBar value={progressPercent} color="brand" className="mt-4" aria-label="Journey progress" />
      {currentStepId && (
        <Link
          to="#diagnosis-journey"
          className="mt-4 inline-flex items-center gap-1 text-caption font-medium text-brand-500 hover:text-brand-600"
        >
          Continue your journey
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}
