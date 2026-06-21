import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { sakhiRouter } from './sakhi.routes.js';
import { chatRouter } from './chat.routes.js';
import { aiRouter } from './ai.routes.js';
import { insightsRouter } from './insights.routes.js';
import { reportsRouter } from './reports.routes.js';
import { symptomsRouter } from './symptoms.routes.js';

export const apiRouter = Router();

apiRouter.use('/symptoms', authenticate, symptomsRouter);
apiRouter.use('/insights', authenticate, insightsRouter);
apiRouter.use('/sakhi', authenticate, sakhiRouter);
apiRouter.use('/chat', authenticate, chatRouter);
apiRouter.use('/ai', authenticate, aiRouter);
apiRouter.use('/reports', authenticate, reportsRouter);
