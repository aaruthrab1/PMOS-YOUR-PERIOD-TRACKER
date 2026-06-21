import {
  getCurrentUserId, listRecords, updateRecord,
  deleteRecord, upsertRecord, generateClientId, type ListOptions,
} from './crud';
import { persistWithOffline } from './persistWithOffline';
import type { AndrogenLog, AndrogenLogInsert } from '@/types/supabase';

const TABLE = 'androgen_logs';

export async function listAndrogenLogs(options?: ListOptions): Promise<AndrogenLog[]> {
  const userId = await getCurrentUserId();
  return listRecords<AndrogenLog>(TABLE, userId, options);
}

export async function upsertAndrogenLog(
  input: Partial<Omit<AndrogenLogInsert, 'user_id' | 'client_id'>> & { logged_date: string },
): Promise<AndrogenLog> {
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
    () => upsertRecord<AndrogenLog>(TABLE, payload, 'user_id,logged_date'),
    payload,
  );
}

export async function updateAndrogenLog(id: string, updates: Partial<AndrogenLogInsert>): Promise<AndrogenLog> {
  const userId = await getCurrentUserId();
  return updateRecord<AndrogenLog>(TABLE, id, userId, updates);
}

export async function removeAndrogenLog(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  return deleteRecord(TABLE, id, userId);
}
