import { useState, useEffect, useCallback } from 'react';
import { setCache, getCache, isOnline } from '@/lib/offline/storage';
import { queueMutation } from '@/lib/offline/syncEngine';
import type { SyncableTable } from '@/types/supabase';

interface UseSupabaseQueryOptions<T> {
  table: SyncableTable;
  fetchFn: () => Promise<T[]>;
  enabled?: boolean;
}

export function useSupabaseQuery<T extends { id: string }>({
  table,
  fetchFn,
  enabled = true,
}: UseSupabaseQueryOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);

    try {
      if (isOnline()) {
        const result = await fetchFn();
        setData(result);
        setFromCache(false);
        await setCache(table, result);
      } else {
        const cached = await getCache<T>(table);
        setData(cached || []);
        setFromCache(true);
      }
    } catch (err) {
      const cached = await getCache<T>(table);
      if (cached) {
        setData(cached);
        setFromCache(true);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  }, [table, fetchFn, enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const mutateOffline = useCallback(async (
    operation: 'insert' | 'update' | 'delete',
    payload: Record<string, unknown>,
    optimisticUpdate?: (prev: T[]) => T[]
  ) => {
    if (optimisticUpdate) {
      setData(optimisticUpdate);
    }
    if (!isOnline()) {
      await queueMutation(table, operation, payload);
      setFromCache(true);
      return;
    }
    await refresh();
  }, [table, refresh]);

  return { data, loading, error, fromCache, refresh, mutateOffline };
}
