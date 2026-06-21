/**
 * Cyra Supabase — TypeScript database interfaces
 * Auto-aligned with supabase/migrations/
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MoodType = 'calm' | 'anxious' | 'irritable' | 'sad' | 'energetic' | 'foggy' | 'neutral' | 'happy' | 'exhausted';
export type FlowIntensity = 'spotting' | 'light' | 'medium' | 'heavy';
export type WeightUnit = 'kg' | 'lb';
export type SyncStatus = 'synced' | 'pending' | 'conflict';
export type ReportStatus = 'draft' | 'ready' | 'shared';
export type ChatRole = 'user' | 'assistant' | 'system';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  timezone: string;
  onboarding_completed: boolean;
  health_goals: string[];
  conditions: string[];
  auth_provider: string | null;
  locale: string | null;
  phone: string | null;
  age_range: string | null;
  region: string | null;
  cycle_regularity: string | null;
  energy_level: number | null;
  common_symptoms: string[];
  last_period_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  reminder_time: string;
  cycle_length_avg: number;
  period_length_avg: number;
  privacy_analytics: boolean;
  language: string;
  simple_language?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PeriodLog {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string | null;
  flow_intensity: FlowIntensity | null;
  pain_level: number | null;
  cycle_length: number | null;
  symptoms: string[];
  notes: string | null;
  client_id: string | null;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SleepLog {
  id: string;
  user_id: string;
  logged_date: string;
  sleep_hours: number | null;
  sleep_quality: number | null;
  bedtime: string | null;
  wake_time: string | null;
  interruptions: number;
  notes: string | null;
  client_id: string | null;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WeightLog {
  id: string;
  user_id: string;
  logged_date: string;
  weight: number;
  unit: WeightUnit;
  body_fat_percent: number | null;
  notes: string | null;
  client_id: string | null;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MoodLog {
  id: string;
  user_id: string;
  logged_date: string;
  mood: MoodType;
  energy_level: number | null;
  anxiety_level: number | null;
  triggers: string[];
  notes: string | null;
  client_id: string | null;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MetabolicLog {
  id: string;
  user_id: string;
  logged_date: string;
  energy_level: number | null;
  hunger_level: number | null;
  sugar_cravings: boolean;
  brain_fog: boolean;
  notes: string | null;
  client_id: string | null;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AndrogenLog {
  id: string;
  user_id: string;
  logged_date: string;
  symptoms: Json;
  lab_markers: Json;
  testosterone_level: number | null;
  dhea_level: number | null;
  notes: string | null;
  client_id: string | null;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_type: string;
  answers: Json;
  score: number | null;
  recommendations: string[];
  completed_at: string;
  client_id: string | null;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
}

export interface DoctorReport {
  id: string;
  user_id: string;
  title: string;
  date_range_start: string;
  date_range_end: string;
  summary: string | null;
  key_symptoms: Json;
  questions_for_doctor: string[];
  sections: Json;
  doctor_prep: Json;
  source_snapshot: Json;
  risk_summary: Json;
  status: ReportStatus;
  shared_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatHistoryEntry {
  id: string;
  user_id: string;
  conversation_id: string;
  role: ChatRole;
  content: string;
  language: string | null;
  token_count: number | null;
  client_id: string | null;
  sync_status: SyncStatus;
  created_at: string;
}

/** Insert types (omit server-generated fields) */
export type PeriodLogInsert = Omit<PeriodLog, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'sync_status' | 'pain_level'> & {
  id?: string;
  pain_level?: number | null;
  sync_status?: SyncStatus;
};

export type SleepLogInsert = Omit<SleepLog, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'sync_status' | 'interruptions'> & {
  id?: string;
  interruptions?: number;
  sync_status?: SyncStatus;
};

export type WeightLogInsert = Omit<WeightLog, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'sync_status'> & {
  id?: string;
  sync_status?: SyncStatus;
};

export type MoodLogInsert = Omit<MoodLog, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'sync_status'> & {
  id?: string;
  sync_status?: SyncStatus;
};

export type MetabolicLogInsert = Omit<MetabolicLog, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'sync_status' | 'sugar_cravings' | 'brain_fog'> & {
  id?: string;
  sugar_cravings?: boolean;
  brain_fog?: boolean;
  sync_status?: SyncStatus;
};

export type AndrogenLogInsert = Omit<AndrogenLog, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'sync_status'> & {
  id?: string;
  sync_status?: SyncStatus;
};

export type QuizResultInsert = Omit<QuizResult, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'sync_status'> & {
  id?: string;
  completed_at?: string;
  sync_status?: SyncStatus;
  client_id?: string | null;
  score?: number | null;
};

export type ChatHistoryInsert = Omit<ChatHistoryEntry, 'id' | 'created_at' | 'sync_status'> & {
  id?: string;
  sync_status?: SyncStatus;
};

