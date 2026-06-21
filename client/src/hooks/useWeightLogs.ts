import { useSupabaseQuery } from './useSupabaseQuery';
import { listWeightLogs, createWeightLog, updateWeightLog, removeWeightLog } from '@/lib/db/weightLogs';
import type { WeightLog, WeightLogInsert } from '@/types/supabase';

export function useWeightLogs(options?: { startDate?: string; endDate?: string; limit?: number }) {
  const query = useSupabaseQuery<WeightLog>({
    table: 'weight_logs',
    fetchFn: () => listWeightLogs(options),
  });

  const create = async (input: Omit<WeightLogInsert, 'user_id' | 'client_id'>) => {
    const result = await createWeightLog(input);
    await query.refresh();
    return result;
  };

  const update = async (id: string, updates: Partial<WeightLogInsert>) => {
    const result = await updateWeightLog(id, updates);
    await query.refresh();
    return result;
  };

  const remove = async (id: string) => {
    await removeWeightLog(id);
    await query.refresh();
  };

  return { ...query, upsert: create, update, remove };
}
