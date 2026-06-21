-- CYRA PRODUCTION DATABASE — COMPLETE IDEMPOTENT SCHEMA
-- Safe to run multiple times on Supabase Production

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS
DO $$ BEGIN CREATE TYPE symptom_category AS ENUM (
  'physical', 'emotional', 'cognitive', 'sleep', 'digestive', 'skin', 'energy'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE severity_level AS ENUM ('none', 'mild', 'moderate', 'severe');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE cycle_phase AS ENUM ('menstrual', 'follicular', 'ovulation', 'luteal', 'unknown');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE mood_type AS ENUM (
  'calm', 'anxious', 'irritable', 'sad', 'energetic', 'foggy', 'neutral'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TYPE mood_type ADD VALUE IF NOT EXISTS 'happy'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE mood_type ADD VALUE IF NOT EXISTS 'exhausted'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE flow_intensity AS ENUM ('spotting', 'light', 'medium', 'heavy');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE weight_unit AS ENUM ('kg', 'lb');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE sync_status AS ENUM ('synced', 'pending', 'conflict');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE report_status AS ENUM ('draft', 'ready', 'shared');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE risk_level AS ENUM ('low', 'moderate', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE chat_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE article_category AS ENUM (
  'pmos_basics', 'symptom_management', 'nutrition', 'mental_health',
  'doctor_prep', 'lifestyle', 'research'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE timeline_event_type AS ENUM (
  'period', 'symptom', 'mood', 'sleep', 'weight', 'metabolic', 'androgen',
  'quiz', 'report', 'doctor_visit', 'milestone', 'note'
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- TABLES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  age INTEGER CHECK (age IS NULL OR (age >= 13 AND age <= 120)),
  age_range TEXT,
  region TEXT,
  language TEXT DEFAULT 'en',
  locale TEXT DEFAULT 'en',
  avatar_url TEXT,
  date_of_birth DATE,
  timezone TEXT DEFAULT 'UTC',
  phone TEXT,
  auth_provider TEXT DEFAULT 'email',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  health_goals TEXT[] DEFAULT '{}',
  conditions TEXT[] DEFAULT '{}',
  common_symptoms TEXT[] DEFAULT '{}',
  cycle_regularity TEXT,
  energy_level INTEGER CHECK (energy_level IS NULL OR (energy_level >= 1 AND energy_level <= 10)),
  last_period_date DATE,
  height_cm INTEGER CHECK (height_cm IS NULL OR (height_cm >= 100 AND height_cm <= 250)),
  weight_kg NUMERIC(5,2) CHECK (weight_kg IS NULL OR weight_kg > 0),
  sleep_avg_hours NUMERIC(3,1) CHECK (sleep_avg_hours IS NULL OR (sleep_avg_hours >= 0 AND sleep_avg_hours <= 24)),
  activity_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  simple_language BOOLEAN NOT NULL DEFAULT FALSE,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_time TIME DEFAULT '09:00:00',
  cycle_length_avg INTEGER DEFAULT 28 CHECK (cycle_length_avg >= 21 AND cycle_length_avg <= 45),
  period_length_avg INTEGER DEFAULT 5 CHECK (period_length_avg >= 2 AND period_length_avg <= 10),
  cycle_length INTEGER GENERATED ALWAYS AS (cycle_length_avg) STORED,
  period_length INTEGER GENERATED ALWAYS AS (period_length_avg) STORED,
  cycle_regularity TEXT,
  last_period_date DATE,
  language TEXT NOT NULL DEFAULT 'en',
  privacy_analytics BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  height_cm INTEGER CHECK (height_cm IS NULL OR (height_cm >= 100 AND height_cm <= 250)),
  weight_kg NUMERIC(5,2) CHECK (weight_kg IS NULL OR weight_kg > 0),
  activity_level TEXT,
  sleep_avg_hours NUMERIC(3,1) CHECK (sleep_avg_hours IS NULL OR (sleep_avg_hours >= 0 AND sleep_avg_hours <= 24)),
  health_goals TEXT[] DEFAULT '{}',
  symptoms JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL DEFAULT 'onboarding',
  score INTEGER CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  risk_level risk_level,
  flagged_symptoms JSONB NOT NULL DEFAULT '[]',
  answers JSONB NOT NULL DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_id TEXT,
  sync_status sync_status NOT NULL DEFAULT 'synced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS period_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE,
  start_date DATE GENERATED ALWAYS AS (period_start) STORED,
  end_date DATE GENERATED ALWAYS AS (period_end) STORED,
  flow_intensity flow_intensity DEFAULT 'medium',
  flow flow_intensity GENERATED ALWAYS AS (flow_intensity) STORED,
  pain_level INTEGER CHECK (pain_level IS NULL OR (pain_level >= 1 AND pain_level <= 5)),
  cycle_length INTEGER CHECK (cycle_length IS NULL OR (cycle_length >= 15 AND cycle_length <= 60)),
  symptoms TEXT[] DEFAULT '{}',
  notes TEXT,
  client_id TEXT,
  sync_status sync_status NOT NULL DEFAULT 'synced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT period_logs_end_after_start CHECK (period_end IS NULL OR period_end >= period_start)
);

CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  log_date DATE GENERATED ALWAYS AS (logged_date) STORED,
  sleep_hours NUMERIC(3,1) CHECK (sleep_hours IS NULL OR (sleep_hours >= 0 AND sleep_hours <= 24)),
  hours NUMERIC(3,1) GENERATED ALWAYS AS (sleep_hours) STORED,
  sleep_quality INTEGER CHECK (sleep_quality IS NULL OR (sleep_quality >= 1 AND sleep_quality <= 10)),
  restedness INTEGER GENERATED ALWAYS AS (sleep_quality) STORED,
  bedtime TIME,
  wake_time TIME,
  interruptions INTEGER DEFAULT 0,
  notes TEXT,
  client_id TEXT,
  sync_status sync_status NOT NULL DEFAULT 'synced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (user_id, logged_date)
);

CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  log_date DATE GENERATED ALWAYS AS (logged_date) STORED,
  weight NUMERIC(5,2) NOT NULL CHECK (weight > 0),
  unit weight_unit NOT NULL DEFAULT 'kg',
  body_fat_percent NUMERIC(4,1),
  notes TEXT,
  client_id TEXT,
  sync_status sync_status NOT NULL DEFAULT 'synced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  log_date DATE GENERATED ALWAYS AS (logged_date) STORED,
  mood mood_type NOT NULL DEFAULT 'neutral',
  energy_level INTEGER CHECK (energy_level IS NULL OR (energy_level >= 1 AND energy_level <= 10)),
  anxiety_level INTEGER CHECK (anxiety_level IS NULL OR (anxiety_level >= 1 AND anxiety_level <= 10)),
  triggers TEXT[] DEFAULT '{}',
  notes TEXT,
  client_id TEXT,
  sync_status sync_status NOT NULL DEFAULT 'synced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (user_id, logged_date)
);

CREATE TABLE IF NOT EXISTS metabolic_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  log_date DATE GENERATED ALWAYS AS (logged_date) STORED,
  energy_level INTEGER CHECK (energy_level IS NULL OR (energy_level >= 1 AND energy_level <= 5)),
  energy INTEGER GENERATED ALWAYS AS (energy_level) STORED,
  hunger_level INTEGER CHECK (hunger_level IS NULL OR (hunger_level >= 1 AND hunger_level <= 5)),
  hunger INTEGER GENERATED ALWAYS AS (hunger_level) STORED,
  sugar_cravings BOOLEAN NOT NULL DEFAULT FALSE,
  brain_fog BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  client_id TEXT,
  sync_status sync_status NOT NULL DEFAULT 'synced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (user_id, logged_date)
);

CREATE TABLE IF NOT EXISTS androgen_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  week_of DATE GENERATED ALWAYS AS (logged_date) STORED,
  hair TEXT,
  acne_zones JSONB NOT NULL DEFAULT '[]',
  facial_hair TEXT,
  scalp TEXT,
  skin TEXT,
  symptoms JSONB NOT NULL DEFAULT '[]',
  lab_markers JSONB NOT NULL DEFAULT '{}',
  testosterone_level NUMERIC(6,2),
  dhea_level NUMERIC(6,2),
  notes TEXT,
  client_id TEXT,
  sync_status sync_status NOT NULL DEFAULT 'synced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (user_id, logged_date)
);

