import type { SupabaseClient } from '@supabase/supabase-js';
import type { Response } from 'express';
import {
  buildSakhiSystemPrompt,
  buildMythDetectorPrompt,
  buildSuggestionsPrompt,
  SAKHI_MAX_HISTORY,
  SAKHI_MAX_TOKENS,
  type SakhiLanguage,
} from '../config/sakhi.prompt.js';
import { AppError } from '../utils/AppError.js';
import { detectLanguage } from '../utils/languageDetect.js';
import {
  buildHealthContext,
  parseConversationMeta,
  updateConversationMeta,
} from './sakhi.context.js';
import {
  fetchUserPersonalization,
  languageCodeToSakhi,
  buildSimpleLanguageInstruction,
  buildRegionalContextInstruction,
} from '../lib/personalization.js';
import { isAiConfigured } from '../config/env.js';
import { completeChat, streamChat, type ChatMessage } from '../config/llm.provider.js';
import {
  memoryCreateConversation,
  memoryGetConversation,
  memoryListConversations,
  memoryAddMessage,
  memoryGetMessages,
  memoryUpdateConversation,
} from './sakhi.memory.js';

function handleAiError(err: unknown): never {
  throw new AppError('Sakhi encountered an issue. Please try again.', 502);
}

/** Delimit user content to reduce prompt-injection surface */
function wrapUserMessage(content: string): string {
  return `<user_message>\n${content.slice(0, 4000)}\n</user_message>`;
}

export interface StreamChatOptions {
  userId: string;
  supabase: SupabaseClient;
  message: string;
  conversationId?: string;
  languageHint?: SakhiLanguage;
}

export interface StreamChatResult {
  conversationId: string;
  fullResponse: string;
  detectedLanguage: SakhiLanguage;
  tokenCount?: number;
}

export interface MythCheckResult {
  accuracy: string;
  evidence: string;
  risks: string;
  betterGuidance: string;
}

export async function checkHealthMyth(
  text: string,
  languageHint?: SakhiLanguage,
): Promise<{ language: SakhiLanguage; result: MythCheckResult }> {
  assertAiAvailable();

  const language = languageHint || detectLanguage(text);
  let raw: string;
  try {
    raw = await completeChat({
      messages: [
        { role: 'system', content: buildMythDetectorPrompt(language) },
        { role: 'user', content: wrapUserMessage(text) },
      ],
      maxTokens: 800,
      temperature: 0.3,
      jsonMode: true,
    });
  } catch {
    handleAiError(new Error('myth check failed'));
  }

  let parsed: MythCheckResult;
  try {
    parsed = JSON.parse(raw!) as MythCheckResult;
  } catch {
    parsed = {
      accuracy: 'Unclear',
      evidence: 'Could not fully analyze this claim.',
      risks: 'Acting on unverified health advice can delay proper care.',
      betterGuidance: 'Consider discussing this with a qualified clinician who knows your history.',
    };
  }

  return { language, result: parsed };
}

async function generateSuggestedReplies(
  userMessage: string,
  assistantResponse: string,
  language: SakhiLanguage,
): Promise<string[]> {
  try {
    const raw = await completeChat({
      messages: [
        { role: 'system', content: buildSuggestionsPrompt(language) },
        {
          role: 'user',
          content: `User asked: ${userMessage.slice(0, 500)}\nSakhi replied: ${assistantResponse.slice(0, 600)}`,
        },
      ],
      maxTokens: 200,
      temperature: 0.6,
      jsonMode: true,
    });
    const data = JSON.parse(raw) as { suggestions?: string[] };
    return (data.suggestions || []).slice(0, 3);
  } catch {
    return [];
  }
}

function assertAiAvailable(): void {
  if (!isAiConfigured()) {
    throw new AppError('Sakhi is temporarily unavailable. Please try again later.', 503);
  }
}

function isSchemaUnavailableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === 'PGRST205'
    || error.message?.includes('Could not find the table') === true
    || error.message?.includes('schema cache') === true
  );
}

