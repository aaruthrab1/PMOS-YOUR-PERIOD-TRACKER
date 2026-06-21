/** Demo-safe mode — never block judges on auth/DB failures. */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

const DEMO_ONBOARDING_KEY = 'cyra_demo_onboarding_complete';
const DEMO_PROFILE_KEY = 'cyra_demo_profile';

export function isDemoMode(): boolean {
  return DEMO_MODE;
}

export function markDemoOnboardingComplete(): void {
  try {
    localStorage.setItem(DEMO_ONBOARDING_KEY, 'true');
  } catch {
    /* ignore */
  }
}

export function isDemoOnboardingComplete(): boolean {
  try {
    return localStorage.getItem(DEMO_ONBOARDING_KEY) === 'true';
  } catch {
    return false;
  }
}

export function clearDemoOnboarding(): void {
  try {
    localStorage.removeItem(DEMO_ONBOARDING_KEY);
    localStorage.removeItem(DEMO_PROFILE_KEY);
  } catch {
    /* ignore */
  }
}

export function saveDemoProfile(data: Record<string, unknown>): void {
  try {
    localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function loadDemoProfile(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(DEMO_PROFILE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
