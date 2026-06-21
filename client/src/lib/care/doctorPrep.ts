import type { Profile, MoodLog, SleepLog, PeriodLog, WeightLog, MetabolicLog, AndrogenLog, QuizResult } from '@/types/supabase';
import type { CycleForecast } from '@/lib/dashboard/cycleForecast';
import type { PeriodAnalytics } from '@/lib/tracker/periodAnalytics';
import type { SleepAnalytics } from '@/lib/tracker/sleepAnalytics';
import type { MoodAnalytics } from '@/lib/tracker/moodAnalytics';
import type { WeightAnalytics } from '@/lib/tracker/weightAnalytics';
import type { MetabolicAnalytics } from '@/lib/tracker/metabolicAnalytics';
import type { JourneyProgress } from './types';
import { DIAGNOSIS_STEPS } from './diagnosisJourney';
import { TEST_GUIDE_ITEMS } from './testGuide';
import type { DoctorPrepDocument } from './types';
import { TRACKER_MOOD_OPTIONS } from '@/lib/constants';

interface DoctorPrepInput {
  profile: Profile | null;
  cycle: CycleForecast;
  periodAnalytics: PeriodAnalytics;
  sleepAnalytics: SleepAnalytics;
  moodAnalytics: MoodAnalytics;
  weightAnalytics: WeightAnalytics;
  metabolicAnalytics: MetabolicAnalytics;
  moodLogs: MoodLog[];
  sleepLogs: SleepLog[];
  weightLogs: WeightLog[];
  metabolicLogs: MetabolicLog[];
  androgenLogs: AndrogenLog[];
  quizResults: QuizResult[];
  periods: PeriodLog[];
  diagnosisProgress: JourneyProgress | null;
}

function moodLabel(mood: string): string {
  return TRACKER_MOOD_OPTIONS.find((m) => m.value === mood)?.label ?? mood;
}

