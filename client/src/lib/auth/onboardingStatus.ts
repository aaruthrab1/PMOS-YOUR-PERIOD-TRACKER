import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/supabase';

import { isDemoMode, isDemoOnboardingComplete } from '@/lib/demoMode';

/** Single source of truth for onboarding completion checks (profile row + auth metadata). */
export function isOnboardingComplete(
  profile: Profile | null | undefined,
  user: User | null | undefined,
): boolean {
  if (isDemoMode() && isDemoOnboardingComplete()) return true;
  if (profile?.onboarding_completed === true) return true;
  const meta = user?.user_metadata?.onboarding_completed;
  return meta === true || meta === 'true';
}

export function logOnboardingState(
  label: string,
  user: User | null | undefined,
  profile: Profile | null | undefined,
): void {
  console.info(`[onboarding] ${label}`, {
    sessionUserId: user?.id ?? null,
    profileId: profile?.id ?? null,
    profileOnboardingCompleted: profile?.onboarding_completed ?? null,
    metadataOnboardingCompleted: user?.user_metadata?.onboarding_completed ?? null,
    resolvedComplete: isOnboardingComplete(profile, user),
  });
}
