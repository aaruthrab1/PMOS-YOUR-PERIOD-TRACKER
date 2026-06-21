import {
  getCurrentUserId, listRecords, updateRecord,
  deleteRecord, upsertRecord, generateClientId, type ListOptions,
} from './crud';
import { persistWithOffline } from './persistWithOffline';
import type { SleepLog, SleepLogInsert } from '@/types/supabase';

const TABLE = 'sleep_logs';

export async function listSleepLogs(options?: ListOptions): Promise<SleepLog[]> {
  const userId = await getCurrentUserId();
  return listRecords<SleepLog>(TABLE, userId, options);
}

export async function upsertSleepLog(input: Omit<SleepLogInsert, 'user_id' | 'client_id'>): Promise<SleepLog> {
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
    () => upsertRecord<SleepLog>(TABLE, payload, 'user_id,logged_date'),
    payload,
  );
}

export async function updateSleepLog(id: string, updates: Partial<SleepLogInsert>): Promise<SleepLog> {
  const userId = await getCurrentUserId();
  return updateRecord<SleepLog>(TABLE, id, userId, updates);
}

export async function removeSleepLog(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  return deleteRecord(TABLE, id, userId);
}
