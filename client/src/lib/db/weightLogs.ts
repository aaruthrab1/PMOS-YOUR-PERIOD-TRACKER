import {
  getCurrentUserId, listRecords, updateRecord,
  deleteRecord, upsertRecord, generateClientId, type ListOptions,
} from './crud';
import { persistWithOffline } from './persistWithOffline';
import type { WeightLog, WeightLogInsert } from '@/types/supabase';

const TABLE = 'weight_logs';

export async function listWeightLogs(options?: ListOptions): Promise<WeightLog[]> {
  const userId = await getCurrentUserId();
  return listRecords<WeightLog>(TABLE, userId, options);
}

export async function upsertWeightLog(input: Omit<WeightLogInsert, 'user_id' | 'client_id'>): Promise<WeightLog> {
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
    () => upsertRecord<WeightLog>(TABLE, payload, 'user_id,logged_date'),
    payload,
  );
}

export async function createWeightLog(input: Omit<WeightLogInsert, 'user_id' | 'client_id'>): Promise<WeightLog> {
  return upsertWeightLog(input);
}

export async function updateWeightLog(id: string, updates: Partial<WeightLogInsert>): Promise<WeightLog> {
  const userId = await getCurrentUserId();
  return updateRecord<WeightLog>(TABLE, id, userId, updates);
}

export async function removeWeightLog(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  return deleteRecord(TABLE, id, userId);
}
