import type { RequestHandler } from 'express';
import type { AuthenticatedRequest } from '../middleware/authenticate.js';
import {
  getTrends,
  getSummary,
  getCycleData,
} from '../services/insights.service.js';

export const getSymptomTrends: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const days = parseInt(req.query.days as string) || 30;
    const trends = await getTrends(authReq.supabase, authReq.userId, days);
    res.json(trends);
  } catch (err) {
    next(err);
  }
};

export const getSymptomSummary: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const days = parseInt(req.query.days as string) || 30;
    const summary = await getSummary(authReq.supabase, authReq.userId, days);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

export const getCycleInsights: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const insights = await getCycleData(authReq.supabase, authReq.userId);
    res.json(insights);
  } catch (err) {
    next(err);
  }
};
