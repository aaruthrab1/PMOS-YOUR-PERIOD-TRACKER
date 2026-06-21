import { Router } from 'express';
import {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
} from '../controllers/reports.controller.js';

export const reportsRouter = Router();

reportsRouter.get('/', getReports);
reportsRouter.post('/', createReport);
reportsRouter.get('/:id', getReportById);
reportsRouter.patch('/:id', updateReport);
reportsRouter.delete('/:id', deleteReport);
