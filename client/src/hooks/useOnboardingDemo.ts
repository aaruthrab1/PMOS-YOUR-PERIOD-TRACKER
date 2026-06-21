import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isOnboardingComplete } from '@/lib/auth/onboardingStatus';
import { submitOnboarding } from '@/lib/onboarding/submit';
import {
  INITIAL_ONBOARDING_DATA,
  type OnboardingData,
} from '@/lib/onboarding/types';
import { markDemoOnboardingComplete, saveDemoProfile, isDemoMode } from '@/lib/demoMode';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import type { Profile } from '@/types/supabase';

export const DEMO_ONBOARDING_STEPS = 3;

export function useOnboardingDemo() {
  const { user, profile, applyOnboardingComplete } = useAuth();
  const { language, setLanguage } = usePersonalization();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(() => ({
    ...INITIAL_ONBOARDING_DATA,
    preferredLanguage: language,
  }));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hydrated] = useState(true);

  useEffect(() => {
    if (profile?.full_name) {
      setData((d) => ({ ...d, fullName: profile.full_name || '' }));
    }
  }, [profile?.full_name]);

  useEffect(() => {
    setData((d) => ({ ...d, preferredLanguage: language }));
  }, [language]);

  const updateData = useCallback((patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
    setError('');
  }, []);

  const validateStep = useCallback((): boolean => {
    if (step === 0) {
      if (data.fullName.trim().length < 2) {
        setError('Please enter your name');
        return false;
      }
      if (!data.ageRange) {
        setError('Please select your age range');
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (data.healthGoals.length === 0) {
        setError('Pick at least one goal');
        return false;
      }
      return true;
    }
    return true;
  }, [step, data]);

  const next = useCallback(() => {
    if (!validateStep()) return false;
    setStep((s) => Math.min(s + 1, DEMO_ONBOARDING_STEPS - 1));
    return true;
  }, [validateStep]);

  const back = useCallback(() => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const buildFallbackProfile = useCallback((): Profile => {
    const now = new Date().toISOString();
    return {
      id: user?.id ?? 'demo-user',
      email: user?.email ?? '',
      full_name: data.fullName.trim(),
      avatar_url: null,
      date_of_birth: null,
      timezone: 'UTC',
      onboarding_completed: true,
      health_goals: data.healthGoals,
      conditions: data.commonSymptoms,
      auth_provider: null,
      locale: data.preferredLanguage,
      phone: null,
      age_range: data.ageRange,
      region: data.region || null,
      cycle_regularity: data.cycleRegularity || null,
      energy_level: data.energyLevel,
      common_symptoms: data.commonSymptoms,
      last_period_date: data.lastPeriodDate || null,
      created_at: now,
      updated_at: now,
    };
  }, [user, data]);

  const finish = useCallback(async (): Promise<boolean> => {
    if (!validateStep()) return false;
    setSubmitting(true);
    setError('');

    try {
      await setLanguage(data.preferredLanguage);
    } catch {
      /* frontend language still updated */
    }

    saveDemoProfile({
      fullName: data.fullName,
      ageRange: data.ageRange,
      healthGoals: data.healthGoals,
      commonSymptoms: data.commonSymptoms,
      preferredLanguage: data.preferredLanguage,
    });
    markDemoOnboardingComplete();

    let savedProfile = buildFallbackProfile();

    try {
      savedProfile = await submitOnboarding(data);
    } catch {
      /* demo mode continues */
    }

    try {
      await applyOnboardingComplete(savedProfile);
    } catch {
      await applyOnboardingComplete(buildFallbackProfile());
    }

    if (!isOnboardingComplete(savedProfile, user) && isDemoMode()) {
      markDemoOnboardingComplete();
    }

    setSubmitting(false);
    return true;
  }, [validateStep, data, setLanguage, buildFallbackProfile, applyOnboardingComplete, user]);

  const progress = ((step + 1) / DEMO_ONBOARDING_STEPS) * 100;
  const isLast = step === DEMO_ONBOARDING_STEPS - 1;

  return {
    step,
    data,
    error,
    submitting,
    hydrated,
    progress,
    isLast,
    updateData,
    next,
    back,
    finish,
    setLanguage,
  };
}
