import type { MoodLog, PeriodLog } from '@/types/supabase';
import type { AndrogenAnalytics } from './analytics';
import type { AndrogenIntelligence } from './types';
import type { AndrogenInsight } from './types';
import { HAIR_SCORES } from './constants';

function cycleGapDays(periods: PeriodLog[]): number[] {
  const sorted = [...periods]
    .filter((p) => !p.deleted_at)
    .sort((a, b) => b.period_start.localeCompare(a.period_start));
  const gaps: number[] = [];
  for (let i = 0; i < sorted.length - 1 && i < 6; i++) {
    const a = new Date(sorted[i].period_start);
    const b = new Date(sorted[i + 1].period_start);
    gaps.push(Math.abs(Math.floor((a.getTime() - b.getTime()) / 86_400_000)));
  }
  return gaps;
}

function hairAcrossCyclesInsight(
  analytics: AndrogenAnalytics,
  periods: PeriodLog[],
): AndrogenInsight | null {
  const { checkIns } = analytics;
  if (checkIns.length < 4 || periods.length < 2) return null;

  const sorted = [...periods]
    .filter((p) => !p.deleted_at)
    .sort((a, b) => b.period_start.localeCompare(a.period_start));

  const cycleHair: number[][] = [];
  for (let i = 0; i < Math.min(sorted.length - 1, 3); i++) {
    const start = sorted[i + 1].period_start;
    const end = sorted[i].period_start;
    const inCycle = checkIns.filter(
      (c) => c.log.logged_date >= start && c.log.logged_date <= end,
    );
    if (inCycle.length >= 1) {
      cycleHair.push(inCycle.map((c) => HAIR_SCORES[c.checkIn.hair_shedding]));
    }
  }

  if (cycleHair.length < 2) return null;

  const avgs = cycleHair.map((s) => s.reduce((a, b) => a + b, 0) / s.length);
  const recent = avgs[0];
  const prior = avgs[1];

  if (recent >= prior + 0.5) {
    return {
      id: 'hair-cycles-up',
      text: 'Hair fall has increased during the last two cycles — consider noting stress, sleep, and nutrition alongside your logs.',
      category: 'hair',
      priority: 9,
    };
  }

  if (recent <= prior - 0.5) {
    return {
      id: 'hair-cycles-down',
      text: 'Hair shedding has eased compared with your previous cycle — a positive trend worth continuing to track.',
      category: 'hair',
      priority: 7,
    };
  }

  return null;
}

function jawlineLongCycleInsight(
  analytics: AndrogenAnalytics,
  periods: PeriodLog[],
): AndrogenInsight | null {
  const gaps = cycleGapDays(periods);
  if (gaps.length === 0) return null;

  const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  if (avgGap < 32) return null;

  const jawWeeks = analytics.checkIns.filter(
    (c) =>
      c.checkIn.acne !== 'none' &&
      c.checkIn.acne_zones.includes('jawline_chin'),
  );

  if (jawWeeks.length >= 2) {
    return {
      id: 'jawline-long-cycle',
      text: 'Jawline acne appears repeatedly before longer cycles — a pattern often linked to hormonal shifts in the luteal phase.',
      category: 'skin',
      priority: 8,
    };
  }

  return null;
}

function darkPatchFatigueInsight(intelligence: AndrogenIntelligence): AndrogenInsight | null {
  if (!intelligence.darkPatches.coOccurrenceNote) return null;
  return {
    id: 'patches-fatigue',
    text: intelligence.darkPatches.coOccurrenceNote,
    category: 'patches',
    priority: 8,
  };
}

function lutealScalpInsight(analytics: AndrogenAnalytics): AndrogenInsight | null {
  const oily = analytics.checkIns.filter(
    (c) => c.phase === 'Luteal' && c.checkIn.scalp_oiliness >= 4,
  );
  if (oily.length >= 2) {
    return {
      id: 'luteal-scalp',
      text: 'Scalp oiliness tends to peak in your luteal phase — research links androgen shifts to sebum production before menstruation.',
      category: 'scalp',
      priority: 6,
    };
  }
  return null;
}

