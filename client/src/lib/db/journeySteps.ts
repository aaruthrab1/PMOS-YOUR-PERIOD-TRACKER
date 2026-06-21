import { getCurrentUserId, upsertRecord } from '@/lib/db/crud';
import { supabase } from '@/lib/supabase';
import type { JourneyStepId, JourneyStepState } from '@/lib/care/types';

export interface JourneyStepRow {
  id: string;
  user_id: string;
  step_id: string;
  completed: boolean;
  date_completed: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function listJourneySteps(userId?: string): Promise<JourneyStepRow[]> {
  const uid = userId ?? (await getCurrentUserId());
  const { data, error } = await supabase
    .from('journey_steps')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as JourneyStepRow[];
}

export async function upsertJourneyStep(
  stepId: JourneyStepId,
  updates: Partial<Pick<JourneyStepState, 'completed' | 'notes'>> & { completedDate?: string | null },
): Promise<JourneyStepRow> {
  const userId = await getCurrentUserId();
  return upsertRecord<JourneyStepRow>(
    'journey_steps',
    {
      user_id: userId,
      step_id: stepId,
      completed: updates.completed ?? false,
      date_completed: updates.completedDate ?? null,
      notes: updates.notes ?? null,
    },
    'user_id,step_id',
  );
}

export function rowsToProgress(rows: JourneyStepRow[]): Record<JourneyStepId, JourneyStepState> {
  const base = {} as Record<JourneyStepId, JourneyStepState>;
  for (const row of rows) {
    base[row.step_id as JourneyStepId] = {
      completed: row.completed,
      completedDate: row.date_completed,
      notes: row.notes ?? '',
    };
  }
  return base;
}
