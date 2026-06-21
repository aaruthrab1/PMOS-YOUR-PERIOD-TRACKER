import type { AndrogenLog, PeriodLog } from '@/types/supabase';
import { getCyclePhaseForDate, PHASE_COLORS, PHASE_LABELS, type CyclePhaseName } from '@/lib/cyclePhase';
import { parseCheckIn } from './checkIn';
import { ACNE_SCORES, HAIR_SCORES, BODY_HAIR_SCORES, DARK_PATCHES_SCORES } from './constants';
import type { AndrogenTrendPoint, AndrogenWeeklyCheckIn } from './types';

export interface AndrogenWeeklyCheckInWithMeta {
  log: AndrogenLog;
  checkIn: AndrogenWeeklyCheckIn;
  phase: string;
  phaseLabel: string;
}

export interface AndrogenAnalytics {
  checkIns: AndrogenWeeklyCheckInWithMeta[];
  checkInCount: number;
  showTrends: boolean;
  trendPoints: AndrogenTrendPoint[];
  acneZoneFrequency: { zone: string; count: number }[];
}

export function analyzeAndrogenLogs(
  logs: AndrogenLog[],
  periods: PeriodLog[],
  cycleLength: number,
  simpleLanguage: boolean,
): AndrogenAnalytics {
  const checkIns: AndrogenWeeklyCheckInWithMeta[] = [];

  for (const log of logs.filter((l) => !l.deleted_at)) {
    const checkIn = parseCheckIn(log);
    if (!checkIn) continue;
    const phase = getCyclePhaseForDate(log.logged_date, periods, cycleLength);
    checkIns.push({
      log,
      checkIn,
      phase,
      phaseLabel: simpleLanguage ? PHASE_LABELS[phase].simple : PHASE_LABELS[phase].medical,
    });
  }

  checkIns.sort((a, b) => a.log.logged_date.localeCompare(b.log.logged_date));

  const trendPoints: AndrogenTrendPoint[] = checkIns.map(({ log, checkIn, phase }) => ({
    date: log.logged_date,
    label: new Date(log.logged_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    phase,
    phaseColor: PHASE_COLORS[phase as CyclePhaseName],
    hairScore: HAIR_SCORES[checkIn.hair_shedding],
    acneScore: ACNE_SCORES[checkIn.acne],
    bodyHairScore: BODY_HAIR_SCORES[checkIn.body_hair],
    scalpOiliness: checkIn.scalp_oiliness,
    scalpDryness: checkIn.scalp_dryness,
    hasAcne: checkIn.acne !== 'none',
    darkPatchScore: DARK_PATCHES_SCORES[checkIn.dark_patches],
  }));

  const zoneCounts = new Map<string, number>();
  for (const { checkIn } of checkIns) {
    if (checkIn.acne === 'none') continue;
    for (const z of checkIn.acne_zones) {
      zoneCounts.set(z, (zoneCounts.get(z) ?? 0) + 1);
    }
  }

  const acneZoneFrequency = [...zoneCounts.entries()]
    .map(([zone, count]) => ({ zone, count }))
    .sort((a, b) => b.count - a.count);

  return {
    checkIns,
    checkInCount: checkIns.length,
    showTrends: checkIns.length >= 3,
    trendPoints,
    acneZoneFrequency,
  };
}
