import { Router } from 'express';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { chatController, generateReportSummary } from '../controllers/ai.controller.js';

export const aiRouter = Router();

aiRouter.use(aiRateLimiter);
aiRouter.post('/chat', chatController);
aiRouter.post('/report-summary', generateReportSummary);
