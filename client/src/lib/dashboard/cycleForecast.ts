import type { PeriodLog, Profile, UserPreferences } from '@/types/supabase';

export interface CycleForecast {
  daysSinceLastPeriod: number | null;
  lastPeriodDate: string | null;
  nextPeriodDate: string | null;
  daysUntilNextPeriod: number | null;
  confidence: number;
  phase: string;
  cycleDay: number | null;
  cycleLength: number;
  hasData: boolean;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.floor(ms / 86_400_000);
}

function estimatePhase(cycleDay: number, cycleLength: number): string {
  const ovulationDay = Math.round(cycleLength * 0.5);
  if (cycleDay <= 5) return 'Menstrual';
  if (cycleDay < ovulationDay - 2) return 'Follicular';
  if (cycleDay <= ovulationDay + 1) return 'Ovulation';
  return 'Luteal';
}

export function computeCycleForecast(
  periods: PeriodLog[],
  preferences: UserPreferences | null,
  profile: Profile | null,
): CycleForecast {
  const cycleLength = preferences?.cycle_length_avg ?? 28;
  const sorted = [...periods]
    .filter((p) => !p.deleted_at && p.period_start)
    .sort((a, b) => b.period_start.localeCompare(a.period_start));

  const latest = sorted[0];
  const lastStart = latest?.period_start ?? profile?.last_period_date ?? null;

  if (!lastStart) {
    return {
      daysSinceLastPeriod: null,
      lastPeriodDate: null,
      nextPeriodDate: null,
      daysUntilNextPeriod: null,
      confidence: 0,
      phase: 'Unknown',
      cycleDay: null,
      cycleLength,
      hasData: false,
    };
  }

  const start = new Date(lastStart);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const daysSince = Math.max(0, daysBetween(start, today));
  const cycleDay = daysSince + 1;

  let avgLength = cycleLength;
  if (sorted.length >= 2) {
    const gaps: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = new Date(sorted[i].period_start);
      const b = new Date(sorted[i + 1].period_start);
      gaps.push(Math.abs(daysBetween(b, a)));
    }
    avgLength = Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length);
  }

  const nextStart = addDays(start, avgLength);
  const daysUntil = daysBetween(today, nextStart);

  let confidence = 45;
  if (sorted.length >= 3) confidence = 85;
  else if (sorted.length >= 2) confidence = 70;
  else if (profile?.cycle_regularity?.includes('regular')) confidence = 65;
  else if (profile?.last_period_date) confidence = 55;

  return {
    daysSinceLastPeriod: daysSince,
    lastPeriodDate: lastStart,
    nextPeriodDate: nextStart.toISOString().split('T')[0],
    daysUntilNextPeriod: Math.max(0, daysUntil),
    confidence,
    phase: estimatePhase(cycleDay, avgLength),
    cycleDay,
    cycleLength: avgLength,
    hasData: true,
  };
}

export function formatForecastDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(iso));
}