export function generateDoctorPrep(input: DoctorPrepInput): DoctorPrepDocument {
  const {
    profile, cycle, periodAnalytics, sleepAnalytics, moodAnalytics,
    weightAnalytics, metabolicAnalytics,
    moodLogs, sleepLogs, weightLogs, metabolicLogs, androgenLogs, quizResults,
    diagnosisProgress,
  } = input;

  const now = new Date();
  const thirtyAgo = new Date(now);
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);
  const cutoff = thirtyAgo.toISOString().split('T')[0];

  const recentMoods = moodLogs
    .filter((l) => !l.deleted_at && l.logged_date >= cutoff)
    .sort((a, b) => b.logged_date.localeCompare(a.logged_date));

  const recentSleep = sleepLogs
    .filter((l) => !l.deleted_at && l.logged_date >= cutoff)
    .sort((a, b) => b.logged_date.localeCompare(a.logged_date));

  const recentMetabolic = metabolicLogs
    .filter((l) => !l.deleted_at && l.logged_date >= cutoff);

  const dates = new Set([
    ...recentMoods.map((m) => m.logged_date),
    ...recentSleep.map((s) => s.logged_date),
    ...recentMetabolic.map((m) => m.logged_date),
    ...androgenLogs.filter((l) => !l.deleted_at && l.logged_date >= cutoff).map((a) => a.logged_date),
  ]);

  const symptomTimeline: DoctorPrepDocument['symptomTimeline'] = [];

  [...dates].sort().reverse().slice(0, 14).forEach((date) => {
    const mood = recentMoods.find((m) => m.logged_date === date);
    const sleep = recentSleep.find((s) => s.logged_date === date);
    const metabolic = recentMetabolic.find((m) => m.logged_date === date);
    const parts: string[] = [];
    if (mood) parts.push(`Mood: ${moodLabel(mood.mood)}`);
    if (sleep?.sleep_hours != null) parts.push(`Sleep: ${sleep.sleep_hours}h`);
    if (mood?.energy_level != null) parts.push(`Energy: ${mood.energy_level}/10`);
    if (metabolic?.brain_fog) parts.push('Brain fog: yes');
    if (parts.length) symptomTimeline.push({ date, summary: parts.join(' · ') });
  });

  const healthSummary: string[] = [];
  const keyConcerns: string[] = [];

  if (profile?.full_name) {
    healthSummary.push(`Prepared for ${profile.full_name.split(' ')[0]}'s visit`);
  }

  if (profile?.conditions?.length) {
    healthSummary.push(`Self-reported conditions: ${profile.conditions.join(', ')}`);
  }

  if (cycle.hasData) {
    healthSummary.push(
      `Current cycle phase: ${cycle.phase} (day ${cycle.cycleDay}). Average cycle length: ${periodAnalytics.averageCycleLength ?? cycle.cycleLength} days.`,
    );
  } else {
    healthSummary.push('Cycle data: not enough period logs yet — consider logging periods for clearer patterns.');
  }

  if (sleepAnalytics.monthlyAverage != null) {
    healthSummary.push(`Average sleep (30 days): ${sleepAnalytics.monthlyAverage} hours per night.`);
    if (sleepAnalytics.monthlyAverage < 6.5) {
      keyConcerns.push('Sleep averaging below 6.5 hours — may affect energy and mood');
    }
  }

  const topMood = moodAnalytics.frequency.sort((a, b) => b.count - a.count)[0];
  if (topMood) {
    healthSummary.push(`Most logged mood recently: ${topMood.label} (${topMood.count} entries).`);
  }

  if (weightAnalytics.trend.length >= 2) {
    const first = weightAnalytics.trend[0].value;
    const last = weightAnalytics.trend[weightAnalytics.trend.length - 1].value;
    const diff = last - first;
    if (Math.abs(diff) >= 0.5) {
      const direction = diff > 0 ? 'upward' : 'downward';
      healthSummary.push(`Weight trend: ${direction} (${diff > 0 ? '+' : ''}${diff.toFixed(1)} ${weightAnalytics.unit} over logged period).`);
    }
  }

  if (metabolicAnalytics.brainFogRate > 30) {
    healthSummary.push(`Brain fog logged on ~${metabolicAnalytics.brainFogRate}% of recent metabolic entries.`);
    keyConcerns.push('Recurring brain fog entries — worth discussing with your clinician');
  }

  if (androgenLogs.filter((l) => !l.deleted_at && l.logged_date >= cutoff).length > 0) {
    healthSummary.push('Androgen symptom check-ins recorded — bring androgen tracker trends to your visit.');
  }

  const latestQuiz = quizResults[0];
  if (latestQuiz) {
    healthSummary.push(
      `Latest assessment (${latestQuiz.quiz_type}): score ${latestQuiz.score ?? 'n/a'} on ${latestQuiz.completed_at?.split('T')[0] ?? 'recent'}.`,
    );
  }

  if (profile?.common_symptoms?.length) {
    healthSummary.push(`Common symptoms from profile: ${profile.common_symptoms.join(', ')}.`);
  }

  const completedDx = diagnosisProgress
    ? DIAGNOSIS_STEPS.filter((s) => diagnosisProgress.steps[s.id]?.completed).map((s) => s.title)
    : [];
  if (completedDx.length) {
    healthSummary.push(`Diagnosis journey progress: ${completedDx.join(' → ')}.`);
  }

  const questionsToAsk: string[] = [
    'Based on my tracked symptoms, what patterns stand out to you?',
    'Are there tests you recommend given my cycle and symptom history?',
    'What lifestyle changes might support my goals while we evaluate options?',
  ];

  if (periodAnalytics.lastCycleLength != null && periodAnalytics.lastCycleLength > 35) {
    questionsToAsk.push('Could my longer cycles explain some of my symptoms?');
    keyConcerns.push(`Recent cycle length ${periodAnalytics.lastCycleLength} days — outside typical range`);
  }

  if (sleepAnalytics.weeklyAverage != null && sleepAnalytics.weeklyAverage < 6.5) {
    questionsToAsk.push('Could poor sleep be contributing to my mood or energy symptoms?');
  }

  const lutealMood = moodAnalytics.phaseBreakdown['Luteal'];
  if (lutealMood && Object.keys(lutealMood).length) {
    questionsToAsk.push('I notice mood shifts before my period — what support options exist for PMOS?');
    keyConcerns.push('Mood shifts logged during luteal phase');
  }

  if (profile?.conditions?.some((c) => c.toLowerCase().includes('pcos'))) {
    questionsToAsk.push('How should we monitor metabolic health alongside my PCOS care?');
  }

  if (weightLogs.length >= 2) {
    questionsToAsk.push('Should we track weight changes alongside my hormonal symptoms?');
  }

  const hasPCOS = profile?.conditions?.some((c) => c.toLowerCase().includes('pcos'));
  const irregular = periodAnalytics.consistencyScore < 50 && periodAnalytics.cycleLengths.length >= 2;

  const testChecklist = TEST_GUIDE_ITEMS.map((test) => {
    let suggested = false;
    let reason = 'Discuss with your clinician if relevant to your symptoms.';

    if (test.id === 'tsh') {
      suggested = true;
      reason = 'Often included in initial workups for irregular cycles and fatigue.';
    }
    if (test.id === 'lh' || test.id === 'fsh') {
      suggested = !!(hasPCOS || irregular);
      reason = 'Commonly checked for ovulation patterns and PCOS evaluation.';
    }
    if (test.id === 'fasting_insulin') {
      suggested = !!(hasPCOS || metabolicAnalytics.cravingRate > 30);
      reason = 'May help assess insulin-related patterns in PCOS or metabolic symptoms.';
    }
    if (test.id === 'pelvic_ultrasound') {
      suggested = !!(hasPCOS || irregular);
      reason = 'Useful when cycles are irregular or PCOS is being considered.';
    }
    if (test.id === 'amh') {
      suggested = false;
      reason = 'Sometimes used for ovarian reserve or fertility planning — ask if it fits your goals.';
    }

    return { name: test.name, reason, suggested };
  });

  const appointmentNotes =
    keyConcerns.length > 0
      ? `You have ${keyConcerns.length} priority topic(s) from your logs. Walk in knowing your data — you deserve to be heard.`
      : 'Your tracker data is ready to support the conversation. You know your body best — use this prep as a starting point.';

  return {
    symptomTimeline,
    healthSummary,
    questionsToAsk: questionsToAsk.slice(0, 7),
    keyConcerns: keyConcerns.slice(0, 5),
    testChecklist,
    appointmentNotes,
  };
}

