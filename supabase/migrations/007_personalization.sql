-- Cyra Personalization System preferences

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS simple_language BOOLEAN DEFAULT false;

COMMENT ON COLUMN user_preferences.language IS 'Cyra UI language code: en, hi, ta, te, kn, ml, bn, mr, gu, pa';
COMMENT ON COLUMN user_preferences.simple_language IS 'Replace medical terms with plain language across Cyra';
