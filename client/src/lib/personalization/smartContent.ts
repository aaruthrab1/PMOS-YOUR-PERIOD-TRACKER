import type { Profile } from '@/types/supabase';
import type { DetectedPattern } from '@/lib/dashboard/patterns';
import type { CycleForecast } from '@/lib/dashboard/cycleForecast';
import type { InsightSummary } from '@/types/database';
import type { TrackerInsight } from '@/lib/tracker/types';
import type { SmartPersonalizationInput } from './types';
import { simplifyText } from './simpleLanguage';
import { pickRegionalTip, regionalFoodPhrase } from './regions';
import { createTranslator } from './translations';

export function buildSmartContext(
  profile: Profile | null,
  language: SmartPersonalizationInput['language'],
  simpleLanguage: boolean,
): SmartPersonalizationInput {
  return {
    ageRange: profile?.age_range,
    region: (profile?.region as SmartPersonalizationInput['region']) ?? null,
    conditions: profile?.conditions ?? [],
    commonSymptoms: profile?.common_symptoms ?? [],
    healthGoals: profile?.health_goals ?? [],
    language,
    simpleLanguage,
  };
}

export function personalizeWeeklyInsight(
  profile: Profile | null,
  summary: InsightSummary | null,
  cycle: CycleForecast,
  patterns: DetectedPattern[],
  ctx: SmartPersonalizationInput,
): string {
  const t = createTranslator(ctx.language);
  const name = profile?.full_name?.split(' ')[0] ?? t('dashboard.welcome');

  let insight: string;

  if (patterns.length > 0 && patterns[0].id !== 'building') {
    insight = patterns[0].description;
  } else if (cycle.hasData && cycle.phase === 'Luteal') {
    insight = t('insights.luteal', {
      phase: ctx.simpleLanguage ? 'pre-period' : cycle.phase.toLowerCase(),
      day: cycle.cycleDay ?? 0,
    });
  } else if (summary && summary.streakDays >= 7) {
    insight = t('insights.streak', { days: summary.streakDays });
    if (summary.dominantMood) {
      insight += ` ${summary.dominantMood}.`;
    }
  } else if (summary?.avgSleep) {
    insight = summary.avgSleep < 7
      ? t('insights.sleepLow', { hours: summary.avgSleep })
      : t('insights.sleepGood', { hours: summary.avgSleep });
  } else if (profile?.health_goals?.length) {
    insight = t('insights.goal', { goal: profile.health_goals[0].toLowerCase() });
  } else {
    insight = `${name}, ${t('insights.default')}`;
  }

  const regional = pickRegionalTip(ctx.region, cycle.cycleDay ?? 0);
  if (regional && !patterns.length) {
    insight += ` ${regional}`;
  }

  if (ctx.conditions?.some((c) => c.toLowerCase().includes('pcos'))) {
    const foods = regionalFoodPhrase(ctx.region);
    insight += ` ${t('education.regionalFoods', { foods })}`;
  }

  return simplifyText(insight, ctx.simpleLanguage);
}

export function personalizeTrackerInsights(
  insights: TrackerInsight[],
  ctx: SmartPersonalizationInput,
): TrackerInsight[] {
  return insights.map((i) => ({
    ...i,
    text: simplifyText(i.text, ctx.simpleLanguage),
  }));
}

export function personalizeEducationText(text: string, ctx: SmartPersonalizationInput): string {
  return simplifyText(text, ctx.simpleLanguage);
}
