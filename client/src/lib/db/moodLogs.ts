import {
  getCurrentUserId, listRecords, updateRecord,
  deleteRecord, upsertRecord, generateClientId, type ListOptions,
} from './crud';
import { persistWithOffline } from './persistWithOffline';
import type { MoodLog, MoodLogInsert } from '@/types/supabase';

const TABLE = 'mood_logs';

export async function listMoodLogs(options?: ListOptions): Promise<MoodLog[]> {
  const userId = await getCurrentUserId();
  return listRecords<MoodLog>(TABLE, userId, options);
}

export async function upsertMoodLog(input: Omit<MoodLogInsert, 'user_id' | 'client_id'>): Promise<MoodLog> {
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
    () => upsertRecord<MoodLog>(TABLE, payload, 'user_id,logged_date'),
    payload,
  );
}

export async function updateMoodLog(id: string, updates: Partial<MoodLogInsert>): Promise<MoodLog> {
  const userId = await getCurrentUserId();
  return updateRecord<MoodLog>(TABLE, id, userId, updates);
}

export async function removeMoodLog(id: string): Promise<void> {
  const userId = await getCurrentUserId();
  return deleteRecord(TABLE, id, userId);
}
