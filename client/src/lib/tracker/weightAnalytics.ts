import type { WeightLog } from '@/types/supabase';
import type { ChartPoint, TrackerInsight } from './types';

export interface WeightAnalytics {
  trend: ChartPoint[];
  monthlyAverages: ChartPoint[];
  insights: TrackerInsight[];
  unit: 'kg' | 'lb';
}

function avg(nums: number[]): number {
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

export function analyzeWeightData(logs: WeightLog[]): WeightAnalytics {
  const active = logs
    .filter((l) => !l.deleted_at)
    .sort((a, b) => a.logged_date.localeCompare(b.logged_date));

  const unit = active[active.length - 1]?.unit ?? 'kg';

  const trend: ChartPoint[] = active.map((l) => ({
    label: new Date(l.logged_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    date: l.logged_date,
    value: l.weight,
  }));

  const byMonth = new Map<string, number[]>();
  for (const l of active) {
    const key = l.logged_date.slice(0, 7);
    const arr = byMonth.get(key) ?? [];
    arr.push(l.weight);
    byMonth.set(key, arr);
  }

  const monthlyAverages: ChartPoint[] = [...byMonth.entries()].map(([month, weights]) => ({
    label: new Date(`${month}-01`).toLocaleDateString('en-US', { month: 'short' }),
    date: `${month}-01`,
    value: Math.round(avg(weights) * 10) / 10,
  }));

  const insights: TrackerInsight[] = [];

  if (active.length < 2) {
    insights.push({
      id: 'weight-start',
      text: 'Log weight over time to see your personal trend — numbers are for your awareness, not judgment.',
      category: 'weight',
    });
  } else {
    const recent = active.slice(-14);
    const values = recent.map((l) => l.weight);
    const first = avg(values.slice(0, Math.ceil(values.length / 2)));
    const second = avg(values.slice(Math.ceil(values.length / 2)));
    const diff = second - first;
    const pct = Math.abs(diff / first) * 100;

    if (pct < 1.5) {
      insights.push({
        id: 'weight-stable',
        text: 'Your weight has been relatively stable over recent entries.',
        category: 'weight',
      });
    } else if (diff > 0) {
      insights.push({
        id: 'weight-up',
        text: 'A slight upward trend appears in recent entries. Bodies naturally fluctuate — context like cycle phase and hydration matters.',
        category: 'weight',
      });
    } else {
      insights.push({
        id: 'weight-down',
        text: 'A slight downward trend appears in recent entries. Tracking helps you notice changes alongside how you feel.',
        category: 'weight',
      });
    }
  }

  return { trend, monthlyAverages, insights, unit };
}
