import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Target, ChevronRight } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { QuizIllustration } from './QuizIllustration';
import type { QuizHealthSnapshot } from '@/lib/quiz/types';

interface HealthSnapshotResultProps {
  snapshot: QuizHealthSnapshot;
  onFinish: () => void;
  finishing?: boolean;
}

export function HealthSnapshotResult({ snapshot, onFinish, finishing }: HealthSnapshotResultProps) {
  const primaryAction = snapshot.nextActions.find((a) => a.primary) ?? snapshot.nextActions[0];

  return (
    <div className="pb-4 animate-slide-up">
      <QuizIllustration id="snapshot" className="mb-6" />

      <p className="section-label">Your health snapshot</p>
      <h1 className="mt-1 font-display text-display-sm text-ink">{snapshot.headline}</h1>
      <p className="mt-3 text-body text-ink-secondary leading-relaxed">{snapshot.summary}</p>

      <Card className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-micro text-ink-muted">Wellness baseline</p>
            <p className="font-display text-display-md text-ink tabular-nums">{snapshot.score}</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-tertiary">
            <Sparkles className="h-7 w-7 text-brand-500" strokeWidth={1.5} aria-hidden="true" />
          </div>
        </div>
        <p className="mt-3 text-micro text-ink-muted">
          This score reflects your starting point — it will evolve as you log. Not a medical assessment.
        </p>
      </Card>

      <section className="mt-6" aria-labelledby="insights-heading">
        <h2 id="insights-heading" className="section-label mb-3">What we noticed</h2>
        <ul className="space-y-2.5">
          {snapshot.insights.map((line) => (
            <li key={line} className="flex gap-2 text-caption text-ink-secondary leading-relaxed">
              <span className="text-brand-500 shrink-0" aria-hidden="true">•</span>
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6" aria-labelledby="focus-heading">
        <h2 id="focus-heading" className="section-label mb-3">Suggested focus areas</h2>
        <ul className="space-y-2">
          {snapshot.focusAreas.map((area) => (
            <li
              key={area.id}
              className="rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 shrink-0 text-brand-500 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-caption font-semibold text-ink">{area.label}</p>
                  <p className="mt-0.5 text-micro text-ink-secondary leading-relaxed">
                    {area.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="section-label mb-3">What to do next</h2>
        <div className="space-y-2">
          {snapshot.nextActions.map((action) => (
            <Link
              key={action.id}
              to={action.href}
              className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-border-strong hover:bg-surface-elevated"
            >
              <div className="min-w-0 flex-1">
                <p className="text-caption font-semibold text-ink">{action.label}</p>
                <p className="text-micro text-ink-tertiary">{action.description}</p>
              </div>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Button fullWidth size="lg" onClick={onFinish} loading={finishing}>
          {primaryAction ? `Continue to ${primaryAction.label.toLowerCase()}` : 'Enter Cyra'}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
