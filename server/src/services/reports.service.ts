import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../utils/AppError.js';
import { buildReportContext } from './report.context.js';
import { generateDoctorReport } from './report.ai.service.js';
import { fetchUserPersonalization } from '../lib/personalization.js';

export async function listReports(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from('doctor_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createDoctorReport(
  supabase: SupabaseClient,
  userId: string,
  input: { title?: string; dateRangeStart: string; dateRangeEnd: string },
) {
  const bundle = await buildReportContext(
    supabase,
    userId,
    input.dateRangeStart,
    input.dateRangeEnd,
  );

  const personalization = await fetchUserPersonalization(supabase, userId);
  const generated = await generateDoctorReport(bundle, personalization);

  const { data, error } = await supabase
    .from('doctor_reports')
    .insert({
      user_id: userId,
      title: input.title || 'Cyra Doctor Report',
      date_range_start: input.dateRangeStart,
      date_range_end: input.dateRangeEnd,
      summary: generated.narrativeSummary,
      key_symptoms: generated.sections.symptomTrends,
      questions_for_doctor: generated.questionsForDoctor,
      sections: generated.sections,
      doctor_prep: generated.doctorPrep,
      source_snapshot: bundle.snapshot,
      risk_summary: generated.riskSummary,
      status: 'ready',
    })
    .select()
    .single();

  if (error) throw new AppError('Failed to create report', 500);
  return data;
}

export async function fetchReport(
  supabase: SupabaseClient,
  userId: string,
  reportId: string,
) {
  const { data, error } = await supabase
    .from('doctor_reports')
    .select('*')
    .eq('id', reportId)
    .eq('user_id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function patchReport(
  supabase: SupabaseClient,
  userId: string,
  reportId: string,
  updates: Record<string, unknown>,
) {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.title) dbUpdates.title = updates.title;
  if (updates.summary) dbUpdates.summary = updates.summary;
  if (updates.keySymptoms) dbUpdates.key_symptoms = updates.keySymptoms;
  if (updates.questionsForDoctor) dbUpdates.questions_for_doctor = updates.questionsForDoctor;
  if (updates.sections) dbUpdates.sections = updates.sections;
  if (updates.doctorPrep) dbUpdates.doctor_prep = updates.doctorPrep;
  if (updates.riskSummary) dbUpdates.risk_summary = updates.riskSummary;
  if (updates.status) {
    dbUpdates.status = updates.status;
    if (updates.status === 'shared') dbUpdates.shared_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('doctor_reports')
    .update(dbUpdates)
    .eq('id', reportId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new AppError('Failed to update report', 500);
  return data;
}

export async function removeReport(
  supabase: SupabaseClient,
  userId: string,
  reportId: string,
): Promise<void> {
  const { error } = await supabase
    .from('doctor_reports')
    .delete()
    .eq('id', reportId)
    .eq('user_id', userId);

  if (error) throw new AppError('Failed to delete report', 500);
}
