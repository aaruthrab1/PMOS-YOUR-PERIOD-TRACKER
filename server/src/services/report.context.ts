import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReportContextBundle, ReportSourceSnapshot } from '../types/report.js';

function computeAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function hairScoreFromSymptoms(symptoms: unknown): number | null {
  if (!symptoms || typeof symptoms !== 'object') return null;
  const s = symptoms as Record<string, unknown>;
  const map: Record<string, number> = { none: 0, slight: 1, noticeable: 2, significant: 3 };
  if (typeof s.hair_shedding === 'string') return map[s.hair_shedding] ?? null;
  return null;
}

const MOOD_SCORES: Record<string, number> = {
  happy: 8, calm: 7, neutral: 6, energetic: 8,
  irritable: 4, anxious: 3, sad: 2, exhausted: 2, foggy: 3,
};

/**
 * Aggregates all Cyra tracker tables for doctor report generation.
 */
export async function buildReportContext(
  supabase: SupabaseClient,
  userId: string,
  dateRangeStart: string,
  dateRangeEnd: string,
): Promise<ReportContextBundle> {
  const [
    profileResult,
    prefsResult,
    periodsResult,
    moodResult,
    sleepResult,
    weightResult,
    metabolicResult,
    androgenResult,
    quizResult,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, date_of_birth, region, conditions, health_goals, common_symptoms, cycle_regularity')
      .eq('id', userId)
      .single(),
    supabase
      .from('user_preferences')
      .select('cycle_length_avg, period_length_avg')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('period_logs')
      .select('period_start, period_end, flow_intensity, cycle_length, pain_level, symptoms')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('period_start', dateRangeStart)
      .lte('period_start', dateRangeEnd)
      .order('period_start', { ascending: false }),
    supabase
      .from('mood_logs')
      .select('logged_date, mood, energy_level, anxiety_level')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('logged_date', dateRangeStart)
      .lte('logged_date', dateRangeEnd)
      .order('logged_date', { ascending: false }),
    supabase
      .from('sleep_logs')
      .select('logged_date, sleep_hours, sleep_quality')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('logged_date', dateRangeStart)
      .lte('logged_date', dateRangeEnd)
      .order('logged_date', { ascending: false }),
    supabase
      .from('weight_logs')
      .select('logged_date, weight, unit')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('logged_date', dateRangeStart)
      .lte('logged_date', dateRangeEnd)
      .order('logged_date', { ascending: false }),
    supabase
      .from('metabolic_logs')
      .select('logged_date, energy_level, hunger_level, sugar_cravings, brain_fog')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('logged_date', dateRangeStart)
      .lte('logged_date', dateRangeEnd)
      .order('logged_date', { ascending: false }),
    supabase
      .from('androgen_logs')
      .select('logged_date, symptoms, testosterone_level')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('logged_date', dateRangeStart)
      .lte('logged_date', dateRangeEnd)
      .order('logged_date', { ascending: false }),
    supabase
      .from('quiz_results')
      .select('quiz_type, score, completed_at, recommendations, answers')
      .eq('user_id', userId)
      .gte('completed_at', `${dateRangeStart}T00:00:00`)
      .lte('completed_at', `${dateRangeEnd}T23:59:59`)
      .order('completed_at', { ascending: false }),
  ]);

  const profile = profileResult.data;
  const prefs = prefsResult.data;
  const periods = periodsResult.data || [];
  const moods = moodResult.data || [];
  const sleeps = sleepResult.data || [];
  const weights = weightResult.data || [];
  const metabolic = metabolicResult.data || [];
  const androgens = androgenResult.data || [];
  const quizzes = quizResult.data || [];

  const snapshot: ReportSourceSnapshot = {
    patient: {
      name: profile?.full_name ?? undefined,
      age: computeAge(profile?.date_of_birth),
      region: profile?.region,
      conditions: profile?.conditions ?? [],
      healthGoals: profile?.health_goals ?? [],
    },
    periodLogs: periods.map((p) => ({
      start: p.period_start,
      end: p.period_end,
      flow: p.flow_intensity,
      cycleLength: p.cycle_length,
      painLevel: p.pain_level,
      symptoms: Array.isArray(p.symptoms) ? (p.symptoms as string[]) : [],
    })),
    moodLogs: moods.map((m) => ({
      date: m.logged_date,
      mood: m.mood,
      energy: m.energy_level,
      anxiety: m.anxiety_level,
    })),
    sleepLogs: sleeps.map((s) => ({
      date: s.logged_date,
      hours: s.sleep_hours != null ? Number(s.sleep_hours) : null,
      quality: s.sleep_quality,
    })),
    weightLogs: weights.map((w) => ({
      date: w.logged_date,
      weight: Number(w.weight),
      unit: w.unit,
    })),
    metabolicLogs: metabolic.map((m) => ({
      date: m.logged_date,
      energy: m.energy_level,
      hunger: m.hunger_level,
      sugarCravings: m.sugar_cravings,
      brainFog: m.brain_fog,
    })),
    androgenLogs: androgens.map((a) => ({
      date: a.logged_date,
      symptoms: typeof a.symptoms === 'object' && a.symptoms ? (a.symptoms as Record<string, unknown>) : undefined,
      testosterone: a.testosterone_level,
    })),
    quizResults: quizzes.map((q) => ({
      type: q.quiz_type,
      score: q.score,
      completedAt: q.completed_at,
      recommendations: q.recommendations ?? [],
    })),
    chartData: {
      sleepHours: sleeps
        .filter((s) => s.sleep_hours != null)
        .map((s) => ({ date: s.logged_date, value: Number(s.sleep_hours) }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      moodEnergy: moods
        .filter((m) => m.energy_level != null)
        .map((m) => ({ date: m.logged_date, value: Number(m.energy_level) }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      moodTrend: moods
        .map((m) => ({
          date: m.logged_date,
          value: m.energy_level != null ? Number(m.energy_level) : (MOOD_SCORES[m.mood] ?? 5),
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      cycleLength: periods
        .filter((p) => p.cycle_length != null)
        .map((p) => ({ date: p.period_start, value: Number(p.cycle_length) }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      hairFall: androgens
        .map((a) => {
          const score = hairScoreFromSymptoms(a.symptoms);
          return score != null ? { date: a.logged_date, value: score } : null;
        })
        .filter((p): p is { date: string; value: number } => p != null)
        .sort((a, b) => a.date.localeCompare(b.date)),
      weight: weights
        .map((w) => ({ date: w.logged_date, value: Number(w.weight) }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    },
    dataCoverage: {
      periods: periods.length,
      moods: moods.length,
      sleep: sleeps.length,
      weight: weights.length,
      metabolic: metabolic.length,
      androgen: androgens.length,
      quizzes: quizzes.length,
    },
  };

  const lines: string[] = [
    `Report date range: ${dateRangeStart} to ${dateRangeEnd}`,
  ];

  if (profile) {
    if (profile.full_name) lines.push(`Patient name: ${profile.full_name}`);
    const age = computeAge(profile.date_of_birth);
    if (age != null) lines.push(`Age: ${age}`);
    if (profile.region) lines.push(`Region: ${profile.region}`);
    if (profile.conditions?.length) lines.push(`Self-reported conditions: ${profile.conditions.join(', ')}`);
    if (profile.health_goals?.length) lines.push(`Health goals: ${profile.health_goals.join(', ')}`);
    if (profile.common_symptoms?.length) lines.push(`Common symptoms (profile): ${profile.common_symptoms.join(', ')}`);
    if (profile.cycle_regularity) lines.push(`Cycle regularity (self-reported): ${profile.cycle_regularity}`);
  }

  if (prefs) {
    lines.push(`Preferred avg cycle length: ${prefs.cycle_length_avg} days`);
  }

  if (periods.length) {
    lines.push(`\nPERIOD LOGS (${periods.length} in range):`);
    for (const p of periods.slice(0, 8)) {
      const sym = Array.isArray(p.symptoms) && p.symptoms.length ? `, symptoms: ${(p.symptoms as string[]).join(', ')}` : '';
      lines.push(
        `- ${p.period_start}${p.period_end ? ` to ${p.period_end}` : ''}, flow: ${p.flow_intensity ?? 'n/a'}, cycle length: ${p.cycle_length ?? 'n/a'} days, pain: ${p.pain_level ?? 'n/a'}/10${sym}`,
      );
    }
  } else {
    lines.push('\nPERIOD LOGS: none in date range');
  }

  if (moods.length) {
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
    lines.push(`\nMOOD LOGS (${moods.length}): top moods: ${Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k}(${v})`).join(', ')}`);
    if (energyN) lines.push(`Average energy: ${(energySum / energyN).toFixed(1)}/10`);
  }

  if (sleeps.length) {
    const hours = sleeps.filter((s) => s.sleep_hours != null).map((s) => Number(s.sleep_hours));
    if (hours.length) {
      const avg = hours.reduce((a, b) => a + b, 0) / hours.length;
      lines.push(`\nSLEEP LOGS (${sleeps.length}): avg ${avg.toFixed(1)}h/night`);
    }
  }

  if (weights.length) {
    const sorted = [...weights].sort((a, b) => a.logged_date.localeCompare(b.logged_date));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    lines.push(`\nWEIGHT LOGS (${weights.length}): ${first.weight} ${first.unit} (${first.logged_date}) → ${last.weight} ${last.unit} (${last.logged_date})`);
  }

  if (metabolic.length) {
    const fogCount = metabolic.filter((m) => m.brain_fog && m.brain_fog !== 'none').length;
    const cravingCount = metabolic.filter((m) => m.sugar_cravings && m.sugar_cravings !== 'none').length;
    lines.push(`\nMETABOLIC LOGS (${metabolic.length}): brain fog logged ${fogCount}×, sugar cravings ${cravingCount}×`);
  }

  if (androgens.length) {
    lines.push(`\nANDROGEN LOGS (${androgens.length}): recent check-ins available`);
    for (const a of androgens.slice(0, 3)) {
      const symKeys = a.symptoms && typeof a.symptoms === 'object'
        ? Object.entries(a.symptoms as Record<string, unknown>).filter(([, v]) => v).map(([k]) => k).join(', ')
        : '';
      if (symKeys) lines.push(`- ${a.logged_date}: ${symKeys}`);
    }
  }

  if (quizzes.length) {
    lines.push(`\nQUIZ / ASSESSMENT RESULTS (${quizzes.length}):`);
    for (const q of quizzes.slice(0, 3)) {
      lines.push(`- ${q.quiz_type}: score ${q.score ?? 'n/a'} on ${q.completed_at?.split('T')[0]}`);
      if (q.recommendations?.length) lines.push(`  Notes: ${q.recommendations.slice(0, 2).join('; ')}`);
    }
  }

  const hasData =
    periods.length > 0 ||
    moods.length > 0 ||
    sleeps.length > 0 ||
    weights.length > 0 ||
    metabolic.length > 0 ||
    androgens.length > 0 ||
    quizzes.length > 0 ||
    !!profile;

  return {
    snapshot,
    contextText: lines.join('\n'),
    hasData,
  };
}

/** Build a day-by-day timeline from logs for doctor prep */
export function buildSymptomTimeline(
  snapshot: ReportSourceSnapshot,
  maxDays = 21,
): Array<{ date: string; summary: string }> {
  const dates = new Set<string>();
  snapshot.moodLogs.forEach((m) => dates.add(m.date));
  snapshot.sleepLogs.forEach((s) => dates.add(s.date));
  snapshot.metabolicLogs.forEach((m) => dates.add(m.date));
  snapshot.androgenLogs.forEach((a) => dates.add(a.date));

  return [...dates]
    .sort()
    .reverse()
    .slice(0, maxDays)
    .map((date) => {
      const parts: string[] = [];
      const mood = snapshot.moodLogs.find((m) => m.date === date);
      const sleep = snapshot.sleepLogs.find((s) => s.date === date);
      const metabolic = snapshot.metabolicLogs.find((m) => m.date === date);

      if (mood) {
        parts.push(`Mood: ${mood.mood}`);
        if (mood.energy != null) parts.push(`Energy: ${mood.energy}/10`);
      }
      if (sleep?.hours != null) parts.push(`Sleep: ${sleep.hours}h`);
      if (metabolic?.brainFog && metabolic.brainFog !== 'none') parts.push(`Brain fog: ${metabolic.brainFog}`);
      if (metabolic?.sugarCravings && metabolic.sugarCravings !== 'none') parts.push(`Cravings: ${metabolic.sugarCravings}`);

      const androgen = snapshot.androgenLogs.find((a) => a.date === date);
      if (androgen?.symptoms && typeof androgen.symptoms === 'object') {
        const sym = androgen.symptoms as Record<string, unknown>;
        if (sym.hair_shedding && sym.hair_shedding !== 'none') parts.push(`Hair: ${sym.hair_shedding}`);
        if (sym.acne && sym.acne !== 'none') parts.push(`Acne: ${sym.acne}`);
      }

      return { date, summary: parts.join(' · ') || 'Logged activity' };
    })
    .filter((t) => t.summary);
}

/** Rule-based risk flags — never diagnostic */
export function computeRiskSummary(snapshot: ReportSourceSnapshot): import('../types/report.js').RiskItem[] {
  const items: import('../types/report.js').RiskItem[] = [];

  const sleepHours = snapshot.chartData.sleepHours.map((p) => p.value);
  if (sleepHours.length >= 5) {
    const avg = sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length;
    if (avg < 6) {
      items.push({
        concern: 'Consistently low sleep',
        severity: avg < 5 ? 'moderate' : 'low',
        note: `Average sleep ~${avg.toFixed(1)}h — worth discussing with your clinician if persistent.`,
      });
    }
  }

  const cycleLengths = snapshot.periodLogs.map((p) => p.cycleLength).filter((c): c is number => c != null);
  if (cycleLengths.length >= 2) {
    const irregular = cycleLengths.some((c) => c < 21 || c > 35);
    if (irregular) {
      items.push({
        concern: 'Irregular cycle lengths logged',
        severity: 'moderate',
        note: 'Cycle lengths outside typical 21–35 day range were recorded — discuss patterns with your doctor.',
      });
    }
  }

  const highPain = snapshot.periodLogs.some((p) => (p.painLevel ?? 0) >= 8);
  if (highPain) {
    items.push({
      concern: 'High pain levels during periods',
      severity: 'high',
      note: 'Severe pain was logged — seek medical advice if this is ongoing or worsening.',
    });
  }

  const anxiousMoods = snapshot.moodLogs.filter((m) => m.mood === 'anxious' || m.mood === 'sad').length;
  if (anxiousMoods >= 5) {
    items.push({
      concern: 'Frequent low mood or anxiety logs',
      severity: 'moderate',
      note: 'Mood patterns may be worth exploring with a healthcare provider or mental health support.',
    });
  }

  const hasPCOS = snapshot.patient.conditions?.some((c) => c.toLowerCase().includes('pcos'));
  if (hasPCOS && snapshot.metabolicLogs.length >= 3) {
    items.push({
      concern: 'Metabolic symptoms alongside PCOS',
      severity: 'low',
      note: 'Metabolic tracking may help your clinician assess insulin-related patterns — bring these logs.',
    });
  }

  if (items.length === 0) {
    items.push({
      concern: 'No urgent flags from logged data',
      severity: 'low',
      note: 'Continue tracking and share this summary with your clinician for personalized guidance.',
    });
  }

  return items;
}