CREATE TABLE IF NOT EXISTS journey_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  date_completed DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, step_id)
);

CREATE TABLE IF NOT EXISTS doctor_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Doctor Visit Summary',
  report_text TEXT,
  report_json JSONB NOT NULL DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  summary TEXT,
  key_symptoms JSONB NOT NULL DEFAULT '[]',
  questions_for_doctor TEXT[] DEFAULT '{}',
  sections JSONB NOT NULL DEFAULT '{}',
  doctor_prep JSONB NOT NULL DEFAULT '{}',
  source_snapshot JSONB NOT NULL DEFAULT '{}',
  risk_summary JSONB NOT NULL DEFAULT '[]',
  status report_status NOT NULL DEFAULT 'draft',
  shared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT doctor_reports_range CHECK (date_range_end >= date_range_start)
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  context_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  token_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weekly_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  insight TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS myth_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  original_text TEXT NOT NULL,
  result JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type timeline_event_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cycle_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE,
  cycle_length INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS symptom_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cycle_phase cycle_phase DEFAULT 'unknown',
  mood mood_type DEFAULT 'neutral',
  energy_level INTEGER CHECK (energy_level IS NULL OR (energy_level >= 1 AND energy_level <= 10)),
  sleep_hours NUMERIC(3,1),
  sleep_quality INTEGER CHECK (sleep_quality IS NULL OR (sleep_quality >= 1 AND sleep_quality <= 10)),
  notes TEXT,
  triggers TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, logged_date)
);

CREATE TABLE IF NOT EXISTS symptom_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES symptom_entries(id) ON DELETE CASCADE,
  symptom_name TEXT NOT NULL,
  category symptom_category NOT NULL,
  severity severity_level NOT NULL DEFAULT 'mild',
  duration_hours NUMERIC(4,1),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS education_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category article_category NOT NULL,
  read_time_minutes INTEGER DEFAULT 5,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS article_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES education_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, article_id)
);

CREATE TABLE IF NOT EXISTS article_read_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES education_articles(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, article_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- LEGACY COLUMN MIGRATION
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height NUMERIC(5,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight NUMERIC(5,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_range TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS health_goals TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS conditions TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS common_symptoms TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cycle_regularity TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS energy_level INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_period_date DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sleep_avg_hours NUMERIC(3,1);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activity_level TEXT;
ALTER TABLE public.profiles ALTER COLUMN email SET DEFAULT '';
UPDATE public.profiles SET email = '' WHERE email IS NULL;
ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;

ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light';
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS simple_language BOOLEAN DEFAULT FALSE;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS reminder_time TIME DEFAULT '09:00:00';
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS cycle_length_avg INTEGER DEFAULT 28;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS period_length_avg INTEGER DEFAULT 5;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS cycle_regularity TEXT;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS last_period_date DATE;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS privacy_analytics BOOLEAN DEFAULT FALSE;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_preferences' AND column_name='cycle_length') THEN
    ALTER TABLE public.user_preferences ADD COLUMN cycle_length INTEGER GENERATED ALWAYS AS (cycle_length_avg) STORED;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user_preferences' AND column_name='period_length') THEN
    ALTER TABLE public.user_preferences ADD COLUMN period_length INTEGER GENERATED ALWAYS AS (period_length_avg) STORED;
  END IF;
END $$;

ALTER TABLE public.period_logs ADD COLUMN IF NOT EXISTS pain_level INTEGER;
ALTER TABLE public.period_logs ADD COLUMN IF NOT EXISTS flow_intensity flow_intensity DEFAULT 'medium';
ALTER TABLE public.period_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.period_logs ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE public.period_logs ADD COLUMN IF NOT EXISTS sync_status sync_status DEFAULT 'synced';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='period_logs' AND column_name='start_date') THEN
    ALTER TABLE public.period_logs ADD COLUMN start_date DATE GENERATED ALWAYS AS (period_start) STORED;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='period_logs' AND column_name='end_date') THEN
    ALTER TABLE public.period_logs ADD COLUMN end_date DATE GENERATED ALWAYS AS (period_end) STORED;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='period_logs' AND column_name='flow') THEN
    ALTER TABLE public.period_logs ADD COLUMN flow flow_intensity GENERATED ALWAYS AS (flow_intensity) STORED;
  END IF;
END $$;

