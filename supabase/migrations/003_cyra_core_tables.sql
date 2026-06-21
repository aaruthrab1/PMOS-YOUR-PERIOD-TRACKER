-- Cyra Core Tables — period, sleep, weight, mood, androgen, quiz, chat_history
-- Run after 001_initial_schema.sql

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE flow_intensity AS ENUM ('spotting', 'light', 'medium', 'heavy');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE weight_unit AS ENUM ('kg', 'lb');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE sync_status AS ENUM ('synced', 'pending', 'conflict');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── PROFILES ENHANCEMENTS ─────────────────────────────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- ─── PERIOD LOGS ─────────────────────────────────────────────────────────────

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

-- ─── SLEEP LOGS ──────────────────────────────────────────────────────────────

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

-- ─── WEIGHT LOGS ─────────────────────────────────────────────────────────────

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

-- ─── MOOD LOGS ───────────────────────────────────────────────────────────────

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

-- ─── ANDROGEN LOGS ───────────────────────────────────────────────────────────

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

-- ─── QUIZ RESULTS ────────────────────────────────────────────────────────────

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

-- ─── CHAT HISTORY ────────────────────────────────────────────────────────────
-- Unified Sakhi chat store (complements ai_conversations / ai_messages)

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

-- ─── UPDATED_AT TRIGGERS ─────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TRIGGER period_logs_updated_at BEFORE UPDATE ON period_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER sleep_logs_updated_at BEFORE UPDATE ON sleep_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER weight_logs_updated_at BEFORE UPDATE ON weight_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER mood_logs_updated_at BEFORE UPDATE ON mood_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER androgen_logs_updated_at BEFORE UPDATE ON androgen_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER quiz_results_updated_at BEFORE UPDATE ON quiz_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

ALTER TABLE period_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE androgen_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Period logs
CREATE POLICY "period_logs_select_own" ON period_logs FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "period_logs_insert_own" ON period_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "period_logs_update_own" ON period_logs FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "period_logs_delete_own" ON period_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Sleep logs
CREATE POLICY "sleep_logs_select_own" ON sleep_logs FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "sleep_logs_insert_own" ON sleep_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sleep_logs_update_own" ON sleep_logs FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "sleep_logs_delete_own" ON sleep_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Weight logs
CREATE POLICY "weight_logs_select_own" ON weight_logs FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "weight_logs_insert_own" ON weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "weight_logs_update_own" ON weight_logs FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "weight_logs_delete_own" ON weight_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Mood logs
CREATE POLICY "mood_logs_select_own" ON mood_logs FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "mood_logs_insert_own" ON mood_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "mood_logs_update_own" ON mood_logs FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "mood_logs_delete_own" ON mood_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Androgen logs
CREATE POLICY "androgen_logs_select_own" ON androgen_logs FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "androgen_logs_insert_own" ON androgen_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "androgen_logs_update_own" ON androgen_logs FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "androgen_logs_delete_own" ON androgen_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Quiz results
CREATE POLICY "quiz_results_select_own" ON quiz_results FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "quiz_results_insert_own" ON quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quiz_results_update_own" ON quiz_results FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "quiz_results_delete_own" ON quiz_results FOR DELETE
  USING (auth.uid() = user_id);

-- Chat history
CREATE POLICY "chat_history_select_own" ON chat_history FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "chat_history_insert_own" ON chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chat_history_delete_own" ON chat_history FOR DELETE
  USING (auth.uid() = user_id);

-- Doctor reports — ensure insert policy exists
DO $$ BEGIN
  CREATE POLICY "doctor_reports_insert_own" ON doctor_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Profiles — allow insert for OAuth trigger (handled by handle_new_user)
DO $$ BEGIN
  CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── MIGRATE cycle_logs → period_logs (optional backfill) ───────────────────

INSERT INTO period_logs (user_id, period_start, period_end, cycle_length, notes, created_at, updated_at)
SELECT user_id, period_start, period_end, cycle_length, notes, created_at, updated_at
FROM cycle_logs
WHERE NOT EXISTS (
  SELECT 1 FROM period_logs pl
  WHERE pl.user_id = cycle_logs.user_id AND pl.period_start = cycle_logs.period_start
);

-- ─── ENHANCED handle_new_user for OAuth ──────────────────────────────────────

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