export type DoctorReportInsert = Omit<DoctorReport, 'id' | 'created_at' | 'updated_at' | 'shared_at' | 'status'> & {
  id?: string;
  status?: ReportStatus;
  shared_at?: string | null;
};

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'email' | 'created_at'>>;

export interface EducationArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  read_time_minutes: number;
  tags: string[];
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface JourneyStep {
  id: string;
  user_id: string;
  step_id: string;
  completed: boolean;
  date_completed: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyInsight {
  id: string;
  user_id: string;
  insight: string;
  generated_at: string;
  created_at: string;
}

export interface HealthProfile {
  id: string;
  user_id: string;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: string | null;
  sleep_avg_hours: number | null;
  health_goals: string[];
  symptoms: Json;
  created_at: string;
  updated_at: string;
}

export interface MythCheck {
  id: string;
  user_id: string;
  original_text: string;
  result: Json;
  created_at: string;
}

export interface ArticleBookmark {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

export interface ArticleReadProgress {
  id: string;
  user_id: string;
  article_id: string;
  progress_percent: number;
  completed_at: string | null;
  updated_at: string;
}

/** Supabase Database generic shape */
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; email: string }; Update: ProfileUpdate };
      user_preferences: { Row: UserPreferences; Insert: Record<string, unknown>; Update: Partial<UserPreferences> };
      education_articles: { Row: EducationArticle; Insert: Partial<EducationArticle>; Update: Partial<EducationArticle> };
      period_logs: { Row: PeriodLog; Insert: PeriodLogInsert; Update: Partial<PeriodLogInsert> };
      sleep_logs: { Row: SleepLog; Insert: SleepLogInsert; Update: Partial<SleepLogInsert> };
      weight_logs: { Row: WeightLog; Insert: WeightLogInsert; Update: Partial<WeightLogInsert> };
      mood_logs: { Row: MoodLog; Insert: MoodLogInsert; Update: Partial<MoodLogInsert> };
      metabolic_logs: { Row: MetabolicLog; Insert: MetabolicLogInsert; Update: Partial<MetabolicLogInsert> };
      androgen_logs: { Row: AndrogenLog; Insert: AndrogenLogInsert; Update: Partial<AndrogenLogInsert> };
      quiz_results: { Row: QuizResult; Insert: QuizResultInsert; Update: Partial<QuizResultInsert> };
      doctor_reports: { Row: DoctorReport; Insert: DoctorReportInsert; Update: Partial<DoctorReportInsert> };
      chat_history: { Row: ChatHistoryEntry; Insert: ChatHistoryInsert; Update: Partial<ChatHistoryInsert> };
      journey_steps: { Row: JourneyStep; Insert: Partial<JourneyStep> & { user_id: string; step_id: string }; Update: Partial<JourneyStep> };
      weekly_insights: { Row: WeeklyInsight; Insert: Partial<WeeklyInsight> & { user_id: string; insight: string }; Update: Partial<WeeklyInsight> };
      health_profiles: { Row: HealthProfile; Insert: Partial<HealthProfile> & { user_id: string }; Update: Partial<HealthProfile> };
      myth_checks: { Row: MythCheck; Insert: Partial<MythCheck> & { user_id: string; original_text: string }; Update: Partial<MythCheck> };
      article_bookmarks: { Row: ArticleBookmark; Insert: Partial<ArticleBookmark> & { user_id: string; article_id: string }; Update: Partial<ArticleBookmark> };
      article_read_progress: { Row: ArticleReadProgress; Insert: Partial<ArticleReadProgress> & { user_id: string; article_id: string }; Update: Partial<ArticleReadProgress> };
      ai_conversations: { Row: { id: string; user_id: string; title: string; context_summary: string | null; created_at: string; updated_at: string }; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      ai_messages: { Row: { id: string; conversation_id: string; user_id: string | null; role: string; content: string; language: string | null; token_count: number | null; created_at: string }; Insert: Record<string, unknown>; Update: Record<string, unknown> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      mood_type: MoodType;
      flow_intensity: FlowIntensity;
      weight_unit: WeightUnit;
      sync_status: SyncStatus;
      report_status: ReportStatus;
    };
  };
}

/** Tables supported by offline sync */
export type SyncableTable =
  | 'period_logs'
  | 'sleep_logs'
  | 'weight_logs'
  | 'mood_logs'
  | 'metabolic_logs'
  | 'androgen_logs'
  | 'quiz_results'
  | 'doctor_reports'
  | 'chat_history';

export type SyncOperation = 'insert' | 'update' | 'delete';

export interface SyncQueueItem {
  id: string;
  table: SyncableTable;
  operation: SyncOperation;
  payload: Record<string, unknown>;
  clientId: string;
  createdAt: number;
  retries: number;
}
