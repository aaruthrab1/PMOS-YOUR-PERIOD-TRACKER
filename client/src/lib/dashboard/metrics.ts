import type { InsightSummary } from '@/types/database';
import type { MoodLog, SleepLog } from '@/types/supabase';
import type { CycleForecast } from './cycleForecast';
import { MOOD_OPTIONS } from '@/lib/constants';

export type MetricStatus = 'good' | 'neutral' | 'low' | 'empty';

export interface DashboardMetric {
  id: 'sleep' | 'energy' | 'mood' | 'cycle';
  label: string;
  value: string;
  detail: string;
  status: MetricStatus;
}

function moodLabel(mood: string): string {
  const found = MOOD_OPTIONS.find((m) => m.value === mood);
  return found?.label ?? mood.charAt(0).toUpperCase() + mood.slice(1);
}

function sleepStatus(hours: number | null | undefined): MetricStatus {
  if (hours == null) return 'empty';
  if (hours >= 7) return 'good';
  if (hours >= 6) return 'neutral';
  return 'low';
}

function energyStatus(level: number | null | undefined): MetricStatus {
  if (level == null) return 'empty';
  if (level >= 7) return 'good';
  if (level >= 5) return 'neutral';
  return 'low';
}

export function computeDashboardMetrics(
  cycle: CycleForecast,
  summary: InsightSummary | null,
  todayMood?: Pick<MoodLog, 'mood' | 'energy_level'> | null,
  todaySleep?: Pick<SleepLog, 'sleep_hours'> | null,
): DashboardMetric[] {
  const sleepHours = todaySleep?.sleep_hours ?? summary?.avgSleep ?? null;
  const energy = todayMood?.energy_level ?? summary?.avgEnergy ?? null;
  const mood = todayMood?.mood ?? summary?.dominantMood ?? null;

  const sleepValue =
    sleepHours != null ? `${Number(sleepHours).toFixed(1)}h` : '—';
  const sleepDetail = todaySleep?.sleep_hours != null ? 'Today' : summary?.avgSleep ? '7-day avg' : 'Not logged';

  const energyValue = energy != null ? `${Math.round(energy)}/10` : '—';
  const energyDetail = todayMood?.energy_level != null ? 'Today' : summary?.avgEnergy ? '7-day avg' : 'Not logged';

  const moodValue = mood ? moodLabel(mood.toLowerCase()) : '—';
  const moodDetail = todayMood?.mood ? 'Today' : summary?.dominantMood ? 'Recent trend' : 'Not logged';

  const cycleValue = cycle.cycleDay != null ? `Day ${cycle.cycleDay}` : '—';
  const cycleDetail = cycle.hasData
    ? `${cycle.phase}${cycle.daysUntilNextPeriod != null ? ` · ~${cycle.daysUntilNextPeriod}d to period` : ''}`
    : 'Log period to start';

  return [
    { id: 'sleep', label: 'Sleep', value: sleepValue, detail: sleepDetail, status: sleepStatus(sleepHours) },
    { id: 'energy', label: 'Energy', value: energyValue, detail: energyDetail, status: energyStatus(energy) },
    { id: 'mood', label: 'Mood', value: moodValue, detail: moodDetail, status: mood ? 'neutral' : 'empty' },
    { id: 'cycle', label: 'Cycle', value: cycleValue, detail: cycleDetail, status: cycle.hasData ? 'good' : 'empty' },
  ];
}
