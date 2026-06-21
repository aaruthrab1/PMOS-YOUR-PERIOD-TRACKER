import { Router } from 'express';
import {
  getSymptomTrends,
  getSymptomSummary,
  getCycleInsights,
} from '../controllers/insights.controller.js';

export const insightsRouter = Router();

insightsRouter.get('/trends', getSymptomTrends);
insightsRouter.get('/summary', getSymptomSummary);
insightsRouter.get('/cycle', getCycleInsights);
