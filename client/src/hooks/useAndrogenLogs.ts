import { useSupabaseQuery } from './useSupabaseQuery';
import { listAndrogenLogs, upsertAndrogenLog, updateAndrogenLog, removeAndrogenLog } from '@/lib/db/androgenLogs';
import type { AndrogenLog, AndrogenLogInsert } from '@/types/supabase';

export function useAndrogenLogs(options?: { startDate?: string; endDate?: string; limit?: number }) {
  const query = useSupabaseQuery<AndrogenLog>({
    table: 'androgen_logs',
    fetchFn: () => listAndrogenLogs(options),
  });

  const upsert = async (input: Partial<Omit<AndrogenLogInsert, 'user_id' | 'client_id'>> & { logged_date: string }) => {
    const result = await upsertAndrogenLog(input);
    await query.refresh();
    return result;
  };

  const update = async (id: string, updates: Partial<AndrogenLogInsert>) => {
    const result = await updateAndrogenLog(id, updates);
    await query.refresh();
    return result;
  };

  const remove = async (id: string) => {
    await removeAndrogenLog(id);
    await query.refresh();
  };

  return { ...query, upsert, update, remove };
}
