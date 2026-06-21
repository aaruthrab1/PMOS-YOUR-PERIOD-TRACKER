import { useCallback, useEffect, useRef, useState } from 'react';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { friendlyChatError, friendlyLoadError } from '@/lib/userMessages';
import {
  streamSakhiChat,
  fetchSakhiConversations,
  fetchSakhiMessages,
  checkSakhiMyth,
  type SakhiMessage,
  type SakhiConversation,
  type SakhiLanguage,
  type MythCheckResult,
} from '@/lib/sakhi';

interface UseSakhiChatOptions {
  token?: string;
}

export function useSakhiChat({ token }: UseSakhiChatOptions) {
  const { sakhiLanguage } = usePersonalization();
  const [messages, setMessages] = useState<SakhiMessage[]>([]);
  const [conversations, setConversations] = useState<SakhiConversation[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [activeLanguage, setActiveLanguage] = useState<SakhiLanguage>(sakhiLanguage);
  const [streaming, setStreaming] = useState(false);
  const [mythLoading, setMythLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initialLoadRef = useRef(false);

  const refreshConversations = useCallback(async () => {
    if (!token) return;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const convs = await fetchSakhiConversations(token);
      setConversations(convs);
      return convs;
    } catch (err) {
      setHistoryError(friendlyLoadError(err instanceof Error ? err.message : undefined));
      return [];
    } finally {
      setHistoryLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || initialLoadRef.current) return;
    initialLoadRef.current = true;

    refreshConversations().then((convs) => {
      if (convs && convs.length > 0) {
        const latest = convs[0];
        setConversationId(latest.id);
        if (latest.preferredLanguage) {
          setActiveLanguage(latest.preferredLanguage as SakhiLanguage);
        }
        fetchSakhiMessages(latest.id, token).then(setMessages).catch(() => {});
      }
    });
  }, [token, refreshConversations]);

  useEffect(() => {
    if (!conversationId) {
      setActiveLanguage(sakhiLanguage);
    }
  }, [sakhiLanguage, conversationId]);

  const loadConversation = useCallback(async (id: string) => {
    if (!token) return;
    setConversationId(id);
    setSuggestions([]);
    setError(null);
    try {
      const msgs = await fetchSakhiMessages(id, token);
      setMessages(msgs);
      const conv = conversations.find((c) => c.id === id);
      if (conv?.preferredLanguage) {
        setActiveLanguage(conv.preferredLanguage as SakhiLanguage);
      }
    } catch (err) {
      setError(friendlyChatError(err instanceof Error ? err.message : 'Something went wrong'));
    }
  }, [token, conversations]);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
    setMessages((prev) =>
      prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
    );
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !token || streaming) return;

    setError(null);
    setSuggestions([]);

    const userMsg: SakhiMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
    };
    const assistantId = crypto.randomUUID();
    const assistantMsg: SakhiMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      streaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStreaming(true);
    abortRef.current = new AbortController();

    try {
      await streamSakhiChat({
        message: text.trim(),
        conversationId,
        language: activeLanguage,
        token,
        signal: abortRef.current.signal,
        onEvent: (event) => {
          if (event.type === 'start') {
            setConversationId(event.conversationId);
            setActiveLanguage(event.language);
          }
          if (event.type === 'token') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + event.content } : m,
              ),
            );
          }
          if (event.type === 'done') {
            setConversationId(event.conversationId);
            setActiveLanguage(event.language);
            setSuggestions(event.suggestions || []);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, streaming: false } : m,
              ),
            );
            refreshConversations();
          }
          if (event.type === 'error') {
            setError(friendlyChatError(event.message));
          }
        },
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(friendlyChatError(err instanceof Error ? err.message : 'Something went wrong'));
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [token, conversationId, streaming, refreshConversations, activeLanguage]);

  const checkMyth = useCallback(async (text: string): Promise<MythCheckResult | null> => {
    if (!token || !text.trim()) return null;
    setMythLoading(true);
    setError(null);

    const userMsg: SakhiMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      isMythCheck: true,
    };

    try {
      const { language, result } = await checkSakhiMyth(text.trim(), token, activeLanguage);
      setActiveLanguage(language);

      const assistantMsg: SakhiMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.betterGuidance,
        mythResult: result,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      return result;
    } catch (err) {
      setError(friendlyChatError(err instanceof Error ? err.message : 'Myth check failed'));
      return null;
    } finally {
      setMythLoading(false);
    }
  }, [token, activeLanguage]);

  const startNewChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setConversationId(undefined);
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    messages,
    conversations,
    conversationId,
    activeLanguage,
    setActiveLanguage,
    streaming,
    mythLoading,
    suggestions,
    error,
    setError,
    historyLoading,
    historyError,
    sendMessage,
    checkMyth,
    loadConversation,
    startNewChat,
    refreshConversations,
    cancelStream,
  };
}
