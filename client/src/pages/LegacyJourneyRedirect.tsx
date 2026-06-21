import { useParams, Navigate } from 'react-router-dom';

/** Redirect legacy /journey/:slug article URLs */
export function LegacyJourneyArticleRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={slug ? `/care/articles/${slug}` : '/care'} replace />;
}
