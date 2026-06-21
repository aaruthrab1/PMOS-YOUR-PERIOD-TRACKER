import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isOnboardingComplete, logOnboardingState } from '@/lib/auth/onboardingStatus';
import { validateOnboardingStep } from '@/lib/onboarding/validation';
import { submitOnboarding } from '@/lib/onboarding/submit';
import { clearOnboardingCache, loadOnboardingCache, saveOnboardingCache } from '@/lib/onboarding/storage';
import { supabase } from '@/lib/supabase';
import { friendlyOnboardingError } from '@/lib/userMessages';
import {
  INITIAL_ONBOARDING_DATA,
  ONBOARDING_STEP_COUNT,
  type OnboardingData,
} from '@/lib/onboarding/types';

export function useOnboarding() {
  const { user, profile, applyOnboardingComplete } = useAuth();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(INITIAL_ONBOARDING_DATA);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (isOnboardingComplete(profile, user)) {
      clearOnboardingCache();
      setHydrated(true);
      return;
    }
    const cached = loadOnboardingCache();
    if (cached) {
      setStep(cached.step);
      setData(cached.data);
    } else if (profile?.full_name) {
      setData((d) => ({ ...d, fullName: profile.full_name || '' }));
    }
    setHydrated(true);
  }, [profile, user]);

  useEffect(() => {
    if (step === 7 && data.energyLevel === null) {
      setData((d) => ({ ...d, energyLevel: 5 }));
    }
  }, [step, data.energyLevel]);

  useEffect(() => {
    if (!hydrated) return;
    saveOnboardingCache(step, data);
  }, [step, data, hydrated]);

  const updateData = useCallback((patch: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...patch }));
    setError('');
  }, []);

  const validateCurrent = useCallback(() => {
    const result = validateOnboardingStep(step, data);
    if (!result.valid) {
      setError(result.message);
      return false;
    }
    setError('');
    return true;
  }, [step, data]);

  const next = useCallback(() => {
    if (!validateCurrent()) return false;
    setStep((s) => Math.min(s + 1, ONBOARDING_STEP_COUNT - 1));
    return true;
  }, [validateCurrent]);

  const back = useCallback(() => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const goToStep = useCallback((index: number) => {
    setError('');
    setStep(Math.max(0, Math.min(index, ONBOARDING_STEP_COUNT - 1)));
  }, []);

  const finish = useCallback(async () => {
    for (const requiredStep of [1, 2, 3, 4, 5, 6, 7]) {
      const result = validateOnboardingStep(requiredStep, data);
      if (!result.valid) {
        setError(result.message);
        setStep(requiredStep);
        return false;
      }
    }
    setSubmitting(true);
    setError('');
    try {
      logOnboardingState('finish before save', user, profile);
      const savedProfile = await submitOnboarding(data);
      await applyOnboardingComplete(savedProfile);
      const { data: { user: afterUser } } = await supabase.auth.getUser();
      logOnboardingState('finish after save', afterUser, { ...savedProfile, onboarding_completed: true });
      if (!isOnboardingComplete(savedProfile, afterUser)) {
        setError('Almost done! Tap Enter Cyra again, or refresh the page.');
        return false;
      }
      return true;
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Could not save your profile. Please try again.';
      setError(friendlyOnboardingError(message));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [data, user, profile, applyOnboardingComplete]);

  const progress = ((step + 1) / ONBOARDING_STEP_COUNT) * 100;
  const isFirst = step === 0;
  const isLast = step === ONBOARDING_STEP_COUNT - 1;

  return {
    step,
    data,
    error,
    submitting,
    hydrated,
    progress,
    isFirst,
    isLast,
    updateData,
    next,
    back,
    goToStep,
    finish,
    validateCurrent,
  };
}