export function formatDoctorPrepText(doc: DoctorPrepDocument): string {
  const lines: string[] = ['CYRA — DOCTOR VISIT PREP', ''];

  lines.push('HEALTH SUMMARY', ...doc.healthSummary.map((s) => `• ${s}`), '');

  if (doc.keyConcerns.length) {
    lines.push('KEY CONCERNS', ...doc.keyConcerns.map((s) => `• ${s}`), '');
  }

  lines.push('SYMPTOM TIMELINE (recent)');
  if (doc.symptomTimeline.length === 0) {
    lines.push('• No recent logs — track in Cyra before your visit for richer data.');
  } else {
    doc.symptomTimeline.forEach(({ date, summary }) => lines.push(`• ${date}: ${summary}`));
  }
  lines.push('');

  lines.push('QUESTIONS TO ASK');
  doc.questionsToAsk.forEach((q) => lines.push(`• ${q}`));
  lines.push('');

  lines.push('TEST CHECKLIST');
  doc.testChecklist.filter((t) => t.suggested).forEach((t) => lines.push(`☐ ${t.name} — ${t.reason}`));
  doc.testChecklist.filter((t) => !t.suggested).forEach((t) => lines.push(`○ ${t.name} — ${t.reason}`));
  lines.push('');

  lines.push('APPOINTMENT NOTES', doc.appointmentNotes, '');
  lines.push('Generated by Cyra for personal use — not a medical document.');

  return lines.join('\n');
}
