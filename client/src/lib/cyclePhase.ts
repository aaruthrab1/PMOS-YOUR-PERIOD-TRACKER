import type { PeriodLog } from '@/types/supabase';

export type CyclePhaseName = 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Unknown';

export function getCyclePhaseForDate(
  date: string,
  periods: PeriodLog[],
  cycleLength = 28,
): CyclePhaseName {
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

export const PHASE_COLORS: Record<CyclePhaseName, string> = {
  Menstrual: '#EC4899',
  Follicular: '#5B4BDB',
  Ovulation: '#8B5CF6',
  Luteal: '#F59E0B',
  Unknown: '#9CA3AF',
};

export const PHASE_LABELS: Record<CyclePhaseName, { medical: string; simple: string }> = {
  Menstrual: { medical: 'Menstrual', simple: 'Period week' },
  Follicular: { medical: 'Follicular', simple: 'After period' },
  Ovulation: { medical: 'Ovulatory', simple: 'Mid-cycle' },
  Luteal: { medical: 'Luteal', simple: 'Before period' },
  Unknown: { medical: 'Unknown', simple: 'Unknown' },
};