async function resolveConversation(
  supabase: SupabaseClient,
  userId: string,
  message: string,
  conversationId?: string,
): Promise<{ id: string; preferredLanguage?: SakhiLanguage; ephemeral?: boolean }> {
  if (conversationId) {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('id, context_summary')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

  if (error || !data) {
    if (isSchemaUnavailableError(error)) {
      const mem = conversationId
        ? memoryGetConversation(userId, conversationId)
        : null;
      if (mem) {
        const meta = parseConversationMeta(mem.contextSummary);
        return { id: mem.id, preferredLanguage: meta.preferredLanguage as SakhiLanguage | undefined, ephemeral: true };
      }
      const created = memoryCreateConversation(userId, message);
      return { id: created.id, ephemeral: true };
    }
    throw new AppError('Conversation not found', 404);
  }

    const meta = parseConversationMeta(data.context_summary);
    return {
      id: data.id,
      preferredLanguage: meta.preferredLanguage as SakhiLanguage | undefined,
    };
  }

  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({
      user_id: userId,
      title: message.slice(0, 60),
    })
    .select('id')
    .single();

  if (error || !data) {
    if (isSchemaUnavailableError(error)) {
      const created = memoryCreateConversation(userId, message);
      return { id: created.id, ephemeral: true };
    }
    throw new AppError('Could not start conversation', 500);
  }

  return { id: data.id };
}

async function loadMessageHistory(
  supabase: SupabaseClient,
  conversationId: string,
  ephemeral?: boolean,
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  if (ephemeral) {
    return memoryGetMessages(conversationId)
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  }

  const { data, error } = await supabase
    .from('ai_messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(SAKHI_MAX_HISTORY);

  if (error && isSchemaUnavailableError(error)) {
    return memoryGetMessages(conversationId)
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  }

  return (data || [])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));
}

async function resolveSakhiLanguageAndPrompt(
  supabase: SupabaseClient,
  userId: string,
  message: string,
  conv: { preferredLanguage?: SakhiLanguage },
  languageHint?: SakhiLanguage,
): Promise<{ detectedLanguage: SakhiLanguage; systemPrompt: string; healthContext: Awaited<ReturnType<typeof buildHealthContext>> }> {
  const userPrefs = await fetchUserPersonalization(supabase, userId);
  const profileDefaultLang = languageCodeToSakhi(userPrefs.language) as SakhiLanguage;
  const detectedLanguage = languageHint || detectLanguage(message, conv.preferredLanguage ?? profileDefaultLang);

  const healthContext = await buildHealthContext(supabase, userId);
  const simpleNote = buildSimpleLanguageInstruction(userPrefs.simpleLanguage);
  const regionNote = buildRegionalContextInstruction(userPrefs.region);
  const systemPrompt =
    buildSakhiSystemPrompt(detectedLanguage, healthContext.summary)
    + (regionNote ? `\n\n${regionNote}` : '')
    + (simpleNote ? `\n\n${simpleNote}` : '');

  return { detectedLanguage, systemPrompt, healthContext };
}

