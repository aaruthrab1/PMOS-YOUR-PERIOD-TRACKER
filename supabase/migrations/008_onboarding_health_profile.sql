-- Extended onboarding health profile fields

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS height_cm INTEGER CHECK (height_cm IS NULL OR (height_cm >= 100 AND height_cm <= 250)),
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(5,2) CHECK (weight_kg IS NULL OR weight_kg > 0),
  ADD COLUMN IF NOT EXISTS sleep_avg_hours NUMERIC(3,1) CHECK (sleep_avg_hours IS NULL OR (sleep_avg_hours >= 0 AND sleep_avg_hours <= 24)),
  ADD COLUMN IF NOT EXISTS activity_level TEXT;

COMMENT ON COLUMN profiles.height_cm IS 'Onboarding: height in centimeters';
COMMENT ON COLUMN profiles.weight_kg IS 'Onboarding: baseline weight in kg';
COMMENT ON COLUMN profiles.sleep_avg_hours IS 'Onboarding: typical nightly sleep hours';
COMMENT ON COLUMN profiles.activity_level IS 'Onboarding: self-reported activity level';
