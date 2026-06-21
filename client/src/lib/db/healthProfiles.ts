import { getCurrentUserId, upsertRecord } from '@/lib/db/crud';
import { supabase } from '@/lib/supabase';

export interface HealthProfileRow {
  id: string;
  user_id: string;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: string | null;
  sleep_avg_hours: number | null;
  health_goals: string[];
  symptoms: unknown;
  created_at: string;
  updated_at: string;
}

export async function getHealthProfile(userId?: string): Promise<HealthProfileRow | null> {
  const uid = userId ?? (await getCurrentUserId());
  const { data, error } = await supabase
    .from('health_profiles')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();

  if (error) throw error;
  return data as HealthProfileRow | null;
}

export async function updateHealthProfile(
  updates: Partial<Omit<HealthProfileRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
): Promise<HealthProfileRow> {
  const userId = await getCurrentUserId();
  return upsertRecord<HealthProfileRow>(
    'health_profiles',
    { user_id: userId, ...updates },
    'user_id',
  );
}
