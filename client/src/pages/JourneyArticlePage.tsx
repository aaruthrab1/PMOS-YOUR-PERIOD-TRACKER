import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui';
import { ARTICLE_CATEGORIES } from '@/lib/constants';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { pickRegionalTip } from '@/lib/personalization';

export function JourneyArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { simplify, region } = usePersonalization();
  const [article, setArticle] = useState<{
    title: string; content: string; category: string; read_time_minutes: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase.from('education_articles').select('*').eq('slug', slug).single()
      .then(({ data }) => { setArticle(data); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="skeleton h-8 w-2/3 rounded-xl mb-4" />
        <div className="skeleton h-4 w-full rounded-lg mb-2" />
        <div className="skeleton h-4 w-5/6 rounded-lg" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-caption text-ink-secondary">Article not found</p>
        <Link to="/care" className="mt-4 inline-block text-caption font-semibold text-brand-600">Back to Care</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link to="/care/articles" className="mb-6 inline-flex items-center gap-1.5 text-caption font-medium text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <article className="animate-slide-up">
        <Badge variant="primary" className="mb-4">
          {ARTICLE_CATEGORIES[article.category] || article.category}
        </Badge>
        <h1 className="font-display text-display-sm text-ink">{simplify(article.title)}</h1>
        <div className="mt-3 flex items-center gap-1.5 text-micro text-ink-tertiary">
          <Clock className="h-3.5 w-3.5" /> {article.read_time_minutes} min read
        </div>

        <div className="mt-8 space-y-4">
          {article.content.split('\n').map((p, i) => {
            if (p.startsWith('# ')) return <h2 key={i} className="font-display text-title text-ink mt-8">{simplify(p.slice(2))}</h2>;
            if (p.startsWith('## ')) return <h3 key={i} className="font-display text-caption font-semibold text-ink mt-6">{simplify(p.slice(3))}</h3>;
            if (p.startsWith('- ')) return <li key={i} className="ml-4 text-body text-ink-secondary leading-relaxed">{simplify(p.slice(2))}</li>;
            if (!p.trim()) return null;
            return <p key={i} className="text-body text-ink-secondary leading-relaxed">{simplify(p)}</p>;
          })}
        </div>

        {pickRegionalTip(region, article.title.length) && (
          <div className="mt-8 rounded-2xl border border-border bg-surface-secondary p-4">
            <p className="section-label mb-2">Tip for your region</p>
            <p className="text-caption text-ink-secondary leading-relaxed">
              {simplify(pickRegionalTip(region, article.title.length)!)}
            </p>
          </div>
        )}

        <div className="mt-10 rounded-2xl bg-surface-tertiary p-4">
          <p className="text-micro text-ink-tertiary leading-relaxed">
            For educational purposes only. Not a substitute for professional medical advice.
          </p>
        </div>
      </article>
    </div>
  );
}
