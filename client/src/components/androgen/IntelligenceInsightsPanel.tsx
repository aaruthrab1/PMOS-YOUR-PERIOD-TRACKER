import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import type { AndrogenInsight } from '@/lib/androgen/types';
import { cn } from '@/lib/tokens';

interface IntelligenceInsightsPanelProps {
  insights: AndrogenInsight[];
}

export function IntelligenceInsightsPanel({ insights }: IntelligenceInsightsPanelProps) {
  const { t, simplify } = usePersonalization();

  if (insights.length === 0) return null;

  return (
    <section aria-labelledby="intelligence-insights">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand-500" aria-hidden="true" />
        <h2 id="intelligence-insights" className="section-label !mb-0">
          {t('androgen.aiInsights')}
        </h2>
      </div>
      <ul className="space-y-2">
        {insights.map((insight, i) => (
          <li key={insight.id}>
            <Card className={cn('!py-3.5 !px-4', i === 0 && 'ring-1 ring-brand-500/15')}>
              {insight.category && insight.category !== 'general' && (
                <p className="text-overline uppercase text-ink-muted mb-1 capitalize">
                  {insight.category.replace('_', ' ')}
                </p>
              )}
              <p className="text-caption text-ink-secondary leading-relaxed">{simplify(insight.text)}</p>
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-micro text-ink-muted">{t('androgen.insightDisclaimer')}</p>
    </section>
  );
}
