import type { ReportContextBundle } from '../types/report.js';
import type { UserPersonalizationPrefs } from '../lib/personalization.js';
import {
  buildLanguageInstruction,
  buildRegionalContextInstruction,
  buildSimpleLanguageInstruction,
} from '../lib/personalization.js';

export const REPORT_MODEL = 'llama-3.3-70b-versatile';

export const REPORT_SYSTEM_PROMPT = `You are Cyra's Doctor Report Generator — a clinical documentation assistant for women's health.

STRICT RULES:
- NEVER diagnose conditions or name diseases as confirmed
- NEVER claim certainty ("definitely", "you have", "this proves")
- NEVER recommend stopping, skipping, or changing prescribed medications
- Use hedging language: "patterns suggest", "may be worth discussing", "could indicate"
- Tone: professional but simple — suitable for a doctor visit handout
- Encourage healthcare consultation where appropriate
- Base all statements ONLY on the provided tracked data
- If data is sparse, say so honestly and suggest what to track before the visit

Output valid JSON only. No markdown fences.`;

export function buildReportGenerationPrompt(
  bundle: ReportContextBundle,
  prefs?: UserPersonalizationPrefs,
): string {
  const personalization = prefs
    ? [
        buildLanguageInstruction(prefs.language),
        buildRegionalContextInstruction(prefs.region),
        buildSimpleLanguageInstruction(prefs.simpleLanguage),
      ].filter(Boolean).join('\n')
    : '';

  return `Generate a structured doctor visit report from this patient's Cyra health tracking data.

${personalization ? `PERSONALIZATION:\n${personalization}\n\n` : ''}${bundle.contextText}

Return JSON with this exact structure:
{
  "sections": {
    "cyclePatternSummary": ["2-4 bullet strings about menstrual/cycle patterns from logs"],
    "symptomTrends": ["2-4 bullets on physical/symptom patterns across logs"],
    "sleepEnergyTrends": ["2-3 bullets on sleep and energy patterns"],
    "sleepAnalysis": ["2-3 bullets focused on sleep duration and quality"],
    "moodTrends": ["2-3 bullets on mood and emotional patterns"],
    "androgenAnalysis": ["2-3 bullets on hair, skin, scalp patterns from androgen logs if any"],
    "weightTrends": ["1-3 bullets on weight changes, or note if insufficient data"],
    "discussionPoints": ["4-6 specific topics the patient should raise with their doctor"],
    "suggestedTests": [{"name": "Test name", "reason": "Why it may be relevant — not a prescription"}]
  },
  "doctorPrep": {
    "questionsToAsk": ["5-7 thoughtful questions for the appointment"],
    "keyConcerns": ["3-5 priority concerns based on data"],
    "testChecklist": [{"name": "Test", "reason": "Why discuss", "suggested": true/false}],
    "appointmentNotes": "2-3 sentence prep note for the patient (warm, empowering)"
  },
  "riskSummary": [{"concern": "short label", "severity": "low|moderate|high", "note": "non-diagnostic note"}],
  "narrativeSummary": "A 3-5 paragraph markdown-style summary combining all sections for display. Use ## headers for major sections."
}

If a data category has no logs, acknowledge the gap and suggest tracking. Keep language accessible for Indian patients.`;
}
