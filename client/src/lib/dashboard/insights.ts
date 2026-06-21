import type { Profile } from '@/types/supabase';
import type { InsightSummary } from '@/types/database';
import type { CycleForecast } from './cycleForecast';
import type { DetectedPattern } from './patterns';

export function generateWeeklyInsight(
  profile: Profile | null,
  summary: InsightSummary | null,
  cycle: CycleForecast,
  patterns: DetectedPattern[],
): string {
  const name = profile?.full_name?.split(' ')[0] ?? 'there';

  if (patterns.length > 0 && patterns[0].id !== 'building') {
    return patterns[0].description;
  }

  if (cycle.hasData && cycle.phase === 'Luteal') {
    return `${name}, you're in your ${cycle.phase.toLowerCase()} phase (day ${cycle.cycleDay}). Many people notice shifts in energy and mood now — logging daily helps you spot what supports you.`;
  }

  if (summary && summary.streakDays >= 7) {
    return `You've logged ${summary.streakDays} days in a row — that consistency makes your insights much sharper. ${summary.dominantMood ? `Your most common mood lately is ${summary.dominantMood}.` : ''}`;
  }

  if (summary?.avgSleep) {
    return `Your average sleep is ${summary.avgSleep}h this month. ${summary.avgSleep < 7 ? 'Even 30 minutes more can ease PMOS-related fatigue.' : 'Solid rest supports hormonal balance and mood stability.'}`;
  }

  if (profile?.health_goals?.length) {
    return `Based on your goal to "${profile.health_goals[0].toLowerCase()}", try a quick log today — small daily entries reveal patterns fast.`;
  }

  return `${name}, welcome back. A two-minute check-in today helps Cyra personalize your cycle and symptom insights.`;
}
