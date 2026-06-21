import { useSupabaseQuery } from './useSupabaseQuery';
import { listSleepLogs, upsertSleepLog, updateSleepLog, removeSleepLog } from '@/lib/db/sleepLogs';
import type { SleepLog, SleepLogInsert } from '@/types/supabase';

export function useSleepLogs(options?: { startDate?: string; endDate?: string; limit?: number }) {
  const query = useSupabaseQuery<SleepLog>({
    table: 'sleep_logs',
    fetchFn: () => listSleepLogs(options),
  });

  const upsert = async (input: Omit<SleepLogInsert, 'user_id' | 'client_id'>) => {
    const result = await upsertSleepLog(input);
    await query.refresh();
    return result;
  };

  const update = async (id: string, updates: Partial<SleepLogInsert>) => {
    const result = await updateSleepLog(id, updates);
    await query.refresh();
    return result;
  };

  const remove = async (id: string) => {
    await removeSleepLog(id);
    await query.refresh();
  };

  return { ...query, upsert, update, remove };
}
