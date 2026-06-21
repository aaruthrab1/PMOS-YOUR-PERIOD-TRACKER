import { useSupabaseQuery } from './useSupabaseQuery';
import { listPeriodLogs, createPeriodLog, updatePeriodLog, removePeriodLog } from '@/lib/db/periodLogs';
import type { PeriodLog, PeriodLogInsert } from '@/types/supabase';

export function usePeriodLogs(options?: { startDate?: string; endDate?: string; limit?: number }) {
  const query = useSupabaseQuery<PeriodLog>({
    table: 'period_logs',
    fetchFn: () => listPeriodLogs(options),
  });

  const create = async (input: Omit<PeriodLogInsert, 'user_id' | 'client_id'>) => {
    const result = await createPeriodLog(input);
    await query.refresh();
    return result;
  };

  const update = async (id: string, updates: Partial<PeriodLogInsert>) => {
    const result = await updatePeriodLog(id, updates);
    await query.refresh();
    return result;
  };

  const remove = async (id: string) => {
    await removePeriodLog(id);
    await query.refresh();
  };

  return { ...query, create, update, remove };
}
