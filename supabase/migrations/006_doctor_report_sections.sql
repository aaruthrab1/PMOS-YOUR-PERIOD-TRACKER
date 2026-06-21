-- Structured doctor report sections for Cyra Doctor Report Generator

ALTER TABLE doctor_reports
  ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS doctor_prep JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS source_snapshot JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS risk_summary JSONB DEFAULT '[]';

COMMENT ON COLUMN doctor_reports.sections IS 'AI health summary: cycle, symptoms, sleep, mood, weight, discussion, tests';
COMMENT ON COLUMN doctor_reports.doctor_prep IS 'Doctor prep mode: questions, timeline, concerns, checklist, notes';
COMMENT ON COLUMN doctor_reports.source_snapshot IS 'Aggregated tracker data for PDF tables and charts';
COMMENT ON COLUMN doctor_reports.risk_summary IS 'Non-diagnostic risk flags for clinician discussion';
