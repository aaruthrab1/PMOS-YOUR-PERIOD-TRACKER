import type { MetabolicLog, SleepLog } from '@/types/supabase';
import type { CycleForecast } from '@/lib/dashboard/cycleForecast';
import type { ChartPoint, TrackerInsight, EnergySleepCorrelation } from './types';

export interface MetabolicAnalytics {
  weeklyEnergy: number | null;
  weeklyHunger: number | null;
  cravingRate: number;
  brainFogRate: number;
  energyTrend: ChartPoint[];
  correlationEnergySleep: EnergySleepCorrelation[];
  insights: TrackerInsight[];
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10;
}

export function analyzeMetabolicData(
  metabolic: MetabolicLog[],
  sleep: SleepLog[],
  cycle: CycleForecast,
): MetabolicAnalytics {
  const active = metabolic.filter((l) => !l.deleted_at);
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekLogs = active.filter((l) => new Date(l.logged_date) >= weekAgo);

  const weeklyEnergy = avg(weekLogs.map((l) => l.energy_level).filter((v): v is number => v != null));
  const weeklyHunger = avg(weekLogs.map((l) => l.hunger_level).filter((v): v is number => v != null));
  const cravingRate = weekLogs.length
    ? Math.round((weekLogs.filter((l) => l.sugar_cravings).length / weekLogs.length) * 100)
    : 0;
  const brainFogRate = weekLogs.length
    ? Math.round((weekLogs.filter((l) => l.brain_fog).length / weekLogs.length) * 100)
    : 0;

  const energyTrend: ChartPoint[] = active.slice(-30).map((l) => ({
    label: new Date(l.logged_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    date: l.logged_date,
    value: l.energy_level ?? 0,
  }));

  const sleepByDate = new Map(sleep.filter((s) => !s.deleted_at).map((s) => [s.logged_date, s.sleep_hours]));
  const correlationEnergySleep: EnergySleepCorrelation[] = active
    .filter((l) => l.energy_level != null && sleepByDate.has(l.logged_date))
    .slice(-14)
    .map((l) => ({
      label: l.logged_date.slice(5),
      date: l.logged_date,
      energy: l.energy_level!,
      sleep: sleepByDate.get(l.logged_date) ?? 0,
    }));

  const insights: TrackerInsight[] = [];

  if (active.length === 0) {
    insights.push({
      id: 'metabolic-start',
      text: 'Log energy, hunger, and cravings to discover how they connect with sleep and your cycle.',
      category: 'metabolic',
    });
  } else {
    if (cycle.phase === 'Luteal' && weeklyEnergy != null && weeklyEnergy <= 2.5) {
      insights.push({
        id: 'metabolic-luteal',
        text: 'Energy tends to run lower in your luteal phase — many people notice this before their period.',
        category: 'metabolic',
      });
    }

    if (cravingRate >= 40 && cycle.phase === 'Luteal') {
      insights.push({
        id: 'metabolic-cravings',
        text: 'Sugar cravings appear more often in your luteal phase — hormonal shifts can influence appetite.',
        category: 'metabolic',
      });
    }

    const lowSleepFog = active.filter(
      (l) => l.brain_fog && (sleepByDate.get(l.logged_date) ?? 8) < 6,
    );
    if (lowSleepFog.length >= 2) {
      insights.push({
        id: 'metabolic-fog',
        text: 'Brain fog appears more often when sleep is below 6 hours — rest may help clarity on those days.',
        category: 'metabolic',
      });
    }
  }

  return {
    weeklyEnergy,
    weeklyHunger,
    cravingRate,
    brainFogRate,
    energyTrend,
    correlationEnergySleep,
    insights,
  };
}
