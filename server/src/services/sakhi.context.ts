import type { SupabaseClient } from '@supabase/supabase-js';

export interface SakhiHealthContext {
  summary: string;
  hasData: boolean;
  insights: string[];
}

interface PeriodRow {
  period_start: string;
  period_end?: string | null;
  cycle_length?: number | null;
}

interface MoodRow {
  logged_date: string;
  mood: string;
  energy_level: number | null;
}

interface SleepRow {
  logged_date: string;
  sleep_hours: number | null;
  sleep_quality: number | null;
}

interface SymptomEntryRow {
  logged_date: string;
  cycle_phase: string;
  mood: string;
  energy_level: number | null;
  sleep_hours: number | null;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.round(Math.abs(da.getTime() - db.getTime()) / 86_400_000);
}

function dateInRange(dateStr: string, start: Date, end: Date): boolean {
  const d = new Date(dateStr);
  return d >= start && d < end;
}

/**
 * Detects repeated low energy in the ~7 days before period starts.
 * Example insight: "logged low energy before period for two cycles"
 */
function detectPremenstrualEnergyPattern(
  periods: PeriodRow[],
  moodLogs: MoodRow[],
  symptomEntries: SymptomEntryRow[],
  cycleLengthAvg: number,
): string | null {
  if (periods.length < 2) return null;

  let matchingCycles = 0;
  const cyclesToCheck = Math.min(periods.length - 1, 4);

  for (let i = 0; i < cyclesToCheck; i++) {
    const periodStart = new Date(periods[i].period_start);
    const prevStart = new Date(periods[i + 1].period_start);
    const cycleLen =
      periods[i].cycle_length ??
      daysBetween(periods[i].period_start, periods[i + 1].period_start) ??
      cycleLengthAvg;

    const windowStart = new Date(periodStart);
    windowStart.setDate(windowStart.getDate() - 7);

    const moodInWindow = moodLogs.filter(
      (m) =>
        m.energy_level != null &&
        dateInRange(m.logged_date, windowStart, periodStart),
    );

    const lutealEntries = symptomEntries.filter(
      (e) =>
        e.cycle_phase === 'luteal' &&
        e.energy_level != null &&
        dateInRange(e.logged_date, windowStart, periodStart),
    );

    const allEnergy = [
      ...moodInWindow.map((m) => m.energy_level!),
      ...lutealEntries.map((e) => e.energy_level!),
    ];

    if (allEnergy.length >= 1) {
      const avg = allEnergy.reduce((a, b) => a + b, 0) / allEnergy.length;
      if (avg <= 4.5) matchingCycles++;
    } else if (prevStart < periodStart) {
      // Fallback: any low-energy log in premenstrual window without explicit phase
      const anyLow = moodLogs.some(
        (m) =>
          m.energy_level != null &&
          m.energy_level <= 4 &&
          dateInRange(m.logged_date, windowStart, periodStart),
      );
      if (anyLow) matchingCycles++;
    }
  }

  if (matchingCycles >= 2) {
    return `Pattern: logged low energy (≤4–5/10) in the ~7 days before period start for ${matchingCycles} recent cycles — reference this when discussing fatigue, mood, or cycle-related symptoms.`;
  }
  return null;
}

function detectSleepTrend(sleeps: SleepRow[]): string | null {
  const recent = sleeps.filter((s) => s.sleep_hours != null).slice(0, 14);
  if (recent.length < 5) return null;

  const hours = recent.map((s) => Number(s.sleep_hours));
  const avg = hours.reduce((a, b) => a + b, 0) / hours.length;
  const underSix = hours.filter((h) => h < 6).length;

  if (avg < 6.5) {
    return `Sleep pattern: average ${avg.toFixed(1)}h over last ${recent.length} logs (${underSix} nights under 6h) — mention gently if sleep or energy comes up.`;
  }
  return null;
}

