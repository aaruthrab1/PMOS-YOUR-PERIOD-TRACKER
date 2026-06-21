import type { ReportSourceSnapshot, ReportChartPoint } from './types';

const HAIR_SCORES: Record<string, number> = {
  none: 0,
  slight: 1,
  noticeable: 2,
  significant: 3,
};

const MOOD_SCORES: Record<string, number> = {
  happy: 8,
  calm: 7,
  neutral: 6,
  energetic: 8,
  irritable: 4,
  anxious: 3,
  sad: 2,
  exhausted: 2,
  foggy: 3,
};

function parseHairScore(symptoms: Record<string, unknown> | undefined): number | null {
  if (!symptoms || typeof symptoms !== 'object') return null;
  const level = symptoms.hair_shedding;
  if (typeof level !== 'string') return null;
  return HAIR_SCORES[level] ?? null;
}

export function enrichSnapshot(snapshot: ReportSourceSnapshot): ReportSourceSnapshot {
  const cycleLength: ReportChartPoint[] =
    snapshot.chartData.cycleLength ??
    snapshot.periodLogs
      .filter((p) => p.cycleLength != null)
      .map((p) => ({ date: p.start, value: p.cycleLength! }))
      .sort((a, b) => a.date.localeCompare(b.date));

  const moodTrend: ReportChartPoint[] =
    snapshot.chartData.moodTrend ??
    snapshot.moodLogs
      .map((m) => ({
        date: m.date,
        value: m.energy ?? MOOD_SCORES[m.mood] ?? 5,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

  const hairFall: ReportChartPoint[] =
    snapshot.chartData.hairFall ??
    snapshot.androgenLogs
      .map((a) => {
        const score = parseHairScore(a.symptoms);
        return score != null ? { date: a.date, value: score } : null;
      })
      .filter((p): p is ReportChartPoint => p != null)
      .sort((a, b) => a.date.localeCompare(b.date));

  return {
    ...snapshot,
    chartData: {
      ...snapshot.chartData,
      cycleLength,
      moodTrend,
      hairFall,
    },
  };
}
