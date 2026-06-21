/**
 * Validates required environment variables at startup.
 * Warns in development; logs clearly when AI/DB features are degraded.
 */

const REQUIRED_FOR_AI = ['GROQ_API_KEY'] as const;
const AI_FALLBACK_KEYS = ['GOOGLE_GENERATIVE_AI_API_KEY'] as const;
const REQUIRED_FOR_DB = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const;

export interface EnvStatus {
  groqConfigured: boolean;
  geminiConfigured: boolean;
  supabaseConfigured: boolean;
  missing: string[];
}

export function validateEnv(): EnvStatus {
  const missing: string[] = [];

  for (const key of [...REQUIRED_FOR_AI, ...REQUIRED_FOR_DB]) {
    if (!process.env[key]?.trim()) {
      missing.push(key);
    }
  }

  const groqConfigured = Boolean(process.env.GROQ_API_KEY?.trim());
  const geminiConfigured = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim());
  const supabaseConfigured =
    Boolean(process.env.SUPABASE_URL?.trim()) &&
    Boolean(process.env.SUPABASE_ANON_KEY?.trim());

  if (!groqConfigured && !geminiConfigured) {
    console.warn('[env] GROQ_API_KEY and GOOGLE_GENERATIVE_AI_API_KEY missing — Sakhi AI will return 503');
  } else if (!groqConfigured) {
    console.warn('[env] GROQ_API_KEY missing — using Gemini fallback only');
  }
  if (!supabaseConfigured) {
    console.warn('[env] Supabase credentials incomplete — database operations may fail');
  }

  return { groqConfigured, geminiConfigured, supabaseConfigured, missing };
}

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim());
}

export function isAiConfigured(): boolean {
  return isGroqConfigured() || isGeminiConfigured();
}
