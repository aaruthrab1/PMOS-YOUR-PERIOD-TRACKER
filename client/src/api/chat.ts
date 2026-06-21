import { ApiError } from './errors';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export type SakhiLanguage =
  | 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada'
  | 'Malayalam' | 'Bengali' | 'Marathi' | 'Gujarati' | 'Punjabi';

export interface SakhiConversation {
  id: string;
  title: string;
  updatedAt: string;
  preferredLanguage?: SakhiLanguage;
}

export interface MythCheckResult {
  accuracy: string;
  evidence: string;
  risks: string;
  betterGuidance: string;
}

export type SakhiStreamEvent =
  | { type: 'start'; conversationId: string; language: SakhiLanguage }
  | { type: 'token'; content: string }
  | { type: 'done'; conversationId: string; language: SakhiLanguage; tokenCount?: number; suggestions?: string[] }
  | { type: 'error'; message: string };

export interface ApiChatOptions {
  message: string;
  conversationId?: string;
  language?: SakhiLanguage;
  token: string;
  onEvent: (event: SakhiStreamEvent) => void;
  signal?: AbortSignal;
}

export interface BackendHealth {
  online: boolean;
  status?: string;
  groq?: boolean;
  supabase?: boolean;
}

async function parseApiError(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.error === 'string') return body.error;
    if (typeof body.message === 'string') return body.message;
  } catch {
    // non-JSON body
  }
  if (response.status === 401) return 'Please sign in again to talk to Sakhi.';
  if (response.status === 503) return 'Sakhi AI is temporarily unavailable. Please try again later.';
  if (response.status === 429) return 'Too many messages. Please rest a moment and try again.';
  return fallback;
}

function authHeaders(token: string, extra?: HeadersInit): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

async function parseSseStream(
  response: Response,
  onEvent: (event: SakhiStreamEvent) => void,
): Promise<void> {
  if (!response.body) {
    throw new ApiError('Streaming is not supported in this browser.', 500);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const event = JSON.parse(line.slice(6)) as SakhiStreamEvent;
        onEvent(event);
        if (event.type === 'error') {
          throw new ApiError(event.message, 502);
        }
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }
}

/** Stream Sakhi chat — primary entry point (callable as `api.chat(...)`) */
async function chatStream(options: ApiChatOptions): Promise<void> {
  const { message, conversationId, language, token, onEvent, signal } = options;

  const response = await fetch(`${API_URL}/sakhi/chat`, {
    method: 'POST',
    headers: authHeaders(token, {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    }),
    body: JSON.stringify({ message, conversationId, language, stream: true }),
    signal,
  });

  if (!response.ok) {
    const msg = await parseApiError(response, `Chat request failed (${response.status})`);
    throw new ApiError(msg, response.status);
  }

  await parseSseStream(response, onEvent);
}

async function mythCheck(
  text: string,
  token: string,
  language?: SakhiLanguage,
): Promise<{ language: SakhiLanguage; result: MythCheckResult }> {
  const res = await fetch(`${API_URL}/sakhi/myth-check`, {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ text, language }),
  });
  if (!res.ok) {
    const msg = await parseApiError(res, 'Myth check failed');
    throw new ApiError(msg, res.status);
  }
  return res.json();
}

async function listConversations(token: string): Promise<SakhiConversation[]> {
  const res = await fetch(`${API_URL}/sakhi/conversations`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const msg = await parseApiError(res, 'Failed to load conversations');
    throw new ApiError(msg, res.status);
  }
  return res.json();
}

async function fetchMessages(
  conversationId: string,
  token: string,
): Promise<Array<{ id: string; role: 'user' | 'assistant'; content: string; created_at?: string }>> {
  const res = await fetch(`${API_URL}/sakhi/conversations/${conversationId}/messages`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const msg = await parseApiError(res, 'Failed to load messages');
    throw new ApiError(msg, res.status);
  }
  const data = await res.json();
  return data.map((m: { id: string; role: string; content: string; created_at: string }) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    created_at: m.created_at,
  }));
}

async function createConversation(token: string): Promise<{ id: string }> {
  const res = await fetch(`${API_URL}/sakhi/conversations`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const msg = await parseApiError(res, 'Failed to create conversation');
    throw new ApiError(msg, res.status);
  }
  return res.json();
}

export async function checkBackendHealth(): Promise<BackendHealth> {
  try {
    const res = await fetch(`${API_URL}/health`, { method: 'GET' });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return {
      online: data.status === 'ok',
      status: data.status,
      groq: data.groq,
      supabase: data.supabase,
    };
  } catch {
    return { online: false };
  }
}

export interface ApiChatClient {
  (options: ApiChatOptions): Promise<void>;
  mythCheck: typeof mythCheck;
  listConversations: typeof listConversations;
  fetchMessages: typeof fetchMessages;
  createConversation: typeof createConversation;
}

export const chatApi: ApiChatClient = Object.assign(chatStream, {
  mythCheck,
  listConversations,
  fetchMessages,
  createConversation,
});
