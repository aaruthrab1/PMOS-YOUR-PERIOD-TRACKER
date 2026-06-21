import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/tokens';

export function OfflineSyncBanner() {
  const { online, pending, syncing, sync } = useOfflineSync();

  if (online && pending === 0) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-2 text-micro',
        online ? 'bg-wellness-50 text-wellness-500' : 'bg-amber-50 text-amber-700'
      )}
      role="status"
    >
      <div className="flex items-center gap-2">
        {online ? <Cloud className="h-3.5 w-3.5" /> : <CloudOff className="h-3.5 w-3.5" />}
        <span>
          {!online
            ? 'Offline — changes saved locally'
            : pending > 0
              ? `${pending} change${pending > 1 ? 's' : ''} syncing...`
              : 'All changes synced'}
        </span>
      </div>
      {online && pending > 0 && (
        <button
          onClick={() => sync()}
          disabled={syncing}
          className="flex items-center gap-1 font-medium hover:underline disabled:opacity-50"
        >
          <RefreshCw className={cn('h-3 w-3', syncing && 'animate-spin')} />
          Sync now
        </button>
      )}
    </div>
  );
}
