import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: { 'X-Client-Info': 'cyra-web' },
  },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const AUTH_REDIRECT_URL = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`;

/** Active Supabase project config (for diagnostics). */
export function getSupabaseConfig() {
  let projectRef = '';
  try {
    const payload = supabaseAnonKey.split('.')[1];
    if (payload) {
      projectRef = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).ref ?? '';
    }
  } catch {
    // ignore decode errors
  }
  return {
    url: supabaseUrl,
    projectRef,
    anonKey: supabaseAnonKey,
    configured: isSupabaseConfigured,
  };
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export function logSupabaseAuthState(context: string, user: User | null) {
  if (!import.meta.env.DEV) return;
  const cfg = getSupabaseConfig();
  console.info(`[supabase:${context}]`, {
    url: cfg.url,
    projectRef: cfg.projectRef,
    userId: user?.id ?? null,
  });
}
