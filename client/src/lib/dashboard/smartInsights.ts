import type { MoodLog, SleepLog, PeriodLog, AndrogenLog } from '@/types/supabase';
import type { CycleForecast } from './cycleForecast';
import { analyzeSleepData } from '@/lib/tracker/sleepAnalytics';
import { analyzeMoodData } from '@/lib/tracker/moodAnalytics';
import { MOOD_OPTIONS } from '@/lib/constants';

export interface SmartInsight {
  id: string;
  text: string;
  category: 'cycle' | 'sleep' | 'mood' | 'energy' | 'androgen';
  priority: number;
}

function moodLabel(mood: string): string {
  return MOOD_OPTIONS.find((m) => m.value === mood)?.label ?? mood;
}

function sleepBeforePeriodInsight(
  sleepLogs: SleepLog[],
  cycle: CycleForecast,
): SmartInsight | null {
  if (!cycle.hasData || cycle.daysUntilNextPeriod == null || cycle.daysUntilNextPeriod > 7) {
    return null;
  }

  const recent = sleepLogs
    .filter((l) => !l.deleted_at && l.sleep_hours != null)
    .slice(0, 10);

  if (recent.length < 4) {
    return {
      id: 'sleep-before-period-hint',
      text: 'Your sleep tends to drop before your cycle starts — log nightly this week to confirm the pattern.',
      category: 'sleep',
      priority: 8,
    };
  }

  const avg = recent.reduce((s, l) => s + (l.sleep_hours ?? 0), 0) / recent.length;
  if (avg < 6.8) {
    return {
      id: 'sleep-before-period',
      text: `Your sleep is averaging ${avg.toFixed(1)}h with your period ~${cycle.daysUntilNextPeriod} days away — rest may help ease premenstrual symptoms.`,
      category: 'sleep',
      priority: 9,
    };
  }

  return null;
}

function fatigueLongCycleInsight(periods: PeriodLog[], moodLogs: MoodLog[]): SmartInsight | null {
  const sorted = [...periods]
    .filter((p) => !p.deleted_at)
    .sort((a, b) => b.period_start.localeCompare(a.period_start));

  if (sorted.length < 2) return null;

  const gaps: number[] = [];
  for (let i = 0; i < Math.min(sorted.length - 1, 4); i++) {
    const a = new Date(sorted[i].period_start);
    const b = new Date(sorted[i + 1].period_start);
    gaps.push(Math.abs(Math.floor((a.getTime() - b.getTime()) / 86_400_000)));
  }

  const avgLength = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  if (avgLength < 32) return null;

  const lowEnergy = moodLogs.filter(
    (l) => !l.deleted_at && l.energy_level != null && l.energy_level <= 5,
  ).length;

  if (lowEnergy >= 3) {
    return {
      id: 'fatigue-long-cycle',
      text: 'Fatigue appears most often during longer cycles — energy dips may align with extended luteal phases.',
      category: 'energy',
      priority: 7,
    };
  }

  return {
    id: 'long-cycle-note',
    text: `Your recent cycles average ${Math.round(avgLength)} days — tracking energy across the full cycle can reveal useful patterns.`,
    category: 'cycle',
    priority: 5,
  };
}

