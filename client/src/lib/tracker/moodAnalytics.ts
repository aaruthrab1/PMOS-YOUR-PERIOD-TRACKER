import type { MoodLog, PeriodLog } from '@/types/supabase';
import type { CycleForecast } from '@/lib/dashboard/cycleForecast';
import type { ChartPoint, TrackerInsight } from './types';
import { TRACKER_MOOD_OPTIONS } from '@/lib/constants';

export interface MoodAnalytics {
  frequency: { mood: string; label: string; emoji: string; count: number }[];
  calendar: Map<string, string>;
  phaseBreakdown: Record<string, Record<string, number>>;
  insights: TrackerInsight[];
}

function getCyclePhaseForDate(date: string, periods: PeriodLog[], cycleLength: number): string {
  const sorted = [...periods]
    .filter((p) => !p.deleted_at)
    .sort((a, b) => b.period_start.localeCompare(a.period_start));
  const latest = sorted.find((p) => p.period_start <= date);
  if (!latest) return 'Unknown';

  const start = new Date(latest.period_start);
  const target = new Date(date);
  start.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const day = Math.floor((target.getTime() - start.getTime()) / 86_400_000) + 1;
  const ovulation = Math.round(cycleLength * 0.5);

  if (day <= 5) return 'Menstrual';
  if (day < ovulation - 2) return 'Follicular';
  if (day <= ovulation + 1) return 'Ovulation';
  return 'Luteal';
}

export function analyzeMoodData(
  logs: MoodLog[],
  periods: PeriodLog[],
  cycle: CycleForecast,
): MoodAnalytics {
  const active = logs.filter((l) => !l.deleted_at);
  const calendar = new Map<string, string>();
  const counts: Record<string, number> = {};
  const phaseBreakdown: Record<string, Record<string, number>> = {};

  for (const l of active) {
    calendar.set(l.logged_date, l.mood);
    counts[l.mood] = (counts[l.mood] ?? 0) + 1;

    const phase = getCyclePhaseForDate(l.logged_date, periods, cycle.cycleLength);
    if (!phaseBreakdown[phase]) phaseBreakdown[phase] = {};
    phaseBreakdown[phase][l.mood] = (phaseBreakdown[phase][l.mood] ?? 0) + 1;
  }

  const frequency = TRACKER_MOOD_OPTIONS.map(({ value, label, emoji }) => ({
    mood: value,
    label,
    emoji,
    count: counts[value] ?? 0,
  })).filter((f) => f.count > 0);

  const insights: TrackerInsight[] = [];

  if (active.length === 0) {
    insights.push({
      id: 'mood-empty',
      text: 'Your mood patterns will appear here.',
      category: 'mood',
    });
  } else {
    const lutealMoods = phaseBreakdown['Luteal'] ?? {};
    const prePeriodCount = (lutealMoods.anxious ?? 0) + (lutealMoods.irritable ?? 0) + (lutealMoods.sad ?? 0);
    if (prePeriodCount >= 2) {
      insights.push({
        id: 'mood-pre-period',
        text: 'Mood shifts like anxiety or irritability show up more often in your luteal phase — a common experience many people track.',
        category: 'mood',
      });
    }

    const top = frequency.sort((a, b) => b.count - a.count)[0];
    if (top && top.count >= 3) {
      insights.push({
        id: 'mood-pattern',
        text: `${top.label} has been your most logged mood recently. Noticing repeats can help you plan supportive routines.`,
        category: 'mood',
      });
    }

    const phases = Object.keys(phaseBreakdown);
    if (phases.length >= 2) {
      insights.push({
        id: 'mood-phase',
        text: 'Your mood varies across cycle phases — comparing entries by phase can reveal what feels different each week.',
        category: 'mood',
      });
    }
  }

  return { frequency, calendar, phaseBreakdown, insights };
}

export function moodChartFromFrequency(
  frequency: MoodAnalytics['frequency'],
): ChartPoint[] {
  return frequency.map((f) => ({
    label: f.emoji,
    date: f.mood,
    value: f.count,
  }));
}
