import type { MoodLog, SleepLog, MetabolicLog, PeriodLog } from '@/types/supabase';
import type { DailyTrend } from '@/types/database';

export interface TrackerSummary {
  daysLogged: number;
  dominantMood: string;
  avgEnergy: number | null;
  avgSleep: number | null;
  streakDays: number;
  topSymptoms: { name: string; frequency: number; avgSeverity: number }[];
}

function uniqueDates(logs: { logged_date: string; deleted_at?: string | null }[]): string[] {
  return [...new Set(logs.filter((l) => !l.deleted_at).map((l) => l.logged_date))].sort();
}

function calculateStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = [...dates].sort().reverse();
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export function computeTrackerSummary(input: {
  moodLogs: MoodLog[];
  sleepLogs: SleepLog[];
  metabolicLogs: MetabolicLog[];
  periods: PeriodLog[];
  days?: number;
}): TrackerSummary {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (input.days ?? 30));
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const moods = input.moodLogs.filter((l) => !l.deleted_at && l.logged_date >= cutoffStr);
  const sleeps = input.sleepLogs.filter((l) => !l.deleted_at && l.logged_date >= cutoffStr);
  const metabolic = input.metabolicLogs.filter((l) => !l.deleted_at && l.logged_date >= cutoffStr);

  const moodCounts: Record<string, number> = {};
  for (const m of moods) {
    moodCounts[m.mood] = (moodCounts[m.mood] ?? 0) + 1;
  }
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'neutral';

  const energyVals = metabolic.filter((m) => m.energy_level != null).map((m) => m.energy_level!);
  const sleepVals = sleeps.filter((s) => s.sleep_hours != null).map((s) => Number(s.sleep_hours));

  const allDates = uniqueDates([
    ...moods,
    ...sleeps,
    ...metabolic,
    ...input.periods.filter((p) => !p.deleted_at).map((p) => ({ logged_date: p.period_start, deleted_at: null })),
  ]);

  return {
    daysLogged: allDates.length,
    dominantMood,
    avgEnergy: energyVals.length
      ? Math.round((energyVals.reduce((a, b) => a + b, 0) / energyVals.length) * 10) / 10
      : null,
    avgSleep: sleepVals.length
      ? Math.round((sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length) * 10) / 10
      : null,
    streakDays: calculateStreak(allDates),
    topSymptoms: [],
  };
}

export function buildDailyTrends(input: {
  moodLogs: MoodLog[];
  sleepLogs: SleepLog[];
  metabolicLogs: MetabolicLog[];
  days?: number;
}): DailyTrend[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (input.days ?? 30));
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const byDate = new Map<string, DailyTrend>();

  for (const m of input.moodLogs.filter((l) => !l.deleted_at && l.logged_date >= cutoffStr)) {
    const row = byDate.get(m.logged_date) ?? {
      date: m.logged_date,
      mood: m.mood,
      energyLevel: null,
      sleepHours: null,
      symptomCount: 0,
      avgSeverity: 0,
    };
    row.mood = m.mood;
    if (m.energy_level != null) row.energyLevel = m.energy_level;
    byDate.set(m.logged_date, row);
  }

  for (const s of input.sleepLogs.filter((l) => !l.deleted_at && l.logged_date >= cutoffStr)) {
    const row = byDate.get(s.logged_date) ?? {
      date: s.logged_date,
      mood: 'neutral',
      energyLevel: null,
      sleepHours: null,
      symptomCount: 0,
      avgSeverity: 0,
    };
    if (s.sleep_hours != null) row.sleepHours = Number(s.sleep_hours);
    byDate.set(s.logged_date, row);
  }

  for (const m of input.metabolicLogs.filter((l) => !l.deleted_at && l.logged_date >= cutoffStr)) {
    const row = byDate.get(m.logged_date);
    if (row && m.energy_level != null) row.energyLevel = m.energy_level;
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}
