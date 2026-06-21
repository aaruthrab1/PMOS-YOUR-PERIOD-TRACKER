import type { MoodLog, PeriodLog } from '@/types/supabase';
import type { AndrogenAnalytics, AndrogenWeeklyCheckInWithMeta } from './analytics';
import {
  ACNE_ZONE_OPTIONS,
  DARK_PATCH_LOCATION_OPTIONS,
  BODY_HAIR_SCORES,
} from './constants';
import type {
  AndrogenIntelligence,
  AndrogenTrendPoint,
  TrendDirection,
  WeeklyChange,
  ZoneFrequency,
  LocationFrequency,
} from './types';

function computeWeeklyChange(
  points: AndrogenTrendPoint[],
  key: keyof Pick<AndrogenTrendPoint, 'hairScore' | 'acneScore' | 'bodyHairScore' | 'scalpOiliness' | 'scalpDryness'>,
  labels: { up: string; down: string; stable: string },
): WeeklyChange {
  if (points.length < 2) {
    return { direction: 'stable', label: labels.stable, delta: 0 };
  }
  const prev = points[points.length - 2][key] as number;
  const curr = points[points.length - 1][key] as number;
  const delta = curr - prev;
  if (delta >= 1) return { direction: 'up', label: labels.up, delta };
  if (delta <= -1) return { direction: 'down', label: labels.down, delta };
  return { direction: 'stable', label: labels.stable, delta };
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function detectHormonalPattern(
  checkIns: AndrogenWeeklyCheckInWithMeta[],
): 'jawline_cycle' | 'luteal_acne' | 'stable' | null {
  const withAcne = checkIns.filter((c) => c.checkIn.acne !== 'none');
  if (withAcne.length < 2) return null;

  const jawLuteal = withAcne.filter(
    (c) =>
      c.checkIn.acne_zones.includes('jawline_chin') &&
      (c.phase === 'Luteal' || c.phase === 'Menstrual'),
  );
  if (jawLuteal.length >= 2) return 'jawline_cycle';

  const lutealAcne = withAcne.filter((c) => c.phase === 'Luteal');
  if (lutealAcne.length >= 2 && lutealAcne.length / withAcne.length >= 0.5) {
    return 'luteal_acne';
  }

  const scores = checkIns.map((c) => c.checkIn.acne);
  const unique = new Set(scores);
  if (unique.size === 1 && scores[0] === 'none') return 'stable';

  return null;
}

function buildZoneFrequency(checkIns: AndrogenWeeklyCheckInWithMeta[]): ZoneFrequency[] {
  const counts = new Map<string, number>();
  let total = 0;
  for (const { checkIn } of checkIns) {
    if (checkIn.acne === 'none') continue;
    for (const z of checkIn.acne_zones) {
      counts.set(z, (counts.get(z) ?? 0) + 1);
      total++;
    }
  }
  return ACNE_ZONE_OPTIONS.map(({ id, label }) => ({
    zone: id,
    label,
    count: counts.get(id) ?? 0,
    pct: total > 0 ? Math.round(((counts.get(id) ?? 0) / total) * 100) : 0,
  })).sort((a, b) => b.count - a.count);
}

function buildLocationFrequency(checkIns: AndrogenWeeklyCheckInWithMeta[]): LocationFrequency[] {
  const counts = new Map<string, number>();
  let total = 0;
  for (const { checkIn } of checkIns) {
    if (checkIn.dark_patches === 'no') continue;
    for (const loc of checkIn.dark_patch_locations) {
      counts.set(loc, (counts.get(loc) ?? 0) + 1);
      total++;
    }
  }
  return DARK_PATCH_LOCATION_OPTIONS.map(({ id, label }) => ({
    location: id,
    label,
    count: counts.get(id) ?? 0,
    pct: total > 0 ? Math.round(((counts.get(id) ?? 0) / total) * 100) : 0,
  })).sort((a, b) => b.count - a.count);
}

function detectDarkPatchFatigue(
  checkIns: AndrogenWeeklyCheckInWithMeta[],
  moodLogs: MoodLog[],
): string | null {
  const patchWeeks = checkIns.filter(
    (c) => c.checkIn.dark_patches === 'yes' || c.checkIn.dark_patches === 'maybe',
  );
  if (patchWeeks.length < 2) return null;

  let overlap = 0;
  for (const { log } of patchWeeks) {
    const weekEnd = new Date(log.logged_date);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekMoods = moodLogs.filter((m) => {
      if (m.deleted_at) return false;
      const d = m.logged_date;
      return d >= log.logged_date && d <= weekEnd.toISOString().split('T')[0];
    });
    const fatigued = weekMoods.some(
      (m) =>
        m.mood === 'exhausted' ||
        (m.energy_level != null && m.energy_level <= 4),
    );
    if (fatigued) overlap++;
  }

  if (overlap >= 2 && overlap / patchWeeks.length >= 0.5) {
    return 'Dark patches and fatigue often occur together in your logs.';
  }
  return null;
}

function facialHairProgressLabel(checkIns: AndrogenWeeklyCheckInWithMeta[]): string {
  const scores = checkIns.map((c) => BODY_HAIR_SCORES[c.checkIn.body_hair]);
  if (scores.length < 2) return 'Building baseline';
  const recent = scores.slice(-4);
  const trend = recent[recent.length - 1] - recent[0];
  if (trend >= 1) return 'Gradual increase noted';
  if (trend <= -1) return 'Trending down';
  return 'Stable over recent weeks';
}

function peakHairPhase(checkIns: AndrogenWeeklyCheckInWithMeta[]): string | null {
  const byPhase = new Map<string, number[]>();
  for (const { checkIn, phaseLabel } of checkIns) {
    if (phaseLabel === 'Unknown') continue;
    const scores = byPhase.get(phaseLabel) ?? [];
    scores.push(checkIn.hair_shedding === 'none' ? 0 : checkIn.hair_shedding === 'slight' ? 1 : checkIn.hair_shedding === 'noticeable' ? 2 : 3);
    byPhase.set(phaseLabel, scores);
  }
  let best: { phase: string; avg: number } | null = null;
  for (const [phase, scores] of byPhase) {
    const a = avg(scores);
    if (!best || a > best.avg) best = { phase, avg: a };
  }
  return best && best.avg >= 1.5 ? best.phase : null;
}

export function computeAndrogenIntelligence(
  analytics: AndrogenAnalytics,
  moodLogs: MoodLog[],
  _periods: PeriodLog[],
): AndrogenIntelligence {
  const { checkIns, trendPoints } = analytics;

  const hairScores = trendPoints.map((p) => p.hairScore);
  const reportedPatchWeeks = checkIns.filter(
    (c) => c.checkIn.dark_patches !== 'no',
  ).length;

  return {
    hair: {
      trendPoints,
      weeklyChange: computeWeeklyChange(trendPoints, 'hairScore', {
        up: 'Increased shedding this week',
        down: 'Shedding eased this week',
        stable: 'No major change this week',
      }),
      avgSeverity: avg(hairScores),
      peakPhase: peakHairPhase(checkIns),
    },
    skin: {
      trendPoints,
      zoneFrequency: buildZoneFrequency(checkIns),
      weeklyChange: computeWeeklyChange(trendPoints, 'acneScore', {
        up: 'Breakouts increased',
        down: 'Breakouts improved',
        stable: 'Acne stable this week',
      }),
      hormonalPattern: detectHormonalPattern(checkIns),
    },
    facialHair: {
      trendPoints,
      weeklyChange: computeWeeklyChange(trendPoints, 'bodyHairScore', {
        up: 'More growth noted',
        down: 'Growth eased',
        stable: 'No change this week',
      }),
      progressLabel: facialHairProgressLabel(checkIns),
    },
    scalp: {
      oilinessPoints: trendPoints,
      drynessPoints: trendPoints,
      oilinessChange: computeWeeklyChange(trendPoints, 'scalpOiliness', {
        up: 'Oiliness increased',
        down: 'Oiliness reduced',
        stable: 'Oiliness stable',
      }),
      drynessChange: computeWeeklyChange(trendPoints, 'scalpDryness', {
        up: 'Dryness increased',
        down: 'Dryness reduced',
        stable: 'Dryness stable',
      }),
    },
    darkPatches: {
      locationFrequency: buildLocationFrequency(checkIns),
      reportedWeeks: reportedPatchWeeks,
      coOccurrenceNote: detectDarkPatchFatigue(checkIns, moodLogs),
    },
  };
}

export function trendDirectionIcon(direction: TrendDirection): string {
  if (direction === 'up') return '↑';
  if (direction === 'down') return '↓';
  return '→';
}
