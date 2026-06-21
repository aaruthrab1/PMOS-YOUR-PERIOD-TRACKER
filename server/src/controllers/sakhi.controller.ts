import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/authenticate.js';
import { AppError } from '../utils/AppError.js';
import { isValidSakhiLanguage } from '../utils/languageDetect.js';
import {
  streamSakhiChat,
  chatWithSakhi,
  listConversations,
  getConversationMessages,
  checkHealthMyth,
} from '../services/sakhi.service.js';
import type { SakhiLanguage } from '../config/sakhi.prompt.js';

const mythSchema = z.object({
  text: z.string().min(10).max(4000),
  language: z.string().optional(),
});

const chatSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().uuid().optional(),
  language: z.string().optional(),
  stream: z.boolean().optional().default(true),
});

export const sakhiStreamController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsed = chatSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError('Invalid request', 400, parsed.error.flatten());
    }

    const languageHint = parsed.data.language && isValidSakhiLanguage(parsed.data.language)
      ? (parsed.data.language as SakhiLanguage)
      : undefined;

    if (parsed.data.stream === false) {
      const result = await chatWithSakhi({
        userId: authReq.userId,
        supabase: authReq.supabase,
        message: parsed.data.message,
        conversationId: parsed.data.conversationId,
        languageHint,
      });
      res.json({
        conversationId: result.conversationId,
        message: result.fullResponse,
        language: result.detectedLanguage,
      });
      return;
    }

    await streamSakhiChat(
      {
        userId: authReq.userId,
        supabase: authReq.supabase,
        message: parsed.data.message,
        conversationId: parsed.data.conversationId,
        languageHint,
      },
      res
    );
  } catch (err) {
    if (!res.headersSent) {
      next(err);
    }
  }
};

export const listConversationsController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const conversations = await listConversations(authReq.supabase, authReq.userId);
    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

export const getMessagesController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const conversationId = req.params.id as string;
    const messages = await getConversationMessages(
      authReq.supabase,
      authReq.userId,
      conversationId
    );
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

export const mythCheckController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsed = mythSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid request', 400, parsed.error.flatten());
    }

    const languageHint = parsed.data.language && isValidSakhiLanguage(parsed.data.language)
      ? (parsed.data.language as SakhiLanguage)
      : undefined;

    const result = await checkHealthMyth(parsed.data.text, languageHint);

    await authReq.supabase.from('myth_checks').insert({
      user_id: authReq.userId,
      original_text: parsed.data.text,
      result: result.result as unknown as Record<string, unknown>,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const newConversationController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { data, error } = await authReq.supabase
      .from('ai_conversations')
      .insert({
        user_id: authReq.userId,
        title: 'New conversation',
      })
      .select('id, title, created_at')
      .single();

    if (error) throw new AppError('Failed to create conversation', 500);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};
