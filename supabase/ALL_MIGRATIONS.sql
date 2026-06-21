-- ═══════════════════════════════════════════════════════════════════════════════
-- CYRA — Complete Supabase Setup
-- Paste this entire file into: Supabase Dashboard → SQL Editor → New query → Run
-- Project: https://bcbrztscmpvvfamwtrbr.supabase.co
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 001: Initial schema ───────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE symptom_category AS ENUM (
  'physical', 'emotional', 'cognitive', 'sleep', 'digestive', 'skin', 'energy'
);

CREATE TYPE severity_level AS ENUM ('none', 'mild', 'moderate', 'severe');

CREATE TYPE cycle_phase AS ENUM ('menstrual', 'follicular', 'ovulation', 'luteal', 'unknown');

CREATE TYPE mood_type AS ENUM (
  'calm', 'anxious', 'irritable', 'sad', 'energetic', 'foggy', 'neutral'
);

CREATE TYPE article_category AS ENUM (
  'pmos_basics', 'symptom_management', 'nutrition', 'mental_health',
  'doctor_prep', 'lifestyle', 'research'
);

CREATE TYPE report_status AS ENUM ('draft', 'ready', 'shared');

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

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own cycle logs" ON cycle_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own symptom entries" ON symptom_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own symptom details" ON symptom_details
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM symptom_entries se
      WHERE se.id = entry_id AND se.user_id = auth.uid()
    )
  );

ALTER TABLE education_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published articles" ON education_articles
  FOR SELECT USING (published_at IS NOT NULL);

CREATE POLICY "Users manage own bookmarks" ON article_bookmarks
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own read progress" ON article_read_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own conversations" ON ai_conversations
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own messages" ON ai_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM ai_conversations ac
      WHERE ac.id = conversation_id AND ac.user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage own reports" ON doctor_reports
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- ─── 002: Seed education articles ────────────────────────────────────────────

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

-- ─── 003: Core tracker tables ──────────────────────────────────────────────────

DO $$ BEGIN CREATE TYPE flow_intensity AS ENUM ('spotting', 'light', 'medium', 'heavy');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE weight_unit AS ENUM ('kg', 'lb');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE sync_status AS ENUM ('synced', 'pending', 'conflict');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE TABLE IF NOT EXISTS period_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE,
  flow_intensity flow_intensity DEFAULT 'medium',
  cycle_length INTEGER,
  symptoms TEXT[] DEFAULT '{}',
  notes TEXT,
  client_id TEXT,
  sync_status sync_status DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_period_logs_user ON period_logs(user_id, period_start DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_period_logs_client_id ON period_logs(user_id, client_id)
  WHERE client_id IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS sleep_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours NUMERIC(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  bedtime TIME,
  wake_time TIME,
  interruptions INTEGER DEFAULT 0,
  notes TEXT,
  client_id TEXT,
  sync_status sync_status DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, logged_date)
);

CREATE INDEX IF NOT EXISTS idx_sleep_logs_user ON sleep_logs(user_id, logged_date DESC);

CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC(5,2) NOT NULL CHECK (weight > 0),
  unit weight_unit DEFAULT 'kg',
  body_fat_percent NUMERIC(4,1),
  notes TEXT,
  client_id TEXT,
  sync_status sync_status DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_weight_logs_user ON weight_logs(user_id, logged_date DESC);

CREATE TABLE IF NOT EXISTS mood_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood mood_type NOT NULL DEFAULT 'neutral',
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  anxiety_level INTEGER CHECK (anxiety_level BETWEEN 1 AND 10),
  triggers TEXT[] DEFAULT '{}',
  notes TEXT,
  client_id TEXT,
  sync_status sync_status DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, logged_date)
);

CREATE INDEX IF NOT EXISTS idx_mood_logs_user ON mood_logs(user_id, logged_date DESC);

CREATE TABLE IF NOT EXISTS androgen_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  symptoms JSONB DEFAULT '[]',
  lab_markers JSONB DEFAULT '{}',
  testosterone_level NUMERIC(6,2),
  dhea_level NUMERIC(6,2),
  notes TEXT,
  client_id TEXT,
  sync_status sync_status DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, logged_date)
);

CREATE INDEX IF NOT EXISTS idx_androgen_logs_user ON androgen_logs(user_id, logged_date DESC);

CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_type TEXT NOT NULL DEFAULT 'onboarding',
  answers JSONB NOT NULL DEFAULT '{}',
  score INTEGER,
  recommendations TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  client_id TEXT,
  sync_status sync_status DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(user_id, completed_at DESC);

CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  language TEXT DEFAULT 'English',
  token_count INTEGER,
  client_id TEXT,
  sync_status sync_status DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_history_user ON chat_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_conversation ON chat_history(conversation_id, created_at);

DO $$ BEGIN
  CREATE TRIGGER period_logs_updated_at BEFORE UPDATE ON period_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER sleep_logs_updated_at BEFORE UPDATE ON sleep_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER weight_logs_updated_at BEFORE UPDATE ON weight_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER mood_logs_updated_at BEFORE UPDATE ON mood_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER androgen_logs_updated_at BEFORE UPDATE ON androgen_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER quiz_results_updated_at BEFORE UPDATE ON quiz_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE period_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE androgen_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "period_logs_select_own" ON period_logs FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "period_logs_insert_own" ON period_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "period_logs_update_own" ON period_logs FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "period_logs_delete_own" ON period_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "sleep_logs_select_own" ON sleep_logs FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "sleep_logs_insert_own" ON sleep_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sleep_logs_update_own" ON sleep_logs FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "sleep_logs_delete_own" ON sleep_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "weight_logs_select_own" ON weight_logs FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "weight_logs_insert_own" ON weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "weight_logs_update_own" ON weight_logs FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "weight_logs_delete_own" ON weight_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "mood_logs_select_own" ON mood_logs FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "mood_logs_insert_own" ON mood_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mood_logs_update_own" ON mood_logs FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "mood_logs_delete_own" ON mood_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "androgen_logs_select_own" ON androgen_logs FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "androgen_logs_insert_own" ON androgen_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "androgen_logs_update_own" ON androgen_logs FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "androgen_logs_delete_own" ON androgen_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "quiz_results_select_own" ON quiz_results FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "quiz_results_insert_own" ON quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quiz_results_update_own" ON quiz_results FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "quiz_results_delete_own" ON quiz_results FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "chat_history_select_own" ON chat_history FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "chat_history_insert_own" ON chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chat_history_delete_own" ON chat_history FOR DELETE
  USING (auth.uid() = user_id);

DO $$ BEGIN
  CREATE POLICY "doctor_reports_insert_own" ON doctor_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO period_logs (user_id, period_start, period_end, cycle_length, notes, created_at, updated_at)
SELECT user_id, period_start, period_end, cycle_length, notes, created_at, updated_at
FROM cycle_logs
WHERE NOT EXISTS (
  SELECT 1 FROM period_logs pl
  WHERE pl.user_id = cycle_logs.user_id AND pl.period_start = cycle_logs.period_start
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url, auth_provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    full_name = CASE WHEN profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END,
    auth_provider = EXCLUDED.auth_provider,
    updated_at = NOW();

  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 004: Onboarding fields ────────────────────────────────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_range TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cycle_regularity TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level IS NULL OR (energy_level >= 1 AND energy_level <= 10));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS common_symptoms TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_period_date DATE;

-- ─── 005: Tracker extensions ─────────────────────────────────────────────────

ALTER TABLE period_logs ADD COLUMN IF NOT EXISTS pain_level INTEGER CHECK (pain_level BETWEEN 1 AND 5);

DO $$ BEGIN ALTER TYPE mood_type ADD VALUE IF NOT EXISTS 'happy';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN ALTER TYPE mood_type ADD VALUE IF NOT EXISTS 'exhausted';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_weight_logs_user_date
  ON weight_logs(user_id, logged_date)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS metabolic_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  hunger_level INTEGER CHECK (hunger_level BETWEEN 1 AND 5),
  sugar_cravings BOOLEAN DEFAULT FALSE,
  brain_fog BOOLEAN DEFAULT FALSE,
  notes TEXT,
  client_id TEXT,
  sync_status sync_status DEFAULT 'synced',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, logged_date)
);

CREATE INDEX IF NOT EXISTS idx_metabolic_logs_user ON metabolic_logs(user_id, logged_date DESC);

DO $$ BEGIN
  CREATE TRIGGER metabolic_logs_updated_at BEFORE UPDATE ON metabolic_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE metabolic_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "metabolic_logs_select_own" ON metabolic_logs FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "metabolic_logs_insert_own" ON metabolic_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "metabolic_logs_update_own" ON metabolic_logs FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "metabolic_logs_delete_own" ON metabolic_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ─── 006: Doctor report sections ─────────────────────────────────────────────

ALTER TABLE doctor_reports
  ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS doctor_prep JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source_snapshot JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS risk_summary JSONB DEFAULT '[]';

-- ─── 007: Personalization ──────────────────────────────────────────────────────

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS simple_language BOOLEAN DEFAULT false;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Done! You should see: Success. No rows returned
-- ═══════════════════════════════════════════════════════════════════════════════
