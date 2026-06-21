import { getCurrentUserId, insertRecord } from '@/lib/db/crud';
import { supabase } from '@/lib/supabase';

export interface WeeklyInsightRow {
  id: string;
  user_id: string;
  insight: string;
  generated_at: string;
  created_at: string;
}

const STALE_MS = 24 * 60 * 60 * 1000;

export async function getLatestWeeklyInsight(userId?: string): Promise<WeeklyInsightRow | null> {
  const uid = userId ?? (await getCurrentUserId());
  const { data, error } = await supabase
    .from('weekly_insights')
    .select('*')
    .eq('user_id', uid)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as WeeklyInsightRow | null;
}

export function isWeeklyInsightStale(row: WeeklyInsightRow | null): boolean {
  if (!row) return true;
  return Date.now() - new Date(row.generated_at).getTime() >= STALE_MS;
}

export async function saveWeeklyInsight(insight: string): Promise<WeeklyInsightRow> {
  const userId = await getCurrentUserId();
  return insertRecord<WeeklyInsightRow>('weekly_insights', {
    user_id: userId,
    insight,
    generated_at: new Date().toISOString(),
  });
}
