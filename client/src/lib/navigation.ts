import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/supabase';
import { isOnboardingComplete } from '@/lib/auth/onboardingStatus';

/** Route after successful authentication based on onboarding state */
export function getPostAuthRoute(
  profile?: Profile | null,
  user?: User | null,
): string {
  return isOnboardingComplete(profile, user) ? '/dashboard' : '/onboarding';
}
