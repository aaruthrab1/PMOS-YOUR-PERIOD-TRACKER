import type {
  CyraDoctorReport,
  ReportSections,
  DoctorPrepData,
  ReportSourceSnapshot,
  RiskItem,
  ReportChartPoint,
} from './types';
import { parseDoctorPrep, parseReportSections, parseRiskSummary, parseSourceSnapshot } from './types';
import { enrichSnapshot } from './enrichSnapshot';

export interface ClinicalReportView {
  patientName: string;
  generatedOn: string;
  reportPeriod: string;
  healthSummary: string[];
  profileSummary: string[];
  cycleAnalysis: string[];
  sleepAnalysis: string[];
  moodAnalysis: string[];
  androgenAnalysis: string[];
  symptomHistory: string[];
  riskPatterns: RiskItem[];
  questionsForDoctor: string[];
  recommendedTests: Array<{ name: string; reason: string; suggested?: boolean }>;
  timeline: Array<{ date: string; summary: string }>;
  snapshot: ReportSourceSnapshot;
  charts: {
    cycleLength: ReportChartPoint[];
    sleepHours: ReportChartPoint[];
    moodTrend: ReportChartPoint[];
    hairFall: ReportChartPoint[];
  };
}

const HAIR_SCORES: Record<string, number> = {
  none: 0,
  slight: 1,
  noticeable: 2,
  significant: 3,
};

function formatReportDate(d: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(d));
}

