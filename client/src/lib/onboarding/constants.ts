import type { IndiaRegion } from './types';

export const AGE_RANGES = [
  '18–24',
  '25–34',
  '35–44',
  '45–54',
  '55+',
  'Prefer not to say',
] as const;

export const REGIONS: { value: IndiaRegion; label: string }[] = [
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'central', label: 'Central' },
  { value: 'northeast', label: 'Northeast' },
];

export const HEALTH_GOALS = [
  'Understand symptoms',
  'Track cycles',
  'Improve wellbeing',
  'Fertility awareness',
  'Doctor preparation',
] as const;

export const CYCLE_REGULARITY_OPTIONS = [
  'Regular',
  'Mostly regular',
  'Irregular',
  'Very irregular or absent',
  'Not sure',
] as const;

export const ONBOARDING_SYMPTOMS = [
  'Acne',
  'Hair fall',
  'Fatigue',
  'Irregular periods',
  'Facial hair',
  'Weight changes',
] as const;

export const ACTIVITY_LEVELS = [
  'Mostly sedentary',
  'Light (1–2 days/week)',
  'Moderate (3–4 days/week)',
  'Very active (5+ days/week)',
] as const;

export const ONBOARDING_STEP_TITLES = [
  'Welcome',
  'About you',
  'Age',
  'Region',
  'Health goals',
  'Cycle start',
  'Cycle regularity',
  'Energy',
  'Symptoms',
  'Complete',
] as const;

export const ENTRY_TAGLINE = 'Understand your cycle. Understand yourself.';
