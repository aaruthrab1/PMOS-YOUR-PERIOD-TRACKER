import type { CyraLanguageCode, SakhiLanguageName } from './types';

export interface LanguageOption {
  code: CyraLanguageCode;
  label: string;
  nativeLabel: string;
  sakhiName: SakhiLanguageName;
}

export const CYRA_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', sakhiName: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', sakhiName: 'Hindi' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', sakhiName: 'Tamil' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', sakhiName: 'Telugu' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', sakhiName: 'Kannada' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം', sakhiName: 'Malayalam' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', sakhiName: 'Bengali' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', sakhiName: 'Marathi' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', sakhiName: 'Gujarati' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ', sakhiName: 'Punjabi' },
];

const CODE_TO_SAKHI = Object.fromEntries(
  CYRA_LANGUAGES.map((l) => [l.code, l.sakhiName]),
) as Record<CyraLanguageCode, SakhiLanguageName>;

const SAKHI_TO_CODE = Object.fromEntries(
  CYRA_LANGUAGES.map((l) => [l.sakhiName, l.code]),
) as Record<SakhiLanguageName, CyraLanguageCode>;

const SUPPORTED_CODES = new Set(CYRA_LANGUAGES.map((l) => l.code));

export const LANGUAGE_STORAGE_KEY = 'cyra_language';
export const LANGUAGE_INIT_KEY = 'cyra_language_initialized';

/** Map browser locale prefixes to Cyra language codes */
const BROWSER_LOCALE_MAP: Record<string, CyraLanguageCode> = {
  en: 'en',
  hi: 'hi',
  ta: 'ta',
  te: 'te',
  kn: 'kn',
  ml: 'ml',
  bn: 'bn',
  mr: 'mr',
  gu: 'gu',
  pa: 'pa',
};

export function languageToSakhi(code: string | null | undefined): SakhiLanguageName {
  if (code && code in CODE_TO_SAKHI) return CODE_TO_SAKHI[code as CyraLanguageCode];
  return 'English';
}

export function sakhiToLanguage(name: SakhiLanguageName): CyraLanguageCode {
  return SAKHI_TO_CODE[name] ?? 'en';
}

export function normalizeLanguageCode(raw: string | null | undefined): CyraLanguageCode {
  if (!raw) return 'en';
  const lower = raw.toLowerCase().split('-')[0];
  if (SUPPORTED_CODES.has(lower as CyraLanguageCode)) return lower as CyraLanguageCode;
  if (raw in CODE_TO_SAKHI) return raw as CyraLanguageCode;
  const byName = CYRA_LANGUAGES.find(
    (l) => l.label.toLowerCase() === raw.toLowerCase() || l.sakhiName.toLowerCase() === raw.toLowerCase(),
  );
  return byName?.code ?? 'en';
}

export function detectBrowserLanguage(): CyraLanguageCode {
  if (typeof navigator === 'undefined') return 'en';
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const raw of langs) {
    if (!raw) continue;
    const prefix = raw.toLowerCase().split('-')[0];
    const mapped = BROWSER_LOCALE_MAP[prefix];
    if (mapped) return mapped;
  }
  return 'en';
}

export function readStoredLanguage(): CyraLanguageCode | null {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored ? normalizeLanguageCode(stored) : null;
  } catch {
    return null;
  }
}

export function writeStoredLanguage(code: CyraLanguageCode): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    localStorage.setItem(LANGUAGE_INIT_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function resolveInitialLanguage(
  dbLanguage?: string | null,
  profileLocale?: string | null,
): CyraLanguageCode {
  if (dbLanguage) return normalizeLanguageCode(dbLanguage);
  if (profileLocale) return normalizeLanguageCode(profileLocale);
  const stored = readStoredLanguage();
  if (stored) return stored;
  const detected = detectBrowserLanguage();
  writeStoredLanguage(detected);
  return detected;
}

export function getLanguageOption(code: CyraLanguageCode): LanguageOption {
  return CYRA_LANGUAGES.find((l) => l.code === code) ?? CYRA_LANGUAGES[0];
}

/** CSS font-family stack for a language code */
export function fontStackForLanguage(code: CyraLanguageCode): string {
  const stacks: Record<CyraLanguageCode, string> = {
    en: "'Inter', system-ui, sans-serif",
    hi: "'Noto Sans Devanagari', 'Inter', system-ui, sans-serif",
    mr: "'Noto Sans Devanagari', 'Inter', system-ui, sans-serif",
    ta: "'Noto Sans Tamil', 'Inter', system-ui, sans-serif",
    te: "'Noto Sans Telugu', 'Inter', system-ui, sans-serif",
    kn: "'Noto Sans Kannada', 'Inter', system-ui, sans-serif",
    ml: "'Noto Sans Malayalam', 'Inter', system-ui, sans-serif",
    bn: "'Noto Sans Bengali', 'Inter', system-ui, sans-serif",
    gu: "'Noto Sans Gujarati', 'Inter', system-ui, sans-serif",
    pa: "'Noto Sans Gurmukhi', 'Inter', system-ui, sans-serif",
  };
  return stacks[code] ?? stacks.en;
}
