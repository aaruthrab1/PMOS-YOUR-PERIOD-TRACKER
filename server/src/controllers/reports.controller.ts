import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/authenticate.js';
import { AppError } from '../utils/AppError.js';
import {
  listReports,
  createDoctorReport,
  fetchReport,
  patchReport,
  removeReport,
} from '../services/reports.service.js';

const createReportSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  dateRangeStart: z.string(),
  dateRangeEnd: z.string(),
});

const updateReportSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  summary: z.string().optional(),
  keySymptoms: z.array(z.unknown()).optional(),
  questionsForDoctor: z.array(z.string()).optional(),
  sections: z.record(z.unknown()).optional(),
  doctorPrep: z.record(z.unknown()).optional(),
  riskSummary: z.array(z.unknown()).optional(),
  status: z.enum(['draft', 'ready', 'shared']).optional(),
});

export const getReports: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const reports = await listReports(authReq.supabase, authReq.userId);
    res.json(reports);
  } catch (err) {
    next(err);
  }
};

export const createReport: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsed = createReportSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid request body', 400, parsed.error.flatten());
    }

    const report = await createDoctorReport(authReq.supabase, authReq.userId, parsed.data);
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
};

export const getReportById: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const reportId = req.params.id as string;
    const report = await fetchReport(authReq.supabase, authReq.userId, reportId);
    if (!report) {
      throw new AppError('Report not found', 404);
    }
    res.json(report);
  } catch (err) {
    next(err);
  }
};

export const updateReport: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const parsed = updateReportSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError('Invalid request body', 400, parsed.error.flatten());
    }

    const reportId = req.params.id as string;
    const report = await patchReport(authReq.supabase, authReq.userId, reportId, parsed.data);
    res.json(report);
  } catch (err) {
    next(err);
  }
};

export const deleteReport: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const reportId = req.params.id as string;
    await removeReport(authReq.supabase, authReq.userId, reportId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
