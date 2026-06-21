import { usePersonalization } from '@/contexts/PersonalizationContext';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import type { RecommendedNextStep } from '@/lib/care/recommendedNextStep';
import { scrollToCareSection } from '@/lib/care/recommendedNextStep';

interface RecommendedNextStepSectionProps {
  step: RecommendedNextStep;
}

export function RecommendedNextStepSection({ step }: RecommendedNextStepSectionProps) {
  const { t } = usePersonalization();
  const isHashLink = step.cta.href.startsWith('#');

  const handleCta = () => {
    if (isHashLink) scrollToCareSection(step.cta.href.slice(1));
  };

  return (
    <section aria-labelledby="recommended-next-heading">
      <h2 id="recommended-next-heading" className="section-label mb-3">
        {t('care.recommendedNext')}
      </h2>
      <Card className="ring-1 ring-brand-500/15">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10">
            <Sparkles className="h-5 w-5 text-brand-500" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-title-sm text-ink">{step.title}</p>
            <p className="mt-1 text-caption text-ink-secondary leading-relaxed">{step.description}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {step.sources.map((source) => (
            <Badge key={source.label} variant="outline" className="!text-micro">
              {source.label}: {source.detail}
            </Badge>
          ))}
        </div>

        <div className="mt-5">
          {isHashLink ? (
            <Button onClick={handleCta}>
              {step.cta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          ) : (
            <Link to={step.cta.href}>
              <Button>
                {step.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </section>
  );
}
