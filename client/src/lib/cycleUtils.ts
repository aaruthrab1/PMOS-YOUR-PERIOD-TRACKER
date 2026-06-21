import type { PeriodLog, UserPreferences } from '@/types/supabase';

export interface CycleOverview {
  cycleDay: number | null;
  cycleLength: number;
  phase: string;
  phaseDescription: string;
  progress: number;
  hasData: boolean;
}

function estimatePhase(cycleDay: number, cycleLength: number): { phase: string; description: string } {
  const ovulationDay = Math.round(cycleLength * 0.5);
  if (cycleDay <= 5) {
    return { phase: 'Menstrual', description: 'Rest and hydration can help during your period.' };
  }
  if (cycleDay < ovulationDay - 2) {
    return { phase: 'Follicular', description: 'Energy often rises in this phase — a good time for new routines.' };
  }
  if (cycleDay <= ovulationDay + 1) {
    return { phase: 'Ovulation', description: 'You may notice changes in mood, energy, or cervical fluid.' };
  }
  return { phase: 'Luteal', description: 'Mood and energy shifts are common — tracking helps spot your patterns.' };
}

export function computeCycleOverview(
  periods: PeriodLog[],
  preferences: UserPreferences | null,
): CycleOverview {
  const cycleLength = preferences?.cycle_length_avg ?? 28;
  const sorted = [...periods]
    .filter((p) => !p.deleted_at && p.period_start)
    .sort((a, b) => b.period_start.localeCompare(a.period_start));

  const latest = sorted[0];
  if (!latest) {
    return {
      cycleDay: null,
      cycleLength,
      phase: 'Unknown',
      phaseDescription: 'Log your period to see cycle insights here.',
      progress: 0,
      hasData: false,
    };
  }

  const start = new Date(latest.period_start);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const cycleDay = Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1);
  const { phase, description } = estimatePhase(cycleDay, cycleLength);
  const progress = Math.min(100, Math.round((cycleDay / cycleLength) * 100));

  return {
    cycleDay,
    cycleLength,
    phase,
    phaseDescription: description,
    progress,
    hasData: true,
  };
}
