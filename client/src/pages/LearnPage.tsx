import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { ARTICLE_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/tokens';
import type { Database } from '@/types/database';

type Article = Database['public']['Tables']['education_articles']['Row'];

export function LearnPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('education_articles')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setArticles(data || []);
        setLoading(false);
      });
  }, []);

  const featured = articles.filter((a) => a.is_featured);
  const rest = articles.filter((a) => !a.is_featured);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-display-sm text-ink">Learn</h1>
        <p className="mt-1 text-caption text-ink-secondary">Evidence-based PCOS education and wellness guides</p>
      </header>

      {loading ? (
        <p className="text-caption text-ink-muted">Loading articles...</p>
      ) : articles.length === 0 ? (
        <Card className="text-center">
          <p className="text-caption text-ink-muted">Articles will appear here once the database is connected.</p>
        </Card>
      ) : (
        <>
          {featured.length > 0 && (
            <section aria-labelledby="featured-heading">
              <h2 id="featured-heading" className="section-label mb-4">
                Featured
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {featured.map((article) => (
                  <ArticleCard key={article.id} article={article} featured />
                ))}
              </div>
            </section>
          )}

          {rest.length > 0 && (
            <section aria-labelledby="all-heading">
              <h2 id="all-heading" className="section-label mb-4">
                All articles
              </h2>
              <div className="space-y-3">
                {rest.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function ArticleCard({ article, featured }: { article: Article; featured?: boolean }) {
  return (
    <Link
      to={`/learn/${article.slug}`}
      className={cn(
        'group block transition-colors hover:border-border-strong',
        featured ? 'card' : 'card flex items-center gap-4 py-4',
      )}
    >
      <div className={featured ? '' : 'flex-1'}>
        <span className="text-overline uppercase text-brand-500">
          {ARTICLE_CATEGORIES[article.category] || article.category}
        </span>
        <h3 className={cn(
          'font-display font-semibold text-ink group-hover:text-brand-400',
          featured ? 'mt-1 text-title-lg' : 'mt-0.5 text-caption',
        )}>
          {article.title}
        </h3>
        {featured && (
          <p className="mt-2 text-caption leading-relaxed text-ink-secondary">
            {article.summary}
          </p>
        )}
        <div className="mt-2 flex items-center gap-1 text-micro text-ink-muted">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {article.read_time_minutes} min read
        </div>
      </div>
      {!featured && <ArrowRight className="h-4 w-4 shrink-0 text-ink-muted group-hover:text-brand-400" aria-hidden="true" />}
    </Link>
  );
}
