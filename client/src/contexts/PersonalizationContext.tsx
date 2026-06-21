import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { updatePreferences } from '@/lib/db/profiles';
import { isDemoMode } from '@/lib/demoMode';
import {
  languageToSakhi,
  getLanguageOption,
  createTranslator,
  simplifyText,
  pickCopy,
  buildSmartContext,
  resolveInitialLanguage,
  writeStoredLanguage,
  fontStackForLanguage,
  type CyraLanguageCode,
  type IndiaRegion,
  type DualCopy,
  type TranslationKey,
  type SakhiLanguageName,
} from '@/lib/personalization';

interface PersonalizationContextValue {
  language: CyraLanguageCode;
  sakhiLanguage: SakhiLanguageName;
  simpleLanguage: boolean;
  region: IndiaRegion | null;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  simplify: (text: string) => string;
  pick: (copy: DualCopy) => string;
  setLanguage: (code: CyraLanguageCode) => Promise<void>;
  setSimpleLanguage: (enabled: boolean) => Promise<void>;
  setRegion: (region: IndiaRegion) => Promise<void>;
  smartContext: ReturnType<typeof buildSmartContext>;
  languageLabel: string;
  nativeLanguageLabel: string;
}

const PersonalizationContext = createContext<PersonalizationContextValue | null>(null);

const LEGACY_SIMPLE_KEYS = ['cyra_androgen_simple_language', 'cyra_care_simple_language'];

export function PersonalizationProvider({ children }: { children: ReactNode }) {
  const { profile, preferences, user, updateProfile } = useAuth();
  const [language, setLanguageState] = useState<CyraLanguageCode>(() =>
    resolveInitialLanguage(null, null),
  );
  const [simpleLanguage, setSimpleLanguageState] = useState(false);
  const [region, setRegionState] = useState<IndiaRegion | null>(null);

  useEffect(() => {
    const lang = resolveInitialLanguage(preferences?.language, profile?.locale);
    setLanguageState(lang);

    const dbSimple = preferences?.simple_language;
    if (dbSimple != null) {
      setSimpleLanguageState(dbSimple);
    } else {
      const legacy = LEGACY_SIMPLE_KEYS.some((k) => {
        try {
          return localStorage.getItem(k) === 'true';
        } catch {
          return false;
        }
      });
      setSimpleLanguageState(legacy);
    }

    setRegionState((profile?.region as IndiaRegion) ?? null);
  }, [preferences, profile?.locale, profile?.region, preferences?.language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.style.fontFamily = fontStackForLanguage(language);
  }, [language]);

  const t = useMemo(() => createTranslator(language), [language]);

  const simplify = useCallback(
    (text: string) => simplifyText(text, simpleLanguage),
    [simpleLanguage],
  );

  const pick = useCallback(
    (copy: DualCopy) => pickCopy(copy, simpleLanguage),
    [simpleLanguage],
  );

  const setLanguage = useCallback(async (code: CyraLanguageCode) => {
    setLanguageState(code);
    writeStoredLanguage(code);
    if (user && !isDemoMode()) {
      try {
        await updatePreferences({ language: code });
        await updateProfile({ locale: code });
      } catch {
        /* frontend translation still applies */
      }
    }
  }, [user, updateProfile]);

  const setSimpleLanguage = useCallback(async (enabled: boolean) => {
    setSimpleLanguageState(enabled);
    try {
      localStorage.setItem('cyra_simple_language', String(enabled));
      LEGACY_SIMPLE_KEYS.forEach((k) => localStorage.setItem(k, String(enabled)));
    } catch {
      /* ignore */
    }
    if (user) {
      await updatePreferences({ simple_language: enabled });
    }
  }, [user]);

  const setRegion = useCallback(async (newRegion: IndiaRegion) => {
    setRegionState(newRegion);
    if (user) {
      await updateProfile({ region: newRegion });
    }
  }, [user, updateProfile]);

  const smartContext = useMemo(
    () => buildSmartContext(profile, language, simpleLanguage),
    [profile, language, simpleLanguage],
  );

  const langOption = getLanguageOption(language);

  const value: PersonalizationContextValue = {
    language,
    sakhiLanguage: languageToSakhi(language),
    simpleLanguage,
    region,
    t,
    simplify,
    pick,
    setLanguage,
    setSimpleLanguage,
    setRegion,
    smartContext,
    languageLabel: langOption.label,
    nativeLanguageLabel: langOption.nativeLabel,
  };

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const ctx = useContext(PersonalizationContext);
  if (!ctx) throw new Error('usePersonalization must be used within PersonalizationProvider');
  return ctx;
}

export { INDIA_REGIONS, CYRA_LANGUAGES } from '@/lib/personalization';
