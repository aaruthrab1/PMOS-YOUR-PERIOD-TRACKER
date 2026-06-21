import type { User, PostgrestError, AuthError } from '@supabase/supabase-js';
import { supabase, getSupabaseConfig, logSupabaseAuthState } from '@/lib/supabase';
import { getCurrentUserId, DbError } from './crud';
import {
  formatSupabaseError,
  isMissingColumnError,
  legacyProfileUpdate,
  onboardingUserMetadata,
  productionProfileUpdate,
} from './schemaCompat';
import type { OnboardingData } from '@/lib/onboarding/types';
import type { Profile, ProfileUpdate, UserPreferences } from '@/types/supabase';

function asPostgrestError(error: unknown): PostgrestError | null {
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return error as PostgrestError;
  }
  return null;
}

function authErrorMessage(error: AuthError): string {
  return `[${error.name}] ${error.message}`;
}

function mergeProfileWithUser(profile: Profile | null, user: User | null): Profile | null {
  if (!profile && !user) return null;

  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const base = profile ?? {
    id: user!.id,
    email: user!.email ?? '',
    full_name: (meta.full_name as string) ?? null,
    avatar_url: null,
    date_of_birth: null,
    timezone: 'UTC',
    onboarding_completed: false,
    health_goals: [],
    conditions: [],
    auth_provider: null,
    locale: null,
    phone: null,
    age_range: null,
    region: null,
    cycle_regularity: null,
    energy_level: null,
    common_symptoms: [],
    last_period_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    ...base,
    full_name: base.full_name ?? (meta.full_name as string) ?? null,
    age_range: base.age_range ?? (meta.age_range as string) ?? null,
    region: base.region ?? (meta.region as string) ?? null,
    health_goals: base.health_goals?.length ? base.health_goals : (meta.health_goals as string[]) ?? [],
    cycle_regularity: base.cycle_regularity ?? (meta.cycle_regularity as string) ?? null,
    energy_level: base.energy_level ?? (meta.energy_level as number) ?? null,
    common_symptoms: base.common_symptoms?.length ? base.common_symptoms : (meta.common_symptoms as string[]) ?? [],
    last_period_date: base.last_period_date ?? (meta.last_period_date as string) ?? null,
    onboarding_completed:
      base.onboarding_completed === true
      || meta.onboarding_completed === true
      || meta.onboarding_completed === 'true',
  };
}

export async function ensureProfileRow(user: User): Promise<void> {
  const { data } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (data) return;

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    email: user.email ?? '',
    full_name: (user.user_metadata?.full_name as string) ?? '',
  } as never);

  if (error && error.code !== '23505') {
    console.warn('[profiles] ensureProfileRow:', formatSupabaseError(error));
  }
}

async function patchProfile(
  userId: string,
  email: string,
  updates: Record<string, unknown>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates as never)
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) throw error;

  if (data) {
    const { data: { user } } = await supabase.auth.getUser();
    return mergeProfileWithUser(data as Profile, user) as Profile;
  }

  const { data: inserted, error: insertError } = await supabase
    .from('profiles')
    .upsert({ id: userId, email, ...updates } as never, { onConflict: 'id' })
    .select()
    .single();

  if (insertError) throw insertError;
  const { data: { user } } = await supabase.auth.getUser();
  return mergeProfileWithUser(inserted as Profile, user) as Profile;
}

export async function getProfile(): Promise<Profile | null> {
  const userId = await getCurrentUserId();
  const { data: { user } } = await supabase.auth.getUser();
  logSupabaseAuthState('getProfile', user);
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw new DbError(formatSupabaseError(error), error.code, error.details);
  return mergeProfileWithUser(data as Profile | null, user);
}

export async function updateProfile(updates: ProfileUpdate): Promise<Profile> {
  const userId = await getCurrentUserId();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new DbError('Not authenticated', '401');

  try {
    return await patchProfile(userId, user.email ?? '', updates as Record<string, unknown>);
  } catch (error) {
    const pg = asPostgrestError(error);
    throw new DbError(
      pg ? formatSupabaseError(pg) : 'Profile update failed',
      pg?.code,
      pg?.details,
    );
  }
}

/**
 * Persist onboarding profile.
 * Failing file/line when production schema is not deployed:
 *   profiles.ts patchProfile() update — [PGRST204] Could not find the 'age_range' column of 'profiles'
 */
export async function saveOnboardingProfile(data: OnboardingData): Promise<Profile> {
  const cfg = getSupabaseConfig();
  const userId = await getCurrentUserId();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new DbError(
      `Not authenticated — sign in again${userError ? `: ${userError.message}` : ''}`,
      '401',
    );
  }

  console.info('[onboarding] saveOnboardingProfile', {
    userId,
    url: cfg.url,
    projectRef: cfg.projectRef,
  });

  const { error: metaError } = await supabase.auth.updateUser({
    data: onboardingUserMetadata(data),
  });
  if (metaError) {
    throw new DbError(authErrorMessage(metaError), metaError.name);
  }

  const { data: { user: afterMeta } } = await supabase.auth.getUser();
  console.info('[onboarding] after metadata save onboarding_completed=', afterMeta?.user_metadata?.onboarding_completed);

  await ensureProfileRow(user);

  try {
    return await patchProfile(userId, user.email ?? '', legacyProfileUpdate(data));
  } catch (legacyError) {
    const pgLegacy = asPostgrestError(legacyError);
    console.warn(
      '[onboarding] legacy profile update failed:',
      pgLegacy ? formatSupabaseError(pgLegacy) : legacyError,
    );
  }

  try {
    return await patchProfile(
      userId,
      user.email ?? '',
      productionProfileUpdate(data) as Record<string, unknown>,
    );
  } catch (prodError) {
    const pgProd = asPostgrestError(prodError);
    if (pgProd && !isMissingColumnError(pgProd)) {
      throw new DbError(formatSupabaseError(pgProd), pgProd.code, pgProd.details);
    }
    console.warn('[onboarding] production columns unavailable:', pgProd?.message);
  }

  const { data: refreshed } = await supabase.auth.getUser();
  const merged = mergeProfileWithUser(null, refreshed.user)!;
  return { ...merged, onboarding_completed: true };
}

export async function getPreferences(): Promise<UserPreferences | null> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase.from('user_preferences').select('*').eq('user_id', userId).maybeSingle();
  if (error) {
    if (error.code === 'PGRST205') return null;
    throw new DbError(formatSupabaseError(error), error.code, error.details);
  }
  return data;
}

export async function updatePreferences(updates: Partial<UserPreferences>): Promise<UserPreferences | null> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('user_preferences')
    .update(updates as never)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST205') return null;
    throw new DbError(formatSupabaseError(error), error.code, error.details);
  }
  return data;
}
