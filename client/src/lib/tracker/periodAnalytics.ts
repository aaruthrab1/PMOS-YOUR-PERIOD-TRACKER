import type { PeriodLog, UserPreferences } from '@/types/supabase';
import type { CycleForecast } from '@/lib/dashboard/cycleForecast';
import type { ChartPoint, TrackerInsight } from './types';

export interface PeriodAnalytics {
  cycleLengths: number[];
  lastSixCycles: ChartPoint[];
  averageCycleLength: number | null;
  lastCycleLength: number | null;
  consistencyScore: number;
  forecastConfidence: number;
  insights: TrackerInsight[];
  periodDays: Set<string>;
  predictedDays: Set<string>;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  const last = new Date(end);
  cur.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);
  while (cur <= last) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function analyzePeriodData(
  periods: PeriodLog[],
  cycle: CycleForecast,
  preferences: UserPreferences | null,
): PeriodAnalytics {
  const sorted = [...periods]
    .filter((p) => !p.deleted_at && p.period_start)
    .sort((a, b) => b.period_start.localeCompare(a.period_start));

  const cycleLengths: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = new Date(sorted[i].period_start);
    const b = new Date(sorted[i + 1].period_start);
    cycleLengths.push(Math.abs(daysBetween(b, a)));
  }

  const lastSix = cycleLengths.slice(0, 6).reverse();
  const lastSixCycles: ChartPoint[] = lastSix.map((value, i) => ({
    label: `C${i + 1}`,
    date: sorted[i]?.period_start ?? '',
    value,
  }));

  const averageCycleLength =
    cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((s, v) => s + v, 0) / cycleLengths.length)
      : preferences?.cycle_length_avg ?? null;

  const lastCycleLength = cycleLengths[0] ?? null;

  let consistencyScore = 0;
  if (cycleLengths.length >= 2) {
    const avg = cycleLengths.reduce((s, v) => s + v, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((s, v) => s + (v - avg) ** 2, 0) / cycleLengths.length;
    const stdDev = Math.sqrt(variance);
    consistencyScore = Math.max(0, Math.min(100, Math.round(100 - stdDev * 8)));
  } else if (sorted.length >= 1) {
    consistencyScore = 40;
  }

  const periodDays = new Set<string>();
  for (const p of sorted) {
    const end = p.period_end ?? p.period_start;
    dateRange(p.period_start, end).forEach((d) => periodDays.add(d));
  }

  const predictedDays = new Set<string>();
  if (cycle.nextPeriodDate) {
    const start = new Date(cycle.nextPeriodDate);
    const periodLen = preferences?.period_length_avg ?? 5;
    for (let i = 0; i < periodLen; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      predictedDays.add(d.toISOString().split('T')[0]);
    }
  }

  const insights: TrackerInsight[] = [];

  if (sorted.length === 0) {
    insights.push({
      id: 'period-empty',
      text: 'No period logged yet. Add your first cycle to begin tracking.',
      category: 'period',
    });
  }

  if (lastCycleLength != null && lastCycleLength > 35) {
    insights.push({
      id: 'period-long',
      text: `Your last cycle was ${lastCycleLength} days — longer than typical. Stress, travel, or hormonal shifts can affect timing. Tracking helps you notice patterns over time.`,
      category: 'period',
    });
  }

  if (cycleLengths.length >= 3) {
    const avg = cycleLengths.reduce((s, v) => s + v, 0) / cycleLengths.length;
    const irregular = cycleLengths.filter((l) => Math.abs(l - avg) > 7).length;
    if (irregular >= 2) {
      insights.push({
        id: 'period-irregular',
        text: 'Your recent cycles vary more than usual. This is worth noting for your own awareness — many factors influence cycle length.',
        category: 'period',
      });
    }
  }

  if (sorted.length > 0 && sorted.length < 2) {
    insights.push({
      id: 'period-sparse',
      text: 'Log a few more cycles to unlock consistency scores and more accurate predictions.',
      category: 'period',
    });
  }

  return {
    cycleLengths,
    lastSixCycles,
    averageCycleLength,
    lastCycleLength,
    consistencyScore,
    forecastConfidence: cycle.confidence,
    insights,
    periodDays,
    predictedDays,
  };
}
