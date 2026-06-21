-- Onboarding profile fields for post-auth setup flow

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_range TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cycle_regularity TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS energy_level INTEGER CHECK (energy_level IS NULL OR (energy_level >= 1 AND energy_level <= 10));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS common_symptoms TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_period_date DATE;

COMMENT ON COLUMN profiles.age_range IS 'Onboarding: user age bracket';
COMMENT ON COLUMN profiles.region IS 'Onboarding: India region (north, south, east, west, central, northeast)';
COMMENT ON COLUMN profiles.cycle_regularity IS 'Onboarding: self-reported cycle regularity';
COMMENT ON COLUMN profiles.energy_level IS 'Onboarding: baseline energy 1-10';
COMMENT ON COLUMN profiles.common_symptoms IS 'Onboarding: frequently experienced symptoms';
COMMENT ON COLUMN profiles.last_period_date IS 'Onboarding: most recent period start date';