ALTER TABLE public.sleep_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.sleep_logs ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE public.sleep_logs ADD COLUMN IF NOT EXISTS sync_status sync_status DEFAULT 'synced';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sleep_logs' AND column_name='log_date') THEN
    ALTER TABLE public.sleep_logs ADD COLUMN log_date DATE GENERATED ALWAYS AS (logged_date) STORED;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sleep_logs' AND column_name='hours') THEN
    ALTER TABLE public.sleep_logs ADD COLUMN hours NUMERIC(3,1) GENERATED ALWAYS AS (sleep_hours) STORED;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='sleep_logs' AND column_name='restedness') THEN
    ALTER TABLE public.sleep_logs ADD COLUMN restedness INTEGER GENERATED ALWAYS AS (sleep_quality) STORED;
  END IF;
END $$;

ALTER TABLE public.weight_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.weight_logs ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE public.weight_logs ADD COLUMN IF NOT EXISTS sync_status sync_status DEFAULT 'synced';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='weight_logs' AND column_name='log_date') THEN
    ALTER TABLE public.weight_logs ADD COLUMN log_date DATE GENERATED ALWAYS AS (logged_date) STORED;
  END IF;
END $$;

ALTER TABLE public.mood_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.mood_logs ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE public.mood_logs ADD COLUMN IF NOT EXISTS sync_status sync_status DEFAULT 'synced';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='mood_logs' AND column_name='log_date') THEN
    ALTER TABLE public.mood_logs ADD COLUMN log_date DATE GENERATED ALWAYS AS (logged_date) STORED;
  END IF;
END $$;

ALTER TABLE public.metabolic_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.metabolic_logs ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE public.metabolic_logs ADD COLUMN IF NOT EXISTS sync_status sync_status DEFAULT 'synced';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='metabolic_logs' AND column_name='log_date') THEN
    ALTER TABLE public.metabolic_logs ADD COLUMN log_date DATE GENERATED ALWAYS AS (logged_date) STORED;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='metabolic_logs' AND column_name='energy') THEN
    ALTER TABLE public.metabolic_logs ADD COLUMN energy INTEGER GENERATED ALWAYS AS (energy_level) STORED;
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='metabolic_logs' AND column_name='hunger') THEN
    ALTER TABLE public.metabolic_logs ADD COLUMN hunger INTEGER GENERATED ALWAYS AS (hunger_level) STORED;
  END IF;
END $$;

ALTER TABLE public.androgen_logs ADD COLUMN IF NOT EXISTS hair TEXT;
ALTER TABLE public.androgen_logs ADD COLUMN IF NOT EXISTS acne_zones JSONB DEFAULT '[]';
ALTER TABLE public.androgen_logs ADD COLUMN IF NOT EXISTS facial_hair TEXT;
ALTER TABLE public.androgen_logs ADD COLUMN IF NOT EXISTS scalp TEXT;
ALTER TABLE public.androgen_logs ADD COLUMN IF NOT EXISTS skin TEXT;
ALTER TABLE public.androgen_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.androgen_logs ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE public.androgen_logs ADD COLUMN IF NOT EXISTS sync_status sync_status DEFAULT 'synced';
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='androgen_logs' AND column_name='week_of') THEN
    ALTER TABLE public.androgen_logs ADD COLUMN week_of DATE GENERATED ALWAYS AS (logged_date) STORED;
  END IF;
END $$;

ALTER TABLE public.quiz_results ADD COLUMN IF NOT EXISTS risk_level risk_level;
ALTER TABLE public.quiz_results ADD COLUMN IF NOT EXISTS flagged_symptoms JSONB DEFAULT '[]';
ALTER TABLE public.quiz_results ADD COLUMN IF NOT EXISTS assessment_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.quiz_results ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE public.quiz_results ADD COLUMN IF NOT EXISTS sync_status sync_status DEFAULT 'synced';

ALTER TABLE public.ai_messages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE public.ai_messages ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';

ALTER TABLE public.doctor_reports ADD COLUMN IF NOT EXISTS report_text TEXT;
ALTER TABLE public.doctor_reports ADD COLUMN IF NOT EXISTS report_json JSONB DEFAULT '{}';
ALTER TABLE public.doctor_reports ADD COLUMN IF NOT EXISTS generated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.doctor_reports ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '{}';
ALTER TABLE public.doctor_reports ADD COLUMN IF NOT EXISTS doctor_prep JSONB DEFAULT '{}';
ALTER TABLE public.doctor_reports ADD COLUMN IF NOT EXISTS source_snapshot JSONB DEFAULT '{}';
ALTER TABLE public.doctor_reports ADD COLUMN IF NOT EXISTS risk_summary JSONB DEFAULT '[]';


-- LEGACY CHAT TABLE
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  token_count INTEGER,
  client_id TEXT,
  sync_status sync_status NOT NULL DEFAULT 'synced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_conversation ON chat_history(conversation_id, created_at);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS chat_history_select_own ON chat_history;
DROP POLICY IF EXISTS chat_history_insert_own ON chat_history;
DROP POLICY IF EXISTS chat_history_update_own ON chat_history;
DROP POLICY IF EXISTS chat_history_delete_own ON chat_history;
CREATE POLICY chat_history_select_own ON chat_history FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY chat_history_insert_own ON chat_history FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY chat_history_update_own ON chat_history FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY chat_history_delete_own ON chat_history FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);


DROP VIEW IF EXISTS chat_messages;
DROP VIEW IF EXISTS chat_conversations;

CREATE VIEW chat_conversations
WITH (security_invoker = true) AS
SELECT id, user_id, title, created_at, updated_at
FROM ai_conversations;

