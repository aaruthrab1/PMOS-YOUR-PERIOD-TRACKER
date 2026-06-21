import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { supabase } from '@/lib/supabase';

interface FeaturedArticle {
  slug: string;
  title: string;
  read_time_minutes: number;
}

export function HomeLearnTeaser() {
  const { t } = usePersonalization();
  const [article, setArticle] = useState<FeaturedArticle | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const { data } = await supabase
          .from('education_articles')
          .select('slug, title, read_time_minutes')
          .eq('is_featured', true)
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cancelled && data) setArticle(data as FeaturedArticle);
      } catch {
        /* ignore */
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (!article) return null;

  return (
    <section aria-labelledby="learn-heading">
      <div className="home-section-head">
        <h2 id="learn-heading" className="home-section-title">
          {t('care.library')}
        </h2>
        <Link to="/care#knowledge-library" className="home-section-link">
          {t('care.browseArticles')}
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
      <Link to={`/care/articles/${article.slug}`} className="home-learn-card">
        <p className="text-overline uppercase text-ink-muted">{t('care.journey')}</p>
        <p className="mt-1 text-caption font-semibold text-ink">{article.title}</p>
        <p className="mt-1 text-micro text-ink-secondary">{article.read_time_minutes} min read</p>
      </Link>
    </section>
  );
}
