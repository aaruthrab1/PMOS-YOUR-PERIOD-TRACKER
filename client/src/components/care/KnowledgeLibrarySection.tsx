import { usePersonalization } from '@/contexts/PersonalizationContext';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui';
import { KNOWLEDGE_TOPICS } from '@/lib/care/knowledgeLibrary';
import { cn } from '@/lib/tokens';

export function KnowledgeLibrarySection() {
  const { t } = usePersonalization();
  return (
    <section id="knowledge-library" aria-labelledby="knowledge-library-heading">
      <h2 id="knowledge-library-heading" className="section-label mb-3">
        {t('care.library')}
      </h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {KNOWLEDGE_TOPICS.map((topic, i) => {
          const Icon = topic.icon;
          const href = topic.articleSlug
            ? `/care/articles/${topic.articleSlug}`
            : `/care/topics/${topic.id}`;

          return (
            <Link key={topic.id} to={href} className="group block">
              <Card
                interactive
                className={cn('h-full !py-3.5 animate-slide-up', `stagger-${Math.min(i + 1, 6)}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-tertiary">
                    <Icon className="h-4 w-4 text-brand-500" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-caption font-semibold text-ink group-hover:text-brand-500 transition-colors">
                      {topic.title}
                    </p>
                    <p className="mt-0.5 text-micro text-ink-secondary line-clamp-2 leading-snug">
                      {topic.teaser}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-ink-muted">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {topic.readMinutes} min
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-brand-500" aria-hidden="true" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
      <Link
        to="/care/articles"
        className="mt-4 inline-flex text-micro font-semibold text-brand-500"
      >
        Browse all articles →
      </Link>
    </section>
  );
}