export async function streamSakhiChat(
  options: StreamChatOptions,
  res: Response
): Promise<StreamChatResult> {
  assertAiAvailable();

  const { userId, supabase, message, conversationId, languageHint } = options;

  const conv = await resolveConversation(supabase, userId, message, conversationId);
  const { detectedLanguage, systemPrompt, healthContext } = await resolveSakhiLanguageAndPrompt(
    supabase, userId, message, conv, languageHint,
  );

  const history = await loadMessageHistory(supabase, conv.id, conv.ephemeral);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.role === 'user' ? wrapUserMessage(m.content) : m.content,
    })),
    { role: 'user', content: wrapUserMessage(message) },
  ];

  // Persist user message
  if (conv.ephemeral) {
    memoryAddMessage(conv.id, 'user', message);
  } else {
    await supabase.from('ai_messages').insert({
      conversation_id: conv.id,
      role: 'user',
      content: message,
    });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const sendEvent = (data: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent({ type: 'start', conversationId: conv.id, language: detectedLanguage });

  let fullResponse = '';

  try {
    for await (const chunk of streamChat({ messages, maxTokens: SAKHI_MAX_TOKENS, temperature: 0.75 })) {
      if (chunk.content) {
        fullResponse += chunk.content;
        sendEvent({ type: 'token', content: chunk.content });
      }
    }

    if (!fullResponse.trim()) {
      fullResponse = getFallbackMessage(detectedLanguage);
      sendEvent({ type: 'token', content: fullResponse });
    }

    // Persist assistant response
    if (conv.ephemeral) {
      memoryAddMessage(conv.id, 'assistant', fullResponse);
      memoryUpdateConversation(conv.id, {
        contextSummary: JSON.stringify({
          preferredLanguage: detectedLanguage,
          lastMessageAt: new Date().toISOString(),
          hasHealthContext: healthContext.hasData,
        }),
        updatedAt: new Date().toISOString(),
      });
    } else {
      await supabase.from('ai_messages').insert({
        conversation_id: conv.id,
        role: 'assistant',
        content: fullResponse,
      });

      await updateConversationMeta(supabase, conv.id, {
        preferredLanguage: detectedLanguage,
        lastMessageAt: new Date().toISOString(),
        hasHealthContext: healthContext.hasData,
      });
    }

    const suggestions = await generateSuggestedReplies(message, fullResponse, detectedLanguage);

    sendEvent({
      type: 'done',
      conversationId: conv.id,
      language: detectedLanguage,
      suggestions,
    });

    res.end();

    return {
      conversationId: conv.id,
      fullResponse,
      detectedLanguage,
    };
  } catch (err) {
    const isClientAbort = err instanceof Error && err.name === 'AbortError';
    const message =
      err instanceof AppError
        ? err.message
        : 'Sakhi encountered an issue. Please try again.';
    if (!isClientAbort && !fullResponse.trim()) {
      sendEvent({ type: 'error', message });
    }
    if (!res.writableEnded) {
      res.end();
    }
    if (!isClientAbort) {
      throw err instanceof AppError ? err : new AppError(message, 502);
    }
    return {
      conversationId: conv.id,
      fullResponse: fullResponse || '',
      detectedLanguage,
    };
  }
}

/** Non-streaming fallback for clients that don't support SSE */
export async function chatWithSakhi(
  options: StreamChatOptions
): Promise<StreamChatResult> {
  assertAiAvailable();

  const { userId, supabase, message, conversationId, languageHint } = options;

  const conv = await resolveConversation(supabase, userId, message, conversationId);
  const { detectedLanguage, systemPrompt, healthContext } = await resolveSakhiLanguageAndPrompt(
    supabase, userId, message, conv, languageHint,
  );

  const history = await loadMessageHistory(supabase, conv.id, conv.ephemeral);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.role === 'user' ? wrapUserMessage(m.content) : m.content,
    })),
    { role: 'user', content: wrapUserMessage(message) },
  ];

  if (conv.ephemeral) {
    memoryAddMessage(conv.id, 'user', message);
  } else {
    await supabase.from('ai_messages').insert({
      conversation_id: conv.id,
      role: 'user',
      content: message,
    });
  }

  let fullResponse: string;
  try {
    fullResponse = await completeChat({ messages, maxTokens: SAKHI_MAX_TOKENS, temperature: 0.75 });
  } catch {
    handleAiError(new Error('chat failed'));
  }

  fullResponse = fullResponse!.trim() || getFallbackMessage(detectedLanguage);

  if (conv.ephemeral) {
    memoryAddMessage(conv.id, 'assistant', fullResponse);
    memoryUpdateConversation(conv.id, {
      contextSummary: JSON.stringify({
        preferredLanguage: detectedLanguage,
        lastMessageAt: new Date().toISOString(),
        hasHealthContext: healthContext.hasData,
      }),
      updatedAt: new Date().toISOString(),
    });
  } else {
    await supabase.from('ai_messages').insert({
      conversation_id: conv.id,
      role: 'assistant',
      content: fullResponse,
    });

    await updateConversationMeta(supabase, conv.id, {
      preferredLanguage: detectedLanguage,
      lastMessageAt: new Date().toISOString(),
      hasHealthContext: healthContext.hasData,
    });
  }

  return {
    conversationId: conv.id,
    fullResponse,
    detectedLanguage,
  };
}