function detectMoodTrend(moods: MoodRow[]): string | null {
  if (moods.length < 5) return null;

  const recent = moods.slice(0, 14);
  const lowMoods = recent.filter((m) =>
    ['low', 'anxious', 'irritable', 'sad', 'overwhelmed'].includes(m.mood),
  );

  if (lowMoods.length >= Math.ceil(recent.length * 0.4)) {
    return `Mood pattern: ${lowMoods.length} of last ${recent.length} mood logs were low-stress moods (${[...new Set(lowMoods.map((m) => m.mood))].join(', ')}) — validate feelings before giving tips.`;
  }
  return null;
}

/**
 * Builds health context from Cyra Supabase logs for Sakhi prompts.
 */
export async function buildHealthContext(
  supabase: SupabaseClient,
  userId: string,
  days = 60,
): Promise<SakhiHealthContext> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0];

  const [
    profileResult,
    prefsResult,
    periodsResult,
    moodResult,
    sleepResult,
    quizResult,
    symptomResult,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'full_name, health_goals, conditions, region, locale, cycle_regularity, common_symptoms, energy_level, last_period_date, date_of_birth',
      )
      .eq('id', userId)
      .single(),
    supabase
      .from('user_preferences')
      .select('cycle_length_avg, period_length_avg, language, simple_language')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('period_logs')
      .select('period_start, period_end, flow_intensity, cycle_length')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('period_start', { ascending: false })
      .limit(8),
    supabase
      .from('mood_logs')
      .select('logged_date, mood, energy_level')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('logged_date', startStr)
      .order('logged_date', { ascending: false })
      .limit(45),
    supabase
      .from('sleep_logs')
      .select('logged_date, sleep_hours, sleep_quality')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('logged_date', startStr)
      .order('logged_date', { ascending: false })
      .limit(45),
    supabase
      .from('quiz_results')
      .select('quiz_type, score, completed_at, recommendations, answers')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(5),
    supabase
      .from('symptom_entries')
      .select('logged_date, cycle_phase, mood, energy_level, sleep_hours')
      .eq('user_id', userId)
      .gte('logged_date', startStr)
      .order('logged_date', { ascending: false })
      .limit(45),
  ]);

  const profile = profileResult.data;
  const prefs = prefsResult.data;
  const periods = (periodsResult.data || []) as PeriodRow[];
  const moods = (moodResult.data || []) as MoodRow[];
  const sleeps = (sleepResult.data || []) as SleepRow[];
  const quizzes = quizResult.data || [];
  const symptoms = (symptomResult.data || []) as SymptomEntryRow[];

  const insights: string[] = [];
  const lines: string[] = [];
  const cycleLengthAvg = prefs?.cycle_length_avg ?? 28;

  if (profile?.full_name) {
    lines.push(`User's first name: ${profile.full_name.split(' ')[0]}`);
  }
  if (profile?.region) {
    lines.push(`Region: ${profile.region}`);
  }
  if (profile?.locale) {
    lines.push(`Preferred locale: ${profile.locale}`);
  }
  if (profile?.conditions?.length) {
    lines.push(`Known conditions/interests: ${profile.conditions.join(', ')}`);
  }
  if (profile?.health_goals?.length) {
    lines.push(`Health goals: ${profile.health_goals.join(', ')}`);
  }
  if (profile?.cycle_regularity) {
    lines.push(`Self-reported cycle regularity: ${profile.cycle_regularity}`);
  }
  if (profile?.common_symptoms?.length) {
    lines.push(`Common symptoms (profile): ${profile.common_symptoms.join(', ')}`);
  }
  if (profile?.energy_level != null) {
    lines.push(`Baseline energy (onboarding): ${profile.energy_level}/10`);
  }

  if (prefs) {
    lines.push(`Average cycle length: ${prefs.cycle_length_avg} days`);
    lines.push(`Average period length: ${prefs.period_length_avg} days`);
  }

  if (periods.length) {
    const latest = periods[0];
    lines.push(
      `Latest period start: ${latest.period_start}${latest.period_end ? `, end: ${latest.period_end}` : ''}`,
    );
    if (periods.length >= 2) {
      const gap = daysBetween(periods[0].period_start, periods[1].period_start);
      lines.push(`Last inter-cycle gap: ~${gap} days (${periods.length} recent period logs on file)`);
    }
  } else if (profile?.last_period_date) {
    lines.push(`Last period date (onboarding): ${profile.last_period_date}`);
  }

  const moodCounts: Record<string, number> = {};
  let energySum = 0;
  let energyN = 0;
  for (const m of moods) {
    moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    if (m.energy_level != null) {
      energySum += m.energy_level;
      energyN++;
    }
  }
  if (moods.length) {
    lines.push(`Mood logs (last ${days}d): ${moods.length} entries`);
    const top = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    if (top) lines.push(`Most logged mood: ${top[0]} (${top[1]}×)`);
  }
  if (energyN) {
    lines.push(`Average logged energy (mood logs): ${(energySum / energyN).toFixed(1)}/10`);
  }

  const sleepHours = sleeps.filter((s) => s.sleep_hours != null).map((s) => Number(s.sleep_hours));
  if (sleepHours.length) {
    const avg = sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length;
    lines.push(`Average sleep (last ${days}d): ${avg.toFixed(1)}h (${sleepHours.length} logs)`);
    const poorQuality = sleeps.filter((s) => s.sleep_quality != null && s.sleep_quality <= 4).length;
    if (poorQuality >= 3) {
      lines.push(`Sleep quality: ${poorQuality} logs rated ≤4/10 recently`);
    }
  }

  if (symptoms.length) {
    const phaseCounts: Record<string, number> = {};
    for (const s of symptoms) {
      phaseCounts[s.cycle_phase] = (phaseCounts[s.cycle_phase] || 0) + 1;
    }
    const phaseSummary = Object.entries(phaseCounts)
      .filter(([p]) => p !== 'unknown')
      .map(([p, n]) => `${p}: ${n}`)
      .join(', ');
    if (phaseSummary) {
      lines.push(`Daily symptom entries by cycle phase: ${phaseSummary}`);
    }
  }

  if (quizzes.length) {
    for (const q of quizzes.slice(0, 3)) {
      lines.push(
        `Assessment (${q.quiz_type}): score ${q.score ?? 'n/a'}, date ${q.completed_at?.split('T')[0] ?? 'unknown'}`,
      );
      if (q.recommendations?.length) {
        lines.push(`  → ${q.recommendations.slice(0, 2).join('; ')}`);
      }
    }
  }

  const premenstrualInsight = detectPremenstrualEnergyPattern(
    periods,
    moods,
    symptoms,
    cycleLengthAvg,
  );
  if (premenstrualInsight) insights.push(premenstrualInsight);

  const sleepInsight = detectSleepTrend(sleeps);
  if (sleepInsight) insights.push(sleepInsight);

  const moodInsight = detectMoodTrend(moods);
  if (moodInsight) insights.push(moodInsight);

  if (insights.length) {
    lines.push('');
    lines.push('## Detected patterns (use naturally in replies — do not list robotically)');
    lines.push(...insights);
  }

  return {
    summary: lines.join('\n'),
    hasData: lines.length > 0,
    insights,
  };
}

export function parseConversationMeta(contextSummary: string | null): {
  preferredLanguage?: string;
} {
  if (!contextSummary) return {};
  try {
    return JSON.parse(contextSummary);
  } catch {
    return {};
  }
}

export async function updateConversationMeta(
  supabase: SupabaseClient,
  conversationId: string,
  meta: Record<string, unknown>,
): Promise<void> {
  await supabase
    .from('ai_conversations')
    .update({
      context_summary: JSON.stringify(meta),
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId);
}
