export interface ReportSections {
  cyclePatternSummary: string[];
  symptomTrends: string[];
  sleepEnergyTrends: string[];
  sleepAnalysis?: string[];
  moodTrends: string[];
  androgenAnalysis?: string[];
  weightTrends: string[];
  discussionPoints: string[];
  suggestedTests: Array<{ name: string; reason: string }>;
}

export interface DoctorPrepData {
  questionsToAsk: string[];
  symptomTimeline: Array<{ date: string; summary: string }>;
  keyConcerns: string[];
  testChecklist: Array<{ name: string; reason: string; suggested: boolean }>;
  appointmentNotes: string;
}

export interface RiskItem {
  concern: string;
  severity: 'low' | 'moderate' | 'high';
  note: string;
}

export interface ReportPatientInfo {
  name?: string;
  age?: number | null;
  region?: string | null;
  conditions?: string[];
  healthGoals?: string[];
}

export interface ReportPeriodRow {
  start: string;
  end?: string | null;
  flow?: string | null;
  cycleLength?: number | null;
  painLevel?: number | null;
  symptoms?: string[];
}

export interface ReportChartPoint {
  date: string;
  value: number;
}

export interface ReportSourceSnapshot {
  patient: ReportPatientInfo;
  periodLogs: ReportPeriodRow[];
  moodLogs: Array<{ date: string; mood: string; energy?: number | null }>;
  sleepLogs: Array<{ date: string; hours?: number | null; quality?: string | null }>;
  weightLogs: Array<{ date: string; weight: number; unit: string }>;
  metabolicLogs: Array<{
    date: string;
    energy?: number | null;
    hunger?: number | null;
    sugarCravings?: string | null;
    brainFog?: string | null;
  }>;
  androgenLogs: Array<{ date: string; symptoms?: Record<string, unknown> }>;
  quizResults: Array<{
    type: string;
    score?: number | null;
    completedAt: string;
    recommendations?: string[];
  }>;
  chartData: {
    sleepHours: ReportChartPoint[];
    moodEnergy: ReportChartPoint[];
    moodTrend?: ReportChartPoint[];
    cycleLength?: ReportChartPoint[];
    hairFall?: ReportChartPoint[];
    weight: ReportChartPoint[];
  };
  dataCoverage: {
    periods: number;
    moods: number;
    sleep: number;
    weight: number;
    metabolic: number;
    androgen: number;
    quizzes: number;
  };
}

export interface CyraDoctorReport {
  id: string;
  title: string;
  date_range_start: string;
  date_range_end: string;
  summary: string | null;
  key_symptoms: unknown;
  questions_for_doctor: string[];
  sections: ReportSections | null;
  doctor_prep: DoctorPrepData | null;
  source_snapshot: ReportSourceSnapshot | null;
  risk_summary: RiskItem[] | null;
  status: string;
  created_at: string;
}

export type ReportViewMode = 'summary' | 'prep' | 'export';

export const REPORT_DATE_PRESETS = [
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 6 months', days: 180 },
] as const;

export function parseReportSections(raw: unknown): ReportSections | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as ReportSections;
  if (!Array.isArray(s.cyclePatternSummary)) return null;
  return s;
}

export function parseDoctorPrep(raw: unknown): DoctorPrepData | null {
  if (!raw || typeof raw !== 'object') return null;
  const d = raw as DoctorPrepData;
  if (!Array.isArray(d.questionsToAsk)) return null;
  return d;
}

export function parseSourceSnapshot(raw: unknown): ReportSourceSnapshot | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as ReportSourceSnapshot;
  if (!s.patient || !s.chartData) return null;
  return {
    ...s,
    chartData: {
      sleepHours: s.chartData.sleepHours ?? [],
      moodEnergy: s.chartData.moodEnergy ?? [],
      moodTrend: s.chartData.moodTrend,
      cycleLength: s.chartData.cycleLength,
      hairFall: s.chartData.hairFall,
      weight: s.chartData.weight ?? [],
    },
  };
}

export function parseRiskSummary(raw: unknown): RiskItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((r) => r && typeof r.concern === 'string');
}
