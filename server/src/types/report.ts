/** Structured doctor report types — shared between context, AI, and API */

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
  moodLogs: Array<{ date: string; mood: string; energy?: number | null; anxiety?: number | null }>;
  sleepLogs: Array<{ date: string; hours?: number | null; quality?: string | null }>;
  weightLogs: Array<{ date: string; weight: number; unit: string }>;
  metabolicLogs: Array<{
    date: string;
    energy?: number | null;
    hunger?: number | null;
    sugarCravings?: string | null;
    brainFog?: string | null;
  }>;
  androgenLogs: Array<{ date: string; symptoms?: Record<string, unknown>; testosterone?: number | null }>;
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

export interface ReportGenerationResult {
  sections: ReportSections;
  doctorPrep: DoctorPrepData;
  riskSummary: RiskItem[];
  narrativeSummary: string;
  questionsForDoctor: string[];
}

export interface ReportContextBundle {
  snapshot: ReportSourceSnapshot;
  contextText: string;
  hasData: boolean;
}
