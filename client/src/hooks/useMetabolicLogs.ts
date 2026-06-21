import { useSupabaseQuery } from './useSupabaseQuery';
import { listMetabolicLogs, upsertMetabolicLog, updateMetabolicLog, removeMetabolicLog } from '@/lib/db/metabolicLogs';
import { OfflineWriteError } from '@/lib/db/persistWithOffline';
import type { MetabolicLog, MetabolicLogInsert } from '@/types/supabase';

export function useMetabolicLogs(options?: { startDate?: string; endDate?: string; limit?: number }) {
  const query = useSupabaseQuery<MetabolicLog>({
    table: 'metabolic_logs',
    fetchFn: () => listMetabolicLogs(options),
  });

  const upsert = async (input: Omit<MetabolicLogInsert, 'user_id' | 'client_id'>) => {
    try {
      const result = await upsertMetabolicLog(input);
      await query.refresh();
      return result;
    } catch (err) {
      if (err instanceof OfflineWriteError) {
        await query.refresh();
        return null;
      }
      throw err;
    }
  };

  const update = async (id: string, updates: Partial<MetabolicLogInsert>) => {
    const result = await updateMetabolicLog(id, updates);
    await query.refresh();
    return result;
  };

  const remove = async (id: string) => {
    await removeMetabolicLog(id);
    await query.refresh();
  };

  return { ...query, upsert, update, remove };
}
