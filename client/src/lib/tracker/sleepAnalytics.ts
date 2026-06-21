import type { SleepLog } from '@/types/supabase';
import type { ChartPoint, TrackerInsight } from './types';

export interface SleepAnalytics {
  weeklyAverage: number | null;
  monthlyAverage: number | null;
  trend30: ChartPoint[];
  restednessTrend: ChartPoint[];
  insights: TrackerInsight[];
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10;
}

export function analyzeSleepData(logs: SleepLog[]): SleepAnalytics {
  const active = logs.filter((l) => !l.deleted_at).sort((a, b) => a.logged_date.localeCompare(b.logged_date));
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const weekLogs = active.filter((l) => new Date(l.logged_date) >= weekAgo);
  const monthLogs = active.filter((l) => new Date(l.logged_date) >= monthAgo);

  const weeklyAverage = avg(weekLogs.map((l) => l.sleep_hours).filter((h): h is number => h != null));
  const monthlyAverage = avg(monthLogs.map((l) => l.sleep_hours).filter((h): h is number => h != null));

  const trend30: ChartPoint[] = monthLogs.map((l) => ({
    label: new Date(l.logged_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    date: l.logged_date,
    value: l.sleep_hours ?? 0,
  }));

  const restednessTrend: ChartPoint[] = monthLogs
    .filter((l) => l.sleep_quality != null)
    .map((l) => ({
      label: new Date(l.logged_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      date: l.logged_date,
      value: l.sleep_quality!,
    }));

  const insights: TrackerInsight[] = [];

  if (active.length === 0) {
    insights.push({
      id: 'sleep-empty',
      text: 'Track your sleep for a few days to discover patterns.',
      category: 'sleep',
    });
  } else {
    if (monthlyAverage != null && monthlyAverage >= 7) {
      insights.push({
        id: 'sleep-consistent',
        text: `You're averaging ${monthlyAverage}h of sleep this month — a steady rhythm supports energy and mood.`,
        category: 'sleep',
      });
    }

    if (weeklyAverage != null && weeklyAverage < 6.5) {
      insights.push({
        id: 'sleep-debt',
        text: `Your weekly average is ${weeklyAverage}h. When sleep runs short, many people notice more fatigue and brain fog — rest when you can.`,
        category: 'sleep',
      });
    }

    if (trend30.length >= 7) {
      const firstHalf = trend30.slice(0, Math.floor(trend30.length / 2));
      const secondHalf = trend30.slice(Math.floor(trend30.length / 2));
      const a1 = avg(firstHalf.map((p) => p.value).filter(Boolean));
      const a2 = avg(secondHalf.map((p) => p.value).filter(Boolean));
      if (a1 != null && a2 != null && a2 - a1 >= 0.4) {
        insights.push({
          id: 'sleep-improving',
          text: `Sleep has improved recently (${a1}h → ${a2}h average). Notice what routines may be helping.`,
          category: 'sleep',
        });
      }
    }
  }

  return { weeklyAverage, monthlyAverage, trend30, restednessTrend, insights };
}
