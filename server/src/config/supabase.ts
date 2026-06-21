import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  || process.env.SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials not configured — server will fail on DB operations');
} else if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
  console.warn('[supabase] SUPABASE_SERVICE_ROLE_KEY missing — using anon key for admin client (dev only)');
}

export type Supabase = SupabaseClient;

export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(
    supabaseUrl || '',
    process.env.SUPABASE_ANON_KEY || '',
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    }
  );
}
