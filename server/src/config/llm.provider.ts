import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SAKHI_MODEL, SAKHI_MAX_TOKENS } from './sakhi.prompt.js';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type CompletionOptions = {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  jsonMode?: boolean;
};

export type StreamChunk = { content: string; done?: boolean };

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

function geminiClient(): GoogleGenerativeAI | null {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

function toGeminiMessages(messages: ChatMessage[]) {
  const system = messages.find((m) => m.role === 'system')?.content ?? '';
  const turns = messages.filter((m) => m.role !== 'system');
  return { system, turns };
}

function isGroqRetryable(_err: unknown): boolean {
  return true;
}

export async function completeChat(options: CompletionOptions): Promise<string> {
  const { messages, maxTokens = SAKHI_MAX_TOKENS, temperature = 0.75, jsonMode = false } = options;

  try {
    const completion = await groq.chat.completions.create({
      model: SAKHI_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
      ...(jsonMode ? { response_format: { type: 'json_object' as const } } : {}),
    });
    return completion.choices[0]?.message?.content?.trim() ?? '';
  } catch (groqErr) {
    const gemini = geminiClient();
    if (!gemini) throw groqErr;

    const { system, turns } = toGeminiMessages(messages);
    const model = gemini.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      systemInstruction: system || undefined,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    });

    const history = turns.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.content }],
    }));
    const last = turns[turns.length - 1];
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(last?.content ?? '');
    return result.response.text().trim();
  }
}

export async function* streamChat(options: CompletionOptions): AsyncGenerator<StreamChunk> {
  const { messages, maxTokens = SAKHI_MAX_TOKENS, temperature = 0.75 } = options;

  try {
    const stream = await groq.chat.completions.create({
      model: SAKHI_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? '';
      if (content) yield { content };
    }
    yield { content: '', done: true };
    return;
  } catch (groqErr) {
    if (!isGroqRetryable(groqErr)) throw groqErr;
    const text = await completeChat({ messages, maxTokens, temperature });
    if (text) yield { content: text };
    yield { content: '', done: true };
  }
}

export function isLlmConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim() || process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim());
}
