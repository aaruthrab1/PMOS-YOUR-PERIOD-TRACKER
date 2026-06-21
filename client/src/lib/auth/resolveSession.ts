import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, getSupabaseConfig, logSupabaseAuthState } from '@/lib/supabase';
import { isDemoMode } from '@/lib/demoMode';

export interface ResolvedAuth {
  user: User | null;
  session: Session | null;
}

function isInvalidSessionError(error: AuthError | null): boolean {
  if (!error) return false;
  if (error.status === 401 || error.status === 403) return true;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('invalid jwt')
    || msg.includes('jwt expired')
    || msg.includes('session not found')
    || msg.includes('user not found')
  );
}

/**
 * Validates the current auth state against Supabase Auth servers.
 * getSession() alone reads localStorage and can return a ghost user
 * when auth.users is empty or the JWT is stale/invalid.
 */
export async function resolveAuthUser(): Promise<ResolvedAuth> {
  const { data: { session: localSession } } = await supabase.auth.getSession();

  // Demo mode: trust local session — never clear ghost sessions or block UI
  if (isDemoMode()) {
    return { user: localSession?.user ?? null, session: localSession };
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    if (isInvalidSessionError(error)) {
      if (import.meta.env.DEV) {
        console.warn('[auth] Server rejected session — clearing stale local auth:', error?.message);
      }
      await supabase.auth.signOut();
      return { user: null, session: null };
    }
    // Local session exists but server returned no user — ghost session
    if (!user && localSession) {
      if (import.meta.env.DEV) {
        console.warn('[auth] Ghost session detected — clearing local auth');
      }
      await supabase.auth.signOut();
      return { user: null, session: null };
    }
    if (error && import.meta.env.DEV) {
      console.warn('[auth] getUser failed (keeping local session):', error.message);
    }
    return { user: localSession?.user ?? null, session: localSession };
  }

  const { data: { session } } = await supabase.auth.getSession();
  logSupabaseAuthState('resolveAuthUser', user);
  return { user, session: session ?? localSession };
}

export function logActiveSupabaseConfig(): void {
  if (!import.meta.env.DEV) return;
  const cfg = getSupabaseConfig();
  console.info('[auth] Active Supabase configuration', {
    url: cfg.url,
    projectRef: cfg.projectRef,
    configured: cfg.configured,
  });
}
