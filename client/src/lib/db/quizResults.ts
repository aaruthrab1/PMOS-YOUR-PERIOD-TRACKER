import { getCurrentUserId, insertRecord, hardDeleteRecord } from './crud';
import { supabase } from '@/lib/supabase';
import type { QuizResult, Json } from '@/types/supabase';

const TABLE = 'quiz_results';

export async function listQuizResults(quizType?: string): Promise<QuizResult[]> {
  const userId = await getCurrentUserId();
  let query = supabase.from(TABLE).select('*').eq('user_id', userId).order('completed_at', { ascending: false });
  if (quizType) query = query.eq('quiz_type', quizType);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function saveQuizResult(input: {
  quiz_type: string;
  answers: Json;
  recommendations?: string[];
  score?: number | null;
}): Promise<QuizResult> {
  const userId = await getCurrentUserId();
  return insertRecord<QuizResult>(TABLE, {
    ...input,
    user_id: userId,
    sync_status: 'synced',
    completed_at: new Date().toISOString(),
  });
}

export async function removeQuizResult(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  return hardDeleteRecord(TABLE, id, userId);
}
