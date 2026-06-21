import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { SuggestedAction } from '@/lib/dashboard/suggestedActions';

interface SuggestedActionsProps {
  actions: SuggestedAction[];
}

export function SuggestedActions({ actions }: SuggestedActionsProps) {
  if (actions.length === 0) return null;

  return (
    <section aria-labelledby="suggested-heading">
      <div className="home-section-head">
        <h2 id="suggested-heading" className="home-section-title">
          Suggested for today
        </h2>
      </div>
      <div className="home-action-scroll">
        {actions.map((action) => (
          <Link key={action.id} to={action.href} className="home-action-card">
            <p className="text-caption font-semibold text-ink">{action.label}</p>
            <p className="mt-1 text-micro text-ink-secondary leading-relaxed line-clamp-2">
              {action.reason}
            </p>
            <ChevronRight className="mt-3 h-4 w-4 text-ink-muted" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
