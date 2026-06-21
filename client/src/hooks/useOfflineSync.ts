import { useEffect, useState, useCallback, useRef } from 'react';
import { flushSyncQueue, getPendingCount } from '@/lib/offline/syncEngine';
import { isOnline } from '@/lib/offline/storage';

export function useOfflineSync() {
  const [online, setOnline] = useState(isOnline());
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const intervalRef = useRef<number>();

  const refreshPending = useCallback(async () => {
    const count = await getPendingCount();
    setPending(count);
  }, []);

  const sync = useCallback(async () => {
    if (!isOnline() || syncing) return { synced: 0, failed: 0 };
    setSyncing(true);
    try {
      const result = await flushSyncQueue();
      setLastSync(new Date());
      await refreshPending();
      return result;
    } finally {
      setSyncing(false);
    }
  }, [syncing, refreshPending]);

  useEffect(() => {
    refreshPending();

    const handleOnline = () => {
      setOnline(true);
      sync();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    intervalRef.current = window.setInterval(refreshPending, 30_000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sync, refreshPending]);

  return { online, pending, syncing, lastSync, sync, refreshPending };
}
