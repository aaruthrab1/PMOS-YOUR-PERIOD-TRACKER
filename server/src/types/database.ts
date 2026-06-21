export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          date_of_birth: string | null;
          timezone: string;
          onboarding_completed: boolean;
          health_goals: string[];
          conditions: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string; email: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          theme: string;
          notifications_enabled: boolean;
          reminder_time: string;
          cycle_length_avg: number;
          period_length_avg: number;
          privacy_analytics: boolean;
          language: string;
          simple_language: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['user_preferences']['Row']> & { user_id: string };
        Update: Partial<Database['public']['Tables']['user_preferences']['Row']>;
      };
      cycle_logs: {
        Row: {
          id: string;
          user_id: string;
          period_start: string;
          period_end: string | null;
          cycle_length: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['cycle_logs']['Row']> & { user_id: string; period_start: string };
        Update: Partial<Database['public']['Tables']['cycle_logs']['Row']>;
      };
      symptom_entries: {
        Row: {
          id: string;
          user_id: string;
          logged_date: string;
          cycle_phase: Database['public']['Enums']['cycle_phase'];
          mood: Database['public']['Enums']['mood_type'];
          energy_level: number | null;
          sleep_hours: number | null;
          sleep_quality: number | null;
          notes: string | null;
          triggers: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['symptom_entries']['Row']> & { user_id: string; logged_date: string };
        Update: Partial<Database['public']['Tables']['symptom_entries']['Row']>;
      };
      symptom_details: {
        Row: {
          id: string;
          entry_id: string;
          symptom_name: string;
          category: Database['public']['Enums']['symptom_category'];
          severity: Database['public']['Enums']['severity_level'];
          duration_hours: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['symptom_details']['Row']> & { entry_id: string; symptom_name: string; category: Database['public']['Enums']['symptom_category']; severity: Database['public']['Enums']['severity_level'] };
        Update: Partial<Database['public']['Tables']['symptom_details']['Row']>;
      };
      education_articles: {
        Row: {
          id: string;
          slug: string;
          title: string;
          summary: string;
          content: string;
          category: Database['public']['Enums']['article_category'];
          read_time_minutes: number;
          tags: string[];
          is_featured: boolean;
          published_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['education_articles']['Row']> & { slug: string; title: string; summary: string; content: string; category: Database['public']['Enums']['article_category'] };
        Update: Partial<Database['public']['Tables']['education_articles']['Row']>;
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          context_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['ai_conversations']['Row']> & { user_id: string };
        Update: Partial<Database['public']['Tables']['ai_conversations']['Row']>;
      };
      ai_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          token_count: number | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['ai_messages']['Row']> & { conversation_id: string; role: string; content: string };
        Update: Partial<Database['public']['Tables']['ai_messages']['Row']>;
      };
      doctor_reports: {
        Row: {
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
          status: Database['public']['Enums']['report_status'];
          shared_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['doctor_reports']['Row']> & { user_id: string; date_range_start: string; date_range_end: string };
        Update: Partial<Database['public']['Tables']['doctor_reports']['Row']>;
      };
    };
    Enums: {
      symptom_category: 'physical' | 'emotional' | 'cognitive' | 'sleep' | 'digestive' | 'skin' | 'energy';
      severity_level: 'none' | 'mild' | 'moderate' | 'severe';
      cycle_phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | 'unknown';
      mood_type: 'calm' | 'anxious' | 'irritable' | 'sad' | 'energetic' | 'foggy' | 'neutral';
      article_category: 'pmos_basics' | 'symptom_management' | 'nutrition' | 'mental_health' | 'doctor_prep' | 'lifestyle' | 'research';
      report_status: 'draft' | 'ready' | 'shared';
    };
  };
}
