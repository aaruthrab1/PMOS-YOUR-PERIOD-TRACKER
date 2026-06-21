import { isOnline } from '@/lib/offline/storage';
import { queueMutation } from '@/lib/offline/syncEngine';
import { generateClientId } from '@/lib/db/crud';
import type { SyncableTable } from '@/types/supabase';

export class OfflineWriteError extends Error {
  constructor(message = 'Saved offline — will sync when connected') {
    super(message);
    this.name = 'OfflineWriteError';
  }
}

export async function persistWithOffline<T>(
  table: SyncableTable,
  operation: 'insert' | 'update' | 'delete',
  onlineFn: () => Promise<T>,
  payload: Record<string, unknown>,
): Promise<T> {
  if (!isOnline()) {
    await queueMutation(table, operation, {
      ...payload,
      client_id: payload.client_id ?? generateClientId(),
    });
    throw new OfflineWriteError();
  }

  try {
    return await onlineFn();
  } catch (err) {
    if (!navigator.onLine) {
      await queueMutation(table, operation, {
        ...payload,
        client_id: payload.client_id ?? generateClientId(),
      });
      throw new OfflineWriteError();
    }
    throw err;
  }
}
