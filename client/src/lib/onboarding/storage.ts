import type { OnboardingData, OnboardingProgress } from './types';
import { INITIAL_ONBOARDING_DATA } from './types';

const INTRO_SEEN_KEY = 'cyra_intro_seen';
const SETUP_CACHE_KEY = 'cyra_onboarding_setup';

export function hasSeenIntro(): boolean {
  try {
    return localStorage.getItem(INTRO_SEEN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markIntroSeen(): void {
  try {
    localStorage.setItem(INTRO_SEEN_KEY, 'true');
  } catch {
    /* unavailable */
  }
}

export function loadOnboardingCache(): OnboardingProgress | null {
  try {
    const raw = localStorage.getItem(SETUP_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingProgress;
    return {
      step: parsed.step ?? 0,
      data: { ...INITIAL_ONBOARDING_DATA, ...parsed.data },
      updatedAt: parsed.updatedAt ?? Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveOnboardingCache(step: number, data: OnboardingData): void {
  try {
    const payload: OnboardingProgress = { step, data, updatedAt: Date.now() };
    localStorage.setItem(SETUP_CACHE_KEY, JSON.stringify(payload));
  } catch {
    /* unavailable */
  }
}

export function clearOnboardingCache(): void {
  try {
    localStorage.removeItem(SETUP_CACHE_KEY);
  } catch {
    /* unavailable */
  }
}

/** @deprecated use hasSeenIntro */
export const hasSeenOnboarding = hasSeenIntro;
/** @deprecated use markIntroSeen */
export const markOnboardingSeen = markIntroSeen;
