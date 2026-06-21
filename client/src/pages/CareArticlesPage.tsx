import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, Badge, SkeletonList, ErrorState, EmptyState } from '@/components/ui';
import { ARTICLE_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/tokens';
import { usePageTitle } from '@/hooks/usePageTitle';

interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  read_time_minutes: number;
  is_featured: boolean;
}

export function CareArticlesPage() {
  usePageTitle('Care articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('education_articles')
      .select('id, slug, title, summary, category, read_time_minutes, is_featured')
      .order('is_featured', { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (fetchError) setError(fetchError.message);
        else setArticles(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container pb-8">
      <Link to="/care" className="mb-4 inline-flex text-caption font-medium text-brand-600">
        ← Back to Care
      </Link>
      <PageHeader title="Education library" subtitle="Articles to support your health journey" />

      {loading ? (
        <SkeletonList count={3} />
      ) : error ? (
        <ErrorState title="Could not load articles" message={error} onRetry={() => window.location.reload()} />
      ) : articles.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Articles coming soon"
          description="We're preparing evidence-based guides on PMOS, cycle health, and doctor visits. Check back soon — or explore Care tabs for cycle education and test guides today."
          action={{ label: 'Back to Care', onClick: () => window.location.assign('/care') }}
        />
      ) : (
        <div className="space-y-3">
          {articles.map((article, i) => (
            <Link key={article.id} to={`/care/articles/${article.slug}`} className="block group">
              <Card interactive padding="sm" className={cn('animate-slide-up', `stagger-${Math.min(i + 1, 5)}`)}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">
                        {ARTICLE_CATEGORIES[article.category as keyof typeof ARTICLE_CATEGORIES] || article.category}
                      </Badge>
                      {article.is_featured && <Badge variant="brand">Featured</Badge>}
                    </div>
                    <p className="text-caption font-semibold text-ink group-hover:text-brand-600 transition-colors">
                      {article.title}
                    </p>
                    <p className="mt-1 text-micro text-ink-secondary line-clamp-2">{article.summary}</p>
                    <div className="mt-2 flex items-center gap-1 text-micro text-ink-tertiary">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {article.read_time_minutes} min read
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-ink-muted group-hover:text-brand-500" aria-hidden="true" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
