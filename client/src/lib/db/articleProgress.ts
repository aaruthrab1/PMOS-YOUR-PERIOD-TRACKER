import { getCurrentUserId, upsertRecord } from '@/lib/db/crud';
import { supabase } from '@/lib/supabase';

export interface ArticleBookmarkRow {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface ArticleReadProgressRow {
  id: string;
  user_id: string;
  article_id: string;
  progress_percent: number;
  completed_at: string | null;
  updated_at: string;
}

export async function toggleArticleBookmark(articleId: string, bookmarked: boolean): Promise<void> {
  const userId = await getCurrentUserId();
  if (bookmarked) {
    await upsertRecord<ArticleBookmarkRow>(
      'article_bookmarks',
      { user_id: userId, article_id: articleId },
      'user_id,article_id',
    );
    return;
  }
  await supabase
    .from('article_bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('article_id', articleId);
}

export async function listBookmarkedArticleIds(): Promise<string[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('article_bookmarks')
    .select('article_id')
    .eq('user_id', userId);

  if (error) throw error;
  return ((data ?? []) as { article_id: string }[]).map((r) => r.article_id);
}

export async function upsertArticleProgress(
  articleId: string,
  progressPercent: number,
): Promise<ArticleReadProgressRow> {
  const userId = await getCurrentUserId();
  return upsertRecord<ArticleReadProgressRow>(
    'article_read_progress',
    {
      user_id: userId,
      article_id: articleId,
      progress_percent: progressPercent,
      completed_at: progressPercent >= 100 ? new Date().toISOString() : null,
    },
    'user_id,article_id',
  );
}

export async function getArticleProgress(articleId: string): Promise<ArticleReadProgressRow | null> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('article_read_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('article_id', articleId)
    .maybeSingle();

  if (error) throw error;
  return data as ArticleReadProgressRow | null;
}