CREATE VIEW chat_messages
WITH (security_invoker = true) AS
SELECT id, conversation_id, user_id, role, content, language, created_at
FROM ai_messages;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_health_profiles_user_id ON health_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_assessment_date ON quiz_results(user_id, assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_results_completed_at ON quiz_results(user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_period_logs_user_id ON period_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_period_logs_start_date ON period_logs(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_period_logs_period_start ON period_logs(user_id, period_start DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_period_logs_client_id ON period_logs(user_id, client_id) WHERE client_id IS NOT NULL AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_id ON sleep_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_log_date ON sleep_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_logged_date ON sleep_logs(user_id, logged_date DESC);

CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_log_date ON weight_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_weight_logs_logged_date ON weight_logs(user_id, logged_date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_weight_logs_user_date ON weight_logs(user_id, logged_date) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_mood_logs_user_id ON mood_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_logs_log_date ON mood_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_mood_logs_logged_date ON mood_logs(user_id, logged_date DESC);

CREATE INDEX IF NOT EXISTS idx_metabolic_logs_user_id ON metabolic_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_metabolic_logs_log_date ON metabolic_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_metabolic_logs_logged_date ON metabolic_logs(user_id, logged_date DESC);

CREATE INDEX IF NOT EXISTS idx_androgen_logs_user_id ON androgen_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_androgen_logs_week_of ON androgen_logs(user_id, week_of DESC);
CREATE INDEX IF NOT EXISTS idx_androgen_logs_logged_date ON androgen_logs(user_id, logged_date DESC);

CREATE INDEX IF NOT EXISTS idx_journey_steps_user_id ON journey_steps(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_steps_step_id ON journey_steps(user_id, step_id);

CREATE INDEX IF NOT EXISTS idx_doctor_reports_user_id ON doctor_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_reports_generated_at ON doctor_reports(user_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_reports_created_at ON doctor_reports(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_updated_at ON ai_conversations(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_id ON ai_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_weekly_insights_user_id ON weekly_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_insights_generated_at ON weekly_insights(user_id, generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_myth_checks_user_id ON myth_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_myth_checks_created_at ON myth_checks(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_health_timeline_events_user_id ON health_timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_health_timeline_events_event_date ON health_timeline_events(user_id, event_date DESC);

CREATE INDEX IF NOT EXISTS idx_cycle_logs_user_id ON cycle_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_cycle_logs_period_start ON cycle_logs(user_id, period_start DESC);

CREATE INDEX IF NOT EXISTS idx_symptom_entries_user_id ON symptom_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_entries_logged_date ON symptom_entries(user_id, logged_date DESC);

CREATE INDEX IF NOT EXISTS idx_symptom_details_entry_id ON symptom_details(entry_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_ai_message_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    SELECT ac.user_id INTO NEW.user_id
    FROM public.ai_conversations ac
    WHERE ac.id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_quiz_assessment_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.assessment_date := (NEW.completed_at AT TIME ZONE 'UTC')::date;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, avatar_url, auth_provider, language, locale
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    COALESCE(NEW.raw_user_meta_data->>'language', 'en'),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    full_name = CASE WHEN profiles.full_name IS NULL OR profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
    auth_provider = EXCLUDED.auth_provider,
    updated_at = NOW();

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.health_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS user_preferences_updated_at ON user_preferences;
CREATE TRIGGER user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS health_profiles_updated_at ON health_profiles;
CREATE TRIGGER health_profiles_updated_at BEFORE UPDATE ON health_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS quiz_results_updated_at ON quiz_results;
CREATE TRIGGER quiz_results_updated_at BEFORE UPDATE ON quiz_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS quiz_results_assessment_date ON quiz_results;
CREATE TRIGGER quiz_results_assessment_date BEFORE INSERT OR UPDATE OF completed_at ON quiz_results FOR EACH ROW EXECUTE FUNCTION public.set_quiz_assessment_date();

DROP TRIGGER IF EXISTS period_logs_updated_at ON period_logs;
CREATE TRIGGER period_logs_updated_at BEFORE UPDATE ON period_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS sleep_logs_updated_at ON sleep_logs;
CREATE TRIGGER sleep_logs_updated_at BEFORE UPDATE ON sleep_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS weight_logs_updated_at ON weight_logs;
CREATE TRIGGER weight_logs_updated_at BEFORE UPDATE ON weight_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS mood_logs_updated_at ON mood_logs;
CREATE TRIGGER mood_logs_updated_at BEFORE UPDATE ON mood_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS metabolic_logs_updated_at ON metabolic_logs;
CREATE TRIGGER metabolic_logs_updated_at BEFORE UPDATE ON metabolic_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS androgen_logs_updated_at ON androgen_logs;
CREATE TRIGGER androgen_logs_updated_at BEFORE UPDATE ON androgen_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS journey_steps_updated_at ON journey_steps;
CREATE TRIGGER journey_steps_updated_at BEFORE UPDATE ON journey_steps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS doctor_reports_updated_at ON doctor_reports;
CREATE TRIGGER doctor_reports_updated_at BEFORE UPDATE ON doctor_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS health_timeline_events_updated_at ON health_timeline_events;
CREATE TRIGGER health_timeline_events_updated_at BEFORE UPDATE ON health_timeline_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS cycle_logs_updated_at ON cycle_logs;
CREATE TRIGGER cycle_logs_updated_at BEFORE UPDATE ON cycle_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS symptom_entries_updated_at ON symptom_entries;
CREATE TRIGGER symptom_entries_updated_at BEFORE UPDATE ON symptom_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS education_articles_updated_at ON education_articles;
CREATE TRIGGER education_articles_updated_at BEFORE UPDATE ON education_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS article_read_progress_updated_at ON article_read_progress;
CREATE TRIGGER article_read_progress_updated_at BEFORE UPDATE ON article_read_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS ai_messages_set_user_id ON ai_messages;
CREATE TRIGGER ai_messages_set_user_id BEFORE INSERT ON ai_messages FOR EACH ROW EXECUTE FUNCTION public.set_ai_message_user_id();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- LEGACY POLICY CLEANUP
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users manage own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users manage own cycle logs" ON public.cycle_logs;
DROP POLICY IF EXISTS "Users manage own symptom entries" ON public.symptom_entries;
DROP POLICY IF EXISTS "Users manage own symptom details" ON public.symptom_details;
DROP POLICY IF EXISTS "Anyone can read published articles" ON public.education_articles;
DROP POLICY IF EXISTS "Users manage own bookmarks" ON public.article_bookmarks;
DROP POLICY IF EXISTS "Users manage own read progress" ON public.article_read_progress;
DROP POLICY IF EXISTS "Users manage own conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users manage own messages" ON public.ai_messages;
DROP POLICY IF EXISTS "Users manage own reports" ON public.doctor_reports;
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "period_logs_select_own" ON public.period_logs;
DROP POLICY IF EXISTS "sleep_logs_select_own" ON public.sleep_logs;
DROP POLICY IF EXISTS "weight_logs_select_own" ON public.weight_logs;
DROP POLICY IF EXISTS "mood_logs_select_own" ON public.mood_logs;
DROP POLICY IF EXISTS "androgen_logs_select_own" ON public.androgen_logs;
DROP POLICY IF EXISTS "quiz_results_select_own" ON public.quiz_results;
DROP POLICY IF EXISTS "chat_history_select_own" ON public.chat_history;
DROP POLICY IF EXISTS "chat_history_insert_own" ON public.chat_history;
DROP POLICY IF EXISTS "chat_history_delete_own" ON public.chat_history;
DROP POLICY IF EXISTS "metabolic_logs_select_own" ON public.metabolic_logs;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE period_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metabolic_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE androgen_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE myth_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_read_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE education_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON profiles;
DROP POLICY IF EXISTS profiles_insert_own ON profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;
DROP POLICY IF EXISTS profiles_delete_own ON profiles;
CREATE POLICY profiles_select_own ON profiles FOR SELECT TO authenticated USING ((select auth.uid()) = id);
CREATE POLICY profiles_insert_own ON profiles FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = id);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE TO authenticated USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);
CREATE POLICY profiles_delete_own ON profiles FOR DELETE TO authenticated USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS user_preferences_select_own ON user_preferences;
DROP POLICY IF EXISTS user_preferences_insert_own ON user_preferences;
DROP POLICY IF EXISTS user_preferences_update_own ON user_preferences;
DROP POLICY IF EXISTS user_preferences_delete_own ON user_preferences;
CREATE POLICY user_preferences_select_own ON user_preferences FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY user_preferences_insert_own ON user_preferences FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY user_preferences_update_own ON user_preferences FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY user_preferences_delete_own ON user_preferences FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS health_profiles_select_own ON health_profiles;
DROP POLICY IF EXISTS health_profiles_insert_own ON health_profiles;
DROP POLICY IF EXISTS health_profiles_update_own ON health_profiles;
DROP POLICY IF EXISTS health_profiles_delete_own ON health_profiles;
CREATE POLICY health_profiles_select_own ON health_profiles FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY health_profiles_insert_own ON health_profiles FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY health_profiles_update_own ON health_profiles FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY health_profiles_delete_own ON health_profiles FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS quiz_results_select_own ON quiz_results;
DROP POLICY IF EXISTS quiz_results_insert_own ON quiz_results;
DROP POLICY IF EXISTS quiz_results_update_own ON quiz_results;
DROP POLICY IF EXISTS quiz_results_delete_own ON quiz_results;
CREATE POLICY quiz_results_select_own ON quiz_results FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY quiz_results_insert_own ON quiz_results FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY quiz_results_update_own ON quiz_results FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY quiz_results_delete_own ON quiz_results FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS period_logs_select_own ON period_logs;
DROP POLICY IF EXISTS period_logs_insert_own ON period_logs;
DROP POLICY IF EXISTS period_logs_update_own ON period_logs;
DROP POLICY IF EXISTS period_logs_delete_own ON period_logs;
CREATE POLICY period_logs_select_own ON period_logs FOR SELECT TO authenticated USING ((select auth.uid()) = user_id AND deleted_at IS NULL);
CREATE POLICY period_logs_insert_own ON period_logs FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY period_logs_update_own ON period_logs FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY period_logs_delete_own ON period_logs FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS sleep_logs_select_own ON sleep_logs;
DROP POLICY IF EXISTS sleep_logs_insert_own ON sleep_logs;
DROP POLICY IF EXISTS sleep_logs_update_own ON sleep_logs;
DROP POLICY IF EXISTS sleep_logs_delete_own ON sleep_logs;
CREATE POLICY sleep_logs_select_own ON sleep_logs FOR SELECT TO authenticated USING ((select auth.uid()) = user_id AND deleted_at IS NULL);
CREATE POLICY sleep_logs_insert_own ON sleep_logs FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY sleep_logs_update_own ON sleep_logs FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY sleep_logs_delete_own ON sleep_logs FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS weight_logs_select_own ON weight_logs;
DROP POLICY IF EXISTS weight_logs_insert_own ON weight_logs;
DROP POLICY IF EXISTS weight_logs_update_own ON weight_logs;
DROP POLICY IF EXISTS weight_logs_delete_own ON weight_logs;
CREATE POLICY weight_logs_select_own ON weight_logs FOR SELECT TO authenticated USING ((select auth.uid()) = user_id AND deleted_at IS NULL);
CREATE POLICY weight_logs_insert_own ON weight_logs FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY weight_logs_update_own ON weight_logs FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY weight_logs_delete_own ON weight_logs FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS mood_logs_select_own ON mood_logs;
DROP POLICY IF EXISTS mood_logs_insert_own ON mood_logs;
DROP POLICY IF EXISTS mood_logs_update_own ON mood_logs;
DROP POLICY IF EXISTS mood_logs_delete_own ON mood_logs;
CREATE POLICY mood_logs_select_own ON mood_logs FOR SELECT TO authenticated USING ((select auth.uid()) = user_id AND deleted_at IS NULL);
CREATE POLICY mood_logs_insert_own ON mood_logs FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY mood_logs_update_own ON mood_logs FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY mood_logs_delete_own ON mood_logs FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS metabolic_logs_select_own ON metabolic_logs;
DROP POLICY IF EXISTS metabolic_logs_insert_own ON metabolic_logs;
DROP POLICY IF EXISTS metabolic_logs_update_own ON metabolic_logs;
DROP POLICY IF EXISTS metabolic_logs_delete_own ON metabolic_logs;
CREATE POLICY metabolic_logs_select_own ON metabolic_logs FOR SELECT TO authenticated USING ((select auth.uid()) = user_id AND deleted_at IS NULL);
CREATE POLICY metabolic_logs_insert_own ON metabolic_logs FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY metabolic_logs_update_own ON metabolic_logs FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY metabolic_logs_delete_own ON metabolic_logs FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS androgen_logs_select_own ON androgen_logs;
DROP POLICY IF EXISTS androgen_logs_insert_own ON androgen_logs;
DROP POLICY IF EXISTS androgen_logs_update_own ON androgen_logs;
DROP POLICY IF EXISTS androgen_logs_delete_own ON androgen_logs;
CREATE POLICY androgen_logs_select_own ON androgen_logs FOR SELECT TO authenticated USING ((select auth.uid()) = user_id AND deleted_at IS NULL);
CREATE POLICY androgen_logs_insert_own ON androgen_logs FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY androgen_logs_update_own ON androgen_logs FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY androgen_logs_delete_own ON androgen_logs FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS journey_steps_select_own ON journey_steps;
DROP POLICY IF EXISTS journey_steps_insert_own ON journey_steps;
DROP POLICY IF EXISTS journey_steps_update_own ON journey_steps;
DROP POLICY IF EXISTS journey_steps_delete_own ON journey_steps;
CREATE POLICY journey_steps_select_own ON journey_steps FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY journey_steps_insert_own ON journey_steps FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY journey_steps_update_own ON journey_steps FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY journey_steps_delete_own ON journey_steps FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS doctor_reports_select_own ON doctor_reports;
DROP POLICY IF EXISTS doctor_reports_insert_own ON doctor_reports;
DROP POLICY IF EXISTS doctor_reports_update_own ON doctor_reports;
DROP POLICY IF EXISTS doctor_reports_delete_own ON doctor_reports;
CREATE POLICY doctor_reports_select_own ON doctor_reports FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY doctor_reports_insert_own ON doctor_reports FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY doctor_reports_update_own ON doctor_reports FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY doctor_reports_delete_own ON doctor_reports FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS ai_conversations_select_own ON ai_conversations;
DROP POLICY IF EXISTS ai_conversations_insert_own ON ai_conversations;
DROP POLICY IF EXISTS ai_conversations_update_own ON ai_conversations;
DROP POLICY IF EXISTS ai_conversations_delete_own ON ai_conversations;
CREATE POLICY ai_conversations_select_own ON ai_conversations FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY ai_conversations_insert_own ON ai_conversations FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY ai_conversations_update_own ON ai_conversations FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY ai_conversations_delete_own ON ai_conversations FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS ai_messages_select_own ON ai_messages;
DROP POLICY IF EXISTS ai_messages_insert_own ON ai_messages;
DROP POLICY IF EXISTS ai_messages_update_own ON ai_messages;
DROP POLICY IF EXISTS ai_messages_delete_own ON ai_messages;
CREATE POLICY ai_messages_select_own ON ai_messages FOR SELECT TO authenticated USING (
  (select auth.uid()) = user_id OR EXISTS (
    SELECT 1 FROM ai_conversations ac WHERE ac.id = conversation_id AND ac.user_id = (select auth.uid())
  )
);
CREATE POLICY ai_messages_insert_own ON ai_messages FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_conversations ac WHERE ac.id = conversation_id AND ac.user_id = (select auth.uid())
  )
);
CREATE POLICY ai_messages_update_own ON ai_messages FOR UPDATE TO authenticated USING (
  (select auth.uid()) = user_id OR EXISTS (
    SELECT 1 FROM ai_conversations ac WHERE ac.id = conversation_id AND ac.user_id = (select auth.uid())
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_conversations ac WHERE ac.id = conversation_id AND ac.user_id = (select auth.uid())
  )
);
CREATE POLICY ai_messages_delete_own ON ai_messages FOR DELETE TO authenticated USING (
  (select auth.uid()) = user_id OR EXISTS (
    SELECT 1 FROM ai_conversations ac WHERE ac.id = conversation_id AND ac.user_id = (select auth.uid())
  )
);

DROP POLICY IF EXISTS weekly_insights_select_own ON weekly_insights;
DROP POLICY IF EXISTS weekly_insights_insert_own ON weekly_insights;
DROP POLICY IF EXISTS weekly_insights_update_own ON weekly_insights;
DROP POLICY IF EXISTS weekly_insights_delete_own ON weekly_insights;
CREATE POLICY weekly_insights_select_own ON weekly_insights FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY weekly_insights_insert_own ON weekly_insights FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY weekly_insights_update_own ON weekly_insights FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY weekly_insights_delete_own ON weekly_insights FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS myth_checks_select_own ON myth_checks;
DROP POLICY IF EXISTS myth_checks_insert_own ON myth_checks;
DROP POLICY IF EXISTS myth_checks_update_own ON myth_checks;
DROP POLICY IF EXISTS myth_checks_delete_own ON myth_checks;
CREATE POLICY myth_checks_select_own ON myth_checks FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY myth_checks_insert_own ON myth_checks FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY myth_checks_update_own ON myth_checks FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY myth_checks_delete_own ON myth_checks FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS health_timeline_events_select_own ON health_timeline_events;
DROP POLICY IF EXISTS health_timeline_events_insert_own ON health_timeline_events;
DROP POLICY IF EXISTS health_timeline_events_update_own ON health_timeline_events;
DROP POLICY IF EXISTS health_timeline_events_delete_own ON health_timeline_events;
CREATE POLICY health_timeline_events_select_own ON health_timeline_events FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY health_timeline_events_insert_own ON health_timeline_events FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY health_timeline_events_update_own ON health_timeline_events FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY health_timeline_events_delete_own ON health_timeline_events FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS cycle_logs_select_own ON cycle_logs;
DROP POLICY IF EXISTS cycle_logs_insert_own ON cycle_logs;
DROP POLICY IF EXISTS cycle_logs_update_own ON cycle_logs;
DROP POLICY IF EXISTS cycle_logs_delete_own ON cycle_logs;
CREATE POLICY cycle_logs_select_own ON cycle_logs FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY cycle_logs_insert_own ON cycle_logs FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY cycle_logs_update_own ON cycle_logs FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY cycle_logs_delete_own ON cycle_logs FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS symptom_entries_select_own ON symptom_entries;
DROP POLICY IF EXISTS symptom_entries_insert_own ON symptom_entries;
DROP POLICY IF EXISTS symptom_entries_update_own ON symptom_entries;
DROP POLICY IF EXISTS symptom_entries_delete_own ON symptom_entries;
CREATE POLICY symptom_entries_select_own ON symptom_entries FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY symptom_entries_insert_own ON symptom_entries FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY symptom_entries_update_own ON symptom_entries FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY symptom_entries_delete_own ON symptom_entries FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS symptom_details_select_own ON symptom_details;
DROP POLICY IF EXISTS symptom_details_insert_own ON symptom_details;
DROP POLICY IF EXISTS symptom_details_update_own ON symptom_details;
DROP POLICY IF EXISTS symptom_details_delete_own ON symptom_details;
CREATE POLICY symptom_details_select_own ON symptom_details FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM symptom_entries se WHERE se.id = entry_id AND se.user_id = (select auth.uid()))
);
CREATE POLICY symptom_details_insert_own ON symptom_details FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM symptom_entries se WHERE se.id = entry_id AND se.user_id = (select auth.uid()))
);
CREATE POLICY symptom_details_update_own ON symptom_details FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM symptom_entries se WHERE se.id = entry_id AND se.user_id = (select auth.uid()))
) WITH CHECK (
  EXISTS (SELECT 1 FROM symptom_entries se WHERE se.id = entry_id AND se.user_id = (select auth.uid()))
);
CREATE POLICY symptom_details_delete_own ON symptom_details FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM symptom_entries se WHERE se.id = entry_id AND se.user_id = (select auth.uid()))
);

