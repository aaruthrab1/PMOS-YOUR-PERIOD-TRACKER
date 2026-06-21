import type { Profile } from '@/types/supabase';
import type { InsightSummary } from '@/types/database';
import type { CycleForecast } from './cycleForecast';
import type { DetectedPattern } from './patterns';

export interface TodayFocusAction {
  id: string;
  label: string;
  reason: string;
  href: string;
}

export function computeTodayFocus(
  profile: Profile | null,
  cycle: CycleForecast,
  summary: InsightSummary | null,
  patterns: DetectedPattern[],
  today: {
    moodLogged: boolean;
    sleepLogged: boolean;
    energyLogged: boolean;
    periodLogged: boolean;
  },
): TodayFocusAction[] {
  const actions: TodayFocusAction[] = [];

  if (!today.moodLogged) {
    actions.push({
      id: 'log-mood',
      label: 'Log your mood',
      reason: 'One tap — helps Sakhi spot patterns',
      href: '/tracker',
    });
  }

  if (!today.sleepLogged) {
    actions.push({
      id: 'log-sleep',
      label: 'Log last night\'s sleep',
      reason: summary?.avgSleep && summary.avgSleep < 7
        ? `You're averaging ${summary.avgSleep}h — sleep affects energy`
        : 'Sleep links strongly to mood and cycle symptoms',
      href: '/tracker',
    });
  }

  if (cycle.hasData && cycle.daysUntilNextPeriod != null && cycle.daysUntilNextPeriod <= 5) {
    actions.push({
      id: 'prep-period',
      label: 'Prepare for your period',
      reason: `About ${cycle.daysUntilNextPeriod} days away — plan rest and comfort`,
      href: '/care',
    });
  } else if (cycle.phase === 'Luteal' && cycle.hasData) {
    actions.push({
      id: 'luteal-care',
      label: 'Go easy on energy today',
      reason: 'Luteal phase — lighter tasks and hydration often help',
      href: '/tracker',
    });
  }

  const energyPattern = patterns.find((p) => p.type === 'energy');
  if (energyPattern && actions.length < 3) {
    actions.push({
      id: 'energy-pattern',
      label: 'Review your energy trend',
      reason: energyPattern.description.split('.')[0] + '.',
      href: '/reports',
    });
  }

  if (!today.periodLogged && !cycle.hasData && actions.length < 3) {
    actions.push({
      id: 'log-period',
      label: 'Log your last period',
      reason: 'Unlock cycle day and predictions',
      href: '/tracker',
    });
  }

  const goal = profile?.health_goals?.[0];
  if (goal && actions.length < 3) {
    actions.push({
      id: 'health-goal',
      label: `Focus: ${goal}`,
      reason: 'Your stated health goal — small steps count',
      href: '/care',
    });
  }

  if (actions.length < 3) {
    actions.push({
      id: 'sakhi-checkin',
      label: 'Ask Sakhi how you\'re doing',
      reason: 'Personalized guidance from your logs',
      href: '/chat',
    });
  }

  if (actions.length < 3 && summary && summary.streakDays < 3) {
    actions.push({
      id: 'build-streak',
      label: 'Build your logging streak',
      reason: `${summary.streakDays} day${summary.streakDays === 1 ? '' : 's'} so far — 3+ days reveal patterns`,
      href: '/tracker',
    });
  }

  // Dedupe by id and take top 3
  const seen = new Set<string>();
  return actions.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  }).slice(0, 3);
}
