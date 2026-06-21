import { History, X, MessageCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui';
import { friendlyLoadError } from '@/lib/userMessages';
import { cn } from '@/lib/tokens';
import type { SakhiConversation } from '@/lib/sakhi';

interface ConversationHistoryProps {
  open: boolean;
  onClose: () => void;
  conversations: SakhiConversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Desktop sidebar — no overlay/backdrop */
  variant?: 'drawer' | 'sidebar';
}

export function ConversationHistory({
  open,
  onClose,
  conversations,
  activeId,
  onSelect,
  loading,
  error,
  onRetry,
  variant = 'drawer',
}: ConversationHistoryProps) {
  if (!open) return null;

  const isDrawer = variant === 'drawer';

  return (
    <>
      {isDrawer && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Close history"
        />
      )}
      <aside
        role={isDrawer ? 'dialog' : undefined}
        aria-modal={isDrawer ? true : undefined}
        aria-label="Conversation history"
        className={cn(
          isDrawer
            ? 'fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-surface shadow-3'
            : 'flex h-full w-full flex-col lg:rounded-3xl lg:ring-1 lg:ring-border/60',
        )}
      >
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-brand-500" aria-hidden="true" />
            <p className="font-display text-title-sm text-ink">History</p>
          </div>
          {isDrawer && (
            <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-surface-secondary" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex flex-col items-center gap-3 p-8" aria-busy="true">
              <LoadingSpinner size="sm" />
              <p className="text-caption text-ink-tertiary">Loading conversations…</p>
            </div>
          ) : error ? (
            <div className="p-4 text-center">
              <p className="text-caption text-risk-high">{friendlyLoadError(error)}</p>
              {onRetry && (
                <button type="button" onClick={onRetry} className="mt-2 text-micro font-semibold text-brand-600">
                  Try again
                </button>
              )}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-8 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-surface-tertiary text-brand-500">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-caption font-medium text-ink">No conversations yet</p>
              <p className="mt-1 text-micro text-ink-tertiary">Start a chat — your conversations will appear here</p>
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelect(c.id);
                  if (isDrawer) onClose();
                }}
                aria-current={activeId === c.id ? 'true' : undefined}
                className={cn(
                  'mb-1 w-full rounded-xl px-3 py-2.5 text-left transition-colors',
                  activeId === c.id ? 'bg-surface-tertiary ring-1 ring-border' : 'hover:bg-surface-secondary',
                )}
              >
                <p className="truncate text-caption font-medium text-ink">{c.title || 'Conversation'}</p>
                <p className="text-micro text-ink-tertiary">
                  {new Date(c.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </button>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