function moodMonthComparison(moodLogs: MoodLog[], periods: PeriodLog[], cycle: CycleForecast): SmartInsight | null {
  const active = moodLogs.filter((l) => !l.deleted_at);
  if (active.length < 8) return null;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const positive = new Set(['calm', 'happy', 'energetic', 'neutral']);

  const thisMonth = active.filter((l) => new Date(l.logged_date) >= thisMonthStart);
  const lastMonth = active.filter((l) => {
    const d = new Date(l.logged_date);
    return d >= lastMonthStart && d <= lastMonthEnd;
  });

  if (thisMonth.length < 3 || lastMonth.length < 3) return null;

  const thisPos = thisMonth.filter((l) => positive.has(l.mood)).length / thisMonth.length;
  const lastPos = lastMonth.filter((l) => positive.has(l.mood)).length / lastMonth.length;
  const diff = thisPos - lastPos;

  if (diff >= 0.15) {
    return {
      id: 'mood-improved',
      text: 'Your mood has improved compared with last month — keep noting what supports you.',
      category: 'mood',
      priority: 8,
    };
  }

  if (diff <= -0.15) {
    return {
      id: 'mood-challenging',
      text: 'Mood has been more challenging this month — sleep and cycle phase may be contributing factors.',
      category: 'mood',
      priority: 7,
    };
  }

  const top = analyzeMoodData(active, periods, cycle).frequency.sort((a, b) => b.count - a.count)[0];

  if (top) {
    return {
      id: 'mood-dominant',
      text: `${moodLabel(top.mood)} has been your most logged mood recently — patterns often link to cycle phase and sleep.`,
      category: 'mood',
      priority: 4,
    };
  }

  return null;
}

function androgenInsight(androgenLogs: AndrogenLog[]): SmartInsight | null {
  const recent = androgenLogs.filter((l) => !l.deleted_at).slice(0, 8);
  if (recent.length === 0) {
    return {
      id: 'androgen-start',
      text: 'Weekly androgen check-ins help track hair, skin, and scalp changes across your cycle.',
      category: 'androgen',
      priority: 3,
    };
  }

  if (recent.length >= 3) {
    return {
      id: 'androgen-tracking',
      text: `You have ${recent.length} androgen check-ins — review trends before your next doctor visit.`,
      category: 'androgen',
      priority: 5,
    };
  }

  return null;
}

export function generateSmartInsights(input: {
  cycle: CycleForecast;
  sleepLogs: SleepLog[];
  moodLogs: MoodLog[];
  periods: PeriodLog[];
  androgenLogs: AndrogenLog[];
}): SmartInsight[] {
  const { cycle, sleepLogs, moodLogs, periods, androgenLogs } = input;
  const insights: SmartInsight[] = [];

  const sleepInsight = sleepBeforePeriodInsight(sleepLogs, cycle);
  if (sleepInsight) insights.push(sleepInsight);

  const fatigueInsight = fatigueLongCycleInsight(periods, moodLogs);
  if (fatigueInsight) insights.push(fatigueInsight);

  const moodInsight = moodMonthComparison(moodLogs, periods, cycle);
  if (moodInsight) insights.push(moodInsight);

  const sleepAnalytics = analyzeSleepData(sleepLogs);
  if (sleepAnalytics.weeklyAverage != null && sleepAnalytics.weeklyAverage < 6.5 && !sleepInsight) {
    insights.push({
      id: 'sleep-low-week',
      text: `Sleep averaged ${sleepAnalytics.weeklyAverage}h this week — even 30 extra minutes can support mood and energy.`,
      category: 'sleep',
      priority: 6,
    });
  }

  const moodAnalytics = analyzeMoodData(moodLogs, periods, cycle);
  for (const t of moodAnalytics.insights.slice(0, 1)) {
    if (t.id !== 'mood-empty') {
      insights.push({
        id: t.id,
        text: t.text,
        category: 'mood',
        priority: 6,
      });
    }
  }

  const androgen = androgenInsight(androgenLogs);
  if (androgen) insights.push(androgen);

  if (cycle.hasData && cycle.phase === 'Luteal' && !insights.some((i) => i.category === 'cycle')) {
    insights.push({
      id: 'luteal-phase',
      text: `You're in the ${cycle.phase.toLowerCase()} phase (day ${cycle.cycleDay}) — many people notice shifts in energy and mood now.`,
      category: 'cycle',
      priority: 5,
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'keep-logging',
      text: 'Log mood and sleep for a few more days — Cyra will surface personalized insights from your cycle history.',
      category: 'cycle',
      priority: 1,
    });
  }

  return insights.sort((a, b) => b.priority - a.priority).slice(0, 4);
}
