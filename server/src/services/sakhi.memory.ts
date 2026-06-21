/** In-memory chat persistence when ai_conversations / ai_messages tables are missing (demo fallback). */

import { randomUUID } from 'crypto';

export interface MemoryConversation {
  id: string;
  userId: string;
  title: string;
  contextSummary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MemoryMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

const conversations = new Map<string, MemoryConversation>();
const messages = new Map<string, MemoryMessage[]>();

export function memoryCreateConversation(userId: string, title: string): MemoryConversation {
  const now = new Date().toISOString();
  const conv: MemoryConversation = {
    id: randomUUID(),
    userId,
    title: title.slice(0, 60) || 'New conversation',
    contextSummary: null,
    createdAt: now,
    updatedAt: now,
  };
  conversations.set(conv.id, conv);
  messages.set(conv.id, []);
  return conv;
}

export function memoryGetConversation(userId: string, conversationId: string): MemoryConversation | null {
  const conv = conversations.get(conversationId);
  return conv && conv.userId === userId ? conv : null;
}

export function memoryListConversations(userId: string): MemoryConversation[] {
  return [...conversations.values()]
    .filter((c) => c.userId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 20);
}

export function memoryAddMessage(
  conversationId: string,
  role: MemoryMessage['role'],
  content: string,
): MemoryMessage {
  const msg: MemoryMessage = {
    id: randomUUID(),
    conversationId,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
  const list = messages.get(conversationId) ?? [];
  list.push(msg);
  messages.set(conversationId, list);
  const conv = conversations.get(conversationId);
  if (conv) conv.updatedAt = msg.createdAt;
  return msg;
}

export function memoryGetMessages(conversationId: string): MemoryMessage[] {
  return messages.get(conversationId) ?? [];
}

export function memoryUpdateConversation(
  conversationId: string,
  patch: Partial<Pick<MemoryConversation, 'contextSummary' | 'updatedAt'>>,
): void {
  const conv = conversations.get(conversationId);
  if (!conv) return;
  if (patch.contextSummary !== undefined) conv.contextSummary = patch.contextSummary;
  if (patch.updatedAt) conv.updatedAt = patch.updatedAt;
}
