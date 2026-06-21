import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/authenticate.js';
import { AppError } from '../utils/AppError.js';
import { chatWithAI, generateReportSummary as generateSummary } from '../services/ai.service.js';

const chatSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().uuid().optional(),
});

const reportSummarySchema = z.object({
  dateRangeStart: z.string(),
  dateRangeEnd: z.string(),
  symptoms: z.array(z.object({
    name: z.string(),
    severity: z.string(),
    frequency: z.number(),
  })),
  moodTrend: z.string().optional(),
  notes: z.string().optional(),
});

export const chatController: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid request body', 400, parsed.error.flatten());
    }

    const result = await chatWithAI(
      authReq.userId,
      authReq.supabase,
      parsed.data.message,
      parsed.data.conversationId
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const generateReportSummary: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsed = reportSummarySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid request body', 400, parsed.error.flatten());
    }

    const summary = await generateSummary(parsed.data);
    res.json({ summary });
  } catch (err) {
    next(err);
  }
};
