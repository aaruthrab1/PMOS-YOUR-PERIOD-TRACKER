import type { PostgrestError } from '@supabase/supabase-js';
import type { OnboardingData } from '@/lib/onboarding/types';
import type { ProfileUpdate } from '@/types/supabase';

/** Human-readable Supabase/PostgREST error for UI and logs */
export function formatSupabaseError(error: PostgrestError): string {
  const parts = [`[${error.code}] ${error.message}`];
  if (error.details) parts.push(String(error.details));
  if (error.hint) parts.push(`Hint: ${error.hint}`);
  return parts.join(' — ');
}

export function isMissingColumnError(error: PostgrestError | null): boolean {
  return error?.code === 'PGRST204';
}

export function isMissingTableError(error: PostgrestError | null): boolean {
  return error?.code === 'PGRST205';
}

export function ageFromRange(ageRange: string): number | null {
  const map: Record<string, number> = {
    '18–24': 21,
    '25–34': 30,
    '35–44': 40,
    '45–54': 50,
    '55+': 55,
  };
  return map[ageRange] ?? null;
}

export function productionProfileUpdate(data: OnboardingData): ProfileUpdate {
  return {
    full_name: data.fullName.trim(),
    age_range: data.ageRange,
    region: data.region || null,
    health_goals: data.healthGoals,
    last_period_date: data.lastPeriodDate || null,
    cycle_regularity: data.cycleRegularity,
    energy_level: data.energyLevel,
    common_symptoms: data.commonSymptoms,
    conditions: data.commonSymptoms.filter((s) =>
      ['Irregular periods', 'Heavy flow', 'Acne'].includes(s),
    ),
    onboarding_completed: true,
  };
}

/** Maps onboarding data to the legacy profiles table (full_name, age, height, weight). */
export function legacyProfileUpdate(data: OnboardingData): Record<string, unknown> {
  const patch: Record<string, unknown> = {
    full_name: data.fullName.trim(),
  };
  const age = ageFromRange(data.ageRange);
  if (age != null) patch.age = age;
  if (data.heightCm != null) patch.height = data.heightCm;
  if (data.weightKg != null) patch.weight = data.weightKg;
  return patch;
}

export function onboardingUserMetadata(data: OnboardingData): Record<string, unknown> {
  return {
    onboarding_completed: true,
    full_name: data.fullName.trim(),
    age_range: data.ageRange,
    region: data.region || null,
    health_goals: data.healthGoals,
    last_period_date: data.lastPeriodDate || null,
    cycle_regularity: data.cycleRegularity,
    energy_level: data.energyLevel,
    common_symptoms: data.commonSymptoms,
  };
}
