import { useState, useEffect, useRef, FormEvent, KeyboardEvent, useCallback } from 'react';
import { Send, Plus, Globe, AlertCircle, History, Shield, Square } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LANGUAGE_LABELS,
  type SakhiLanguage,
} from '@/lib/sakhi';
import { useSakhiChat } from '@/hooks/useSakhiChat';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { useLocalizedPageTitle } from '@/hooks/useLocalizedPageTitle';
import { checkBackendHealth } from '@/api/client';
import { Button, CopyButton } from '@/components/ui';
import { MythFactCheckCard, ConversationHistory, SakhiAvatar, SakhiMessageContent, SakhiWelcomeScreen } from '@/components/sakhi';
import { cn } from '@/lib/tokens';
import { friendlyChatError } from '@/lib/userMessages';

const ALL_LANGUAGES = Object.keys(LANGUAGE_LABELS) as SakhiLanguage[];

type ChatMode = 'chat' | 'myth';

function displayUserContent(content: string, isMythCheck?: boolean) {
  if (isMythCheck) return content;
  return content.replace(/^\[Myth check\]\n?/, '');
}

export function ChatPage() {
  useLocalizedPageTitle('page.chat');
  const { t, languageLabel } = usePersonalization();
  const { session, profile } = useAuth();
  const token = session?.access_token;
  const firstName = profile?.full_name?.split(' ')[0];

  const sakhi = useSakhiChat({ token });
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ChatMode>('chat');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshBackendStatus = useCallback(async () => {
    const health = await checkBackendHealth();
    setBackendOnline(health.online);
  }, []);

  useEffect(() => {
    refreshBackendStatus();
    const interval = setInterval(refreshBackendStatus, 30_000);
    return () => clearInterval(interval);
  }, [refreshBackendStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: sakhi.streaming ? 'auto' : 'smooth' });
  }, [sakhi.messages, sakhi.streaming, sakhi.mythLoading, sakhi.suggestions]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    if (mode === 'myth') {
      await sakhi.checkMyth(text);
      setInput('');
      return;
    }

    await sakhi.sendMessage(text);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-5rem)] flex-col lg:h-[calc(100dvh-4rem)] lg:flex-row lg:gap-4 lg:px-4 lg:pt-4">
      <div className="hidden lg:block lg:w-64 lg:shrink-0">
        <ConversationHistory
          open
          variant="sidebar"
          onClose={() => {}}
          conversations={sakhi.conversations}
          activeId={sakhi.conversationId}
          onSelect={sakhi.loadConversation}
          loading={sakhi.historyLoading}
          error={sakhi.historyError}
          onRetry={sakhi.refreshConversations}
        />
      </div>

      <ConversationHistory
        open={historyOpen}
        variant="drawer"
        onClose={() => setHistoryOpen(false)}
        conversations={sakhi.conversations}
        activeId={sakhi.conversationId}
        onSelect={sakhi.loadConversation}
        loading={sakhi.historyLoading}
        error={sakhi.historyError}
        onRetry={sakhi.refreshConversations}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border/60 bg-surface/80 px-page-x py-3 backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg items-center justify-between">
            <div className="flex items-center gap-3">
              <SakhiAvatar size="md" pulse={sakhi.streaming || sakhi.mythLoading} />
              <div>
                <h1 className="font-display text-title text-ink">{t('chat.title')}</h1>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-ink-tertiary" aria-hidden="true" />
                  <span className="text-micro text-ink-tertiary">
                    {languageLabel} · {t('chat.supportiveOnly')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary lg:hidden"
                aria-label="Conversation history"
              >
                <History className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={sakhi.startNewChat}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary"
                aria-label="New conversation"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mx-auto mt-3 flex max-w-lg gap-2">
            <button
              type="button"
              onClick={() => setMode('chat')}
              aria-pressed={mode === 'chat'}
              className={cn(
                'flex-1 rounded-full py-1.5 text-micro font-semibold transition-all',
                mode === 'chat' ? 'bg-brand-500 text-ink-inverse' : 'border border-border bg-surface text-ink-secondary',
              )}
            >
              {t('chat.modeChat')}
            </button>
            <button
              type="button"
              onClick={() => setMode('myth')}
              aria-pressed={mode === 'myth'}
              className={cn(
                'flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 text-micro font-semibold transition-all',
                mode === 'myth' ? 'bg-brand-500 text-ink-inverse' : 'border border-border bg-surface text-ink-secondary',
              )}
            >
              <Shield className="h-3.5 w-3.5" aria-hidden="true" />
              {t('chat.modeMyth')}
            </button>
          </div>
        </div>

        {backendOnline === false && (
          <div
            className="mx-auto flex w-full max-w-lg items-center gap-2 border-b border-amber-200 bg-amber-50 px-page-x py-2.5 dark:border-amber-900/40 dark:bg-amber-950/30"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="flex-1 text-micro text-amber-800 dark:text-amber-200">
              {t('chat.offline')}
            </p>
            <button
              type="button"
              onClick={refreshBackendStatus}
              className="text-micro font-medium text-amber-700 dark:text-amber-300"
            >
              {t('chat.offlineRetry')}
            </button>
          </div>
        )}

        {sakhi.error && (
          <div className="mx-auto flex w-full max-w-lg items-center gap-2 border-b border-risk-high/20 bg-risk-high-bg px-page-x py-2.5" role="alert">
            <AlertCircle className="h-4 w-4 shrink-0 text-risk-high" aria-hidden="true" />
            <p className="flex-1 text-micro text-risk-high">{friendlyChatError(sakhi.error)}</p>
            <button type="button" onClick={() => sakhi.setError(null)} className="text-micro font-medium text-risk-high">
              {t('chat.dismiss')}
            </button>
          </div>
        )}

        <div ref={logRef} className="flex-1 overflow-y-auto px-page-x py-4" role="log" aria-label="Chat with Sakhi">
          <div className="mx-auto max-w-lg space-y-4">
            {sakhi.messages.length === 0 && !sakhi.mythLoading && mode === 'chat' && (
              <SakhiWelcomeScreen
                firstName={firstName}
                activeLanguage={sakhi.activeLanguage}
                onSelectLanguage={sakhi.setActiveLanguage}
                onPrompt={sakhi.sendMessage}
                streaming={sakhi.streaming}
                languageLabels={LANGUAGE_LABELS}
                allLanguages={ALL_LANGUAGES}
              />
            )}

            {sakhi.messages.length === 0 && !sakhi.mythLoading && mode === 'myth' && (
              <div className="flex flex-col items-center py-8 text-center animate-fade-in">
                <SakhiAvatar size="lg" className="mb-5" />
                <h2 className="font-display text-title text-ink">{t('chat.mythEmptyTitle')}</h2>
                <p className="mt-2 max-w-sm text-caption text-ink-secondary leading-relaxed">
                  {t('chat.mythEmptyDesc')}
                </p>
              </div>
            )}

            {sakhi.mythLoading && (
              <div className="flex animate-slide-up justify-start">
                <SakhiAvatar size="sm" className="mr-2 mt-1" pulse />
                <div className="max-w-[85%] rounded-3xl bg-surface-elevated px-4 py-3 border border-border">
                  <p className="text-micro font-medium text-ink-secondary mb-2">{t('chat.checkingClaim')}</p>
                  <span className="flex gap-1 py-1" aria-label="Sakhi is analyzing">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="h-2 w-2 rounded-full bg-brand-300 animate-pulse-soft"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}

            {sakhi.messages.map((msg, idx) => {
              const prevUser = msg.role === 'assistant'
                ? sakhi.messages.slice(0, idx).reverse().find((m) => m.role === 'user')
                : null;

              return (
                <div key={msg.id}>
                  {msg.mythResult && prevUser && (
                    <MythFactCheckCard
                      claim={displayUserContent(prevUser.content, prevUser.isMythCheck)}
                      result={msg.mythResult}
                      className="mb-3 animate-slide-up"
                    />
                  )}

                  <div className={cn('flex animate-slide-up', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {msg.role === 'assistant' && (
                      <SakhiAvatar size="sm" className="mr-2 mt-1" pulse={msg.streaming} />
                    )}
                    <div
                      className={cn(
                        'max-w-[85%] rounded-3xl px-4 py-3 text-caption leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-brand-500 text-ink-inverse'
                          : 'bg-surface-elevated text-ink border border-border',
                      )}
                    >
                      {msg.role === 'user' && (
                        <p className="whitespace-pre-wrap">{displayUserContent(msg.content, msg.isMythCheck)}</p>
                      )}

                      {msg.role === 'assistant' && !msg.mythResult && (
                        <>
                          {msg.content ? (
                            <SakhiMessageContent content={msg.content} />
                          ) : msg.streaming ? (
                            <span className="flex gap-1 py-1" aria-label="Sakhi is typing">
                              {[0, 150, 300].map((d) => (
                                <span
                                  key={d}
                                  className="h-2 w-2 rounded-full bg-brand-300 animate-pulse-soft"
                                  style={{ animationDelay: `${d}ms` }}
                                />
                              ))}
                            </span>
                          ) : null}
                          {msg.streaming && msg.content && (
                            <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-brand-400" aria-hidden="true" />
                          )}
                        </>
                      )}

                      {msg.role === 'assistant' && msg.content && !msg.streaming && !msg.mythResult && (
                        <div className="mt-2 pt-2 border-t border-border/40">
                          <CopyButton text={msg.content} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {sakhi.suggestions.length > 0 && !sakhi.streaming && (
              <div className="flex flex-wrap gap-2 pt-2 animate-slide-up" role="group" aria-label="Suggested follow-ups">
                {sakhi.suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sakhi.sendMessage(s)}
                    className="chip-active hover:opacity-90"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} aria-hidden="true" />
          </div>
        </div>

        <div className="border-t border-border/60 bg-surface px-page-x py-3 pb-24 lg:pb-4">
          <form onSubmit={handleSubmit} className="mx-auto max-w-lg">
            <div className="flex gap-2 items-end">
              <label htmlFor="sakhi-input" className="sr-only">
                {mode === 'myth' ? t('chat.mythPlaceholder') : t('chat.placeholder')}
              </label>
              <textarea
                id="sakhi-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={mode === 'myth' ? 3 : 1}
                placeholder={
                  mode === 'myth'
                    ? t('chat.mythPlaceholder')
                    : t('chat.placeholder')
                }
                className="input-field min-h-[44px] max-h-32 flex-1 resize-none py-3"
                disabled={sakhi.streaming || sakhi.mythLoading}
              />
              {sakhi.streaming ? (
                <Button
                  type="button"
                  onClick={sakhi.cancelStream}
                  aria-label="Stop response"
                  className="!px-4 shrink-0"
                  variant="secondary"
                >
                  <Square className="h-4 w-4 fill-current" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!input.trim() || sakhi.mythLoading}
                  aria-label={mode === 'myth' ? 'Check myth' : 'Send message'}
                  className="!px-4 shrink-0"
                >
                  {mode === 'myth' ? <Shield className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                </Button>
              )}
            </div>
            <p className="mt-2 text-center text-micro text-ink-tertiary">
              {t('chat.footerDisclaimer')}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
