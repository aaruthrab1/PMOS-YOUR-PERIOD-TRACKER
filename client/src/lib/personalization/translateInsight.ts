import type { TranslationKey } from '@/lib/personalization/translations/en';

/** Map smart insight IDs to translation keys (English text kept as fallback) */
const INSIGHT_KEY_MAP: Record<string, TranslationKey> = {
  'sleep-before-period': 'insight.sleepBeforePeriod',
  'sleep-before-period-hint': 'insight.sleepBeforePeriod',
  'fatigue-long-cycle': 'insight.fatigueLongCycle',
  'mood-improved': 'insight.moodImproved',
  'mood-challenging': 'insight.moodChallenging',
  'patches-fatigue': 'insight.darkPatchesFatigue',
  'keep-logging': 'insight.keepLogging',
  'hair-cycles-up': 'insight.hairCyclesUp',
  'jawline-long-cycle': 'insight.jawlineLongCycle',
  'building': 'insight.keepLogging',
  'start': 'insight.keepLogging',
  'androgen-start': 'insight.keepLogging',
  'androgen-tracking': 'insight.category.androgen',
  'luteal-phase': 'insights.luteal',
  'long-cycle-note': 'insight.fatigueLongCycle',
  'sleep-low-week': 'insights.sleepLow',
};

const CATEGORY_KEY_MAP: Record<string, TranslationKey> = {
  cycle: 'insight.category.cycle',
  sleep: 'insight.category.sleep',
  mood: 'insight.category.mood',
  energy: 'insight.category.energy',
  androgen: 'insight.category.androgen',
};

export function translateInsightText(
  id: string,
  fallback: string,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
): string {
  const key = INSIGHT_KEY_MAP[id];
  if (key) return t(key);
  return fallback;
}

export function translateInsightCategory(
  category: string | undefined,
  t: (key: TranslationKey) => string,
): string | undefined {
  if (!category || category === 'general') return undefined;
  const key = CATEGORY_KEY_MAP[category];
  return key ? t(key) : category;
}