export async function listConversations(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('id, title, context_summary, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) {
    if (isSchemaUnavailableError(error)) {
      return memoryListConversations(userId).map((c) => ({
        id: c.id,
        title: c.title,
        updatedAt: c.updatedAt,
        ...parseConversationMeta(c.contextSummary),
      }));
    }
    throw new AppError('Failed to load conversations', 500);
  }

  return (data || []).map((c) => ({
    id: c.id,
    title: c.title,
    updatedAt: c.updated_at,
    ...parseConversationMeta(c.context_summary),
  }));
}

export async function getConversationMessages(
  supabase: SupabaseClient,
  userId: string,
  conversationId: string
) {
  const { data: conv, error: convError } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (convError && isSchemaUnavailableError(convError)) {
    const mem = memoryGetConversation(userId, conversationId);
    if (!mem) throw new AppError('Conversation not found', 404);
    return memoryGetMessages(conversationId).map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      created_at: m.createdAt,
    }));
  }

  if (!conv) throw new AppError('Conversation not found', 404);

  const { data, error } = await supabase
    .from('ai_messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw new AppError('Failed to load messages', 500);
  return data || [];
}

function getFallbackMessage(language: SakhiLanguage): string {
  const fallbacks: Record<SakhiLanguage, string> = {
    English: "I'm here for you, though I'm having a little trouble finding the right words right now. Could you try asking again?",
    Hindi: 'मैं यहाँ हूँ, लेकिन अभी मुझे सही शब्द नहीं मिल रहे। क्या आप फिर से पूछ सकती हैं?',
    Tamil: 'நான் இங்கே இருக்கிறேன், ஆனால் சரியான வார்த்தைகள் கிடைக்கவில்லை. மீண்டும் கேட்க முடியுமா?',
    Telugu: 'నేను ఇక్కడ ఉన్నాను, కానీ సరైన మాటలు రాలేదు. మళ్ళీ అడగగలరా?',
    Kannada: 'ನಾನು ಇಲ್ಲಿದ್ದೇನೆ, ಆದರೆ ಸರಿಯಾದ ಪದಗಳು ಸಿಗುತ್ತಿಲ್ಲ. ಮತ್ತೆ ಕೇಳಬಹುದೇ?',
    Malayalam: 'ഞാൻ ഇവിടെയുണ്ട്, പക്ഷേ ശരിയായ വാക്കുകൾ കിട്ടുന്നില്ല. വീണ്ടും ചോദിക്കാമോ?',
    Bengali: 'আমি এখানে আছি, কিন্তু সঠিক কথা খুঁজে পাচ্ছি না। আবার জিজ্ঞেস করতে পারেন?',
    Marathi: 'मी इथे आहे, पण योग्य शब्द सापडत नाहीत. पुन्हा विचारू शकता का?',
    Gujarati: 'હું અહીં છું, પણ યોગ્ય શબ્દો મળતા નથી. ફરી પૂછી શકો?',
    Punjabi: 'ਮੈਂ ਇੱਥੇ ਹਾਂ, ਪਰ ਸਹੀ ਸ਼ਬਦ ਨਹੀਂ ਮਿਲ ਰਹੇ। ਕੀ ਤੁਸੀਂ ਦੁਬਾਰਾ ਪੁੱਛ ਸਕਦੇ ਹੋ?',
  };
  return fallbacks[language] || fallbacks.English;
}
