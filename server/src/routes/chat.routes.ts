import { Router } from 'express';
import { sakhiRateLimiter } from '../middleware/rateLimiter.js';
import {
  sakhiStreamController,
  listConversationsController,
  getMessagesController,
  newConversationController,
  mythCheckController,
} from '../controllers/sakhi.controller.js';

/** Unified chat API — mirrors /api/sakhi for Next.js-style /api/chat consumers */
export const chatRouter = Router();

chatRouter.use(sakhiRateLimiter);

chatRouter.post('/', sakhiStreamController);
chatRouter.post('/myth-check', mythCheckController);
chatRouter.get('/conversations', listConversationsController);
chatRouter.post('/conversations', newConversationController);
chatRouter.get('/conversations/:id/messages', getMessagesController);
