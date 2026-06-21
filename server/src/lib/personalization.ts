/** Server-side personalization helpers for AI services */

export const SAKHI_LANGUAGE_NAMES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada',
  'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Punjabi',
] as const;

export type SakhiLanguageName = (typeof SAKHI_LANGUAGE_NAMES)[number];

const CODE_TO_SAKHI: Record<string, SakhiLanguageName> = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
  bn: 'Bengali',
  mr: 'Marathi',
  gu: 'Gujarati',
  pa: 'Punjabi',
};

export interface UserPersonalizationPrefs {
  language: string;
  simpleLanguage: boolean;
  region: string | null;
  locale: string | null;
}

export async function fetchUserPersonalization(
  supabase: import('@supabase/supabase-js').SupabaseClient,
  userId: string,
): Promise<UserPersonalizationPrefs> {
  const [profileResult, prefsResult] = await Promise.all([
    supabase.from('profiles').select('locale, region').eq('id', userId).single(),
    supabase.from('user_preferences').select('language, simple_language').eq('user_id', userId).single(),
  ]);

  const profile = profileResult.data;
  const prefs = prefsResult.data as { language?: string; simple_language?: boolean } | null;

  return {
    language: prefs?.language ?? profile?.locale ?? 'en',
    simpleLanguage: prefs?.simple_language ?? false,
    region: profile?.region ?? null,
    locale: profile?.locale ?? null,
  };
}

export function languageCodeToSakhi(code: string | null | undefined): SakhiLanguageName {
  if (!code) return 'English';
  if (code in CODE_TO_SAKHI) return CODE_TO_SAKHI[code];
  const match = SAKHI_LANGUAGE_NAMES.find((n) => n.toLowerCase() === code.toLowerCase());
  return match ?? 'English';
}

export function buildSimpleLanguageInstruction(simpleLanguage: boolean): string {
  if (!simpleLanguage) return '';
  return `
SIMPLE LANGUAGE MODE — ACTIVE:
- Replace medical jargon with plain, everyday language
- Example: "Insulin resistance" → "Your body has trouble using sugar properly"
- Example: "Ovulation" → "Release of an egg"
- Example: "Amenorrhea" → "Missing periods"
- Keep tone warm and accessible`;
}

export function buildRegionalContextInstruction(region: string | null): string {
  if (!region) return '';
  return `User region: ${region} India. When giving food or lifestyle examples, prefer culturally relevant options for this region when appropriate.`;
}

export function buildLanguageInstruction(languageCode: string): string {
  const sakhi = languageCodeToSakhi(languageCode);
  if (sakhi === 'English') return 'Respond in English unless the user writes in another language.';
  return `User preferred language: ${sakhi}. Generate all content in ${sakhi} unless the user explicitly uses another language.`;
}
