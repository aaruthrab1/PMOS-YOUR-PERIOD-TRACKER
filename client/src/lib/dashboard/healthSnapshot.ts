import type { Profile, QuizResult } from '@/types/supabase';
import type { InsightSummary, DailyTrend } from '@/types/database';

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface HealthSnapshot {
  score: number;
  risk: RiskLevel;
  riskLabel: string;
  lastAssessmentDate: string | null;
  lastAssessmentLabel: string;
  hasData: boolean;
}

function riskFromScore(score: number, symptomBurden: number): RiskLevel {
  if (score >= 72 && symptomBurden < 2) return 'low';
  if (score >= 50 || symptomBurden < 4) return 'moderate';
  return 'high';
}

function riskLabel(risk: RiskLevel): string {
  if (risk === 'low') return 'Looking balanced';
  if (risk === 'moderate') return 'Worth monitoring';
  return 'Needs attention';
}

export function computeHealthSnapshot(
  profile: Profile | null,
  summary: InsightSummary | null,
  trends: DailyTrend[],
  latestQuiz: QuizResult | null,
  logCount = 0,
): HealthSnapshot {
  const hasData =
    logCount > 0 ||
    (summary?.daysLogged ?? 0) > 0 ||
    trends.length > 0 ||
    !!latestQuiz ||
    !!profile?.energy_level;

  if (!hasData) {
    return {
      score: 0,
      risk: 'moderate',
      riskLabel: 'Not enough data yet',
      lastAssessmentDate: null,
      lastAssessmentLabel: 'Log to unlock',
      hasData: false,
    };
  }

  let score = 62;

  if (profile?.energy_level) {
    score = Math.min(100, 40 + profile.energy_level * 6);
  }

  if (summary) {
    score += Math.min(15, summary.streakDays * 2);
    score += Math.min(10, summary.daysLogged);
    if (summary.avgSleep && summary.avgSleep >= 7) score += 8;
    else if (summary.avgSleep && summary.avgSleep < 6) score -= 8;
    if (summary.avgEnergy && summary.avgEnergy >= 6) score += 5;
  }

  if (latestQuiz?.score) {
    score = Math.round(score * 0.6 + latestQuiz.score * 4);
  }

  score = Math.max(20, Math.min(98, Math.round(score)));

  const symptomBurden = summary?.topSymptoms?.reduce((s, t) => s + t.frequency, 0) ?? 0;
  const recentSeverity = trends.slice(-7).reduce((s, t) => s + t.avgSeverity, 0) / Math.max(1, trends.slice(-7).length);
  const adjustedBurden = symptomBurden + recentSeverity;

  const risk = riskFromScore(score, adjustedBurden);

  const lastAssessmentDate =
    latestQuiz?.completed_at ??
    (profile?.onboarding_completed ? profile.updated_at : null);

  const lastAssessmentLabel = lastAssessmentDate
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
        new Date(lastAssessmentDate)
      )
    : 'Not yet assessed';

  return {
    score,
    risk,
    riskLabel: riskLabel(risk),
    lastAssessmentDate,
    lastAssessmentLabel,
    hasData: true,
  };
}
