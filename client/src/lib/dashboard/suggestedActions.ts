import type { CycleForecast } from './cycleForecast';
import type { SmartInsight } from './smartInsights';
import type { HealthSnapshot } from './healthSnapshot';
import { MOOD_OPTIONS } from '@/lib/constants';

export interface SuggestedAction {
  id: string;
  label: string;
  reason: string;
  href: string;
}

export function computeSuggestedActions(input: {
  cycle: CycleForecast;
  health: HealthSnapshot;
  smartInsights: SmartInsight[];
  todayMood?: { mood: string } | null;
  todaySleep?: { sleep_hours: number | null } | null;
  todayMetabolic?: { notes: string | null; energy_level?: number | null };
}): SuggestedAction[] {
  const actions: SuggestedAction[] = [];
  const { cycle, health, smartInsights, todayMood, todaySleep, todayMetabolic } = input;

  if (!todayMood) {
    actions.push({
      id: 'log-mood',
      label: 'Log how you feel',
      reason: 'A 10-second check-in sharpens your insights',
      href: '/tracker?tab=mood',
    });
  }

  if (!todaySleep?.sleep_hours) {
    actions.push({
      id: 'log-sleep',
      label: 'Log last night\'s sleep',
      reason: 'Sleep patterns help explain energy shifts',
      href: '/tracker?tab=sleep',
    });
  }

  if (!cycle.hasData) {
    actions.push({
      id: 'log-period',
      label: 'Log your last period',
      reason: 'Unlock cycle predictions and phase-aware guidance',
      href: '/tracker',
    });
  } else if (cycle.daysUntilNextPeriod != null && cycle.daysUntilNextPeriod <= 5) {
    actions.push({
      id: 'prep-period',
      label: 'Prepare for your period',
      reason: `Estimated in ${cycle.daysUntilNextPeriod} days — rest and hydration often help`,
      href: '/chat',
    });
  }

  if (health.risk === 'high' || smartInsights.some((i) => i.priority >= 7)) {
    actions.push({
      id: 'talk-sakhi',
      label: 'Talk to Sakhi',
      reason: 'Get calm, personalized guidance from your logs',
      href: '/chat',
    });
  }

  if (!health.hasData) {
    actions.push({
      id: 'take-quiz',
      label: 'Complete health snapshot',
      reason: 'Build your baseline in under 3 minutes',
      href: '/quiz?retake=1',
    });
  }

  if (todayMetabolic?.energy_level == null && todayMood && !actions.some((a) => a.id === 'log-mood')) {
    actions.push({
      id: 'log-energy',
      label: 'Rate your energy',
      reason: 'Energy dips often align with cycle phase',
      href: '/tracker?tab=metabolic',
    });
  }

  const topInsight = smartInsights[0];
  if (topInsight && actions.length < 3) {
    actions.push({
      id: `insight-${topInsight.id}`,
      label: 'Explore this pattern',
      reason: topInsight.text.slice(0, 80) + (topInsight.text.length > 80 ? '…' : ''),
      href: '/chat',
    });
  }

  return actions.slice(0, 4);
}

export function moodDisplayLabel(mood: string): string {
  return MOOD_OPTIONS.find((m) => m.value === mood)?.label ?? mood;
}
