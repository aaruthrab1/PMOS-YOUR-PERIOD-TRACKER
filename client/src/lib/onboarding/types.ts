import type { CyraLanguageCode } from '@/lib/personalization/types';

export type IndiaRegion = 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast';

export interface OnboardingData {
  fullName: string;
  ageRange: string;
  region: IndiaRegion | '';
  preferredLanguage: CyraLanguageCode;
  healthGoals: string[];
  lastPeriodDate: string;
  lastPeriodSkipped: boolean;
  cycleLengthAvg: number;
  cycleRegularity: string;
  heightCm: number | null;
  weightKg: number | null;
  sleepAvgHours: number | null;
  activityLevel: string;
  commonSymptoms: string[];
  energyLevel: number | null;
}

export interface OnboardingProgress {
  step: number;
  data: OnboardingData;
  updatedAt: number;
}

/** Onboarding wizard steps (0–9): Welcome → Complete */
export const ONBOARDING_STEP_COUNT = 10;

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  fullName: '',
  ageRange: '',
  region: '',
  preferredLanguage: 'en',
  healthGoals: [],
  lastPeriodDate: '',
  lastPeriodSkipped: false,
  cycleLengthAvg: 28,
  cycleRegularity: '',
  heightCm: null,
  weightKg: null,
  sleepAvgHours: null,
  activityLevel: '',
  commonSymptoms: [],
  energyLevel: null,
};
