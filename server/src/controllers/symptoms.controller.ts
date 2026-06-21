import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/authenticate.js';
import { AppError } from '../utils/AppError.js';
import {
  fetchSymptoms,
  insertSymptomEntry,
  modifySymptomEntry,
  removeSymptomEntry,
} from '../services/symptoms.service.js';

const createEntrySchema = z.object({
  loggedDate: z.string(),
  cyclePhase: z.enum(['menstrual', 'follicular', 'ovulation', 'luteal', 'unknown']).optional(),
  mood: z.enum(['calm', 'anxious', 'irritable', 'sad', 'energetic', 'foggy', 'neutral']).optional(),
  energyLevel: z.number().min(1).max(10).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  sleepQuality: z.number().min(1).max(10).optional(),
  notes: z.string().max(2000).optional(),
  triggers: z.array(z.string()).optional(),
  symptoms: z.array(z.object({
    symptomName: z.string(),
    category: z.enum(['physical', 'emotional', 'cognitive', 'sleep', 'digestive', 'skin', 'energy']),
    severity: z.enum(['none', 'mild', 'moderate', 'severe']),
    durationHours: z.number().optional(),
    notes: z.string().optional(),
  })).optional(),
});

export const getSymptoms: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;
    const entries = await fetchSymptoms(authReq.supabase, authReq.userId, startDate, endDate);
    res.json(entries);
  } catch (err) {
    next(err);
  }
};

export const createSymptomEntry: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsed = createEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid request body', 400, parsed.error.flatten());
    }

    const entry = await insertSymptomEntry(authReq.supabase, authReq.userId, parsed.data);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};

export const updateSymptomEntry: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsed = createEntrySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid request body', 400, parsed.error.flatten());
    }

    const entryId = req.params.id as string;
    const entry = await modifySymptomEntry(authReq.supabase, authReq.userId, entryId, parsed.data);
    res.json(entry);
  } catch (err) {
    next(err);
  }
};

export const deleteSymptomEntry: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const entryId = req.params.id as string;
    await removeSymptomEntry(authReq.supabase, authReq.userId, entryId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
