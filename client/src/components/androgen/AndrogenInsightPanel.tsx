import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui';
import type { AndrogenInsight } from '@/lib/androgen/types';

interface AndrogenInsightPanelProps {
  insights: AndrogenInsight[];
}

export function AndrogenInsightPanel({ insights }: AndrogenInsightPanelProps) {
  if (insights.length === 0) return null;

  return (
    <Card className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-brand-500" aria-hidden="true" />
        <p className="section-label !mb-0">Patterns we noticed</p>
      </div>
      <ul className="space-y-2.5">
        {insights.map((insight) => (
          <li key={insight.id} className="text-caption text-ink-secondary leading-relaxed">
            {insight.text}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-micro text-ink-muted">
        For awareness only — not a diagnosis. Share patterns with your clinician if helpful.
      </p>
    </Card>
  );
}
