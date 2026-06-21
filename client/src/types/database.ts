/** @deprecated Use @/types/supabase instead */
export type {
  Profile,
  UserPreferences,
  PeriodLog,
  SleepLog,
  WeightLog,
  MoodLog,
  AndrogenLog,
  QuizResult,
  DoctorReport,
  ChatHistoryEntry,
  Database,
  MoodType,
} from './supabase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
  streaming?: boolean;
}

export interface DailyTrend {
  date: string;
  mood: string;
  energyLevel: number | null;
  sleepHours: number | null;
  symptomCount: number;
  avgSeverity: number;
}

export interface InsightSummary {
  daysLogged: number;
  dominantMood: string;
  avgEnergy: number | null;
  avgSleep: number | null;
  topSymptoms: Array<{ name: string; frequency: number; avgSeverity: number }>;
  streakDays: number;
}

export interface SymptomEntryWithDetails {
  id: string;
  logged_date: string;
  cycle_phase: string;
  mood: string;
  energy_level: number | null;
  sleep_hours: number | null;
  sleep_quality: number | null;
  notes: string | null;
  triggers: string[];
  symptom_details: Array<{
    id: string;
    symptom_name: string;
    category: string;
    severity: string;
  }>;
}
