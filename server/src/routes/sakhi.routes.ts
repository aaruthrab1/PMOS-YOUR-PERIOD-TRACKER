import { Router } from 'express';
import { sakhiRateLimiter } from '../middleware/rateLimiter.js';
import {
  sakhiStreamController,
  listConversationsController,
  getMessagesController,
  newConversationController,
  mythCheckController,
} from '../controllers/sakhi.controller.js';

export const sakhiRouter = Router();

sakhiRouter.use(sakhiRateLimiter);

sakhiRouter.post('/myth-check', mythCheckController);
sakhiRouter.post('/chat', sakhiStreamController);
sakhiRouter.get('/conversations', listConversationsController);
sakhiRouter.post('/conversations', newConversationController);
sakhiRouter.get('/conversations/:id/messages', getMessagesController);
