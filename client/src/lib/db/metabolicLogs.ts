import {
  getCurrentUserId, listRecords, updateRecord,
  deleteRecord, upsertRecord, generateClientId, type ListOptions,
} from './crud';
import { persistWithOffline } from './persistWithOffline';
import type { MetabolicLog, MetabolicLogInsert } from '@/types/supabase';

const TABLE = 'metabolic_logs';

export async function listMetabolicLogs(options?: ListOptions): Promise<MetabolicLog[]> {
  const userId = await getCurrentUserId();
  return listRecords<MetabolicLog>(TABLE, userId, options);
}

export async function upsertMetabolicLog(
  input: Omit<MetabolicLogInsert, 'user_id' | 'client_id'>,
): Promise<MetabolicLog> {
  const userId = await getCurrentUserId();
  const clientId = generateClientId();
  const payload = {
    ...input,
    user_id: userId,
    client_id: clientId,
    sync_status: 'synced' as const,
    sugar_cravings: input.sugar_cravings ?? false,
    brain_fog: input.brain_fog ?? false,
  };

  return persistWithOffline(
    TABLE,
    'insert',
    () => upsertRecord<MetabolicLog>(TABLE, payload, 'user_id,logged_date'),
    payload,
  );
}

export async function updateMetabolicLog(id: string, updates: Partial<MetabolicLogInsert>): Promise<MetabolicLog> {
  const userId = await getCurrentUserId();
  return updateRecord<MetabolicLog>(TABLE, id, userId, updates);
}

export async function removeMetabolicLog(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  return deleteRecord(TABLE, id, userId);
}
