import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../utils/AppError.js';

interface CreateEntryInput {
  loggedDate: string;
  cyclePhase?: string;
  mood?: string;
  energyLevel?: number;
  sleepHours?: number;
  sleepQuality?: number;
  notes?: string;
  triggers?: string[];
  symptoms?: Array<{
    symptomName: string;
    category: string;
    severity: string;
    durationHours?: number;
    notes?: string;
  }>;
}

export async function fetchSymptoms(
  supabase: SupabaseClient,
  userId: string,
  startDate?: string,
  endDate?: string
) {
  let query = supabase
    .from('symptom_entries')
    .select(`
      *,
      symptom_details (*)
    `)
    .eq('user_id', userId)
    .order('logged_date', { ascending: false });

  if (startDate) query = query.gte('logged_date', startDate);
  if (endDate) query = query.lte('logged_date', endDate);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function insertSymptomEntry(
  supabase: SupabaseClient,
  userId: string,
  input: CreateEntryInput
) {
  const { data: entry, error: entryError } = await supabase
    .from('symptom_entries')
    .upsert({
      user_id: userId,
      logged_date: input.loggedDate,
      cycle_phase: input.cyclePhase,
      mood: input.mood,
      energy_level: input.energyLevel,
      sleep_hours: input.sleepHours,
      sleep_quality: input.sleepQuality,
      notes: input.notes,
      triggers: input.triggers,
    }, { onConflict: 'user_id,logged_date' })
    .select()
    .single();

  if (entryError) throw new AppError('Failed to create symptom entry', 500);

  if (input.symptoms?.length) {
    await supabase.from('symptom_details').delete().eq('entry_id', entry.id);

    const { error: detailsError } = await supabase.from('symptom_details').insert(
      input.symptoms.map((s) => ({
        entry_id: entry.id,
        symptom_name: s.symptomName,
        category: s.category,
        severity: s.severity,
        duration_hours: s.durationHours,
        notes: s.notes,
      }))
    );

    if (detailsError) throw new AppError('Failed to save symptom details', 500);
  }

  return fetchEntryById(supabase, userId, entry.id);
}

export async function modifySymptomEntry(
  supabase: SupabaseClient,
  userId: string,
  entryId: string,
  input: Partial<CreateEntryInput>
) {
  const updates: Record<string, unknown> = {};
  if (input.cyclePhase) updates.cycle_phase = input.cyclePhase;
  if (input.mood) updates.mood = input.mood;
  if (input.energyLevel !== undefined) updates.energy_level = input.energyLevel;
  if (input.sleepHours !== undefined) updates.sleep_hours = input.sleepHours;
  if (input.sleepQuality !== undefined) updates.sleep_quality = input.sleepQuality;
  if (input.notes !== undefined) updates.notes = input.notes;
  if (input.triggers) updates.triggers = input.triggers;

  if (Object.keys(updates).length) {
    const { error } = await supabase
      .from('symptom_entries')
      .update(updates)
      .eq('id', entryId)
      .eq('user_id', userId);

    if (error) throw new AppError('Failed to update entry', 500);
  }

  if (input.symptoms) {
    await supabase.from('symptom_details').delete().eq('entry_id', entryId);
    if (input.symptoms.length) {
      await supabase.from('symptom_details').insert(
        input.symptoms.map((s) => ({
          entry_id: entryId,
          symptom_name: s.symptomName,
          category: s.category,
          severity: s.severity,
          duration_hours: s.durationHours,
          notes: s.notes,
        }))
      );
    }
  }

  return fetchEntryById(supabase, userId, entryId);
}

export async function removeSymptomEntry(
  supabase: SupabaseClient,
  userId: string,
  entryId: string
) {
  const { error } = await supabase
    .from('symptom_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);

  if (error) throw new AppError('Failed to delete entry', 500);
}

async function fetchEntryById(
  supabase: SupabaseClient,
  userId: string,
  entryId: string
) {
  const { data, error } = await supabase
    .from('symptom_entries')
    .select(`*, symptom_details (*)`)
    .eq('id', entryId)
    .eq('user_id', userId)
    .single();

  if (error) throw new AppError('Entry not found', 404);
  return data;
}
