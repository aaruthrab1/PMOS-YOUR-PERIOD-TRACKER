import { Zap, Moon, Heart } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui';
import type { DetectedPattern } from '@/lib/dashboard/patterns';

const ICONS = {
  energy: Zap,
  sleep: Moon,
  mood: Heart,
} as const;

interface PatternDetectionSectionProps {
  patterns: DetectedPattern[];
  loading?: boolean;
}

export function PatternDetectionSection({ patterns, loading }: PatternDetectionSectionProps) {
  const display = patterns.filter((p) => p.id !== 'building').slice(0, 2);
  const fallback = patterns.find((p) => p.id === 'building');

  return (
    <section aria-labelledby="patterns-heading">
      <h2 id="patterns-heading" className="section-label mb-3">
        Pattern detection
      </h2>
      <ul className="space-y-2">
        {loading ? (
          <li className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-3 text-micro text-ink-muted">
            <LoadingSpinner size="sm" />
            Scanning your logs…
          </li>
        ) : display.length === 0 ? (
          <li className="rounded-xl border border-border bg-surface px-3.5 py-3 text-micro text-ink-secondary leading-relaxed">
            {fallback?.description ?? 'Log mood and sleep for a few days to unlock personalized patterns.'}
          </li>
        ) : (
          display.map((pattern) => {
            const Icon = ICONS[pattern.type];
            return (
              <li
                key={pattern.id}
                className="flex gap-3 rounded-xl border border-border bg-surface px-3.5 py-3"
              >
                <Icon
                  className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <p className="text-caption text-ink-secondary leading-relaxed">
                  {pattern.description}
                </p>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
