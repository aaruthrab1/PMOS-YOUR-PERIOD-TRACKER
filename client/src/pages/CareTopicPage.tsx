import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { Card } from '@/components/ui';
import { topicById } from '@/lib/care/knowledgeLibrary';
import { usePageTitle } from '@/hooks/usePageTitle';

export function CareTopicPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const topic = topicId ? topicById(topicId) : undefined;

  usePageTitle(topic?.title ?? 'Topic');

  if (!topic) {
    return (
      <div className="page-container pb-8">
        <Link to="/care" className="mb-4 inline-flex text-caption font-medium text-brand-500">
          ← Back to Care
        </Link>
        <p className="text-caption text-ink-secondary">Topic not found.</p>
      </div>
    );
  }

  const Icon = topic.icon;

  return (
    <div className="page-container pb-8 md:max-w-lg">
      <Link
        to="/care#knowledge-library"
        className="mb-6 inline-flex items-center gap-1.5 text-caption font-medium text-brand-500"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Care
      </Link>

      <header className="mb-6">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-surface-tertiary">
          <Icon className="h-5 w-5 text-brand-500" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <h1 className="font-display text-display-sm text-ink">{topic.title}</h1>
        <p className="mt-2 text-caption text-ink-secondary leading-relaxed">{topic.teaser}</p>
        <div className="mt-3 flex items-center gap-1 text-micro text-ink-muted">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {topic.readMinutes} min read
        </div>
      </header>

      <Card>
        <ul className="space-y-4">
          {topic.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3 text-caption text-ink-secondary leading-relaxed">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
              {bullet}
            </li>
          ))}
        </ul>
      </Card>

      <p className="mt-6 text-micro text-ink-muted leading-relaxed">
        For education only — not medical advice. Discuss questions with a qualified clinician.
      </p>
    </div>
  );
}
