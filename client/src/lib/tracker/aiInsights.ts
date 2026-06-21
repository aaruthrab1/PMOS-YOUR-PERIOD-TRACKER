import type { Profile } from '@/types/supabase';
import type { CycleForecast } from '@/lib/dashboard/cycleForecast';
import type { PeriodAnalytics } from './periodAnalytics';
import type { SleepAnalytics } from './sleepAnalytics';
import type { WeightAnalytics } from './weightAnalytics';
import type { MoodAnalytics } from './moodAnalytics';
import type { MetabolicAnalytics } from './metabolicAnalytics';
import type { TrackerInsight } from './types';

interface InsightInput {
  profile: Profile | null;
  cycle: CycleForecast;
  periodAnalytics: PeriodAnalytics;
  sleepAnalytics: SleepAnalytics;
  weightAnalytics: WeightAnalytics;
  moodAnalytics: MoodAnalytics;
  metabolicAnalytics: MetabolicAnalytics;
}

export function generateTrackerInsights(input: InsightInput): TrackerInsight[] {
  const collected: TrackerInsight[] = [
    ...input.periodAnalytics.insights,
    ...input.sleepAnalytics.insights,
    ...input.weightAnalytics.insights,
    ...input.moodAnalytics.insights,
    ...input.metabolicAnalytics.insights,
  ];

  if (input.sleepAnalytics.monthlyAverage != null && input.sleepAnalytics.monthlyAverage >= 7) {
    const calmMoods = input.moodAnalytics.frequency.filter((f) =>
      ['calm', 'happy'].includes(f.mood),
    );
    const anxiousMoods = input.moodAnalytics.frequency.filter((f) =>
      ['anxious', 'irritable', 'sad'].includes(f.mood),
    );
    const calmTotal = calmMoods.reduce((s, f) => s + f.count, 0);
    const anxiousTotal = anxiousMoods.reduce((s, f) => s + f.count, 0);
    if (calmTotal > anxiousTotal && calmTotal >= 2) {
      collected.push({
        id: 'cross-sleep-mood',
        text: 'You report better mood during weeks with longer sleep — a connection many people find worth nurturing.',
        category: 'general',
      });
    }
  }

  if (input.cycle.hasData && input.metabolicAnalytics.weeklyEnergy != null && input.metabolicAnalytics.weeklyEnergy <= 3) {
    const daysUntil = input.cycle.daysUntilNextPeriod;
    if (daysUntil != null && daysUntil <= 3) {
      collected.push({
        id: 'cross-energy-period',
        text: 'Your energy tends to be lower 2–3 days before your period — planning lighter days may help.',
        category: 'general',
      });
    }
  }

  const seen = new Set<string>();
  return collected.filter((i) => {
    if (seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  }).slice(0, 6);
}
