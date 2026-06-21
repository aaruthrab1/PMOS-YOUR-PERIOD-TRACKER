import { Link } from 'react-router-dom';
import { Sparkles, ChevronRight } from 'lucide-react';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { LoadingSpinner } from '@/components/ui';
import { translateInsightCategory, translateInsightText } from '@/lib/personalization/translateInsight';
import type { SmartInsight } from '@/lib/dashboard/smartInsights';

interface PrimaryInsightProps {
  insights: SmartInsight[];
  loading?: boolean;
}

export function PrimaryInsight({ insights, loading }: PrimaryInsightProps) {
  const { t } = usePersonalization();
  const primary = insights[0];

  if (loading) {
    return (
      <section aria-labelledby="insight-heading" className="home-insight-card home-insight-card--loading">
        <div className="flex items-center gap-3">
          <LoadingSpinner size="sm" />
          <p className="text-caption text-ink-secondary">{t('dashboard.analyzing')}</p>
        </div>
      </section>
    );
  }

  if (!primary) {
    return (
      <section aria-labelledby="insight-heading" className="home-insight-card">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 shrink-0 text-brand-500 mt-0.5" aria-hidden="true" />
          <div>
            <h2 id="insight-heading" className="home-section-title !mb-1">
              {t('dashboard.smartInsights')}
            </h2>
            <p className="text-caption text-ink-secondary leading-relaxed">
              {t('insights.default')}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const category = translateInsightCategory(primary.category, t);
  const text = translateInsightText(primary.id, primary.text, t);

  return (
    <section aria-labelledby="insight-heading">
      <div className="home-section-head">
        <h2 id="insight-heading" className="home-section-title">
          {t('dashboard.smartInsights')}
        </h2>
        {insights.length > 1 && (
          <Link to="/tracker" className="home-section-link">
            {t('dashboard.quickLog')}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="home-insight-card">
        {category && (
          <p className="text-overline uppercase text-brand-500 mb-2">{category}</p>
        )}
        <p className="text-body text-ink leading-relaxed">{text}</p>
        {insights.length > 1 && (
          <ul className="mt-4 space-y-2 border-t border-border pt-4">
            {insights.slice(1, 3).map((insight) => (
              <li key={insight.id} className="text-caption text-ink-secondary leading-relaxed">
                {translateInsightText(insight.id, insight.text, t)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
