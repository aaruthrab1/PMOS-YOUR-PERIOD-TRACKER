import type { AndrogenAnalytics } from './analytics';
import type { AndrogenInsight } from './types';

export function generateAndrogenInsights(analytics: AndrogenAnalytics): AndrogenInsight[] {
  const insights: AndrogenInsight[] = [];
  const { checkIns, trendPoints } = analytics;

  if (checkIns.length === 0) {
    insights.push({
      id: 'start',
      text: 'Complete your first weekly check-in to start spotting patterns in hair, skin, and scalp changes.',
    });
    return insights;
  }

  if (checkIns.length < 3) {
    insights.push({
      id: 'building',
      text: `${3 - checkIns.length} more check-in${checkIns.length === 2 ? '' : 's'} unlock trend charts with cycle phase overlays.`,
    });
  }

  const withAcne = checkIns.filter((c) => c.checkIn.acne !== 'none');
  if (withAcne.length >= 3) {
    const phases = withAcne.map((c) => c.phase);
    const uniquePhases = new Set(phases);
    if (uniquePhases.size === 1 && phases[0] !== 'Unknown') {
      insights.push({
        id: 'acne-phase',
        text: `Acne has appeared during the same phase of your cycle (${checkIns.find((c) => c.phase === phases[0])?.phaseLabel ?? phases[0]}) for your recent check-ins.`,
      });
    }
  }

  const hairScores = trendPoints.map((p) => p.hairScore);
  if (hairScores.length >= 3) {
    const recent = hairScores.slice(-4);
    const spread = Math.max(...recent) - Math.min(...recent);
    if (spread <= 1) {
      insights.push({
        id: 'hair-stable',
        text: 'Hair shedding has remained stable over the last month.',
      });
    } else if (recent[recent.length - 1] > recent[0]) {
      insights.push({
        id: 'hair-up',
        text: 'Hair shedding has increased slightly in recent check-ins — tracking alongside your cycle may help you notice what coincides.',
      });
    }
  }

  const irregularPhases = checkIns.filter((c) => c.phase === 'Unknown').length;
  const skinSymptoms = checkIns.filter(
    (c) => c.checkIn.acne !== 'none' || c.checkIn.scalp_oiliness >= 4,
  );
  if (irregularPhases >= 2 && skinSymptoms.length >= 2) {
    insights.push({
      id: 'irregular-skin',
      text: 'Skin symptoms appear more frequently when cycle timing is less clear — logging periods can sharpen these patterns.',
    });
  }

  const oilyLuteal = checkIns.filter(
    (c) => c.phase === 'Luteal' && c.checkIn.scalp_oiliness >= 4,
  );
  if (oilyLuteal.length >= 2) {
    insights.push({
      id: 'oily-luteal',
      text: 'Scalp oiliness tends to run higher before your period — a pattern many people notice in the luteal phase.',
    });
  }

  const jawAcne = analytics.acneZoneFrequency.find((z) => z.zone === 'jawline_chin');
  if (jawAcne && jawAcne.count >= 2) {
    insights.push({
      id: 'jaw-acne',
      text: 'Breakouts along the jaw and chin show up often in your logs — hormonal shifts can influence this area for some people.',
    });
  }

  if (insights.length === 0 && checkIns.length >= 1) {
    insights.push({
      id: 'keep-going',
      text: 'You\'re building a helpful record. Consistent weekly check-ins make patterns easier to spot over time.',
    });
  }

  return insights.slice(0, 5);
}
