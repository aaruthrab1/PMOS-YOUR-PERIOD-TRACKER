import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ARTICLE_CATEGORIES } from '@/lib/constants';
import { upsertArticleProgress } from '@/lib/db/articleProgress';
import type { Database } from '@/types/database';

type Article = Database['public']['Tables']['education_articles']['Row'];

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('education_articles')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        const row = data as Article | null;
        setArticle(row);
        setLoading(false);
        if (row?.id) {
          void upsertArticleProgress(row.id, 100).catch(() => {});
        }
      });
  }, [slug]);

  if (loading) {
    return <p className="text-caption text-ink-muted">Loading article...</p>;
  }

  if (!article) {
    return (
      <div className="text-center">
        <p className="text-ink-secondary">Article not found.</p>
        <Link to="/learn" className="mt-4 inline-block text-caption text-brand-500 hover:text-brand-600">
          Back to Learn
        </Link>
      </div>
    );
  }

  return (
    <article className="animate-slide-up">
      <Link
        to="/learn"
        className="mb-6 inline-flex items-center gap-1 text-caption font-medium text-brand-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Learn
      </Link>

      <header className="mb-8">
        <span className="text-overline uppercase text-brand-500">
          {ARTICLE_CATEGORIES[article.category] || article.category}
        </span>
        <h1 className="mt-2 font-display text-display-sm text-ink">
          {article.title}
        </h1>
        <div className="mt-3 flex items-center gap-1 text-caption text-ink-muted">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {article.read_time_minutes} min read
        </div>
      </header>

      <div className="prose-cyra max-w-none">
        {article.content.split('\n').map((paragraph, i) => {
          if (paragraph.startsWith('# ')) {
            return <h2 key={i} className="font-display text-title-lg text-ink mt-8 mb-3">{paragraph.slice(2)}</h2>;
          }
          if (paragraph.startsWith('## ')) {
            return <h3 key={i} className="font-display text-title text-ink mt-6 mb-2">{paragraph.slice(3)}</h3>;
          }
          if (paragraph.startsWith('- ')) {
            return <li key={i} className="ml-4 text-ink-secondary">{paragraph.slice(2)}</li>;
          }
          if (paragraph.trim() === '') return null;
          return <p key={i} className="mb-4 leading-relaxed text-ink-secondary">{paragraph}</p>;
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-surface-elevated p-4">
        <p className="text-micro text-ink-muted">
          This content is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
        </p>
      </div>
    </article>
  );
}
