import { Router } from 'express';
import {
  getSymptoms,
  createSymptomEntry,
  updateSymptomEntry,
  deleteSymptomEntry,
} from '../controllers/symptoms.controller.js';

export const symptomsRouter = Router();

symptomsRouter.get('/', getSymptoms);
symptomsRouter.post('/', createSymptomEntry);
symptomsRouter.patch('/:id', updateSymptomEntry);
symptomsRouter.delete('/:id', deleteSymptomEntry);