function facialHairTrendInsight(intelligence: AndrogenIntelligence): AndrogenInsight | null {
  const { weeklyChange, progressLabel } = intelligence.facialHair;
  if (weeklyChange.direction === 'up') {
    return {
      id: 'facial-hair-up',
      text: 'Facial or body hair changes were noted this week — consistent weekly logs help distinguish gradual trends from normal variation.',
      category: 'facial_hair',
      priority: 5,
    };
  }
  if (progressLabel === 'Gradual increase noted') {
    return {
      id: 'facial-hair-progress',
      text: 'Facial hair tracking shows a gradual upward trend over recent weeks — useful data for clinician discussions.',
      category: 'facial_hair',
      priority: 6,
    };
  }
  return null;
}

function hormonalAcneInsight(intelligence: AndrogenIntelligence): AndrogenInsight | null {
  const { hormonalPattern } = intelligence.skin;
  if (hormonalPattern === 'jawline_cycle') {
    return {
      id: 'hormonal-jawline',
      text: 'Breakouts cluster along the jawline during late-cycle phases — a hallmark pattern of hormonal acne in many people with PCOS.',
      category: 'skin',
      priority: 7,
    };
  }
  if (hormonalPattern === 'luteal_acne') {
    return {
      id: 'hormonal-luteal',
      text: 'Acne flares most often in your luteal phase — pre-menstrual androgen peaks may be contributing.',
      category: 'skin',
      priority: 7,
    };
  }
  return null;
}

function sleepHairInsight(moodLogs: MoodLog[], analytics: AndrogenAnalytics): AndrogenInsight | null {
  const recentHair = analytics.trendPoints.slice(-3);
  if (recentHair.length < 2 || recentHair[recentHair.length - 1].hairScore < 2) return null;

  const lowEnergy = moodLogs.filter(
    (m) => !m.deleted_at && m.energy_level != null && m.energy_level <= 4,
  ).length;

  if (lowEnergy >= 3) {
    return {
      id: 'hair-energy',
      text: 'Increased hair shedding coincides with lower energy weeks — sleep and stress may be amplifying androgen-related symptoms.',
      category: 'hair',
      priority: 6,
    };
  }
  return null;
}

export function generateIntelligenceInsights(
  analytics: AndrogenAnalytics,
  intelligence: AndrogenIntelligence,
  periods: PeriodLog[],
  moodLogs: MoodLog[],
): AndrogenInsight[] {
  const insights: AndrogenInsight[] = [];

  if (analytics.checkInCount === 0) {
    return [{
      id: 'start',
      text: 'Complete your first weekly check-in to unlock cycle-linked intelligence across hair, skin, and scalp domains.',
      category: 'general',
      priority: 1,
    }];
  }

  if (analytics.checkInCount < 3) {
    insights.push({
      id: 'building',
      text: `${3 - analytics.checkInCount} more check-in${analytics.checkInCount === 2 ? '' : 's'} unlock full trend analysis and cross-domain pattern detection.`,
      category: 'general',
      priority: 2,
    });
  }

  const candidates = [
    hairAcrossCyclesInsight(analytics, periods),
    jawlineLongCycleInsight(analytics, periods),
    darkPatchFatigueInsight(intelligence),
    hormonalAcneInsight(intelligence),
    lutealScalpInsight(analytics),
    facialHairTrendInsight(intelligence),
    sleepHairInsight(moodLogs, analytics),
  ].filter(Boolean) as AndrogenInsight[];

  insights.push(...candidates);

  if (intelligence.hair.peakPhase) {
    insights.push({
      id: 'hair-peak-phase',
      text: `Hair shedding scores highest during your ${intelligence.hair.peakPhase.toLowerCase()} phase — timing may help you anticipate changes.`,
      category: 'hair',
      priority: 5,
    });
  }

  const topZone = intelligence.skin.zoneFrequency.find((z) => z.count >= 2);
  if (topZone && !insights.some((i) => i.id.includes('jawline'))) {
    insights.push({
      id: 'zone-dominant',
      text: `${topZone.label} is your most frequently logged breakout zone (${topZone.count} check-ins) — location mapping helps identify hormonal vs. contact patterns.`,
      category: 'skin',
      priority: 4,
    });
  }

  if (insights.length <= 1) {
    insights.push({
      id: 'keep-going',
      text: 'Your androgen intelligence profile is building. Weekly consistency improves cycle-phase correlation accuracy.',
      category: 'general',
      priority: 1,
    });
  }

  return insights
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .slice(0, 6);
}
