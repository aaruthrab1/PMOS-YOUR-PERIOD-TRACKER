import {
  getCurrentUserId, listRecords, getRecord, insertRecord,
  updateRecord, deleteRecord, generateClientId, type ListOptions,
} from './crud';
import { persistWithOffline } from './persistWithOffline';
import type { PeriodLog, PeriodLogInsert } from '@/types/supabase';

const TABLE = 'period_logs';

export async function listPeriodLogs(options?: ListOptions): Promise<PeriodLog[]> {
  const userId = await getCurrentUserId();
  return listRecords<PeriodLog>(TABLE, userId, options, 'period_start');
}

export async function getPeriodLog(id: string): Promise<PeriodLog | null> {
  const userId = await getCurrentUserId();
  return getRecord<PeriodLog>(TABLE, id, userId);
}

export async function createPeriodLog(
  input: Partial<Omit<PeriodLogInsert, 'user_id' | 'client_id'>> & { period_start: string },
): Promise<PeriodLog> {
  const userId = await getCurrentUserId();
  const clientId = generateClientId();
  const payload = {
    ...input,
    user_id: userId,
    client_id: clientId,
    sync_status: 'synced' as const,
  };

  return persistWithOffline(
    TABLE,
    'insert',
    () => insertRecord<PeriodLog>(TABLE, payload),
    payload,
  );
}

export async function updatePeriodLog(id: string, updates: Partial<PeriodLogInsert>): Promise<PeriodLog> {
  const userId = await getCurrentUserId();
  return updateRecord<PeriodLog>(TABLE, id, userId, updates);
}

export async function removePeriodLog(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  return deleteRecord(TABLE, id, userId);
}
