import { groq } from '../config/groq.js';
import { REPORT_MODEL, REPORT_SYSTEM_PROMPT, buildReportGenerationPrompt } from '../config/report.prompt.js';
import { AppError } from '../utils/AppError.js';
import type { ReportContextBundle, ReportGenerationResult } from '../types/report.js';
import type { UserPersonalizationPrefs } from '../lib/personalization.js';
import { buildSymptomTimeline, computeRiskSummary } from './report.context.js';

function fallbackResult(bundle: ReportContextBundle): ReportGenerationResult {
  const { snapshot } = bundle;
  const timeline = buildSymptomTimeline(snapshot);

  const sections = {
    cyclePatternSummary: snapshot.periodLogs.length
      ? [`${snapshot.periodLogs.length} period(s) logged in this range.`]
      : ['No period logs in this date range — consider logging cycles for clearer patterns.'],
    symptomTrends: snapshot.patient.conditions?.length
      ? [`Self-reported conditions: ${snapshot.patient.conditions.join(', ')}`]
      : ['Limited symptom data — continue tracking in Cyra.'],
    sleepEnergyTrends: snapshot.chartData.sleepHours.length
      ? [`${snapshot.chartData.sleepHours.length} sleep entries recorded.`]
      : ['No sleep logs in range.'],
    moodTrends: snapshot.moodLogs.length
      ? [`${snapshot.moodLogs.length} mood entries recorded.`]
      : ['No mood logs in range.'],
    weightTrends: snapshot.weightLogs.length
      ? [`${snapshot.weightLogs.length} weight entries recorded.`]
      : ['No weight logs in range.'],
    discussionPoints: [
      'Review my tracked health patterns over this period',
      'Are there tests that could help explain my symptoms?',
      'What lifestyle changes might support my goals?',
    ],
    suggestedTests: [
      { name: 'Thyroid panel (TSH)', reason: 'Often considered for fatigue and cycle changes' },
      { name: 'Fasting glucose / insulin', reason: 'May be relevant if metabolic symptoms are logged' },
    ],
  };

  const doctorPrep = {
    questionsToAsk: [
      'What patterns stand out from my tracked data?',
      'Are there tests you recommend based on my logs?',
      'What should I monitor between now and my next visit?',
    ],
    symptomTimeline: timeline,
    keyConcerns: ['Bring this summary to your appointment for context'],
    testChecklist: sections.suggestedTests.map((t) => ({ ...t, suggested: true })),
    appointmentNotes: 'You have prepared a summary of your tracked health data. Your experiences are valid — use this as a starting point for conversation with your clinician.',
  };

  const riskSummary = computeRiskSummary(snapshot);

  const narrativeSummary = [
    '## Health Summary',
    '',
    'This report summarizes your Cyra tracking data for your upcoming visit.',
    '',
    '### Cycle Patterns',
    ...sections.cyclePatternSummary.map((s) => `- ${s}`),
    '',
    '### Discussion Points',
    ...sections.discussionPoints.map((s) => `- ${s}`),
    '',
    '*This is not a medical diagnosis. Please discuss all concerns with a qualified healthcare provider.*',
  ].join('\n');

  return {
    sections,
    doctorPrep,
    riskSummary,
    narrativeSummary,
    questionsForDoctor: doctorPrep.questionsToAsk,
  };
}

function parseAiJson(raw: string): Partial<ReportGenerationResult> | null {
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned) as Partial<ReportGenerationResult>;
  } catch {
    return null;
  }
}

export async function generateDoctorReport(
  bundle: ReportContextBundle,
  prefs?: UserPersonalizationPrefs,
): Promise<ReportGenerationResult> {
  if (!process.env.GROQ_API_KEY) {
    return fallbackResult(bundle);
  }

  try {
    const completion = await groq.chat.completions.create({
      model: REPORT_MODEL,
      messages: [
        { role: 'system', content: REPORT_SYSTEM_PROMPT },
        { role: 'user', content: buildReportGenerationPrompt(bundle, prefs) },
      ],
      max_tokens: 3000,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallbackResult(bundle);

    const parsed = parseAiJson(raw);
    if (!parsed?.sections || !parsed.doctorPrep) return fallbackResult(bundle);

    const timeline = buildSymptomTimeline(bundle.snapshot);
    const ruleRisks = computeRiskSummary(bundle.snapshot);

    const doctorPrep = {
      ...parsed.doctorPrep,
      symptomTimeline:
        parsed.doctorPrep.symptomTimeline?.length ? parsed.doctorPrep.symptomTimeline : timeline,
    };

    const riskSummary =
      parsed.riskSummary?.length ? parsed.riskSummary : ruleRisks;

    const questionsForDoctor =
      doctorPrep.questionsToAsk?.length ? doctorPrep.questionsToAsk : [];

    return {
      sections: parsed.sections,
      doctorPrep,
      riskSummary,
      narrativeSummary: parsed.narrativeSummary || buildNarrativeFromSections(parsed.sections, doctorPrep),
      questionsForDoctor,
    };
  } catch (err) {
    console.error('Doctor report AI generation failed:', err);
    return fallbackResult(bundle);
  }
}

function buildNarrativeFromSections(
  sections: ReportGenerationResult['sections'],
  prep: ReportGenerationResult['doctorPrep'],
): string {
  const parts = ['## Health Summary', ''];
  const add = (title: string, items: string[]) => {
    if (items?.length) {
      parts.push(`### ${title}`, ...items.map((s) => `- ${s}`), '');
    }
  };
  add('Cycle Patterns', sections.cyclePatternSummary);
  add('Symptom Trends', sections.symptomTrends);
  add('Sleep & Energy', sections.sleepEnergyTrends);
  add('Mood', sections.moodTrends);
  add('Weight', sections.weightTrends);
  add('Discussion Points', sections.discussionPoints);
  if (prep.appointmentNotes) {
    parts.push('### Appointment Notes', prep.appointmentNotes, '');
  }
  parts.push('*This summary is for discussion with a healthcare provider — not a diagnosis.*');
  return parts.join('\n');
}