function formatPeriod(start: string, end: string): string {
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmt.format(new Date(start))} — ${fmt.format(new Date(end))}`;
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function buildProfileSummary(snapshot: ReportSourceSnapshot): string[] {
  const { patient } = snapshot;
  const lines: string[] = [];
  if (patient.name) lines.push(`Patient: ${patient.name}`);
  if (patient.age != null) lines.push(`Age: ${patient.age} years`);
  if (patient.region) lines.push(`Region: ${patient.region}`);
  if (patient.conditions?.length) lines.push(`Self-reported conditions: ${patient.conditions.join(', ')}`);
  if (patient.healthGoals?.length) lines.push(`Health goals: ${patient.healthGoals.join(', ')}`);
  const cov = snapshot.dataCoverage;
  lines.push(
    `Data logged: ${cov.periods} periods · ${cov.moods} mood · ${cov.sleep} sleep · ${cov.androgen} androgen check-ins · ${cov.quizzes} assessments`,
  );
  return lines;
}

function buildCycleAnalysis(snapshot: ReportSourceSnapshot, ai: string[]): string[] {
  if (ai.length) return ai;
  const lines: string[] = [];
  const lengths = snapshot.periodLogs.map((p) => p.cycleLength).filter((c): c is number => c != null);
  if (lengths.length === 0) {
    lines.push('Insufficient period logs in this range — log cycle start dates for cycle analysis.');
    return lines;
  }
  const mean = avg(lengths)!;
  lines.push(`Average cycle length: ${Math.round(mean)} days (${lengths.length} cycles logged).`);
  const irregular = lengths.filter((l) => l < 21 || l > 35).length;
  if (irregular > 0) {
    lines.push(`${irregular} cycle(s) outside the typical 21–35 day range — worth discussing with your clinician.`);
  }
  const highPain = snapshot.periodLogs.filter((p) => (p.painLevel ?? 0) >= 7);
  if (highPain.length) {
    lines.push(`High pain (≥7/10) recorded during ${highPain.length} period(s).`);
  }
  return lines;
}

function buildSleepAnalysis(snapshot: ReportSourceSnapshot, ai: string[]): string[] {
  const fromAi = ai.filter((s) => !s.toLowerCase().includes('energy') || s.toLowerCase().includes('sleep'));
  if (fromAi.length >= 2) return fromAi;

  const hours = snapshot.sleepLogs.map((s) => s.hours).filter((h): h is number => h != null);
  if (hours.length === 0) {
    return ['No sleep logs in this period — nightly tracking strengthens this section for your doctor.'];
  }
  const mean = avg(hours)!;
  const lines = [`Average sleep: ${mean.toFixed(1)} hours/night over ${hours.length} logged nights.`];
  if (mean < 6.5) lines.push('Sleep averaging below 7 hours — may affect mood, energy, and cycle symptoms.');
  if (mean >= 7 && mean <= 9) lines.push('Sleep duration falls within a commonly recommended range.');
  return [...fromAi, ...lines].slice(0, 4);
}

function buildMoodAnalysis(snapshot: ReportSourceSnapshot, ai: string[]): string[] {
  if (ai.length >= 2) return ai;
  const counts = new Map<string, number>();
  for (const m of snapshot.moodLogs) {
    counts.set(m.mood, (counts.get(m.mood) ?? 0) + 1);
  }
  if (counts.size === 0) {
    return ['No mood entries in this period — daily mood logs help identify cycle-linked patterns.'];
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const energies = snapshot.moodLogs.map((m) => m.energy).filter((e): e is number => e != null);
  const lines = [`Most logged mood: ${top[0]} (${top[1]} entries).`];
  const eAvg = avg(energies);
  if (eAvg != null) lines.push(`Average energy level: ${eAvg.toFixed(1)}/10.`);
  const anxious = snapshot.moodLogs.filter((m) => m.mood === 'anxious' || m.mood === 'sad').length;
  if (anxious >= 3) lines.push('Anxious or low mood entries appear multiple times — consider discussing support options.');
  return [...ai, ...lines].slice(0, 4);
}

function buildAndrogenAnalysis(snapshot: ReportSourceSnapshot, ai: string[]): string[] {
  if (ai.length) return ai;
  const logs = snapshot.androgenLogs;
  if (logs.length === 0) {
    return ['No androgen check-ins in this period — weekly hair/skin/scalp logs add valuable context for hormone-related symptoms.'];
  }
  const hairScores: number[] = [];
  const acneNotes: string[] = [];
  for (const log of logs) {
    const sym = log.symptoms;
    if (sym && typeof sym === 'object' && 'hair_shedding' in sym) {
      const score = HAIR_SCORES[String(sym.hair_shedding)] ?? 0;
      hairScores.push(score);
    }
    if (sym && typeof sym === 'object' && 'acne' in sym && sym.acne !== 'none') {
      acneNotes.push(String(sym.acne));
    }
  }
  const lines = [`${logs.length} weekly androgen symptom check-in(s) recorded.`];
  if (hairScores.length) {
    const hAvg = avg(hairScores)!;
    if (hAvg >= 1.5) lines.push('Hair shedding scores trend above baseline across check-ins — may correlate with androgen shifts.');
    else lines.push('Hair shedding remained relatively stable across logged check-ins.');
  }
  if (acneNotes.length >= 2) lines.push('Acne was reported in multiple weekly check-ins — location and cycle timing may help your clinician.');
  return lines;
}

function buildSymptomHistory(snapshot: ReportSourceSnapshot, ai: string[]): string[] {
  const lines = [...ai];
  const periodSymptoms = new Map<string, number>();
  for (const p of snapshot.periodLogs) {
    for (const s of p.symptoms ?? []) {
      periodSymptoms.set(s, (periodSymptoms.get(s) ?? 0) + 1);
    }
  }
  if (periodSymptoms.size) {
    const top = [...periodSymptoms.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    lines.push(`Period-linked symptoms: ${top.map(([n, c]) => `${n} (${c}×)`).join(', ')}.`);
  }
  const fog = snapshot.metabolicLogs.filter((m) => m.brainFog && m.brainFog !== 'none').length;
  if (fog >= 2) lines.push(`Brain fog logged on ${fog} days.`);
  const cravings = snapshot.metabolicLogs.filter((m) => m.sugarCravings && m.sugarCravings !== 'none').length;
  if (cravings >= 2) lines.push(`Sugar cravings noted on ${cravings} days.`);
  if (lines.length === 0) {
    lines.push('Log symptoms in Tracker and weekly androgen check-ins to build a richer symptom history.');
  }
  return lines.slice(0, 6);
}

function buildHealthSummary(
  report: CyraDoctorReport,
  sections: ReportSections | null,
  view: Omit<ClinicalReportView, 'healthSummary' | 'snapshot' | 'charts'>,
): string[] {
  if (report.summary) {
    const paras = report.summary.split('\n').filter((p) => p.trim() && !p.startsWith('#'));
    if (paras.length >= 2) return paras.slice(0, 4);
  }
  const bullets = [
    ...view.cycleAnalysis.slice(0, 1),
    ...view.sleepAnalysis.slice(0, 1),
    ...view.moodAnalysis.slice(0, 1),
    ...(sections?.symptomTrends.slice(0, 1) ?? []),
  ].filter(Boolean);
  if (bullets.length) return bullets;
  return ['This report summarizes self-reported health tracking data for discussion with your healthcare provider.'];
}

function buildTimeline(snapshot: ReportSourceSnapshot, prep: DoctorPrepData | null): Array<{ date: string; summary: string }> {
  if (prep?.symptomTimeline.length) return prep.symptomTimeline;

  const dates = new Set<string>();
  snapshot.moodLogs.forEach((m) => dates.add(m.date));
  snapshot.sleepLogs.forEach((s) => dates.add(s.date));
  snapshot.metabolicLogs.forEach((m) => dates.add(m.date));
  snapshot.androgenLogs.forEach((a) => dates.add(a.date));

  return [...dates]
    .sort()
    .reverse()
    .slice(0, 21)
    .map((date) => {
      const parts: string[] = [];
      const mood = snapshot.moodLogs.find((m) => m.date === date);
      const sleep = snapshot.sleepLogs.find((s) => s.date === date);
      const metabolic = snapshot.metabolicLogs.find((m) => m.date === date);
      const androgen = snapshot.androgenLogs.find((a) => a.date === date);

      if (mood) {
        parts.push(`Mood: ${mood.mood}`);
        if (mood.energy != null) parts.push(`Energy: ${mood.energy}/10`);
      }
      if (sleep?.hours != null) parts.push(`Sleep: ${sleep.hours}h`);
      if (metabolic?.brainFog && metabolic.brainFog !== 'none') parts.push(`Brain fog: ${metabolic.brainFog}`);
      if (androgen?.symptoms && typeof androgen.symptoms === 'object') {
        const sym = androgen.symptoms as Record<string, unknown>;
        if (sym.hair_shedding && sym.hair_shedding !== 'none') parts.push(`Hair: ${sym.hair_shedding}`);
        if (sym.acne && sym.acne !== 'none') parts.push(`Acne: ${sym.acne}`);
      }
      return { date, summary: parts.join(' · ') };
    })
    .filter((t) => t.summary);
}

export function buildClinicalReportView(report: CyraDoctorReport): ClinicalReportView | null {
  const rawSnapshot = parseSourceSnapshot(report.source_snapshot);
  if (!rawSnapshot) return null;

  const snapshot = enrichSnapshot(rawSnapshot);
  const sections = parseReportSections(report.sections);
  const prep = parseDoctorPrep(report.doctor_prep);
  const risks = parseRiskSummary(report.risk_summary);

  const cycleAnalysis = buildCycleAnalysis(snapshot, sections?.cyclePatternSummary ?? []);
  const sleepAnalysis = buildSleepAnalysis(snapshot, sections?.sleepAnalysis ?? sections?.sleepEnergyTrends ?? []);
  const moodAnalysis = buildMoodAnalysis(snapshot, sections?.moodTrends ?? []);
  const androgenAnalysis = buildAndrogenAnalysis(snapshot, sections?.androgenAnalysis ?? []);
  const symptomHistory = buildSymptomHistory(snapshot, sections?.symptomTrends ?? []);
  const timeline = buildTimeline(snapshot, prep);

  const questionsForDoctor = prep?.questionsToAsk ?? report.questions_for_doctor ?? [];
  const recommendedTests =
    prep?.testChecklist.map((t) => ({ name: t.name, reason: t.reason, suggested: t.suggested })) ??
    sections?.suggestedTests.map((t) => ({ ...t, suggested: true })) ??
    [];

  const partial = {
    patientName: snapshot.patient.name ?? 'Patient',
    generatedOn: formatReportDate(report.created_at),
    reportPeriod: formatPeriod(report.date_range_start, report.date_range_end),
    profileSummary: buildProfileSummary(snapshot),
    cycleAnalysis,
    sleepAnalysis,
    moodAnalysis,
    androgenAnalysis,
    symptomHistory,
    riskPatterns: risks,
    questionsForDoctor,
    recommendedTests,
    timeline,
  };

  return {
    ...partial,
    healthSummary: buildHealthSummary(report, sections, partial),
    snapshot,
    charts: {
      cycleLength: snapshot.chartData.cycleLength ?? [],
      sleepHours: snapshot.chartData.sleepHours,
      moodTrend: snapshot.chartData.moodTrend ?? snapshot.chartData.moodEnergy,
      hairFall: snapshot.chartData.hairFall ?? [],
    },
  };
}
