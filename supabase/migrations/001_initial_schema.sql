-- Cyra Database Schema
-- Women's health companion: PMOS awareness, symptom tracking, education, doctor prep

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

CREATE TYPE symptom_category AS ENUM (
  'physical',
  'emotional',
  'cognitive',
  'sleep',
  'digestive',
  'skin',
  'energy'
);

CREATE TYPE severity_level AS ENUM (
  'none',
  'mild',
  'moderate',
  'severe'
);

CREATE TYPE cycle_phase AS ENUM (
  'menstrual',
  'follicular',
  'ovulation',
  'luteal',
  'unknown'
);

CREATE TYPE mood_type AS ENUM (
  'calm',
  'anxious',
  'irritable',
  'sad',
  'energetic',
  'foggy',
  'neutral'
);

CREATE TYPE article_category AS ENUM (
  'pmos_basics',
  'symptom_management',
  'nutrition',
  'mental_health',
  'doctor_prep',
  'lifestyle',
  'research'
);

CREATE TYPE report_status AS ENUM (
  'draft',
  'ready',
  'shared'
);

-- ─── PROFILES ────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  timezone TEXT DEFAULT 'UTC',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  health_goals TEXT[] DEFAULT '{}',
  conditions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  reminder_time TIME DEFAULT '09:00:00',
  cycle_length_avg INTEGER DEFAULT 28,
  period_length_avg INTEGER DEFAULT 5,
  privacy_analytics BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CYCLE TRACKING ──────────────────────────────────────────────────────────

CREATE TABLE cycle_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE,
  cycle_length INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cycle_logs_user_date ON cycle_logs(user_id, period_start DESC);

-- ─── SYMPTOM TRACKING ────────────────────────────────────────────────────────

CREATE TABLE symptom_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  cycle_phase cycle_phase DEFAULT 'unknown',
  mood mood_type DEFAULT 'neutral',
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  sleep_hours NUMERIC(3,1),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  notes TEXT,
  triggers TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, logged_date)
);

CREATE INDEX idx_symptom_entries_user_date ON symptom_entries(user_id, logged_date DESC);

CREATE TABLE symptom_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID NOT NULL REFERENCES symptom_entries(id) ON DELETE CASCADE,
  symptom_name TEXT NOT NULL,
  category symptom_category NOT NULL,
  severity severity_level NOT NULL DEFAULT 'mild',
  duration_hours NUMERIC(4,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_symptom_details_entry ON symptom_details(entry_id);

-- ─── EDUCATION ───────────────────────────────────────────────────────────────

CREATE TABLE education_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category article_category NOT NULL,
  read_time_minutes INTEGER DEFAULT 5,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE article_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES education_articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

CREATE TABLE article_read_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES education_articles(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);

-- ─── AI CONVERSATIONS ────────────────────────────────────────────────────────

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New conversation',
  context_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations(user_id, updated_at DESC);

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  token_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id, created_at);

-- ─── DOCTOR PREP ─────────────────────────────────────────────────────────────

CREATE TABLE doctor_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Doctor Visit Summary',
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  summary TEXT,
  key_symptoms JSONB DEFAULT '[]',
  questions_for_doctor TEXT[] DEFAULT '{}',
  status report_status DEFAULT 'draft',
  shared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_doctor_reports_user ON doctor_reports(user_id, created_at DESC);

-- ─── AUDIT LOG ───────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);

-- ─── FUNCTIONS ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  INSERT INTO user_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER symptom_entries_updated_at BEFORE UPDATE ON symptom_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER cycle_logs_updated_at BEFORE UPDATE ON cycle_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER education_articles_updated_at BEFORE UPDATE ON education_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER doctor_reports_updated_at BEFORE UPDATE ON doctor_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_read_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_reports ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- User preferences
CREATE POLICY "Users manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Cycle logs
CREATE POLICY "Users manage own cycle logs" ON cycle_logs
  FOR ALL USING (auth.uid() = user_id);

-- Symptom entries
CREATE POLICY "Users manage own symptom entries" ON symptom_entries
  FOR ALL USING (auth.uid() = user_id);

-- Symptom details (via entry ownership)
CREATE POLICY "Users manage own symptom details" ON symptom_details
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM symptom_entries se
      WHERE se.id = entry_id AND se.user_id = auth.uid()
    )
  );

-- Education articles (public read)
ALTER TABLE education_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published articles" ON education_articles
  FOR SELECT USING (published_at IS NOT NULL);

-- Bookmarks & progress
CREATE POLICY "Users manage own bookmarks" ON article_bookmarks
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own read progress" ON article_read_progress
  FOR ALL USING (auth.uid() = user_id);

-- AI conversations
CREATE POLICY "Users manage own conversations" ON ai_conversations
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own messages" ON ai_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ai_conversations ac
      WHERE ac.id = conversation_id AND ac.user_id = auth.uid()
    )
  );

-- Doctor reports
CREATE POLICY "Users manage own reports" ON doctor_reports
  FOR ALL USING (auth.uid() = user_id);

-- Audit logs (insert only for authenticated users on own actions)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);
