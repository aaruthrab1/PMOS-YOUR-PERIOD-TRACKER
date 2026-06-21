-- Tracker extensions: pain_level, mood enum, weight uniqueness, metabolic_logs

ALTER TABLE period_logs ADD COLUMN IF NOT EXISTS pain_level INTEGER CHECK (pain_level BETWEEN 1 AND 5);

DO $$ BEGIN
  ALTER TYPE mood_type ADD VALUE IF NOT EXISTS 'happy';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE mood_type ADD VALUE IF NOT EXISTS 'exhausted';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

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
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE metabolic_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "metabolic_logs_select_own" ON metabolic_logs FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "metabolic_logs_insert_own" ON metabolic_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "metabolic_logs_update_own" ON metabolic_logs FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "metabolic_logs_delete_own" ON metabolic_logs FOR DELETE
  USING (auth.uid() = user_id);
