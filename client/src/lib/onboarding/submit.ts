import { saveOnboardingProfile, updatePreferences } from '@/lib/db/profiles';
import { supabase } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/db/crud';
import { isMissingTableError, formatSupabaseError } from '@/lib/db/schemaCompat';
import { logOnboardingState } from '@/lib/auth/onboardingStatus';
import { saveQuizResult } from '@/lib/db/quizResults';
import { clearOnboardingCache } from './storage';
import type { OnboardingData } from './types';
import type { Json, Profile } from '@/types/supabase';

async function createOnboardingPeriodLog(data: OnboardingData): Promise<void> {
  if (!data.lastPeriodDate) return;

  const userId = await getCurrentUserId();
  const minimal = {
    user_id: userId,
    period_start: data.lastPeriodDate,
    symptoms: data.commonSymptoms,
  };

  const { error } = await supabase.from('period_logs').insert(minimal as never);
  if (error && !isMissingTableError(error) && error.code !== 'PGRST204') {
    console.warn('[onboarding] period_logs insert skipped:', formatSupabaseError(error));
  }
}

export async function submitOnboarding(data: OnboardingData): Promise<Profile> {
  const { data: { user: beforeUser } } = await supabase.auth.getUser();
  logOnboardingState('before save', beforeUser, null);

  const savedProfile = await saveOnboardingProfile(data);

  const { data: { user: afterUser } } = await supabase.auth.getUser();
  logOnboardingState('after save', afterUser, savedProfile);

  await createOnboardingPeriodLog(data).catch((err) => {
    console.warn('[onboarding] period log non-blocking:', err);
  });

  const answers: Json = {
    fullName: data.fullName,
    ageRange: data.ageRange,
    region: data.region,
    healthGoals: data.healthGoals,
    lastPeriodDate: data.lastPeriodDate,
    cycleRegularity: data.cycleRegularity,
    energyLevel: data.energyLevel,
    commonSymptoms: data.commonSymptoms,
  };

  try {
    await saveQuizResult({
      quiz_type: 'onboarding_v2',
      answers,
      recommendations: data.healthGoals.slice(0, 3),
      score: data.energyLevel,
    });
  } catch (err) {
    console.warn('[onboarding] quiz_results non-blocking:', err);
  }

  const browserLang = typeof navigator !== 'undefined'
    ? (navigator.language?.slice(0, 2) ?? 'en')
    : 'en';
  const langCode = ['hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa'].includes(browserLang)
    ? browserLang
    : 'en';

  await updatePreferences({ language: langCode }).catch(() => {});

  try {
    await supabase.auth.updateUser({ data: { locale: langCode } });
  } catch {
    /* locale stored in auth metadata when profiles.locale column is absent */
  }

  clearOnboardingCache();
  return savedProfile;
}
