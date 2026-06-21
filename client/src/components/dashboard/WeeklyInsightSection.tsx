import { Sparkles } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui';

interface WeeklyInsightSectionProps {
  insight: string;
  loading?: boolean;
}

export function WeeklyInsightSection({ insight, loading }: WeeklyInsightSectionProps) {
  return (
    <section aria-labelledby="insight-heading">
      <h2 id="insight-heading" className="section-label mb-3">
        Weekly insight
      </h2>
      <div className="flex gap-3 rounded-xl border border-border bg-surface px-3.5 py-3">
        <Sparkles
          className="mt-0.5 h-4 w-4 shrink-0 text-brand-500"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <p className="text-caption text-ink-secondary leading-relaxed">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <LoadingSpinner size="sm" />
              Analyzing your week…
            </span>
          ) : (
            insight || 'Log mood and sleep this week to unlock a personalized summary.'
          )}
        </p>
      </div>
    </section>
  );
}
