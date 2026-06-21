import { useSupabaseQuery } from './useSupabaseQuery';
import { listMoodLogs, upsertMoodLog, updateMoodLog, removeMoodLog } from '@/lib/db/moodLogs';
import type { MoodLog, MoodLogInsert } from '@/types/supabase';

export function useMoodLogs(options?: { startDate?: string; endDate?: string; limit?: number }) {
  const query = useSupabaseQuery<MoodLog>({
    table: 'mood_logs',
    fetchFn: () => listMoodLogs(options),
  });

  const upsert = async (input: Omit<MoodLogInsert, 'user_id' | 'client_id'>) => {
    const result = await upsertMoodLog(input);
    await query.refresh();
    return result;
  };

  const update = async (id: string, updates: Partial<MoodLogInsert>) => {
    const result = await updateMoodLog(id, updates);
    await query.refresh();
    return result;
  };

  const remove = async (id: string) => {
    await removeMoodLog(id);
    await query.refresh();
  };

  return { ...query, upsert, update, remove };
}
