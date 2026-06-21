import { supabase } from '@/lib/supabase';
import {
  enqueueSyncItem,
  getSyncQueue,
  removeSyncItem,
  updateSyncItemRetries,
  isOnline,
} from './storage';
import type { SyncQueueItem, SyncableTable, SyncOperation } from '@/types/supabase';

const MAX_RETRIES = 3;

export function createSyncItem(
  table: SyncableTable,
  operation: SyncOperation,
  payload: Record<string, unknown>,
  clientId?: string
): SyncQueueItem {
  return {
    id: crypto.randomUUID(),
    table,
    operation,
    payload,
    clientId: clientId || (payload.client_id as string) || crypto.randomUUID(),
    createdAt: Date.now(),
    retries: 0,
  };
}

export async function queueMutation(
  table: SyncableTable,
  operation: SyncOperation,
  payload: Record<string, unknown>
): Promise<SyncQueueItem> {
  const item = createSyncItem(table, operation, payload);
  await enqueueSyncItem(item);
  return item;
}

async function applySyncItem(item: SyncQueueItem): Promise<void> {
  const { table, operation, payload } = item;

  switch (operation) {
    case 'insert': {
      const { error } = await supabase.from(table).insert({ ...payload, sync_status: 'synced' } as never);
      if (error) throw error;
      break;
    }
    case 'update': {
      const id = payload.id as string;
      const userId = payload.user_id as string;
      const { id: _id, user_id: _uid, ...updates } = payload;
      const { error } = await supabase.from(table).update({ ...updates, sync_status: 'synced' } as never).eq('id', id).eq('user_id', userId);
      if (error) throw error;
      break;
    }
    case 'delete': {
      const id = payload.id as string;
      const userId = payload.user_id as string;
      const softDeleteTables: SyncableTable[] = ['period_logs', 'sleep_logs', 'weight_logs', 'mood_logs', 'metabolic_logs', 'androgen_logs'];
      if (softDeleteTables.includes(table)) {
        const { error } = await supabase.from(table).update({ deleted_at: new Date().toISOString() } as never).eq('id', id).eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId);
        if (error) throw error;
      }
      break;
    }
  }
}

export async function flushSyncQueue(): Promise<{ synced: number; failed: number }> {
  if (!isOnline()) return { synced: 0, failed: 0 };

  const queue = await getSyncQueue();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      await applySyncItem(item);
      await removeSyncItem(item.id);
      synced++;
    } catch {
      const newRetries = item.retries + 1;
      if (newRetries >= MAX_RETRIES) {
        await removeSyncItem(item.id);
      } else {
        await updateSyncItemRetries(item.id, newRetries);
      }
      failed++;
    }
  }

  return { synced, failed };
}

export async function getPendingCount(): Promise<number> {
  const queue = await getSyncQueue();
  return queue.length;
}