DROP POLICY IF EXISTS education_articles_select_published ON education_articles;
CREATE POLICY education_articles_select_published ON education_articles FOR SELECT TO authenticated, anon USING (published_at IS NOT NULL);

DROP POLICY IF EXISTS article_bookmarks_select_own ON article_bookmarks;
DROP POLICY IF EXISTS article_bookmarks_insert_own ON article_bookmarks;
DROP POLICY IF EXISTS article_bookmarks_update_own ON article_bookmarks;
DROP POLICY IF EXISTS article_bookmarks_delete_own ON article_bookmarks;
CREATE POLICY article_bookmarks_select_own ON article_bookmarks FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY article_bookmarks_insert_own ON article_bookmarks FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY article_bookmarks_update_own ON article_bookmarks FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY article_bookmarks_delete_own ON article_bookmarks FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS article_read_progress_select_own ON article_read_progress;
DROP POLICY IF EXISTS article_read_progress_insert_own ON article_read_progress;
DROP POLICY IF EXISTS article_read_progress_update_own ON article_read_progress;
DROP POLICY IF EXISTS article_read_progress_delete_own ON article_read_progress;
CREATE POLICY article_read_progress_select_own ON article_read_progress FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY article_read_progress_insert_own ON article_read_progress FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY article_read_progress_update_own ON article_read_progress FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY article_read_progress_delete_own ON article_read_progress FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS audit_logs_select_own ON audit_logs;
DROP POLICY IF EXISTS audit_logs_insert_own ON audit_logs;
CREATE POLICY audit_logs_select_own ON audit_logs FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY audit_logs_insert_own ON audit_logs FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT SELECT ON chat_conversations TO authenticated, anon;
GRANT SELECT ON chat_messages TO authenticated, anon;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('doctor-reports', 'doctor-reports', false, 20971520, ARRAY['application/pdf', 'application/json', 'text/plain'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS storage_avatars_select_own ON storage.objects;
DROP POLICY IF EXISTS storage_avatars_insert_own ON storage.objects;
DROP POLICY IF EXISTS storage_avatars_update_own ON storage.objects;
DROP POLICY IF EXISTS storage_avatars_delete_own ON storage.objects;
DROP POLICY IF EXISTS storage_doctor_reports_select_own ON storage.objects;
DROP POLICY IF EXISTS storage_doctor_reports_insert_own ON storage.objects;
DROP POLICY IF EXISTS storage_doctor_reports_update_own ON storage.objects;
DROP POLICY IF EXISTS storage_doctor_reports_delete_own ON storage.objects;

CREATE POLICY storage_avatars_select_own ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (select auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY storage_avatars_insert_own ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (select auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY storage_avatars_update_own ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (select auth.uid())::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'avatars' AND (select auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY storage_avatars_delete_own ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (select auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY storage_doctor_reports_select_own ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'doctor-reports' AND (select auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY storage_doctor_reports_insert_own ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'doctor-reports' AND (select auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY storage_doctor_reports_update_own ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'doctor-reports' AND (select auth.uid())::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'doctor-reports' AND (select auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY storage_doctor_reports_delete_own ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'doctor-reports' AND (select auth.uid())::text = (storage.foldername(name))[1]);

INSERT INTO education_articles (slug, title, summary, content, category, read_time_minutes, tags, is_featured) VALUES
(
  'understanding-pmos',
  'Understanding PMOS: What Every Woman Should Know',
  'Premenstrual Ovulation Syndrome (PMOS) encompasses the hormonal shifts and symptoms many women experience throughout their cycle.',
  E'# Understanding PMOS\n\nPremenstrual Ovulation Syndrome refers to the collection of physical, emotional, and cognitive symptoms that can occur in relation to your menstrual cycle.\n\n## Key Points\n\n- Symptoms typically appear 1-2 weeks before menstruation\n- Hormonal fluctuations in estrogen and progesterone play a central role\n- Tracking patterns helps identify personal triggers\n- Not all cycles are the same — your experience is valid\n\n## When to Seek Help\n\nIf symptoms significantly impact daily life, relationships, or work, consult a healthcare provider. Cyra helps you prepare for those conversations with data-driven insights.',
  'pmos_basics', 6, ARRAY['pmos', 'basics', 'hormones'], TRUE
),
(
  'symptom-tracking-guide',
  'How to Track Symptoms Effectively',
  'Learn the best practices for daily symptom logging to uncover meaningful patterns.',
  E'# Effective Symptom Tracking\n\nConsistent tracking is the foundation of understanding your body.\n\n## Daily Check-ins\n\n1. Log symptoms at the same time each day\n2. Rate severity honestly — there is no wrong answer\n3. Note potential triggers (sleep, stress, diet)\n4. Record mood and energy alongside physical symptoms\n\n## Pattern Recognition\n\nAfter 2-3 cycles of consistent tracking, Cyra''s insights engine can identify recurring patterns and help you prepare questions for your doctor.',
  'symptom_management', 5, ARRAY['tracking', 'symptoms', 'tips'], TRUE
),
(
  'preparing-for-your-doctor',
  'Preparing for Your Doctor Visit',
  'Turn your tracked data into actionable talking points for productive healthcare conversations.',
  E'# Doctor Visit Preparation\n\nYour tracked data is powerful evidence. Here is how to use it.\n\n## Before Your Appointment\n\n- Generate a Cyra doctor report covering your last 1-3 cycles\n- Highlight your top 3 concerns\n- Prepare specific questions\n- Bring a list of current medications and supplements\n\n## During the Visit\n\n- Share severity trends, not just symptom names\n- Mention impact on daily life\n- Ask about diagnostic options if needed\n\n## After the Visit\n\n- Log any new diagnoses or treatment plans\n- Set reminders for follow-ups',
  'doctor_prep', 7, ARRAY['doctor', 'appointment', 'advocacy'], TRUE
),
(
  'nutrition-and-cycle-health',
  'Nutrition Strategies for Cycle Health',
  'Evidence-based dietary approaches that may support hormonal balance and reduce symptom severity.',
  E'# Nutrition and Your Cycle\n\nWhile no single diet works for everyone, research suggests certain nutritional strategies may help.\n\n## Helpful Approaches\n\n- **Anti-inflammatory foods**: leafy greens, fatty fish, berries\n- **Stable blood sugar**: protein with every meal, complex carbs\n- **Magnesium-rich foods**: dark chocolate, nuts, seeds\n- **Hydration**: aim for 2-3 liters daily\n\n## Foods to Monitor\n\nSome women find caffeine, alcohol, and high-sodium foods worsen symptoms. Track your personal responses in Cyra.',
  'nutrition', 6, ARRAY['nutrition', 'diet', 'wellness'], FALSE
),
(
  'mental-health-and-pmos',
  'Mental Health During Your Cycle',
  'Understanding the emotional dimension of PMOS and strategies for emotional wellbeing.',
  E'# Mental Health and PMOS\n\nEmotional symptoms are real, valid, and treatable.\n\n## Common Experiences\n\n- Mood swings and irritability\n- Anxiety and worry\n- Low mood or sadness\n- Brain fog and difficulty concentrating\n\n## Coping Strategies\n\n- Mindfulness and breathing exercises\n- Regular movement (even gentle walks help)\n- Social connection and support\n- Professional therapy when needed\n\n## Important Note\n\nIf you experience severe mood changes or thoughts of self-harm, please reach out to a mental health professional or crisis line immediately.',
  'mental_health', 8, ARRAY['mental-health', 'mood', 'wellbeing'], FALSE
)
ON CONFLICT (slug) DO NOTHING;


-- BACKFILL EXISTING AUTH USERS
INSERT INTO public.profiles (id, email, full_name, avatar_url, auth_provider, language, locale)
SELECT
  u.id,
  COALESCE(u.email, ''),
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', ''),
  COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture', ''),
  COALESCE(u.raw_app_meta_data->>'provider', 'email'),
  COALESCE(u.raw_user_meta_data->>'language', 'en'),
  COALESCE(u.raw_user_meta_data->>'locale', 'en')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_preferences (user_id)
SELECT u.id FROM auth.users u
LEFT JOIN public.user_preferences up ON up.user_id = u.id
WHERE up.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.health_profiles (user_id)
SELECT u.id FROM auth.users u
LEFT JOIN public.health_profiles hp ON hp.user_id = u.id
WHERE hp.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;


-- DATABASE SELF TEST
SELECT COUNT(*) AS auth_users_count FROM auth.users;
SELECT COUNT(*) AS profiles_count FROM public.profiles;
SELECT COUNT(*) AS user_preferences_count FROM public.user_preferences;
SELECT COUNT(*) AS health_profiles_count FROM public.health_profiles;

DO $$
DECLARE
  v_auth_users bigint;
  v_profiles bigint;
  v_prefs bigint;
  v_health bigint;
  v_handle_fn boolean;
  v_auth_trigger boolean;
  v_onboarding_col boolean;
  v_missing_policy text;
  v_missing_index text;
  v_required_policies text[] := ARRAY[
    'profiles_select_own','profiles_insert_own','profiles_update_own',
    'user_preferences_select_own','health_profiles_select_own',
    'ai_conversations_select_own','ai_messages_insert_own',
    'doctor_reports_select_own','article_bookmarks_insert_own',
    'symptom_entries_select_own','education_articles_select_published'
  ];
  v_required_indexes text[] := ARRAY[
    'idx_profiles_email','idx_user_preferences_user_id','idx_health_profiles_user_id',
    'idx_ai_conversations_user_id','idx_ai_messages_conversation_id',
    'idx_doctor_reports_user_id','idx_symptom_entries_user_id',
    'idx_article_bookmarks_user_id'
  ];
  v_pol text;
  v_idx text;
BEGIN
  SELECT COUNT(*) INTO v_auth_users FROM auth.users;
  SELECT COUNT(*) INTO v_profiles FROM public.profiles;
  SELECT COUNT(*) INTO v_prefs FROM public.user_preferences;
  SELECT COUNT(*) INTO v_health FROM public.health_profiles;

  RAISE NOTICE 'SELF TEST auth.users=% profiles=% user_preferences=% health_profiles=%', v_auth_users, v_profiles, v_prefs, v_health;

  SELECT EXISTS(
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) INTO v_handle_fn;

  SELECT EXISTS(
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth' AND c.relname = 'users' AND t.tgname = 'on_auth_user_created' AND NOT t.tgisinternal
  ) INTO v_auth_trigger;

  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) INTO v_onboarding_col;

  IF NOT v_handle_fn THEN
    RAISE EXCEPTION 'SELF TEST FAIL: handle_new_user function missing';
  END IF;

  IF NOT v_auth_trigger THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    RAISE NOTICE 'SELF TEST FIX: recreated on_auth_user_created trigger';
  END IF;

  IF NOT v_onboarding_col THEN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'SELF TEST FIX: added profiles.onboarding_completed column';
  END IF;

  FOREACH v_pol IN ARRAY v_required_policies LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND policyname = v_pol
    ) THEN
      RAISE WARNING 'SELF TEST MISSING POLICY: %', v_pol;
    END IF;
  END LOOP;

  FOREACH v_idx IN ARRAY v_required_indexes LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = v_idx
    ) THEN
      RAISE WARNING 'SELF TEST MISSING INDEX: %', v_idx;
    END IF;
  END LOOP;

  IF v_auth_users > v_profiles THEN
    RAISE WARNING 'SELF TEST: % auth.users without profiles row — backfill section should have run', v_auth_users - v_profiles;
  END IF;

  IF v_auth_users > v_prefs THEN
    RAISE WARNING 'SELF TEST: % auth.users without user_preferences row', v_auth_users - v_prefs;
  END IF;

  IF v_auth_users > v_health THEN
    RAISE WARNING 'SELF TEST: % auth.users without health_profiles row', v_auth_users - v_health;
  END IF;

  RAISE NOTICE 'SELF TEST COMPLETE: handle_new_user=% on_auth_user_created=% onboarding_completed_col=%',
    v_handle_fn, v_auth_trigger, v_onboarding_col;
END $$;

CREATE INDEX IF NOT EXISTS idx_article_bookmarks_user_id ON article_bookmarks(user_id);

